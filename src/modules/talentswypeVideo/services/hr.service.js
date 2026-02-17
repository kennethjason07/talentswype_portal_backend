import prisma from '../db/prisma.client.js';

export class HrService {
  static async shortlistCandidate({ jobId, candidateId, notes, hrUserId }) {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.status = 404;
      throw error;
    }

    const shortlist = await prisma.jobShortlist.upsert({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
      create: {
        jobId,
        candidateId,
        shortlistedBy: hrUserId,
        notes,
      },
      update: {
        shortlistedBy: hrUserId,
        notes,
      },
    });

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'SHORTLISTED' },
    });

    const notification = await prisma.hrNotification.create({
      data: {
        hrUserId,
        candidateId,
        jobId,
        type: 'SHORTLIST_UPDATED',
        message: `Candidate ${candidate.email} shortlisted for job ${jobId}`,
      },
    });

    return { shortlist, notification };
  }
}
