// server/server.js
import mongoose from 'mongoose';
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

const corsOptions = {
  origin: 'https://my-task-manager-sable.vercel.app', // <-- The Production URL
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());

// Import and use the task routes
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import workUpdateRoutes from './routes/workUpdateRoutes.js';

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/updates', workUpdateRoutes);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));