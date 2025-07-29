// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import fontRoutes from './routes/fontRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import publicFontRoutes from './routes/publicFontRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Global Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // local dev
    "https://your-frontend.vercel.app", // production frontend (if separate)
    "https://fontflow-production.up.railway.app" // if hosting frontend on Railway
  ],
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// ✅ Root route for API
app.get("/", (req, res) => {
  res.send("🚀 FontFlow API is running. Visit /api/health for status.");
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fonts', apiLimiter, fontRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', publicFontRoutes);

// ✅ Serve React frontend build (from dashboard-ui/dist)
const frontendPath = path.join(__dirname, "dashboard-ui", "dist");
app.use(express.static(frontendPath));

// ✅ Catch-all to serve index.html for React Router
app.get("*", (req, res) => {
  // Prevent overwriting API routes
  if (req.originalUrl.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
