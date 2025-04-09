const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');

// @route   POST api/suppliers/register
// @desc    Register a supplier
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('companyName', 'Company name is required').not().isEmpty()
  ],
  supplierController.registerSupplier
);

// @route   GET api/suppliers/profile
// @desc    Get supplier profile
// @access  Private
router.get('/profile', authMiddleware, supplierController.getSupplierProfile);

// @route   PUT api/suppliers/profile
// @desc    Update supplier profile
// @access  Private
router.put('/profile', authMiddleware, supplierController.updateSupplierProfile);

// @route   POST api/suppliers/documents
// @desc    Upload supplier document
// @access  Private
router.post(
  '/documents',
  [authMiddleware, uploadMiddleware.single('document')],
  supplierController.uploadDocument
);

// @route   GET api/suppliers/documents
// @desc    Get all supplier documents
// @access  Private
router.get('/documents', authMiddleware, supplierController.getDocuments);

// @route   GET api/suppliers
// @desc    Get all suppliers (admin only)
// @access  Private/Admin
router.get('/', authMiddleware, supplierController.getAllSuppliers);

// @route   PUT api/suppliers/approve
// @desc    Approve or reject supplier (admin only)
// @access  Private/Admin
router.put('/approve', authMiddleware, supplierController.approveRejectSupplier);

module.exports = router;
