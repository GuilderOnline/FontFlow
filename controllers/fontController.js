// imports Node modules for file paths & system
import path from 'path';
import fs from 'fs';
import Font from '../models/Font.js'; // import the Mongoose model

// defines request & response objects
export const uploadFont = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  // Save metadata to MongoDB
  try {
    const font = new Font({
      name: fileName,
      originalFile: filePath,
    });

    await font.save();

    return res.status(200).json({
      message: 'Font uploaded successfully.',
      filename: fileName,
      path: filePath,
    });
  } catch (err) {
    console.error('MongoDB save error:', err);
    return res.status(500).json({ message: 'Error saving font metadata' });
  }
};
