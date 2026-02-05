import { Router } from 'express';
const router = Router();

import * as AdminController from '../controllers/admin.Controller.js';
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// GET ROUTES
router.route('/admin/stats').get(UserAuth, allowRoles("ADMIN"), AdminController.getAdminStats);
router.route('/admin/candidates').get(UserAuth, allowRoles("ADMIN"), AdminController.getCandidates);
router.route('/admin/hrs').get(UserAuth, allowRoles("ADMIN"), AdminController.getHRs);
router.route('/admin/candidate-history/:userId').get(UserAuth, allowRoles("ADMIN"), AdminController.getCandidateHistory);

export default router;
