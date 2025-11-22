const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed');
    error.statusCode = 400;
    error.data = errors.array();
    throw error;
  }
};

// controller methods

const signUp = catchAsync(async (req, res) => {
  handleValidation(req);
  const result = await authService.signUp(req.body);
  res.status(201).json({ success: true, message: 'Account created.', data: result });
});

const logIn = catchAsync(async (req, res) => {
  handleValidation(req);
  const result = await authService.logIn(req.body.email, req.body.password);
  res.json({ success: true, message: 'Logged in successfully.', data: result });
});

const getProfile = catchAsync(async (req, res) => {
  // req.user.id comes from the auth middleware
  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, data: { user } });
});

const updateProfile = catchAsync(async (req, res) => {
  handleValidation(req);
  const updatedUser = await authService.updateUserProfile(req.user.id, req.body);
  res.json({ success: true, message: 'Profile updated.', data: { user: updatedUser } });
});

const requestPasswordReset = catchAsync(async (req, res) => {
  handleValidation(req);
  await authService.requestPasswordReset(req.body.email);
  res.json({ success: true, message: 'If an account exists, instructions have been sent.' });
});

const logOut = catchAsync(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = { signUp, logIn, logOut, getProfile, updateProfile, requestPasswordReset };