const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const paymentController = require('../controllers/paymentController');

// @route   GET /api/payments/subscription-plans
// @desc    Get all subscription plans
// @access  Public
router.get('/subscription-plans', paymentController.getSubscriptionPlans);

// @route   POST /api/payments/subscription-plans
// @desc    Create a new subscription plan
// @access  Private (admin only)
router.post(
  '/subscription-plans',
  [
    auth(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required and must be a positive number').isFloat({ min: 0 }),
      check('interval', 'Interval must be monthly or yearly').isIn(['monthly', 'yearly'])
    ]
  ],
  paymentController.createSubscriptionPlan
);

// @route   PUT /api/payments/subscription-plans/:id
// @desc    Update a subscription plan
// @access  Private (admin only)
router.put(
  '/subscription-plans/:id',
  auth(['admin']),
  paymentController.updateSubscriptionPlan
);

// @route   DELETE /api/payments/subscription-plans/:id
// @desc    Delete a subscription plan
// @access  Private (admin only)
router.delete(
  '/subscription-plans/:id',
  auth(['admin']),
  paymentController.deleteSubscriptionPlan
);

// @route   POST /api/payments/subscribe
// @desc    Subscribe to a plan
// @access  Private (supplier only)
router.post(
  '/subscribe',
  [
    auth(['supplier']),
    [
      check('planId', 'Plan ID is required').not().isEmpty(),
      check('paymentMethod', 'Payment method is required').isIn(['credit_card', 'bank_transfer', 'paypal', 'other'])
    ]
  ],
  paymentController.subscribe
);

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel subscription
// @access  Private (supplier only)
router.post(
  '/cancel-subscription',
  auth(['supplier']),
  paymentController.cancelSubscription
);

// @route   GET /api/payments/current-subscription
// @desc    Get current subscription
// @access  Private (supplier only)
router.get(
  '/current-subscription',
  auth(['supplier']),
  paymentController.getCurrentSubscription
);

// @route   GET /api/payments/subscription-history
// @desc    Get subscription history
// @access  Private (supplier only)
router.get(
  '/subscription-history',
  auth(['supplier']),
  paymentController.getSubscriptionHistory
);

// @route   GET /api/payments/payment-history
// @desc    Get payment history
// @access  Private (supplier only)
router.get(
  '/payment-history',
  auth(['supplier']),
  paymentController.getPaymentHistory
);

// @route   GET /api/payments/commission-statistics
// @desc    Get commission statistics for supplier
// @access  Private (supplier only)
router.get(
  '/commission-statistics',
  auth(['supplier']),
  paymentController.getCommissionStatistics
);

// @route   GET /api/payments/sourcing-agent-commission-statistics
// @desc    Get commission statistics for sourcing agent
// @access  Private (sourcing agent only)
router.get(
  '/sourcing-agent-commission-statistics',
  auth(['sourcing_agent']),
  paymentController.getSourcingAgentCommissionStatistics
);

module.exports = router;
