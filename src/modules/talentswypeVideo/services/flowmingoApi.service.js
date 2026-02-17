import logger from '../../../middleware/winston.logger.js';

function buildFlowmingoInvitePayload(candidate, input) {
  return {
    com_interview_set_id: input.flowmingoInterviewSetId,
    candidates: [
      {
        name: `${candidate.firstName} ${candidate.lastName}`.trim(),
        email: candidate.email,
        cv_link: candidate.resumeUrl || undefined,
      },
    ],
    invitation_message: input.invitationMessage,
    send_invite: input.sendInvite ?? true,
  };
}

export async function inviteCandidateViaFlowmingo(candidate, input) {
  const endpoint = process.env.FLOWMINGO_INVITE_API_URL || 'https://apis.flowmingo.ai/company/integration/interview/candidate/invite/v1';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.FLOWMINGO_API_KEY,
    },
    body: JSON.stringify(buildFlowmingoInvitePayload(candidate, input)),
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (!response.ok) {
    logger.error(
      `Flowmingo invite failed: candidateEmail=${candidate.email} status=${response.status} body=${JSON.stringify(body)}`,
    );
    const error = new Error('Flowmingo invite API failed');
    error.status = 502;
    error.meta = { providerStatus: response.status, providerBody: body };
    throw error;
  }

  logger.info(`Flowmingo invite accepted: candidateEmail=${candidate.email}`);
  return body;
}
