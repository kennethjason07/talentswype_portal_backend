import { Router } from 'express'
const router = Router()

import * as JobController from '../controllers/job.Controller.js'
import UserAuth, { allowRoles } from '../middleware/user.Auth.js';

// POST ROUTES
router.route('/jobs').post(UserAuth, allowRoles("HR", "ADMIN"), JobController.createJob);
router.route('/jobs/:id/approve').post(UserAuth, allowRoles("ADMIN"), JobController.approveJob);

router.route('/jobs/apply').post(UserAuth, JobController.applyForJob);

// GET ROUTES
router.route('/hr-jobs/all').get(UserAuth, allowRoles("HR", "ADMIN"), JobController.getHRJobs);


router.route('/jobs').get(UserAuth, JobController.getJobs);
router.route('/jobs/:jobId').get(UserAuth, JobController.getJobById);
router.route('/applications/me').get(UserAuth, JobController.getMyApplications);
router.route('/applications/job/:jobId').get(UserAuth, allowRoles("HR", "ADMIN"), JobController.getApplicantsForJob);
router.route('/jobs/:jobId/matching-candidates').get(UserAuth, allowRoles("HR", "ADMIN"), JobController.getMatchingCandidates);
router.route('/admin/jobs').get(UserAuth, allowRoles("ADMIN"), JobController.getAllJobsForAdmin);

// PUT ROUTES
router.route('/jobs/:jobId').put(UserAuth, allowRoles("HR", "ADMIN"), JobController.updateJob);
router.route('/applications/:applicationId/status').put(UserAuth, allowRoles("HR", "ADMIN"), JobController.manageApplication);

// DELETE ROUTES
router.route('/jobs/:jobId').delete(UserAuth, allowRoles("HR", "ADMIN"), JobController.deleteJob);
router.route('/applications/:applicationId').delete(UserAuth, JobController.withdrawApplication );

export default router;