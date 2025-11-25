const express = require('express');
const router = express.Router();

// Import controller
const {
  signUp,
  logIn,
  logOut,
  getProfile,
  updateProfile,
  requestPasswordReset
} = require('../controllers/auth.controller');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');

// Import validators
const {
  signUpValidator,
  logInValidator,
  passwordResetValidator,
  updateProfileValidator
} = require('../validators/auth.validator');

// --- Routes ---

// Public
router.post('/signup', signUpValidator, signUp);
router.post('/login', logInValidator, logIn);
router.post('/password-reset', passwordResetValidator, requestPasswordReset);

// Logout should be accessible even if token is expired to allow clearing client state
router.post('/logout', logOut);

// Protected
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

module.exports = router;