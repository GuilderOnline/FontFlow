// routes/authRoutes.js

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Load environment variables

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 🚫 If no body is provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required.' });
  }

  // ✅ Dummy authentication logic
  if (username === 'admin' && password === 'password123') {
    const token = jwt.sign({ user: username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({
      message: 'Login successful',
      token,
    });
  }

  // ❌ Invalid credentials
  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
