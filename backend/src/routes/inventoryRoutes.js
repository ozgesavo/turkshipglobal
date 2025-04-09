const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const inventoryController = require('../controllers/inventoryController');

// @route   PUT /api/inventory/product
// @desc    Update product inventory
// @access  Private (supplier only)
router.put(
  '/product',
  [
    auth(['supplier']),
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('quantity', 'Quantity is required and must be a non-negative number').isInt({ min: 0 })
    ]
  ],
  inventoryController.updateProductInventory
);

// @route   PUT /api/inventory/variant
// @desc    Update variant inventory
// @access  Private (supplier only)
router.put(
  '/variant',
  [
    auth(['supplier']),
    [
      check('variantId', 'Variant ID is required').not().isEmpty(),
      check('quantity', 'Quantity is required and must be a non-negative number').isInt({ min: 0 })
    ]
  ],
  inventoryController.updateVariantInventory
);

// @route   POST /api/inventory/bulk-update
// @desc    Bulk update variant inventory
// @access  Private (supplier only)
router.post(
  '/bulk-update',
  [
    auth(['supplier']),
    [
      check('variants', 'Variants array is required').isArray().not().isEmpty(),
      check('variants.*.id', 'Variant ID is required for each variant').not().isEmpty(),
      check('variants.*.quantity', 'Quantity is required and must be a non-negative number for each variant').isInt({ min: 0 })
    ]
  ],
  inventoryController.bulkUpdateVariantInventory
);

// @route   GET /api/inventory/product/:productId/logs
// @desc    Get inventory logs for a product
// @access  Private (supplier only)
router.get('/product/:productId/logs', auth(['supplier']), inventoryController.getProductInventoryLogs);

// @route   GET /api/inventory/variant/:variantId/logs
// @desc    Get inventory logs for a variant
// @access  Private (supplier only)
router.get('/variant/:variantId/logs', auth(['supplier']), inventoryController.getVariantInventoryLogs);

// @route   GET /api/inventory/low-stock
// @desc    Get low stock products for a supplier
// @access  Private (supplier only)
router.get('/low-stock', auth(['supplier']), inventoryController.getLowStockProducts);

// @route   POST /api/inventory/shopify-sync
// @desc    Sync inventory with Shopify (called by webhook)
// @access  Public (with webhook secret validation in a real implementation)
router.post('/shopify-sync', inventoryController.syncShopifyInventory);

// @route   GET /api/inventory/statistics
// @desc    Get inventory statistics for a supplier
// @access  Private (supplier only)
router.get('/statistics', auth(['supplier']), inventoryController.getInventoryStatistics);

module.exports = router;
