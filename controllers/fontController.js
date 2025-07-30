import Font from '../models/fontModel.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import dotenv from 'dotenv';
import * as fontkit from 'fontkit';
import ttf2woff2 from 'ttf2woff2'; // npm install ttf2woff2
import { fileTypeFromBuffer } from 'file-type'; // npm install file-type

dotenv.config();

// AWS S3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate unique filename
const generateFileName = (ext) =>
  `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

// Allowed extensions
const allowedExtensions = ['ttf', 'otf', 'eot', 'woff', 'woff2'];

// Upload Font Controller
export const uploadFont = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const fileBuffer = req.file.buffer;
  const originalName = req.file.originalname;
  const ext = originalName.split('.').pop().toLowerCase();

  // Validate file type
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      message: '❌ Invalid format. Only .ttf, .otf, .eot, .woff, or .woff2 are allowed.',
    });
  }

  // Prepare metadata
  let metadata = {};
  try {
    const font = fontkit.create(fileBuffer);
    const nameRecords = font?.name?.records || {};

    const getNameValue = (field) =>
      nameRecords[field]?.en || nameRecords[field]?.['0-0'] || '';

    metadata = {
      family: getNameValue('fontFamily'),
      fullName: getNameValue('fullName'),
      postscriptName: getNameValue('postscriptName'),
      style: getNameValue('fontSubfamily'),
      weight: font['OS/2']?.usWeightClass?.toString() || 'normal',
      copyright: getNameValue('copyright'),
      version: getNameValue('version'),
      manufacturer: getNameValue('manufacturer'),
      designer: getNameValue('designer'),
      description: getNameValue('description'),
      license: getNameValue('license'),
    };
  } catch (err) {
    console.warn('⚠️ Could not extract font metadata:', err.message);
  }

  try {
    // Generate filenames
    const originalFileName = generateFileName(ext);
    const woff2FileName = generateFileName('woff2');

    // Upload original file
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: originalFileName,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    }));

    // Convert to WOFF2 if not already
    if (ext !== 'woff2') {
      const woff2Buffer = ttf2woff2(fileBuffer);
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: woff2FileName,
        Body: woff2Buffer,
        ContentType: 'font/woff2',
      }));
    }

    // Save to MongoDB
    const fontDoc = new Font({
      name: originalName,
      originalFile: originalFileName,
      woff2File: ext === 'woff2' ? originalFileName : woff2FileName,
      user: req.user.id,
      ...metadata,
    });
    await fontDoc.save();

    // Get signed URLs
    const originalUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: originalFileName,
    }), { expiresIn: 3600 });

    const woff2Url = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: ext === 'woff2' ? originalFileName : woff2FileName,
    }), { expiresIn: 3600 });

    res.status(200).json({
      message: 'Font uploaded successfully.',
      filename: originalName,
      originalUrl,
      woff2Url,
      metadata,
    });

  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: 'Error uploading font' });
  }
};
