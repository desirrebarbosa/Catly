const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const authenticate = async (req, res, next) => {
  let token;

  // check if header exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(' ')[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // get user from the token
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          // role: true 
        }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, error: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

module.exports = { authenticate };