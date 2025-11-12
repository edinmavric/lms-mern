const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function generateUploadUrl({ bucket, key, contentType }) {
  if (!s3) {
    throw new Error(
      'S3 client not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
    );
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3, command, { expiresIn: 600 });
}

async function deleteFile({ bucket, key }) {
  if (!s3) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
}

function getFileUrl(bucket, key, region) {
  const reg = region || process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${reg}.amazonaws.com/${key}`;
}

module.exports = {
  generateUploadUrl,
  deleteFile,
  getFileUrl,
};
