import mongoose from 'mongoose';

const fontSchema = new mongoose.Schema({
  name: String,
  weight: String,
  style: String,
  originalFile: String,
  convertedFile: String,
  createdAt: { type: Date, default: Date.now }
});

const Font = mongoose.model('Font', fontSchema);
export default Font;
