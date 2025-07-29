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

// ✅ Global Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // local dev
    "https://your-frontend.vercel.app", // production frontend
    "https://fontflow-production.up.railway.app" // if hosting frontend on Railway
  ],
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// ✅ Root route for browser visits
app.get("/", (req, res) => {
  res.send("🚀 FontFlow API is running. Visit /api/health for status.");
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/fonts', apiLimiter, fontRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', publicFontRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
