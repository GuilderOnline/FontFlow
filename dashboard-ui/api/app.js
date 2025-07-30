import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoose from 'mongoose';
import serverless from 'serverless-http';

// Import your routes
import fontRoutes from '../../routes/fontRoutes.js';
import { apiLimiter } from '../../middleware/rateLimiter.js';
import authRoutes from '../../routes/authRoutes.js';
import projectsRoutes from '../../routes/projectsRoutes.js';
import publicFontRoutes from '../../routes/publicFontRoutes.js';

dotenv.config();

const app = express();

// ------------------------------
// ✅ Connect to MongoDB only once
// ------------------------------
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    // Already connected
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Avoids memory leaks
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

// Call immediately at cold start
await connectToDatabase();

// ------------------------------
// Middleware
// ------------------------------
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://font-flow.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// ------------------------------
// Routes
// ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/fonts', apiLimiter, fontRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', publicFontRoutes);

// ------------------------------
// Export for Vercel serverless
// ------------------------------
export default serverless(app);
