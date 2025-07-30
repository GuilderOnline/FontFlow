import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
  const { email, password } = req.body;

  // Dummy check — replace with your DB login later
  if (email === 'test@example.com' && password === 'password') {
    return res.json({
      token: 'fake-jwt-token',
      user: { id: '1', role: 'admin' }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default serverless(app);
