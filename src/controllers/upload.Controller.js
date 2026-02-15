import multer from 'multer';
import path from 'path';
import { uploadToGCS, generateSignedUrl, fileExists } from '../utils/uploadToGCS.js';
import { companyLogoBucketName } from '../config/gcs.config.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_LOGO_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 15 * 60;

const ALLOWED_MIME_TO_EXTENSIONS = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const ALLOWED_LOGO_MIME_TO_EXTENSIONS = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
};

const isAllowedFile = (file) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExtensions = ALLOWED_MIME_TO_EXTENSIONS[file.mimetype] || [];
    return allowedExtensions.includes(ext);
};

const isAllowedLogoFile = (file) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExtensions = ALLOWED_LOGO_MIME_TO_EXTENSIONS[file.mimetype] || [];
    return allowedExtensions.includes(ext);
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: (req, file, cb) => {
        if (!isAllowedFile(file)) {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
            return;
        }

        cb(null, true);
    },
});

const uploadLogo = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_LOGO_FILE_SIZE_BYTES,
    },
    fileFilter: (req, file, cb) => {
        if (!isAllowedLogoFile(file)) {
            cb(new Error('Invalid logo file type. Only PNG, JPG/JPEG, and WEBP are allowed.'));
            return;
        }

        cb(null, true);
    },
});

const sanitizeFilePath = (value) => {
    if (!value) {
        return null;
    }

    const decoded = decodeURIComponent(value).replace(/\\/g, '/');
    if (!decoded.startsWith('resumes/') || decoded.includes('..') || decoded.includes('//')) {
        return null;
    }

    return decoded;
};

const sanitizeCompanyLogoPath = (value) => {
    if (!value) {
        return null;
    }

    const decoded = decodeURIComponent(value).replace(/\\/g, '/');
    if (!decoded.startsWith('company-logos/') || decoded.includes('..') || decoded.includes('//')) {
        return null;
    }

    return decoded;
};

const getUploadedFileFromRequest = (req) => {
    if (req.file) {
        return req.file;
    }

    if (req.files?.file?.[0]) {
        return req.files.file[0];
    }

    if (req.files?.resume?.[0]) {
        return req.files.resume[0];
    }

    return null;
};

export const uploadResume = async (req, res) => {
    try {
        const uploadedFile = getUploadedFileFromRequest(req);

        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const uploadResult = await uploadToGCS(
            uploadedFile.buffer,
            uploadedFile.originalname,
            uploadedFile.mimetype
        );

        return res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                filename: uploadResult.filename,
                originalName: uploadResult.originalName,
                size: uploadResult.size,
            },
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error uploading file',
        });
    }
};

export const uploadCompanyLogo = async (req, res) => {
    try {
        const uploadedFile = getUploadedFileFromRequest(req);

        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const uploadResult = await uploadToGCS(
            uploadedFile.buffer,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            {
                folder: 'company-logos',
                defaultBaseName: 'company-logo',
                bucketNameOverride: companyLogoBucketName,
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Company logo uploaded successfully',
            data: {
                filename: uploadResult.filename,
                bucket: uploadResult.bucket,
                originalName: uploadResult.originalName,
                size: uploadResult.size,
            },
        });
    } catch (error) {
        console.error('Company Logo Upload Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error uploading company logo',
        });
    }
};

export const getResumeSignedUrl = async (req, res) => {
    try {
        const sanitizedFilename = sanitizeFilePath(req.params.filename);

        if (!sanitizedFilename) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename format',
            });
        }

        const exists = await fileExists(sanitizedFilename);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found',
            });
        }

        const signedUrl = await generateSignedUrl(sanitizedFilename, DEFAULT_SIGNED_URL_EXPIRY_SECONDS);

        return res.status(200).json({
            success: true,
            data: {
                url: signedUrl,
                expiresIn: DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
            },
        });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error generating resume URL',
        });
    }
};

export const getCompanyLogoSignedUrl = async (req, res) => {
    try {
        const sanitizedFilename = sanitizeCompanyLogoPath(req.params.filename);

        if (!sanitizedFilename) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename format',
            });
        }

        const exists = await fileExists(sanitizedFilename, {
            bucketNameOverride: companyLogoBucketName,
        });
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'Company logo not found',
            });
        }

        const signedUrl = await generateSignedUrl(
            sanitizedFilename,
            DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
            { bucketNameOverride: companyLogoBucketName }
        );

        return res.status(200).json({
            success: true,
            data: {
                url: signedUrl,
                expiresIn: DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
            },
        });
    } catch (error) {
        console.error('Error generating logo signed URL:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error generating company logo URL',
        });
    }
};

export const uploadMiddleware = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]);

export const uploadLogoMiddleware = uploadLogo.fields([
    { name: 'file', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
]);

export const handleUploadMulterError = (err, req, res, next) => {
    if (!err) {
        return next();
    }

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            const maxSize = req.path.includes('company-logo') || req.path.includes('/logo')
                ? '2MB'
                : '5MB';
            return res.status(400).json({
                success: false,
                message: `File size exceeds the maximum allowed size of ${maxSize}`,
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(400).json({
        success: false,
        message: err.message || 'Invalid upload request',
    });
};
