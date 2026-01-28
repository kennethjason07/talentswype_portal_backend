import { Router } from 'express';
const router = Router();

import * as AdminController from '../controllers/admin.Controller.js';
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// GET ROUTES
router.route('/stats').get(UserAuth, allowRoles("ADMIN"), AdminController.getAdminStats);
router.route('/candidates').get(UserAuth, allowRoles("ADMIN"), AdminController.getCandidates);

export default router;
