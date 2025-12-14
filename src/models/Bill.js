// server/src/models/Bill.js
const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema(
  {
    // Bill Details
    billNumber: { type: String, unique: true, required: true },
    date: { type: Date, default: Date.now },

    // Customer Details
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    gstNumber: { type: String, default: 'N/A' },

    // Transport Details
    vehicleNumber: { type: String, required: true },
    packageCategory: { type: String, required: true },
    numberOfPackages: { type: Number, required: true, min: 1 },
    ratePerPackage: { type: Number, required: true, min: 0.01 },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },

    // Financials (calculated)
    subTotal: { type: Number },
    gstRate: { type: Number, default: 0.18 },
    gstAmount: { type: Number },
    totalAmount: { type: Number },

    // Created by (Staff/Admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staffName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to calculate financial totals
 * NOTE:
 * - Synchronous hook (no async keyword)
 * - Uses next() explicitly
 * - Skips recalculation when base fields are unchanged
 */
/*BillSchema.pre('save', function (next) {
  // Skip recalculation if base values are unchanged and this is not a new document
  if (
    !this.isNew &&
    !this.isModified('numberOfPackages') &&
    !this.isModified('ratePerPackage')
  ) {
    return next();
  }

  // Calculation logic
  this.subTotal = this.numberOfPackages * this.ratePerPackage;
  this.gstAmount = this.subTotal * this.gstRate;
  this.totalAmount = this.subTotal + this.gstAmount;

  // Currency precision (2 decimals)
  this.subTotal = parseFloat(this.subTotal.toFixed(2));
  this.gstAmount = parseFloat(this.gstAmount.toFixed(2));
  this.totalAmount = parseFloat(this.totalAmount.toFixed(2));

  next();
});*/

BillSchema.pre('save', function () {
  // Skip recalculation if base values are unchanged and this is not a new document
  if (
    !this.isNew &&
    !this.isModified('numberOfPackages') &&
    !this.isModified('ratePerPackage')
  ) {
    return;
  }

  // Calculation logic
  this.subTotal = this.numberOfPackages * this.ratePerPackage;
  this.gstAmount = this.subTotal * this.gstRate;
  this.totalAmount = this.subTotal + this.gstAmount;

  // Round to 2 decimals
  this.subTotal = parseFloat(this.subTotal.toFixed(2));
  this.gstAmount = parseFloat(this.gstAmount.toFixed(2));
  this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
});

module.exports = mongoose.model('Bill', BillSchema);

