// controllers/auth.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Sign Up - USR-AUTH-03
const signUp = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// Log In - USR-AUTH-01
const logIn = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profilePhoto: user.profilePhoto
      },
      token
    });
  } catch (error) {
    console.error('Log in error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

// Log Out - USR-AUTH-02
// Note: JWT is stateless, so logout is handled client-side by removing the token
// This endpoint is optional and can be used for logging purposes
const logOut = async (req, res) => {
  try {
    // Log the logout event (optional)
    console.log(`User ${req.user.id} logged out at ${new Date().toISOString()}`);

    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Log out error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
};

// Get Current User Profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(profilePhoto && { profilePhoto })
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePhoto: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Request Password Reset - USR-AUTH-04
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    // In production, send actual reset email here
    console.log(`Password reset requested for: ${email}`);

    res.json({
      message: 'If an account exists with this email, you will receive password reset instructions'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

module.exports = {
  signUp,
  logIn,
  logOut,
  getProfile,
  updateProfile,
  requestPasswordReset
};
