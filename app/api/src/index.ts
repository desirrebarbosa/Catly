
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

// Fix for missing types in environment without @types/node
declare var require: any;
declare var module: any;

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

// Health Check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).send('✅ API is healthy. Database: Connected');
    } catch (e: any) {
        res.status(500).send(`❌ API Error. DB Disconnected: ${e.message}`);
    }
});

app.get('/', (req, res) => {
  res.send('🐱 Catly API is Purring!');
});

// --- Serverless Export ---
// This allows Vercel to handle the request without needing app.listen()
export default app;

// --- Local / Standalone Server Logic ---
// Only listen on a port if this file is run directly (e.g. 'npm start' or 'nodemon')
// In Vercel, this block is skipped, preventing port conflicts or timeouts.
if (require.main === module) {
    const server = app.listen(PORT, async () => {
        console.log(`🚀 API Server running on port ${PORT}`);
        try {
            await prisma.$connect();
            console.log("✅ Database connected successfully");
            console.log("⏳ Checking for inactive cats...");
            // Only run background tasks in standalone mode
            await runAutoArchive();
        } catch (e) {
            console.error("❌ Database connection failed at startup.");
        }
    });

    server.on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`\n❌ CRITICAL ERROR: Port ${PORT} is already in use.`);
            console.error(`   Please kill the process running on port ${PORT} and try again.`);
            (process as any).exit(1);
        } else {
            console.error("Server error:", e);
        }
    });

    const gracefulShutdown = async () => {
        console.log('\n🛑 Received kill signal, shutting down gracefully');
        server.close(() => {
            console.log('   HTTP server closed');
            prisma.$disconnect().then(() => {
                console.log('   Database connection closed');
                (process as any).exit(0);
            });
        });
        setTimeout(() => {
            console.error('   Could not close connections in time, forcefully shutting down');
            (process as any).exit(1);
        }, 10000);
    };

    (process as any).on('SIGTERM', gracefulShutdown);
    (process as any).on('SIGINT', gracefulShutdown);
}
