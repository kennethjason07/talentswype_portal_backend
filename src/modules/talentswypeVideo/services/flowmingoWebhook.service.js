import prisma from '../db/prisma.client.js';
import logger from '../../../middleware/winston.logger.js';

async function findInterviewByWebhookPayload(payload) {
  if (payload.candidate_id) {
    const byProviderCandidateId = await prisma.interview.findFirst({
      where: { flowmingoCandidateId: payload.candidate_id },
      include: { candidate: true },
      orderBy: { createdAt: 'desc' },
    });

    if (byProviderCandidateId) {
      return byProviderCandidateId;
    }
  }

  if (payload.interview_set_id && payload.candidate_email) {
    const bySetAndEmail = await prisma.interview.findFirst({
      where: {
        flowmingoInterviewSet: payload.interview_set_id,
        candidate: { email: payload.candidate_email },
      },
      include: { candidate: true },
      orderBy: { createdAt: 'desc' },
    });

    if (bySetAndEmail) {
      return bySetAndEmail;
    }
  }

  if (payload.interview_id) {
    return prisma.interview.findFirst({
      where: { id: payload.interview_id },
      include: { candidate: true },
    });
  }

  return null;
}

function mapInterviewStatus(status) {
  if (status === 'started') return 'STARTED';
  if (status === 'completed') return 'COMPLETED';
  return null;
}

export class FlowmingoWebhookService {
  static async handleWebhookEvent(event) {
    try {
      const persisted = await prisma.webhookEvent
        .create({
          data: {
            provider: 'flowmingo',
            providerEventId: event.event_id,
            eventName: event.event_name,
            payload: event.payload,
          },
        })
        .catch((error) => {
          if (error.code === 'P2002') {
            return null;
          }

          throw error;
        });

      // Idempotency guard: skip processing already-seen webhook events.
      if (!persisted) {
        logger.info(`Flowmingo duplicate webhook ignored: eventId=${event.event_id}`);
        return;
      }

      logger.info(`Flowmingo webhook received: eventId=${event.event_id} eventName=${event.event_name}`);

      if (event.event_name.startsWith('interview.status.update')) {
        await this.handleInterviewStatus(event.payload);
        return;
      }

      if (event.event_name.startsWith('interview.evaluation.update')) {
        await this.handleEvaluationUpdate(event.payload);
      }
    } catch (error) {
      logger.error(
        `Flowmingo webhook processing failed: eventId=${event?.event_id || 'unknown'} payload=${JSON.stringify(event?.payload || {})} error=${error.message}`,
      );
      throw error;
    }
  }

  static async handleInterviewStatus(payload) {
    const interview = await findInterviewByWebhookPayload(payload);
    if (!interview) {
      logger.info(`Flowmingo interview status skipped (no local match): payload=${JSON.stringify(payload)}`);
      return;
    }

    const mappedStatus = mapInterviewStatus(payload.status);

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: mappedStatus || interview.status,
        flowmingoCandidateId: payload.candidate_id || interview.flowmingoCandidateId,
        video: {
          upsert: {
            create: {
              submissionUrl: payload.submission_url || null,
              startedAt: payload.status === 'started' ? new Date(Number(payload.timestamp)) : null,
              completedAt: payload.status === 'completed' ? new Date(Number(payload.timestamp)) : null,
            },
            update: {
              submissionUrl: payload.submission_url || undefined,
              startedAt: payload.status === 'started' ? new Date(Number(payload.timestamp)) : undefined,
              completedAt: payload.status === 'completed' ? new Date(Number(payload.timestamp)) : undefined,
            },
          },
        },
      },
    });

    await prisma.candidate.update({
      where: { id: interview.candidateId },
      data: {
        status: payload.status === 'completed' ? 'INTERVIEW_COMPLETED' : 'INTERVIEW_STARTED',
      },
    });

    await prisma.hrNotification.createMany({
      data: [
        {
          hrUserId: 'dashboard-feed',
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          type: 'INTERVIEW_STATUS',
          message: `Interview ${payload.status} for ${interview.candidate.email}`,
        },
      ],
    });

    logger.info(
      `Flowmingo interview status updated: interviewId=${interview.id} status=${payload.status} candidateId=${interview.candidateId}`,
    );
  }

  static async handleEvaluationUpdate(payload) {
    const interview = await findInterviewByWebhookPayload(payload);
    if (!interview) {
      logger.info(`Flowmingo evaluation skipped (no local match): payload=${JSON.stringify(payload)}`);
      return;
    }

    await prisma.interviewResult.upsert({
      where: { interviewId: interview.id },
      create: {
        interviewId: interview.id,
        evaluationType: payload.evaluation_type || 'holistic',
        overallScore: payload.evaluation_score || null,
        rawScore: payload,
        submittedAt: payload.timestamp ? new Date(Number(payload.timestamp)) : new Date(),
      },
      update: {
        evaluationType: payload.evaluation_type || 'holistic',
        overallScore: payload.evaluation_score || null,
        rawScore: payload,
        submittedAt: payload.timestamp ? new Date(Number(payload.timestamp)) : new Date(),
      },
    });

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: 'SCORED',
        flowmingoCandidateId: payload.candidate_id || interview.flowmingoCandidateId,
        video: {
          upsert: {
            create: {
              submissionUrl: payload.submission_url || null,
            },
            update: {
              submissionUrl: payload.submission_url || undefined,
            },
          },
        },
      },
    });

    await prisma.candidate.update({
      where: { id: interview.candidateId },
      data: { status: 'SCORED' },
    });

    await prisma.hrNotification.create({
      data: {
        hrUserId: 'dashboard-feed',
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        type: 'EVALUATION_READY',
        message: `Evaluation score updated for candidate ${interview.candidateId}`,
      },
    });

    logger.info(
      `Flowmingo evaluation updated: interviewId=${interview.id} evaluationType=${payload.evaluation_type || 'holistic'} score=${payload.evaluation_score ?? 'n/a'}`,
    );
  }
}
