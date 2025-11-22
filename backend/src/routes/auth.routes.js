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

// Protected
router.post('/logout', authenticate, logOut);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

// ⚠️ THIS IS THE LINE THAT WAS LIKELY MISSING OR BROKEN
module.exports = router;