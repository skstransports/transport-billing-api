// server/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Staff/Admin initial setup)
// @route   POST /api/auth/register
// @access  Public (Should be restricted after initial admin setup)
exports.registerUser = async (req, res) => {
  const { name, mobileNumber, password, role } = req.body;

  // Simple validation for roles
  if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const userExists = await User.findOne({ mobileNumber });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const user = await User.create({
      name,
      mobileNumber,
      password,
      role
      // Other fields (salary/license) can be added later by admin
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
      res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { mobileNumber, password } = req.body;

  const user = await User.findOne({ mobileNumber });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid mobile number or password' });
  }
};
