import * as dotenv from 'dotenv';
import path from 'path';

// OPTION 1: If you always run the app from the project ROOT (standard)
// This looks for .env in the folder where you run the command
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// OPTION 2: If Option 1 fails, try forcing it relative to this file
// Go up two levels: src/config/env.ts -> src/config -> src -> ROOT
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("Loading ENV from:", path.resolve(process.cwd(), '.env')); // Debug log
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO"); // Debug log (don't log the actual secret)

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET as string; // Remove fallback to force error if missing
export const PORT = process.env.PORT || 3000;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';