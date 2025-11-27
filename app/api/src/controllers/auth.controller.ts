import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: '',
        about: '',
      },
    });
    
    res.status(201).json({ 
      success: true, 
      data: { 
        token: `jwt-token-${newUser.id}`, // In production, use real JWT library
        user: { id: newUser.id, name: newUser.name, email: newUser.email } 
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
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      data: { 
        token: `jwt-token-${user.id}`, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          phone: user.phone || '', 
          about: user.about || '' 
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
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Exclude password from response
    const { password, ...userData } = user;

    res.json({ success: true, data: { user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const { name, phone, about } = req.body;
    
    const currentUser = await prisma.user.findFirst();

    if (!currentUser) {
       return res.status(404).json({ success: false, error: 'User context missing' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { name, phone, about },
    });
    
    const { password, ...userData } = updatedUser;
    
    res.json({ success: true, message: 'Profile updated', data: { user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

export const requestPasswordReset = async (req: any, res: any) => {
  // In a real app, send email here
  res.json({ success: true, message: 'If an account exists, instructions have been sent.' });
};