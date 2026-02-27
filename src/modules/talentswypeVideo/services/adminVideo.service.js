import prisma from '../db/prisma.client.js';

export class AdminVideoService {
  static async getAllInterviews() {
    const candidates = await prisma.candidate.findMany({
      include: {
        interviews: {
          include: {
            result: true,
            video: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return candidates.map((candidate) => {
      const latestInterview = candidate.interviews[0];
      return {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        status: candidate.status,
        latestInterviewStatus: latestInterview?.status || 'NOT_INVITED',
        latestScore: latestInterview?.result?.overallScore ? Number(latestInterview.result.overallScore) : null,
        videoUrl: latestInterview?.video?.submissionUrl || null,
        updatedAt: candidate.updatedAt,
      };
    });
  }
}
