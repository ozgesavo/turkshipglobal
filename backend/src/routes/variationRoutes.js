const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const variationController = require('../controllers/variationController');

// @route   GET /api/variations/categories/:categoryId
// @desc    Get variation templates for a specific category
// @access  Private (supplier, dropshipper)
router.get('/categories/:categoryId', auth(['supplier', 'dropshipper']), variationController.getCategoryVariationTemplates);

// @route   GET /api/variations/predefined-options
// @desc    Get predefined variation options for common categories
// @access  Private (supplier, dropshipper)
router.get('/predefined-options', auth(['supplier', 'dropshipper']), variationController.getPredefinedVariationOptions);

// @route   POST /api/variations/generate
// @desc    Generate product variants based on selected options
// @access  Private (supplier)
router.post(
  '/generate',
  [
    auth(['supplier']),
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('selectedVariations', 'Selected variations are required').isObject().not().isEmpty()
    ]
  ],
  variationController.generateProductVariants
);

// @route   PUT /api/variations/:id
// @desc    Update a product variant
// @access  Private (supplier)
router.put(
  '/:id',
  [
    auth(['supplier']),
    [
      check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
      check('inventoryQuantity', 'Inventory quantity must be a non-negative number').optional().isInt({ min: 0 })
    ]
  ],
  variationController.updateProductVariant
);

// @route   POST /api/variations/bulk-update
// @desc    Bulk update product variants
// @access  Private (supplier)
router.post(
  '/bulk-update',
  [
    auth(['supplier']),
    [
      check('variants', 'Variants array is required').isArray().not().isEmpty(),
      check('variants.*.id', 'Variant ID is required for each variant').not().isEmpty()
    ]
  ],
  variationController.bulkUpdateProductVariants
);

// @route   DELETE /api/variations/:id
// @desc    Delete a product variant
// @access  Private (supplier)
router.delete('/:id', auth(['supplier']), variationController.deleteProductVariant);

// Admin routes

// @route   POST /api/variations/categories
// @desc    Create or update a category variation template
// @access  Private (admin)
router.post(
  '/categories',
  [
    auth(['admin']),
    [
      check('categoryId', 'Category ID is required').not().isEmpty(),
      check('variationTypes', 'Variation types are required').isArray().not().isEmpty()
    ]
  ],
  variationController.createUpdateCategoryTemplate
);

// @route   DELETE /api/variations/categories/:categoryId
// @desc    Delete a category variation template
// @access  Private (admin)
router.delete('/categories/:categoryId', auth(['admin']), variationController.deleteCategoryTemplate);

module.exports = router;
