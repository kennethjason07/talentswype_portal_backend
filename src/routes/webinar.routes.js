import { Router } from 'express'
const router = Router()

import * as WebinarController from '../controllers/webinar.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/webinar/create').post(UserAuth, allowRoles("ADMIN"), WebinarController.createWebinar);
router.route('/webinar/register/:webinarId').post(UserAuth, WebinarController.registerUserForWebinar);

// GET ROUTES
router.route('/webinar/all').get(UserAuth, allowRoles("ADMIN"), WebinarController.getAllWebinars);

router.route('/webinars').get(UserAuth, WebinarController.getWebinars);
router.route('/webinar/:id').get(WebinarController.getWebinarById);

// PUT ROUTES
router.route('/webinar/:id').put(UserAuth, allowRoles("ADMIN"), WebinarController.updateWebinar);

// DELETE ROUTES
router.route('/webinar/:id').delete(UserAuth, allowRoles("ADMIN"), WebinarController.deleteWebinar);

export default router;