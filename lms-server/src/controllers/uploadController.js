const { generateUploadUrl, getFileUrl } = require('../utils/s3');
const { asyncHandler } = require('../utils/async');

exports.getUploadUrl = asyncHandler(async (req, res) => {
  const { fileName, contentType } = req.query;

  if (!fileName || !contentType) {
    return res.status(400).json({ message: 'Missing fileName or contentType' });
  }

  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    return res.status(500).json({ message: 'AWS_BUCKET_NAME not configured' });
  }

  const tenantPrefix = req.tenantId || 'global';
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${tenantPrefix}/materials/${timestamp}-${sanitizedFileName}`;

  const uploadUrl = await generateUploadUrl({
    bucket,
    key,
    contentType,
  });

  const fileUrl = getFileUrl(bucket, key, process.env.AWS_REGION);

  res.json({
    uploadUrl,
    fileUrl,
    storageKey: key,
  });
});
