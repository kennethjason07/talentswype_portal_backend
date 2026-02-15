import { randomUUID } from 'crypto';
import path from 'path';
import { storage, bucket, bucketName } from '../config/gcs.config.js';

const MIME_TO_EXTENSION = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/pjpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
};

const sanitizeBaseName = (name) => {
    const rawBaseName = path.basename(name, path.extname(name)).toLowerCase();
    const safe = rawBaseName.replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return safe || 'resume';
};

/**
 * Upload a file to Google Cloud Storage (private bucket)
 */
export const uploadToGCS = async (
    fileBuffer,
    originalName,
    mimetype,
    options = {}
) => {
    try {
        const {
            folder = 'resumes',
            defaultBaseName = 'resume',
            bucketNameOverride = null,
        } = options;
        const fileExtension = MIME_TO_EXTENSION[mimetype] || path.extname(originalName).toLowerCase();
        const safeBaseName = sanitizeBaseName(originalName);
        const uniqueFilename = `${folder}/${Date.now()}-${randomUUID()}-${safeBaseName || defaultBaseName}${fileExtension}`;

        const targetBucket = bucketNameOverride
            ? storage.bucket(bucketNameOverride)
            : bucket;
        const file = targetBucket.file(uniqueFilename);

        await file.save(fileBuffer, {
            metadata: {
                contentType: mimetype,
                metadata: {
                    originalName,
                    uploadedAt: new Date().toISOString(),
                },
            },
            resumable: false,
        });

        return {
            filename: uniqueFilename,
            bucket: bucketNameOverride || bucketName,
            originalName,
            size: fileBuffer.length,
            contentType: mimetype,
        };
    } catch (error) {
        console.error('Error uploading to GCS:', error);
        throw error;
    }
};

/**
 * Generate a signed URL for temporary access to a private file
 */
export const generateSignedUrl = async (filename, expiresIn = 900, options = {}) => {
    try {
        const targetBucket = options.bucketNameOverride
            ? storage.bucket(options.bucketNameOverride)
            : bucket;
        const [url] = await targetBucket.file(filename).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresIn * 1000,
        });

        return url;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};

/**
 * Delete a file from Google Cloud Storage
 */
export const deleteFromGCS = async (filename, options = {}) => {
    try {
        const targetBucket = options.bucketNameOverride
            ? storage.bucket(options.bucketNameOverride)
            : bucket;
        await targetBucket.file(filename).delete();
    } catch (error) {
        console.error('Error deleting from GCS:', error);
        throw error;
    }
};

/**
 * Check if a file exists in GCS
 */
export const fileExists = async (filename, options = {}) => {
    try {
        const targetBucket = options.bucketNameOverride
            ? storage.bucket(options.bucketNameOverride)
            : bucket;
        const [exists] = await targetBucket.file(filename).exists();
        return exists;
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
};
