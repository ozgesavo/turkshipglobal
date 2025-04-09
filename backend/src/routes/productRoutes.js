const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/auth');

// @route   POST api/products
// @desc    Create a new product
// @access  Private/Supplier
router.post(
  '/',
  [
    authMiddleware,
    [
      check('sku', 'SKU is required').not().isEmpty(),
      check('name', 'Name is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('costPrice', 'Cost price is required').isNumeric()
    ]
  ],
  productController.createProduct
);

// @route   GET api/products/supplier
// @desc    Get all products for a supplier
// @access  Private/Supplier
router.get('/supplier', authMiddleware, productController.getSupplierProducts);

// @route   GET api/products/:id
// @desc    Get a single product
// @access  Private
router.get('/:id', authMiddleware, productController.getProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Supplier
router.put('/:id', authMiddleware, productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Supplier
router.delete('/:id', authMiddleware, productController.deleteProduct);

// @route   POST api/products/:productId/variants
// @desc    Create a product variant
// @access  Private/Supplier
router.post(
  '/:productId/variants',
  [
    authMiddleware,
    [
      check('sku', 'SKU is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('costPrice', 'Cost price is required').isNumeric()
    ]
  ],
  productController.createVariant
);

// @route   GET api/products/:productId/variants
// @desc    Get all variants for a product
// @access  Private
router.get('/:productId/variants', authMiddleware, productController.getProductVariants);

// @route   PUT api/products/variants/:variantId
// @desc    Update a variant
// @access  Private/Supplier
router.put('/variants/:variantId', authMiddleware, productController.updateVariant);

// @route   DELETE api/products/variants/:variantId
// @desc    Delete a variant
// @access  Private/Supplier
router.delete('/variants/:variantId', authMiddleware, productController.deleteVariant);

module.exports = router;
