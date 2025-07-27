// middleware/jwtAuth.js
import jwt from 'jsonwebtoken';

export const jwtAuth = (req, res, next) => {
  console.log('🧾 Incoming headers:', req.headers);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ Missing or malformed Authorization header');
    return res.status(401).json({ message: 'Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Token received in middleware:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
