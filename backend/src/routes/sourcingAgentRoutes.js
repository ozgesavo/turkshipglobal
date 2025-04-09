const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const sourcingAgentController = require('../controllers/sourcingAgentController');

// @route   POST /api/sourcing-agent/register
// @desc    Register as a sourcing agent
// @access  Private (user)
router.post(
  '/register',
  [
    auth(['user']),
    [
      check('bio', 'Bio is required').not().isEmpty(),
      check('expertise', 'Expertise is required').not().isEmpty()
    ]
  ],
  sourcingAgentController.register
);

// @route   GET /api/sourcing-agent/profile
// @desc    Get sourcing agent profile
// @access  Private (sourcing_agent)
router.get('/profile', auth(['sourcing_agent']), sourcingAgentController.getProfile);

// @route   PUT /api/sourcing-agent/profile
// @desc    Update sourcing agent profile
// @access  Private (sourcing_agent)
router.put(
  '/profile',
  [
    auth(['sourcing_agent']),
    [
      check('bio', 'Bio is required').optional(),
      check('expertise', 'Expertise is required').optional()
    ]
  ],
  sourcingAgentController.updateProfile
);

// @route   POST /api/sourcing-agent/products
// @desc    Submit a product
// @access  Private (sourcing_agent)
router.post(
  '/products',
  auth(['sourcing_agent']),
  sourcingAgentController.submitProduct
);

// @route   GET /api/sourcing-agent/products
// @desc    Get all products submitted by the sourcing agent
// @access  Private (sourcing_agent)
router.get('/products', auth(['sourcing_agent']), sourcingAgentController.getProducts);

// @route   GET /api/sourcing-agent/products/:id
// @desc    Get a specific product
// @access  Private (sourcing_agent)
router.get('/products/:id', auth(['sourcing_agent']), sourcingAgentController.getProduct);

// @route   GET /api/sourcing-agent/commissions
// @desc    Get all commissions for the sourcing agent
// @access  Private (sourcing_agent)
router.get('/commissions', auth(['sourcing_agent']), sourcingAgentController.getCommissions);

// @route   GET /api/sourcing-agent/commission-stats
// @desc    Get commission statistics
// @access  Private (sourcing_agent)
router.get('/commission-stats', auth(['sourcing_agent']), sourcingAgentController.getCommissionStats);

// Admin routes

// @route   PUT /api/sourcing-agent/products/:id/review
// @desc    Approve or reject a product
// @access  Private (admin)
router.put(
  '/products/:id/review',
  [
    auth(['admin']),
    [
      check('status', 'Status is required').isIn(['active', 'rejected']),
      check('commissionRate', 'Commission rate must be a number between 1 and 50').optional().isFloat({ min: 1, max: 50 }),
      check('rejectionReason', 'Rejection reason is required when status is rejected').if((value, { req }) => req.body.status === 'rejected').not().isEmpty()
    ]
  ],
  sourcingAgentController.reviewProduct
);

// @route   GET /api/sourcing-agent/all
// @desc    Get all sourcing agents
// @access  Private (admin)
router.get('/all', auth(['admin']), sourcingAgentController.getAllSourcingAgents);

// @route   GET /api/sourcing-agent/pending-products
// @desc    Get all pending products
// @access  Private (admin)
router.get('/pending-products', auth(['admin']), sourcingAgentController.getPendingProducts);

// @route   POST /api/sourcing-agent/pay-commissions
// @desc    Pay commissions
// @access  Private (admin)
router.post(
  '/pay-commissions',
  [
    auth(['admin']),
    [
      check('commissionIds', 'Commission IDs are required').isArray().not().isEmpty()
    ]
  ],
  sourcingAgentController.payCommissions
);

module.exports = router;
