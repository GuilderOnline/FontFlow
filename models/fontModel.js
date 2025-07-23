// models/fontModel.js
import mongoose from 'mongoose';

const fontSchema = new mongoose.Schema({
  name: String,
  family: String,
  style: String,
  weight: String,
  fullName: String,
  postscriptName: String,
  copyright: String,
  originalFile: String,
  createdAt: { type: Date, default: Date.now },
});

const Font = mongoose.model('Font', fontSchema);
export default Font;
