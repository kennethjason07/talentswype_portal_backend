import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
// Uses VM-attached service account on GCE (no JSON key file needed)
const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME || 'talentswype-resume-bucket';
const bucket = storage.bucket(bucketName);

const companyLogoBucketName = process.env.GCS_COMPANY_LOGO_BUCKET_NAME || 'talentswype-company-logo-bucket';
const companyLogoBucket = storage.bucket(companyLogoBucketName);

export { storage, bucket, bucketName, companyLogoBucket, companyLogoBucketName };
