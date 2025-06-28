// imports Node modules for file paths & system
import path from 'path';
import fs from 'fs';

// defines request & response objects
export const uploadFont = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
// defines upload path & filename
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  // upload success message
  return res.status(200).json({
    message: 'Font uploaded successfully.',
    filename: fileName,
    path: filePath,
  });
};
