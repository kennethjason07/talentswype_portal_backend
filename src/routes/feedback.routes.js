import { Router } from 'express'
const router = Router()

import * as FeedbackController from '../controllers/Feedback.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/feedback').post(UserAuth, FeedbackController.submitFeedback);

// GET ROUTES (Admin Only)
router.route('/all-feedback').get(UserAuth, allowRoles("ADMIN"), FeedbackController.getAllFeedback);

export default router;
