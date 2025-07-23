import express from 'express';
import { uploadFont, deleteFont, getAllFonts } from '../controllers/fontController.js';
import apiKeyAuth from '../middleware/apiKeyAuth.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// ROUTES 🔽

// POST /api/fonts/upload (Requires JWT auth)
router.post('/upload', jwtAuth, upload.single('font'), uploadFont);

// GET /api/fonts (Requires API key)
router.get('/', apiKeyAuth, getAllFonts);

// DELETE /api/fonts/:id (Requires JWT auth)
router.delete('/:id', jwtAuth, deleteFont);

export default router;
