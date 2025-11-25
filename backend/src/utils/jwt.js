const jwt = require('jsonwebtoken');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('WARNING: JWT_SECRET is not defined in .env. Using fallback secret (unsafe for production).');
    return 'secret'; 
  }
  return secret;
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };