// models/font.js
import mongoose from 'mongoose';

const fontSchema = new mongoose.Schema({
  fullName: String,
  style: String,
  weight: String,
  description: String,
  manufacturer: String,
  license: String,
  originalFile: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  createdAt: { type: Date, default: Date.now },
});

// Prevent OverwriteModelError in dev mode (e.g. Vite or Nodemon hot reload)
const Font = mongoose.models.Font || mongoose.model('Font', fontSchema);
export default Font;
