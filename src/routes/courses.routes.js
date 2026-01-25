import { Router } from 'express'
const router = Router()

import * as OfflineCoursesController from '../controllers/offlineCourses.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/offline/course/create').post(UserAuth, allowRoles("ADMIN"), OfflineCoursesController.createOfflineCourse);

// GET ROUTES
router.route('/dashboard/courses').get(UserAuth, OfflineCoursesController.getOfflineCourses);
router.route('/offline/course/:id').get(UserAuth, OfflineCoursesController.getOfflineCourseById);

// PUT ROUTES
router.route('/offline/course/:id').put(UserAuth, allowRoles("ADMIN"), OfflineCoursesController.updateOfflineCourse);

// DELETE ROUTES
router.route('/offline/course/:id').delete(UserAuth, allowRoles("ADMIN"), OfflineCoursesController.deleteOfflineCourse);

export default router;