import express from 'express';
import multer from 'multer';
import { uploadFont, deleteFont, getAllFonts } from '../controllers/fontController.js';
import apiKeyAuth from '../middleware/apiKeyAuth.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// File type filter: only allow .woff, .woff2, .ttf, .otf
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.woff', '.woff2', '.ttf', '.otf'];
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (allowedTypes.includes(`.${ext}`)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ROUTES 🔽

// POST /api/fonts/upload
router.post('/upload', apiKeyAuth, upload.single('font'), uploadFont);

// GET /api/fonts
router.get('/', apiKeyAuth, getAllFonts);

// DELETE /api/fonts/:id
router.delete('/:id', apiKeyAuth, deleteFont);

export default router;
