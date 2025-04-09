const User = require('../models/User');
const Supplier = require('../models/Supplier');
const SupplierDocument = require('../models/SupplierDocument');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new supplier
exports.registerSupplier = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      companyName,
      companyDescription,
      website,
      taxId
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      userType: 'supplier',
      preferredLanguage: req.body.preferredLanguage || 'en'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create supplier profile
    const supplier = new Supplier({
      userId: user._id,
      companyName,
      companyDescription,
      website,
      taxId,
      approvalStatus: 'pending'
    });

    // Save supplier
    await supplier.save();

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get supplier profile
exports.getSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.id }).populate('userId', '-password');
    
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update supplier profile
exports.updateSupplierProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyDescription,
      website,
      taxId
    } = req.body;

    // Build supplier object
    const supplierFields = {};
    if (companyName) supplierFields.companyName = companyName;
    if (companyDescription) supplierFields.companyDescription = companyDescription;
    if (website) supplierFields.website = website;
    if (taxId) supplierFields.taxId = taxId;

    let supplier = await Supplier.findOne({ userId: req.user.id });

    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    // Update supplier
    supplier = await Supplier.findOneAndUpdate(
      { userId: req.user.id },
      { $set: supplierFields },
      { new: true }
    );

    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload supplier document
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, notes } = req.body;
    const documentUrl = req.file.path;

    const supplier = await Supplier.findOne({ userId: req.user.id });
    
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    const document = new SupplierDocument({
      supplierId: supplier._id,
      documentType,
      documentUrl,
      notes,
      status: 'pending'
    });

    await document.save();

    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all supplier documents
exports.getDocuments = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.id });
    
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    const documents = await SupplierDocument.find({ supplierId: supplier._id });

    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const suppliers = await Supplier.find().populate('userId', '-password');

    res.json(suppliers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Approve or reject supplier
exports.approveRejectSupplier = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { supplierId, approvalStatus } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ msg: 'Invalid approval status' });
    }

    let supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    // Update supplier
    supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { 
        approvalStatus,
        approvalDate: Date.now(),
        approvedBy: req.user.id
      },
      { new: true }
    );

    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
