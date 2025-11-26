import express from 'express';
import cors from 'cors';
import { PORT } from './config/env';
import { authRouter } from './routes/auth.routes';
import { catRouter } from './routes/cat.routes';
// import { runAutoArchive } from './controllers/cat.controller';

const app = express();

app.use(cors());
// Fix: Explicitly cast to RequestHandler to resolve type mismatch between connect and express types
app.use(express.json({ limit: '10mb' }) as express.RequestHandler); // Increased limit for Base64 photos

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cats', catRouter);

// Base route
app.get('/', (req, res) => {
  res.send('🐱 Catly API is Purring!');
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  
  // // Run Auto-Archiver on startup
  // console.log("⏳ Checking for inactive cats...");
  // await runAutoArchive();
});