require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const httpStatus = require('http-status');
const otherHelper = require('./others.helper');
const multer = require('multer');

const maxFileSize = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  },
});

const mimeType = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'application/pdf': 'pdf',
};

const uploaderHelper = {};

uploaderHelper.uploadFiles = (folderName = 'uploads', fieldName = 'file') => {
  const upload = multer({
    storage: multer.memoryStorage(), 
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      if (mimeType[file.mimetype]) cb(null, true);
      else cb(new Error('Only image/video files are allowed'), false);
    },
  }).array(fieldName);

  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        let status = httpStatus.BAD_REQUEST;
        let msg = err.message || 'File upload failed';

        if (err.code === 'LIMIT_FILE_SIZE') {
          status = httpStatus.REQUEST_ENTITY_TOO_LARGE; // 413
          msg = `File must be smaller than ${maxFileSize / (1024 * 1024)}MB`;
        } else if (err.status === 413 || err.statusCode === 413 || err.code === 'LIMIT_UNEXPECTED_FILE') {
          status = httpStatus.REQUEST_ENTITY_TOO_LARGE;
          msg = 'Uploaded payload is too large';
        }

        return otherHelper.sendResponse(res, status, false, null, null, msg, null);
      }

      // Normalize files so empty or null pictures don't produce [null] downstream.
      if (!req.files || req.files.length === 0) {
        req.files = [];
        return next();
      }

      req.files = req.files.filter((f) => f != null && f.buffer);
      try {
        const uploadedLocations = [];
        
        for (const file of req.files) {
          const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', 
          };

          const command = new PutObjectCommand(uploadParams);
          await s3.send(command);

          const location = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
          uploadedLocations.push(location);
        }

        req.files = req.files.map((file, index) => ({
          ...file,
          location: uploadedLocations[index]
        }));

        next(); 
      } catch (error) {
        console.error('S3 upload error:', error);
        return otherHelper.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, error, null, 'S3 upload failed', null);
      }
    });
  };
};

module.exports = uploaderHelper;