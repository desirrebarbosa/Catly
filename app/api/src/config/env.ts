import * as dotenv from 'dotenv';
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const JWT_SECRET = process.env.JWT_SECRET || "random super secret but to be changed";
export const PORT = process.env.PORT || 3000;
