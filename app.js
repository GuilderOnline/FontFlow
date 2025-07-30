// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';

import fontRoutes from './routes/fontRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import publicFontRoutes from './routes/publicFontRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://font-flow.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Security + JSON parsing
app.use(express.json());
app.use(helmet());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/fonts', apiLimiter, fontRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', publicFontRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app; // Required for Vercel
