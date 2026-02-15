import express from 'express';
import {
    uploadResume,
    uploadMiddleware,
    uploadCompanyLogo,
    uploadLogoMiddleware,
    getResumeSignedUrl,
    getCompanyLogoSignedUrl,
    handleUploadMulterError,
} from '../controllers/upload.Controller.js';
import UserAuth from '../middleware/user.Auth.js';

const router = express.Router();

router.post(
    '/upload/resume',
    UserAuth,
    (req, res, next) => {
        uploadMiddleware(req, res, (err) => handleUploadMulterError(err, req, res, next));
    },
    uploadResume
);
router.post(
    '/resume',
    UserAuth,
    (req, res, next) => {
        uploadMiddleware(req, res, (err) => handleUploadMulterError(err, req, res, next));
    },
    uploadResume
);

router.post(
    '/upload/company-logo',
    UserAuth,
    (req, res, next) => {
        uploadLogoMiddleware(req, res, (err) => handleUploadMulterError(err, req, res, next));
    },
    uploadCompanyLogo
);
router.post(
    '/company-logo',
    UserAuth,
    (req, res, next) => {
        uploadLogoMiddleware(req, res, (err) => handleUploadMulterError(err, req, res, next));
    },
    uploadCompanyLogo
);

router.get('/upload/resume/view/:filename(*)', UserAuth, getResumeSignedUrl);
router.get('/resume/view/:filename(*)', UserAuth, getResumeSignedUrl);
router.get('/upload/company-logo/view/:filename(*)', UserAuth, getCompanyLogoSignedUrl);
router.get('/company-logo/view/:filename(*)', UserAuth, getCompanyLogoSignedUrl);

export default router;
