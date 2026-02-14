import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
// Uses VM-attached service account on GCE (no JSON key file needed)
const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME || 'talentswype-resume-bucket';
const bucket = storage.bucket(bucketName);

export { storage, bucket, bucketName };
