const { prisma } = require('../config/database');
const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    // extract token
    const token = authHeader.split(' ')[1];

    // verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token.' 
      });
    }

    // get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        phone: true,
        profilePhoto: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found.' 
      });
    }

    // attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication error.' 
    });
  }
};

module.exports = { authenticate };
