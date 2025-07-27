import Font from '../models/fontModel.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import dotenv from 'dotenv';
import * as fontkit from 'fontkit';

dotenv.config();

// 🔐 AWS S3 Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 🧠 Generate a unique filename
const generateFileName = (originalName) => {
  const ext = originalName.split('.').pop();
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
};

// 📤 Upload Font Controller
export const uploadFont = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileBuffer = req.file.buffer;
  const originalName = req.file.originalname;
  const fileName = generateFileName(originalName);

  let metadata = {};

  try {
    const font = fontkit.create(fileBuffer);
    const nameRecords = font?.name?.records || {};

    const getNameValue = (field) =>
      nameRecords[field]?.en ||
      nameRecords[field]?.['0-0'] ||
      '';

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

    console.log('📦 Extracted metadata:', metadata);
  } catch (err) {
    console.warn('⚠️ Could not extract font metadata:', err.message);
  }

  try {
    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    }));

    // Save font record in MongoDB
    const fontDoc = new Font({
      name: originalName,
      originalFile: fileName,
      user: req.user.userId,
      ...metadata,
    });

    await fontDoc.save();

    // Generate signed URL
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
    }), { expiresIn: 3600 });

    res.status(200).json({
      message: 'Font uploaded successfully.',
      filename: originalName,
      s3Key: fileName,
      metadata,
      url: signedUrl,
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: 'Error uploading font' });
  }
};

// 📄 Get Fonts for Logged-In User
export const getAllFonts = async (req, res) => {
  try {
    const fonts = await Font.find({ user: req.user.userId }).sort({ createdAt: -1 });

    const fontsWithUrls = await Promise.all(fonts.map(async (font) => {
      const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: font.originalFile,
      }), { expiresIn: 3600 });

      return {
        ...font.toObject(),
        url: signedUrl,
      };
    }));

    res.status(200).json(fontsWithUrls);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ message: 'Error fetching fonts' });
  }
};

// 🗑️ Delete Font
export const deleteFont = async (req, res) => {
  try {
    const font = await Font.findByIdAndDelete(req.params.id);

    if (!font) {
      return res.status(404).json({ message: 'Font not found' });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: font.originalFile,
    }));

    res.status(200).json({ message: 'Font deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Error deleting font' });
  }
};
