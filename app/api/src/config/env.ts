import * as dotenv from 'dotenv';
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const JWT_SECRET = process.env.JWT_SECRET || "some super secret key since for some reason env cant be processed.";
export const PORT = process.env.PORT || 3000;
