// imports: express, cors, mongoose, dotenv & fontRoutes
import express from 'express'; // enables HTTP server
import cors from 'cors'; // enables CORS
import mongoose from 'mongoose'; // enables MongoDB
import dotenv from 'dotenv'; // loads .env file
import fontRoutes from './routes/fontRoutes.js'; // enable API endpoints for font upload

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // defaults to port 4000

// middleware
app.use(cors());
app.use(express.json()); // express can parse JSON

// font routes defined
app.use('/api/fonts', fontRoutes);

// mongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected')) // console message - works
  .catch(err => console.error('MongoDB connection error:', err)); // console message - not working

// starts the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
