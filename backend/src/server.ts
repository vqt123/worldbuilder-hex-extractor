import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { Database } from './database';
import { HexProcessor } from './hex-processor';
import { createAuthRoutes } from './routes/auth';
import { createImageRoutes } from './routes/images';
import { createHexRoutes } from './routes/hex';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'worldbuilder-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize services
const database = new Database();
const hexProcessor = new HexProcessor();

// Routes
app.use('/api/auth', createAuthRoutes(database));
app.use('/api/images', createImageRoutes(database, hexProcessor));
app.use('/api', createHexRoutes(database, hexProcessor));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});