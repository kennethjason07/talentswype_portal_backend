import { Router } from 'express'
const router = Router()

import * as AssessmentController from '../controllers/assessment.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/assessment/create').post(UserAuth, allowRoles("ADMIN"), AssessmentController.createAssessment);
router.route('/assessment/module/add-questions').post(UserAuth, allowRoles("ADMIN"), AssessmentController.addQuestionsToAssessment);
router.route('/assessment/start-assessment').post(UserAuth, AssessmentController.startAssessment);
router.route('/assessment/submit-answer/:assessmentId').post(UserAuth, AssessmentController.submitAnswerForAssessment);
router.route('/assessment/finish-assessment/:assessmentId').post(UserAuth, AssessmentController.finishAssessment);

// GET ROUTES
router.route('/assessments/admin').get(UserAuth, allowRoles("ADMIN"), AssessmentController.getAllAssessmentForAdmin);
router.route('/assessments/:assessmentId').get(UserAuth, allowRoles("ADMIN"), AssessmentController.getAssessmentById);
router.route('/assessments/admin/result/:assessmentId').get(UserAuth, allowRoles("ADMIN"), AssessmentController.getAllUsersResultForAssessment);
router.route('/assessments/admin/result/:assessmentId/:userId').get(UserAuth, allowRoles("ADMIN"), AssessmentController.getUserResultForAssessment);

router.route('/assessments').get(UserAuth, AssessmentController.getVisibleAssessments);
router.route('/assessment/questions/:assessmentId').get(UserAuth, AssessmentController.getAssesmentAllQuestions);
router.route('/assessment/question/:assessmentId').get(UserAuth, AssessmentController.getAssesmentQuestion);

// PUT ROUTES
router.route('/assessments/admin/:assessmentid').put(UserAuth, allowRoles("ADMIN"), AssessmentController.editAssessment);

// DELETE ROUTES
router.route('/assessments/:assessmentid/:moduleid').delete(UserAuth, allowRoles("ADMIN"), AssessmentController.deleteModuleFromAssessment);
router.route('/assessments/:assessmentid').delete(UserAuth, allowRoles("ADMIN"), AssessmentController.deleteAssessment);

export default router;