const express = require('express');
const { body } = require('express-validator');
const {
  signUp,
  logIn,
  logOut,
  getProfile,
  updateProfile,
  requestPasswordReset
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const signUpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
];

const logInValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Public routes
router.post('/signup', signUpValidation, signUp);
router.post('/login', logInValidation, logIn);
router.post('/password-reset', 
  body('email').isEmail().normalizeEmail(),
  requestPasswordReset
);

// Protected routes (require authentication)
router.post('/logout', authenticate, logOut);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;