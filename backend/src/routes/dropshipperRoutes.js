const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const dropshipperController = require('../controllers/dropshipperController');
const authMiddleware = require('../middlewares/auth');

// @route   POST api/dropshippers/register
// @desc    Register a dropshipper
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('storeName', 'Store name is required').not().isEmpty()
  ],
  dropshipperController.registerDropshipper
);

// @route   GET api/dropshippers/profile
// @desc    Get dropshipper profile
// @access  Private
router.get('/profile', authMiddleware, dropshipperController.getDropshipperProfile);

// @route   PUT api/dropshippers/profile
// @desc    Update dropshipper profile
// @access  Private
router.put('/profile', authMiddleware, dropshipperController.updateDropshipperProfile);

// @route   GET api/dropshippers/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/suppliers', authMiddleware, dropshipperController.getAllSuppliers);

// @route   GET api/dropshippers/suppliers/:id
// @desc    Get supplier details
// @access  Private
router.get('/suppliers/:id', authMiddleware, dropshipperController.getSupplierDetails);

// @route   POST api/dropshippers/connect
// @desc    Connect with a supplier
// @access  Private
router.post('/connect', authMiddleware, dropshipperController.connectWithSupplier);

// @route   GET api/dropshippers/connected-suppliers
// @desc    Get connected suppliers
// @access  Private
router.get('/connected-suppliers', authMiddleware, dropshipperController.getConnectedSuppliers);

// @route   DELETE api/dropshippers/disconnect/:supplierId
// @desc    Disconnect from a supplier
// @access  Private
router.delete('/disconnect/:supplierId', authMiddleware, dropshipperController.disconnectFromSupplier);

// @route   GET api/dropshippers/suppliers/:supplierId/products
// @desc    Get supplier products
// @access  Private
router.get('/suppliers/:supplierId/products', authMiddleware, dropshipperController.getSupplierProducts);

// @route   POST api/dropshippers/import-product
// @desc    Import product to Shopify
// @access  Private
router.post('/import-product', authMiddleware, dropshipperController.importProductToShopify);

module.exports = router;
