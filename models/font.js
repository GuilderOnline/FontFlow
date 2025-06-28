// imports mongoose module to connect with MongoDB
import mongoose from 'mongoose';

// defines the font schema in MongoDB
const fontSchema = new mongoose.Schema({
  name: String,
  weight: String,
  style: String,
  originalFile: String,
  convertedFile: String,
  createdAt: { type: Date, default: Date.now }
});
// creates a model method using mongoose for DB manipulation
const Font = mongoose.model('Font', fontSchema);
export default Font;
