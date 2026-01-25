import { Router } from 'express'
const router = Router()

import * as MentorController from '../controllers/mentor.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/mentor/create').post(UserAuth, allowRoles("ADMIN"), MentorController.createMentor);

// GET ROUTES
router.route('/mentor/all').get(MentorController.getAllMentors);
router.route('/mentor/:id').get(MentorController.getMentorById);

// PUT ROUTES
router.route('/mentor/:id').put(UserAuth, allowRoles("ADMIN"), MentorController.updateMentor);

// DELETE ROUTES
router.route('/mentor/:id').delete(UserAuth, allowRoles("ADMIN"), MentorController.deleteMentor);

export default router;