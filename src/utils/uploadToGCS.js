import { randomUUID } from 'crypto';
import path from 'path';
import { bucket } from '../config/gcs.config.js';

const MIME_TO_EXTENSION = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const sanitizeBaseName = (name) => {
    const rawBaseName = path.basename(name, path.extname(name)).toLowerCase();
    const safe = rawBaseName.replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return safe || 'resume';
};

/**
 * Upload a file to Google Cloud Storage (private bucket)
 */
export const uploadToGCS = async (fileBuffer, originalName, mimetype) => {
    try {
        const fileExtension = MIME_TO_EXTENSION[mimetype] || path.extname(originalName).toLowerCase();
        const safeBaseName = sanitizeBaseName(originalName);
        const uniqueFilename = `resumes/${Date.now()}-${randomUUID()}-${safeBaseName}${fileExtension}`;

        const file = bucket.file(uniqueFilename);

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
export const generateSignedUrl = async (filename, expiresIn = 900) => {
    try {
        const [url] = await bucket.file(filename).getSignedUrl({
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
export const deleteFromGCS = async (filename) => {
    try {
        await bucket.file(filename).delete();
    } catch (error) {
        console.error('Error deleting from GCS:', error);
        throw error;
    }
};

/**
 * Check if a file exists in GCS
 */
export const fileExists = async (filename) => {
    try {
        const [exists] = await bucket.file(filename).exists();
        return exists;
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
};
