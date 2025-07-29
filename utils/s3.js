// utils/s3.js
import AWS from 'aws-sdk';

// Create S3 instance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY, // double-check key names
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Generate a presigned URL for a given S3 object key.
 * @param {string} key - The S3 object key (e.g. 'fonts/my-font.ttf')
 * @returns {Promise<string>} - Signed URL
 */
export const generateSignedUrl = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 60, // URL valid for 1 hour
  };

  return s3.getSignedUrlPromise('getObject', params);
};

export default s3;
