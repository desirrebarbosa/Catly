import * as dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import { PORT } from './config/env';
import { prisma } from './config/db';
import { authRouter } from './routes/auth.routes';
import { catRouter } from './routes/cat.routes';
import { scheduleRouter } from './routes/schedule.routes';
import { contactRouter } from './routes/contact.routes';
import { adoptionRouter } from './routes/adoption.routes';
import { litterRouter } from './routes/litter.routes';
import { inventoryRouter } from './routes/inventory.routes';
import { runAutoArchive } from './controllers/cat.controller';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }) as any);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cats', catRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/adoptions', adoptionRouter);
app.use('/api/litters', litterRouter);
app.use('/api/inventory', inventoryRouter);

app.get('/', (req, res) => {
  res.send('🐱 Catly API is Purring!');
});

app.listen(PORT, async () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (e) {
    console.error("❌ Database connection failed.");
  }
  console.log("⏳ Checking for inactive cats...");
  await runAutoArchive();
});
