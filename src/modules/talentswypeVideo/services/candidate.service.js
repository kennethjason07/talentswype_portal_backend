import prisma from '../db/prisma.client.js';
import { inviteCandidateViaFlowmingo } from './flowmingoApi.service.js';
import logger from '../../../middleware/winston.logger.js';

const RESEND_PROTECTION_MINUTES = 10;

function toNumberOrNull(value) {
  if (!value) return null;
  if (typeof value?.toNumber === 'function') return value.toNumber();
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function extractFlowmingoCandidateId(inviteResult) {
  if (!Array.isArray(inviteResult) || inviteResult.length === 0) {
    return null;
  }

  return inviteResult[0]?.interviewee?.id || null;
}

export class CandidateService {
  static async signupCandidate(payload) {
    // Email-level dedupe keeps signup idempotent for client retries.
    const existing = await prisma.candidate.findUnique({ where: { email: payload.email } });
    if (existing) {
      const error = new Error('Candidate already exists');
      error.status = 409;
      throw error;
    }

    const candidate = await prisma.candidate.create({
      data: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        resumeUrl: payload.resumeUrl,
      },
    });

    const foundationalInterviewSetId =
      payload.foundationalInterviewSetId || process.env.FLOWMINGO_FOUNDATIONAL_INTERVIEW_SET_ID;

    if (!foundationalInterviewSetId) {
      await prisma.candidate.delete({ where: { id: candidate.id } });
      const error = new Error('Foundational interview set is not configured');
      error.status = 500;
      throw error;
    }

    try {
      const foundationalInterview = await this.triggerInterview(candidate.id, {
        flowmingoInterviewSetId: foundationalInterviewSetId,
        invitationMessage: payload.invitationMessage,
        sendInvite: true,
        interviewType: 'FOUNDATIONAL',
      });

      logger.info(
        `Foundational invite sent: candidateId=${candidate.id} interviewId=${foundationalInterview.interview.id}`,
      );

      return { candidate, foundationalInterview };
    } catch (error) {
      await prisma.candidate.delete({ where: { id: candidate.id } }).catch(() => null);
      logger.error(`Signup rollback after foundational invite failure: candidateId=${candidate.id} error=${error.message}`);
      throw error;
    }
  }

  static async triggerInterview(candidateId, payload) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.status = 404;
      throw error;
    }

    const interviewType = payload.interviewType || 'FOLLOW_UP';

    if (interviewType === 'FOUNDATIONAL') {
      const existingFoundational = await prisma.interview.findFirst({
        where: { candidateId, type: 'FOUNDATIONAL' },
      });
      if (existingFoundational) {
        const error = new Error('Foundational interview already exists for this candidate');
        error.status = 409;
        throw error;
      }
    }

    const recentInvite = await prisma.interview.findFirst({
      where: {
        candidateId,
        type: interviewType,
        invitationSentAt: {
          gte: new Date(Date.now() - RESEND_PROTECTION_MINUTES * 60 * 1000),
        },
      },
      orderBy: { invitationSentAt: 'desc' },
    });

    if (recentInvite) {
      const error = new Error('Interview invite was sent recently. Please retry later.');
      error.status = 429;
      throw error;
    }

    // Call Flowmingo first; only persist invite state if provider accepts request.
    const inviteResult = await inviteCandidateViaFlowmingo(candidate, payload);
    const flowmingoCandidateId = extractFlowmingoCandidateId(inviteResult);

    const interview = await prisma.interview
      .create({
        data: {
          candidateId,
          type: interviewType,
          flowmingoInterviewSet: payload.flowmingoInterviewSetId,
          flowmingoCandidateId,
          status: 'INVITED',
          invitationSentAt: new Date(),
          jobId: payload.jobId,
          followUps: payload.followUpQuestions?.length
            ? {
                create: payload.followUpQuestions.map((question) => ({ question })),
              }
            : undefined,
        },
        include: {
          followUps: true,
        },
      })
      .catch((error) => {
        if (error.code === 'P2002') {
          const conflict = new Error(`Interview of type ${interviewType} already exists for this candidate`);
          conflict.status = 409;
          throw conflict;
        }
        throw error;
      });

    logger.info(
      `Interview invite sent: candidateId=${candidateId} type=${interviewType} flowmingoCandidateId=${flowmingoCandidateId || 'n/a'}`,
    );

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'INVITED' },
    });

    return { interview, inviteResult };
  }

  static async getCandidate(candidateId) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        interviews: {
          include: {
            result: true,
            video: true,
            followUps: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      const error = new Error('Candidate not found');
      error.status = 404;
      throw error;
    }

    const latestInterview = candidate.interviews[0];

    return {
      ...candidate,
      // Resume unlock policy: hidden until candidate is shortlisted.
      resumeUrl: candidate.status === 'SHORTLISTED' ? candidate.resumeUrl : null,
      // HR consumes this block first to rank candidates by video evidence before resume review.
      discoveryCard: {
        candidateId: candidate.id,
        latestInterviewStatus: latestInterview?.status || null,
        latestVideoSubmission: latestInterview?.video?.submissionUrl || null,
        latestScore: toNumberOrNull(latestInterview?.result?.overallScore),
      },
    };
  }

  static async getCandidateVideo(candidateId) {
    const interview = await prisma.interview.findFirst({
      where: { candidateId },
      include: {
        video: true,
        result: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!interview || !interview.video) {
      const error = new Error('Video metadata not found');
      error.status = 404;
      throw error;
    }

    return {
      interviewId: interview.id,
      status: interview.status,
      video: interview.video,
      result: interview.result
        ? {
            ...interview.result,
            overallScore: toNumberOrNull(interview.result.overallScore),
          }
        : null,
    };
  }
}
