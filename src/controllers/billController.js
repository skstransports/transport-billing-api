// server/src/controllers/billController.js
const Bill = require('../models/Bill');
const { generatePdf } = require('../utils/pdfGenerator');

/**
 * Helper to generate unique bill number
 * Format: TB-000001
 */
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  return `TB-${String(count + 1).padStart(6, '0')}`;
};

// ================= CREATE BILL =================

// @desc    Create new Bill
// @route   POST /api/bills
// @access  Staff/Admin
exports.createBill = async (req, res) => {
  const {
    customerName,
    customerPhone,
    vehicleNumber,
    packageCategory,
    numberOfPackages,
    ratePerPackage,
    gstNumber,
    fromLocation,
    toLocation,
  } = req.body;

  if (!customerName || !vehicleNumber || !numberOfPackages || !ratePerPackage) {
    return res
      .status(400)
      .json({ message: 'Please fill all required bill fields' });
  }

  try {
    const billNumber = await generateBillNumber();

    const bill = await Bill.create({
      billNumber,
      customerName,
      customerPhone,
      gstNumber,
      vehicleNumber,
      packageCategory,
      numberOfPackages,
      ratePerPackage,
      fromLocation,
      toLocation,
      createdBy: req.user._id,
      staffName: req.user.name,
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error creating bill', error: error.message });
  }
};

// ================= GET BILLS =================

// @desc    Get all bills (Admin) or staff’s bills
// @route   GET /api/bills
// @access  Staff/Admin
exports.getBills = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'staff') {
      query.createdBy = req.user._id;
    }

    if (req.query.customer) {
      query.customerName = {
        $regex: req.query.customer,
        $options: 'i',
      };
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching bills' });
  }
};

// ================= UPDATE BILL =================

// @desc    Update a bill
// @route   PUT /api/bills/:id
// @access  Admin or Owner Staff
exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const isOwner =
      bill.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this bill' });
    }

    bill.customerName = req.body.customerName || bill.customerName;
    bill.customerPhone = req.body.customerPhone || bill.customerPhone;
    bill.gstNumber = req.body.gstNumber || bill.gstNumber;
    bill.vehicleNumber = req.body.vehicleNumber || bill.vehicleNumber;
    bill.packageCategory =
      req.body.packageCategory || bill.packageCategory;
    bill.numberOfPackages =
      req.body.numberOfPackages || bill.numberOfPackages;
    bill.ratePerPackage =
      req.body.ratePerPackage || bill.ratePerPackage;
    bill.fromLocation = req.body.fromLocation || bill.fromLocation;
    bill.toLocation = req.body.toLocation || bill.toLocation;

    await bill.save(); // triggers pre-save hooks

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bill' });
  }
};

// ================= DELETE BILL =================

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Admin only
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    await Bill.deleteOne({ _id: bill._id });
    res.json({ message: 'Bill removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bill' });
  }
};

// ================= DOWNLOAD BILL PDF =================

// @desc    Download bill as PDF
// @route   GET /api/bills/:id/download
// @access  Staff/Admin
exports.downloadBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const isOwner =
      bill.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'Not authorized to download this bill' });
    }

    const pdfBuffer = await generatePdf(bill);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Invoice-${bill.billNumber}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error generating PDF invoice',
      error: error.message,
    });
  }
};

