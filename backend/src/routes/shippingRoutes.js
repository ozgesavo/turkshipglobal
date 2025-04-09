const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const shippingController = require('../controllers/shippingController');

// @route   GET /api/shipping/countries
// @desc    Get all countries
// @access  Public
router.get('/countries', shippingController.getCountries);

// @route   GET /api/shipping/methods
// @desc    Get all shipping methods
// @access  Public
router.get('/methods', shippingController.getShippingMethods);

// @route   GET /api/shipping/rates
// @desc    Get all shipping rates
// @access  Public
router.get('/rates', shippingController.getShippingRates);

// @route   GET /api/shipping/rates/:countryId
// @desc    Get shipping rates by country
// @access  Public
router.get('/rates/:countryId', shippingController.getShippingRatesByCountry);

// @route   POST /api/shipping/calculate
// @desc    Calculate shipping cost
// @access  Public
router.post(
  '/calculate',
  [
    check('country', 'Country is required').not().isEmpty(),
    check('weight', 'Weight is required and must be a positive number').isFloat({ min: 0.1 }),
    check('length', 'Length is required and must be a positive number').isFloat({ min: 1 }),
    check('width', 'Width is required and must be a positive number').isFloat({ min: 1 }),
    check('height', 'Height is required and must be a positive number').isFloat({ min: 1 }),
    check('shippingMethod', 'Shipping method is required').not().isEmpty()
  ],
  shippingController.calculateShipping
);

// Admin routes

// @route   POST /api/shipping/countries
// @desc    Add a new country
// @access  Private (admin only)
router.post(
  '/countries',
  [
    auth(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('code', 'Code is required').not().isEmpty(),
      check('region', 'Region is required').not().isEmpty()
    ]
  ],
  shippingController.addCountry
);

// @route   POST /api/shipping/methods
// @desc    Add a new shipping method
// @access  Private (admin only)
router.post(
  '/methods',
  [
    auth(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('carrier', 'Carrier is required').not().isEmpty()
    ]
  ],
  shippingController.addShippingMethod
);

// @route   POST /api/shipping/rates
// @desc    Add a new shipping rate
// @access  Private (admin only)
router.post(
  '/rates',
  [
    auth(['admin']),
    [
      check('country', 'Country is required').not().isEmpty(),
      check('shippingMethodId', 'Shipping method is required').not().isEmpty(),
      check('baseCost', 'Base cost is required and must be a positive number').isFloat({ min: 0 }),
      check('costPerKg', 'Cost per kg is required and must be a positive number').isFloat({ min: 0 }),
      check('minDeliveryDays', 'Minimum delivery days is required and must be a positive integer').isInt({ min: 1 }),
      check('maxDeliveryDays', 'Maximum delivery days is required and must be a positive integer').isInt({ min: 1 })
    ]
  ],
  shippingController.addShippingRate
);

// @route   PUT /api/shipping/rates/:id
// @desc    Update a shipping rate
// @access  Private (admin only)
router.put(
  '/rates/:id',
  [
    auth(['admin']),
    [
      check('baseCost', 'Base cost must be a positive number').optional().isFloat({ min: 0 }),
      check('costPerKg', 'Cost per kg must be a positive number').optional().isFloat({ min: 0 }),
      check('minDeliveryDays', 'Minimum delivery days must be a positive integer').optional().isInt({ min: 1 }),
      check('maxDeliveryDays', 'Maximum delivery days must be a positive integer').optional().isInt({ min: 1 })
    ]
  ],
  shippingController.updateShippingRate
);

// @route   DELETE /api/shipping/rates/:id
// @desc    Delete a shipping rate
// @access  Private (admin only)
router.delete('/rates/:id', auth(['admin']), shippingController.deleteShippingRate);

module.exports = router;
