const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========== PROTECT MIDDLEWARE ==========
// This middleware checks if the user is authenticated
const protect = async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is approved (admin is always approved)
      if (!req.user.isApproved && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Your account is pending approval. Please contact admin.' });
      }
      
      next(); // User is authenticated, continue to next middleware/route
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// ========== ADMIN MIDDLEWARE ==========
// This middleware checks if the user has admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, continue
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };