const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { generateToken } = require('../utils/jwt');

// helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  return null;
};


// sign up - create new user account, POST/api/signup
const signUp = async (req, res) => {
  try {
    // validate request
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password, name, phone } = req.body;

    // check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'An account with this email already exists.' 
      });
    }

    // hash password for security
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        phone: phone || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    // generate token
    const token = generateToken(user.id);

    // send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create account. Please try again.' 
    });
  }
};

// login, authemticate user, POST/api/auth/login
const logIn = async (req, res) => {
  try {
    // validate request
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    // find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password.' 
      });
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password.' 
      });
    }

    // generate token
    const token = generateToken(user.id);

    // send response
    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          profilePhoto: user.profilePhoto
        },
        token
      }
    });

  } catch (error) {
    console.error('Log in error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to log in. Please try again.' 
    });
  }
};

// logout - end user session, POST/api/auth/logout
const logOut = async (req, res) => {
  try {
    // JWT is stateless - logout is handled client-side
        
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });

  } catch (error) {
    console.error('Log out error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to log out.' 
    });
  }
};

// get profile - get current user profile GET/api/auth/profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get profile.' 
    });
  }
};

// update profile PUT/api/auth/profile
const updateProfile = async (req, res) => {
  try {
    // validate request
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { name, phone, profilePhoto } = req.body;

    // update user
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(profilePhoto !== undefined && { profilePhoto })
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
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile.' 
    });
  }
};

// password reset req POST/api/auth/password-reset
const requestPasswordReset = async (req, res) => {
  try {
    // validate request
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email } = req.body;

    // check if user exists, abstracted for security purposes
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // TODO: If user exists, send password reset email
    // for now, just log it
    if (user) {
      console.log(`Password reset requested for: ${email}`);
      // in production: send email with reset link
    }

    // always return success, security - prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process request.' 
    });
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
