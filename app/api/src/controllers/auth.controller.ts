
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    
    // Trim email to prevent space issues
    const cleanEmail = email.trim();

    // --- Password Validation ---
    if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ success: false, error: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, error: 'Password must contain at least one number.' });
    }
    // ---------------------------

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name,
        phone: '',
        about: '',
        photoUrl: '', // Default empty
      },
    });
    
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ 
      success: true, 
      data: { 
        token,
        user: { 
            id: newUser.id, 
            name: newUser.name, 
            email: newUser.email,
            photoUrl: newUser.photoUrl 
        } 
      } 
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim();
    
    console.log(`[Auth] Attempting login for: ${cleanEmail}`);

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      console.log(`[Auth] User not found: ${cleanEmail}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`[Auth] Password mismatch for: ${cleanEmail}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    
    console.log(`[Auth] Login successful for: ${cleanEmail}`);

    res.json({ 
      success: true, 
      data: { 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          phone: user.phone || '', 
          about: user.about || '',
          photoUrl: user.photoUrl || ''
        } 
      } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.userId; // Securely obtained from middleware

    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password, ...userData } = user;

    res.json({ success: true, data: { user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name, phone, about, photoUrl } = req.body;
    
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, about, photoUrl },
    });
    
    const { password, ...userData } = updatedUser;
    
    res.json({ success: true, message: 'Profile updated', data: { user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

export const requestPasswordReset = async (req: any, res: any) => {
  res.json({ success: true, message: 'If an account exists, instructions have been sent.' });
};
