// imports mongoose module to connect with MongoDB
import mongoose from 'mongoose';

// defines the font schema in MongoDB
const fontSchema = new mongoose.Schema({
  name: String,
  family: String,
  style: String,
  weight: String,
  fullName: String,
  postscriptName: String,
  copyright: String, // license info
  originalFile: String,
  createdAt: { type: Date, default: Date.now },
});
// creates a model method using mongoose for DB manipulation
const Font = mongoose.model('Font', fontSchema);
export default Font;
