// app.js
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import connectDB from './config/db.js';
import fontRoutes from './routes/fontRoutes.js';
import projectRoutes from './routes/projectsRoutes.js';
import publicFontRoutes from './routes/publicFontRoutes.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ===== ROUTES =====

// Secure API routes
app.use('/api/fonts', fontRoutes);       // Fonts CRUD
app.use('/api/projects', projectRoutes); // Projects CRUD

// Public font CSS route
app.use('/', publicFontRoutes); // e.g. /projects/:slug/fonts.css

// Test root
app.get('/', (req, res) => {
  res.send('FontFlow API is running...');
});

// Error handling middleware (optional but useful)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
