import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import skillsRouter from './routes/skills.js';
import projectsRouter from './routes/projects.js';
import internshipsRouter from './routes/internships.js';
import profileRouter from './routes/profile.js';
import certificatesRouter from './routes/certificates.js';
import clubsRouter from './routes/clubs.js';
import volunteerRouter from './routes/volunteer.js';
import sportsRouter from './routes/sports.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import { seedSampleUser } from './utils/eduIdGenerator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 image uploads

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI is not defined in the .env file. Database connection skipped.');
      return;
    }

    // Force Node.js to use Google DNS to bypass local SRV lookup failures (ECONNREFUSED)
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log('✅ MongoDB Connected Successfully');

    // Automatically ensure sample user EUKA2026001 is seeded
    await seedSampleUser();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'EduID Backend is running!' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/internships', internshipsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/volunteer', volunteerRouter);
app.use('/api/sports', sportsRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
