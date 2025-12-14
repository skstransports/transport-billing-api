// server/src/middleware/roleMiddleware.js

// Middleware to restrict access to Admins only
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};

// Middleware to restrict access to Admins or Staff
exports.adminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, must be Admin or Staff' });
  }
};
