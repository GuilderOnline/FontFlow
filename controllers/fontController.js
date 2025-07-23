import Font from '../models/fontModel.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate a random filename to avoid collisions
const generateFileName = (originalName) => {
  const ext = originalName.split('.').pop();
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  return uniqueName;
};

// 📤 Upload font to S3 and extract metadata
export const uploadFont = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileBuffer = req.file.buffer;
  const originalName = req.file.originalname;
  const fileName = generateFileName(originalName);

  let metadata = {};

  try {
    const { default: fontkit } = await import('fontkit');
    const font = fontkit.create(fileBuffer);


    metadata = {
      family: font.familyName || '',
      fullName: font.fullName || '',
      postscriptName: font.postscriptName || '',
      style: font.subfamilyName || '',
      weight: font['OS/2']?.usWeightClass?.toString() || 'normal',
      copyright: font.copyright || '',
    };
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

    const fontDoc = new Font({
      name: originalName,
      originalFile: fileName,
      ...metadata,
    });

    await fontDoc.save();

    return res.status(200).json({
      message: 'Font uploaded successfully.',
      filename: originalName,
      s3Key: fileName,
      metadata,
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    return res.status(500).json({ message: 'Error uploading font' });
  }
};

// 📄 Get all fonts
export const getAllFonts = async (req, res) => {
  try {
    const fonts = await Font.find().sort({ createdAt: -1 });
    res.status(200).json(fonts);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ message: 'Error fetching fonts' });
  }
};

// ❌ Delete font
export const deleteFont = async (req, res) => {
  try {
    const font = await Font.findByIdAndDelete(req.params.id);

    if (!font) {
      return res.status(404).json({ message: 'Font not found' });
    }

    // Delete from S3
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
