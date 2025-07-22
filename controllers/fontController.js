import path from 'path';
import fs from 'fs';
import Font from '../models/Font.js'; // import the Mongoose model



export const deleteFont = async (req, res) => {
  try {
    const font = await Font.findById(req.params.id);
    if (!font) {
      return res.status(404).json({ message: 'Font not found' });
    }

    // Optional: Delete the font file from the uploads folder
    if (font.originalFile) {
      const filePath = path.resolve(font.originalFile);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('⚠️ Failed to delete file:', filePath);
      });
    }

    await font.deleteOne();
    return res.status(200).json({ message: 'Font deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    return res.status(500).json({ message: 'Error deleting font' });
  }
};
// POST /api/fonts/upload
// controllers/fontController.js



export const uploadFont = async (req, res) => {
  console.log('📥 uploadFont controller hit');

  // Ensure a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  console.log(`📁 Upload received: ${fileName}`);
  console.log(`📍 Stored at: ${filePath}`);

  let metadata = {};

  try {
    // Dynamically import fontkit
    const fontkitModule = await import('fontkit');
    const fontkit = fontkitModule.default || fontkitModule;

    // Open and parse font file
    const font = fontkit.openSync(filePath);

    metadata = {
      family: font.familyName || '',
      fullName: font.fullName || '',
      postscriptName: font.postscriptName || '',
      style: font.subfamilyName || '',
      weight: font['OS/2']?.usWeightClass?.toString() || 'normal',
      copyright: font.copyright || '',
    };

    console.log('✅ Extracted metadata:', metadata);
  } catch (err) {
    console.warn('❌ Metadata extraction error:', err.message);
  }

  try {
    const fontDoc = new Font({
      name: fileName,
      originalFile: filePath,
      ...metadata,
    });

    await fontDoc.save();

    console.log('✅ Font document saved to MongoDB:', fontDoc);

    return res.status(200).json({
      message: 'Font uploaded successfully.',
      filename: fileName,
      path: filePath,
      metadata,
    });
  } catch (err) {
    console.error('❌ MongoDB save error:', err);
    return res.status(500).json({ message: 'Error saving font metadata' });
  }
};

// Get all fonts
export const getAllFonts = async (req, res) => {
  try {
    const fonts = await Font.find().sort({ createdAt: -1 }); // optional: newest first
    return res.status(200).json(fonts);
  } catch (err) {
    console.error('Error fetching fonts:', err);
    return res.status(500).json({ message: 'Error retrieving fonts' });
  }
};

/* DELETE /api/fonts/:id
export const deleteFont = async (req, res) => {
  try {
    const font = await Font.findById(req.params.id);
    if (!font) {
      return res.status(404).json({ message: 'Font not found' });
    }

    // Optionally delete local file (skip if using S3)
    if (font.originalFile && fs.existsSync(font.originalFile)) {
      fs.unlinkSync(font.originalFile);
    }

    await Font.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Font deleted successfully.' });
  } catch (err) {
    console.error('MongoDB delete error:', err);
    res.status(500).json({ message: 'Error deleting font' });
  }
}; */
