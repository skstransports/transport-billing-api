// server/src/routes/billRoutes.js
const express = require('express');
const {
  createBill,
  getBills,
  updateBill,
  deleteBill,
  downloadBill, // ✅ New import
} = require('../controllers/billController');

const { protect } = require('../middleware/authMiddleware');
const { admin, adminOrStaff } = require('../middleware/roleMiddleware');

const router = express.Router();

// Create bill / Get bills
router
  .route('/')
  .post(protect, adminOrStaff, createBill) // Staff/Admin
  .get(protect, adminOrStaff, getBills);   // Staff/Admin

// Update / Delete bill
router
  .route('/:id')
  .put(protect, adminOrStaff, updateBill) // Admin or Owner Staff
  .delete(protect, admin, deleteBill);    // Admin only

// 📄 Download bill as PDF
router.get(
  '/:id/download',
  protect,
  adminOrStaff,
  downloadBill
);

module.exports = router;

