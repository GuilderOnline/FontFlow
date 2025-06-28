// import express, multer & uploadFont
import express from 'express';
import multer from 'multer';
import { uploadFont } from '../controllers/fontController.js';

// new router instance
const router = express.Router();

//  multer configuration
const storage = multer.diskStorage({ // use disk storage for uploads
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save to uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use orginal file name
  },
});
// applies storage configuration
const upload = multer({ storage });

router.post('/upload', upload.single('AurumIcons'), uploadFont); // used AurumIcons file name for Postman testing

export default router;
