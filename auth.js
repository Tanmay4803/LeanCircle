// src/middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      // Check if user is active
      if (user.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Check if password was changed after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'User recently changed password. Please log in again.'
        });
      }

      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please log in again.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.status === 'Active' && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
    } catch (jwtError) {
      // Silently ignore token errors for optional auth
    }

    next();

  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

// Check if user can access employee data
const canAccessEmployee = async (req, res, next) => {
  try {
    const { user } = req;
    const employeeId = req.params.id || req.params.employeeId;

    // Administrators and HR Managers can access all employee data
    if (['Administrator', 'HR Manager'].includes(user.role)) {
      return next();
    }

    // Managers can access their team members (this would need team structure)
    if (user.role === 'Manager') {
      // TODO: Implement team-based access control
      return next();
    }

    // Employees can only access their own data
    if (user.role === 'Employee') {
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ 
        _id: employeeId,
        email: user.email 
      });

      if (!employee) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
    }

    next();

  } catch (error) {
    console.error('Employee access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during access check'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  canAccessEmployee
};
