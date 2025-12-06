
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { JWT_SECRET, GOOGLE_CLIENT_ID } from '../config/env';
import { sendPasswordResetEmail } from '../services/email';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const signToken = (userId: string | number, expiresIn: string | number = '30d') => {
  // 3. Ensure options object is typed correctly 
  // (We cast strictly to ensure TS doesn't complain about string | number union)
  return jwt.sign({ userId }, JWT_SECRET, { 
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'] 
  });
};

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, error: 'Password too weak (8+ chars, 1 Upper, 1 Number).' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name,
      },
    });
    
    const token = signToken(newUser.id);
    res.status(201).json({ success: true, data: { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, photoUrl: newUser.photoUrl } } });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    if (user.password === 'GOOGLE_AUTH') {
        return res.status(400).json({ success: false, error: 'Please use Google Sign-In for this account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // Check 2FA
    if (user.is2FAEnabled) {
        // Return a temp token valid for 5 minutes just for 2FA verification
        const tempToken = jwt.sign({ userId: user.id, isTemp: true }, JWT_SECRET, { expiresIn: '5m' });
        return res.json({ 
            success: true, 
            requires2FA: true, 
            data: { tempToken } 
        });
    }

    const token = signToken(user.id);
    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, about: user.about, photoUrl: user.photoUrl } } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const login2FA = async (req: any, res: any) => {
    try {
        const { tempToken, code } = req.body;
        
        // Verify temp token
        let decoded: any;
        try {
            decoded = jwt.verify(tempToken, JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ success: false, error: 'Session expired. Login again.' });
        }

        if (!decoded.isTemp) return res.status(400).json({ success: false, error: 'Invalid 2FA flow.' });

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.is2FAEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA not enabled for this user.' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (!verified) return res.status(401).json({ success: false, error: 'Invalid 2FA Code' });

        const token = signToken(user.id);
        res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, about: user.about, photoUrl: user.photoUrl } } });

    } catch (error) {
        res.status(500).json({ success: false, error: '2FA verification failed' });
    }
};

export const googleLogin = async (req: any, res: any) => {
    try {
        const { idToken } = req.body;
        
        // Verify Google Token
        let payload;
        if (GOOGLE_CLIENT_ID) {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } else {
            // Mock for dev if keys missing
            payload = { email: 'mock@google.com', name: 'Mock User', sub: 'mock_google_id' }; 
        }

        if (!payload || !payload.email) return res.status(400).json({ success: false, error: 'Invalid Google Token' });

        const { email, name, picture } = payload;
        
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create User
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'Google User',
                    password: 'GOOGLE_AUTH',
                    photoUrl: picture
                }
            });
        }

        const token = signToken(user.id);
        res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl } } });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, error: 'Google Login failed' });
    }
};

// --- 2FA Management ---

export const generate2FA = async (req: any, res: any) => {
    try {
        const userId = req.userId;
        const secret = speakeasy.generateSecret({ name: `Catly (${req.userEmail})` });
        
        res.json({ 
            success: true, 
            data: { 
                otpauth_url: secret.otpauth_url,
                base32: secret.base32 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to generate 2FA' });
    }
};

export const verifyAndEnable2FA = async (req: any, res: any) => {
    try {
        const userId = req.userId;
        const { token, secret } = req.body;

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            await prisma.user.update({
                where: { id: userId },
                data: { is2FAEnabled: true, twoFactorSecret: secret }
            });
            res.json({ success: true, message: '2FA Enabled Successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid Code' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to verify 2FA' });
    }
};

export const disable2FA = async (req: any, res: any) => {
    try {
        await prisma.user.update({
            where: { id: req.userId },
            data: { is2FAEnabled: false, twoFactorSecret: null }
        });
        res.json({ success: true, message: '2FA Disabled' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to disable 2FA' });
    }
};

// --- Password Reset ---

export const requestPasswordReset = async (req: any, res: any) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Generate simple 6 digit code for reset
            const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

            await prisma.user.update({
                where: { id: user.id },
                data: { resetToken, resetTokenExpiry: expiry }
            });

            await sendPasswordResetEmail(user.email, resetToken);
        }

        // Always return success to prevent email enumeration
        res.json({ success: true, message: 'If account exists, email sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Request failed' });
    }
};

// Helpers for profile
export const getProfile = async (req: any, res: any) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ success: false });
  const { password, twoFactorSecret, resetToken, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser } });
};

export const updateProfile = async (req: any, res: any) => {
    const { name, phone, about, photoUrl } = req.body;
    const user = await prisma.user.update({
        where: { id: req.userId },
        data: { name, phone, about, photoUrl }
    });
    const { password, twoFactorSecret, resetToken, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser } });
};
