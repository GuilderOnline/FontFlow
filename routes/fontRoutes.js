import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Font route is working!');
});

export default router;
