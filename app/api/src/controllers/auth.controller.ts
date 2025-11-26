import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // In a production app, password should be hashed here (e.g. using bcrypt)
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Store hashed password in real app
        name,
        phone: '',
        about: '',
      },
    });
    
    res.status(201).json({ 
      success: true, 
      data: { 
        token: `jwt-token-${newUser.id}`, // Integrate real JWT generation here
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

    if (!user || user.password !== password) {
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
          phone: user.phone || '', // Handle nullable fields
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
    // In a real app, you would get the ID from req.user.id (middleware)
    // For now, we fetch the first user found or a specific demo user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const { name, phone, about } = req.body;
    
    // In a real app, use req.user.id
    const currentUser = await prisma.user.findFirst();

    if (!currentUser) {
       return res.status(404).json({ success: false, error: 'User context missing' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { name, phone, about },
    });
    
    res.json({ success: true, message: 'Profile updated', data: { user: updatedUser } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

export const requestPasswordReset = async (req: any, res: any) => {
  // Real implementation would check DB and send email via SMTP/SendGrid
  res.json({ success: true, message: 'If an account exists, instructions have been sent.' });
};