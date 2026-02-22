import { z } from 'zod';

export const candidateSignupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().max(100),
    lastName: z.string().max(100).optional().nullable(),
    phone: z.string().max(25).optional().nullable(),
    resumeUrl: z.string().max(500).optional().nullable(),
    foundationalInterviewSetId: z.string().uuid().optional().nullable(),
    invitationMessage: z.string().max(1000).optional().nullable(),
  }),
});

export const triggerInterviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    flowmingoInterviewSetId: z.string().uuid(),
    invitationMessage: z.string().min(10).max(1000).optional(),
    sendInvite: z.boolean().optional(),
    interviewType: z.enum(['FOUNDATIONAL', 'FOLLOW_UP']).optional(),
    jobId: z.string().min(1).max(128).optional(),
    followUpQuestions: z.array(z.string().min(5).max(500)).max(10).optional(),
  }),
});

export const candidateIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const shortlistSchema = z.object({
  params: z.object({
    jobId: z.string().min(1).max(128),
  }),
  body: z.object({
    candidateId: z.string().uuid(),
    notes: z.string().max(1500).optional(),
  }),
});

export const flowmingoWebhookSchema = z.object({
  body: z.object({
    event_id: z.string().uuid(),
    event_name: z.string().min(1),
    payload: z.record(z.any()),
  }),
});

export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten(),
      });
    }

    req.validated = parsed.data;
    return next();
  };
}
