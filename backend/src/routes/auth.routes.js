const express = require('express');
const router = express.Router();

// import controller
const {
  signUp,
  logIn,
  logOut,
  getProfile,
  updateProfile,
  requestPasswordReset
} = require('../controllers/auth.controller');

// import middleware
const { authenticate } = require('../middleware/auth.middleware');

// import validators
const {
  signUpValidator,
  logInValidator,
  passwordResetValidator,
  updateProfileValidator
} = require('../validators/auth.validator');

// public routes
// POST /api/auth/signup - Create new account
router.post('/signup', signUpValidator, signUp);

// POST /api/auth/login - Log in
router.post('/login', logInValidator, logIn);

// POST /api/auth/password-reset - Request password reset
router.post('/password-reset', passwordResetValidator, requestPasswordReset);

// protected routes
// POST /api/auth/logout - Log out
router.post('/logout', authenticate, logOut);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile - Update profile
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

module.exports = router;