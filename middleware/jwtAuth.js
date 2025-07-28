// middleware/jwtAuth.js
import jwt from 'jsonwebtoken';

export const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔧 Updated to support both `userId` and `id` formats
    req.user = {
      id: decoded.userId || decoded.id, // ← FIXED HERE
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
