import express from 'express';
import { CandidateController } from '../controllers/candidate.controller.js';
import { HrController } from '../controllers/hr.controller.js';
import { FlowmingoWebhookController } from '../controllers/flowmingoWebhook.controller.js';
import { hrAuth } from '../middleware/hrAuth.middleware.js';
import {
  candidateIdParamSchema,
  candidateSignupSchema,
  shortlistSchema,
  triggerInterviewSchema,
  validate,
} from '../validation/talentswypeVideo.validation.js';

const router = express.Router();

router.post('/candidates/signup', validate(candidateSignupSchema), CandidateController.signup);
router.post('/candidates/:id/interview', validate(triggerInterviewSchema), CandidateController.triggerInterview);
router.get('/candidates/:id', hrAuth, validate(candidateIdParamSchema), CandidateController.getById);
router.get('/candidates/:id/video', hrAuth, validate(candidateIdParamSchema), CandidateController.getVideo);
router.post('/hr/jobs/:jobId/shortlist', hrAuth, validate(shortlistSchema), HrController.shortlist);

const webhookRouter = express.Router();
webhookRouter.post('/webhooks/flowmingo', express.raw({ type: 'application/json' }), FlowmingoWebhookController.handle);

export { router as talentswypeVideoRouter, webhookRouter as talentswypeWebhookRouter };
