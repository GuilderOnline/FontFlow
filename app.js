// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';

import fontRoutes from './routes/fontRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Global Middleware
app.use(cors());
app.use(express.json());         // Must come before routes to parse JSON
app.use(helmet());               // Adds security headers

// ✅ Routes
app.use('/api/auth', authRoutes);                // Login routes
app.use('/api/fonts', apiLimiter, fontRoutes);   // Font API + rate limiter

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.use(cors({ origin: 'http://localhost:3000' }));
