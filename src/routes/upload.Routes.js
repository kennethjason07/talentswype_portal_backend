import express from 'express';
import {
    uploadResume,
    uploadMiddleware,
    getResumeSignedUrl,
    handleUploadMulterError,
} from '../controllers/upload.Controller.js';
import UserAuth from '../middleware/user.Auth.js';

const router = express.Router();

router.post(
    '/resume',
    UserAuth,
    (req, res, next) => {
        uploadMiddleware(req, res, (err) => handleUploadMulterError(err, req, res, next));
    },
    uploadResume
);

router.get('/resume/view/:filename(*)', UserAuth, getResumeSignedUrl);

export default router;
