import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import serverless from 'serverless-http'; // ✅

import fontRoutes from '../../routes/fontRoutes.js';
import { apiLimiter } from '../../middleware/rateLimiter.js';
import authRoutes from '../../routes/authRoutes.js';
import projectsRoutes from '../../routes/projectsRoutes.js';
import publicFontRoutes from '../../routes/publicFontRoutes.js';

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://font-flow.vercel.app'
  ],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(helmet());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/fonts', apiLimiter, fontRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', publicFontRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ For local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running on http://localhost:${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export const handler = serverless(app);
