const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('dropshipperId', 'Dropshipper ID is required').not().isEmpty(),
      check('supplierId', 'Supplier ID is required').not().isEmpty(),
      check('shopifyOrderId', 'Shopify order ID is required').not().isEmpty(),
      check('customerName', 'Customer name is required').not().isEmpty(),
      check('customerEmail', 'Valid customer email is required').isEmail(),
      check('shippingAddress', 'Shipping address is required').not().isEmpty(),
      check('items', 'Items are required').isArray().not().isEmpty(),
      check('subtotal', 'Subtotal is required').isNumeric(),
      check('shippingCost', 'Shipping cost is required').isNumeric(),
      check('total', 'Total is required').isNumeric()
    ]
  ],
  orderController.createOrder
);

// @route   GET api/orders/supplier
// @desc    Get all orders for a supplier
// @access  Private
router.get('/supplier', authMiddleware, orderController.getSupplierOrders);

// @route   GET api/orders/dropshipper
// @desc    Get all orders for a dropshipper
// @access  Private
router.get('/dropshipper', authMiddleware, orderController.getDropshipperOrders);

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authMiddleware, orderController.getOrderById);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put(
  '/:id/status',
  [
    authMiddleware,
    [
      check('status', 'Status is required').not().isEmpty()
    ]
  ],
  orderController.updateOrderStatus
);

// @route   PUT api/orders/:id/shipping
// @desc    Update shipping information
// @access  Private
router.put('/:id/shipping', authMiddleware, orderController.updateShippingInfo);

// @route   POST api/orders/shopify-webhook
// @desc    Process Shopify webhook for new orders
// @access  Public (secured by Shopify HMAC verification)
router.post('/shopify-webhook', orderController.processShopifyWebhook);

module.exports = router;
