// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes by verifying the JWT and attaching the user to the request
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in the 'Authorization' header (Bearer Token format)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (removes 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID and attach to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
