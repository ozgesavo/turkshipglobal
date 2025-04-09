const SourcingAgent = require('../models/SourcingAgent');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Register as a sourcing agent
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { bio, expertise, paymentInfo } = req.body;
    
    // Check if user is already a sourcing agent
    let sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (sourcingAgent) {
      return res.status(400).json({ msg: 'User is already a sourcing agent' });
    }
    
    // Create a new sourcing agent
    sourcingAgent = new SourcingAgent({
      userId: req.user.id,
      bio,
      expertise,
      paymentInfo
    });
    
    await sourcingAgent.save();
    
    // Update user type
    await User.findByIdAndUpdate(req.user.id, { userType: 'sourcing_agent' });
    
    res.status(201).json(sourcingAgent);
  } catch (err) {
    console.error('Error registering sourcing agent:', err);
    res.status(500).send('Server error');
  }
};

// Get sourcing agent profile
exports.getProfile = async (req, res) => {
  try {
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id })
      .populate('userId', 'firstName lastName email phone');
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    res.json(sourcingAgent);
  } catch (err) {
    console.error('Error getting sourcing agent profile:', err);
    res.status(500).send('Server error');
  }
};

// Update sourcing agent profile
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { bio, expertise, paymentInfo } = req.body;
    
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Update fields
    if (bio) sourcingAgent.bio = bio;
    if (expertise) sourcingAgent.expertise = expertise;
    if (paymentInfo) sourcingAgent.paymentInfo = paymentInfo;
    
    await sourcingAgent.save();
    
    res.json(sourcingAgent);
  } catch (err) {
    console.error('Error updating sourcing agent profile:', err);
    res.status(500).send('Server error');
  }
};

// Submit a product
exports.submitProduct = async (req, res) => {
  try {
    // Handle file uploads
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(400).json({ msg: err.message });
      }
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Delete uploaded files if validation fails
        if (req.files) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({ errors: errors.array() });
      }
      
      const {
        name,
        description,
        category,
        supplierName,
        supplierContact,
        supplierLocation,
        estimatedPrice,
        estimatedShippingCost,
        notes
      } = req.body;
      
      // Find the sourcing agent
      const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
      
      if (!sourcingAgent) {
        // Delete uploaded files if sourcing agent not found
        if (req.files) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        return res.status(404).json({ msg: 'Sourcing agent not found' });
      }
      
      // Process uploaded images
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          // Convert file path to URL
          const relativePath = file.path.replace(/^.*\/uploads/, '/uploads');
          imageUrls.push(`${req.protocol}://${req.get('host')}${relativePath}`);
        });
      }
      
      // Create a new product
      const product = new Product({
        name,
        description,
        category,
        images: imageUrls,
        sourcingAgentId: sourcingAgent._id,
        supplierName,
        supplierContact,
        supplierLocation,
        estimatedPrice: parseFloat(estimatedPrice) || 0,
        estimatedShippingCost: parseFloat(estimatedShippingCost) || 0,
        notes,
        status: 'pending',
        commissionRate: 5 // Default commission rate, can be adjusted by admin
      });
      
      await product.save();
      
      res.status(201).json(product);
    });
  } catch (err) {
    console.error('Error submitting product:', err);
    res.status(500).send('Server error');
  }
};

// Get all products submitted by the sourcing agent
exports.getProducts = async (req, res) => {
  try {
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Find all products submitted by this sourcing agent
    const products = await Product.find({ sourcingAgentId: sourcingAgent._id })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    console.error('Error getting sourcing agent products:', err);
    res.status(500).send('Server error');
  }
};

// Get a specific product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Check if the product belongs to this sourcing agent
    if (product.sourcingAgentId.toString() !== sourcingAgent._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    res.json(product);
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).send('Server error');
  }
};

// Get all commissions for the sourcing agent
exports.getCommissions = async (req, res) => {
  try {
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Find all commissions for this sourcing agent
    const commissions = await Commission.find({ sourcingAgentId: sourcingAgent._id })
      .populate('productId')
      .populate('orderId', 'orderNumber total createdAt')
      .sort({ createdAt: -1 });
    
    // Format the response
    const formattedCommissions = commissions.map(commission => ({
      _id: commission._id,
      product: {
        _id: commission.productId._id,
        name: commission.productId.name,
        images: commission.productId.images
      },
      order: {
        _id: commission.orderId._id,
        orderNumber: commission.orderId.orderNumber,
        total: commission.orderId.total,
        createdAt: commission.orderId.createdAt
      },
      amount: commission.amount,
      commissionRate: commission.commissionRate,
      orderItemTotal: commission.orderItemTotal,
      status: commission.status,
      createdAt: commission.createdAt,
      paidAt: commission.paidAt
    }));
    
    res.json(formattedCommissions);
  } catch (err) {
    console.error('Error getting sourcing agent commissions:', err);
    res.status(500).send('Server error');
  }
};

// Get commission statistics
exports.getCommissionStats = async (req, res) => {
  try {
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Get all commissions for this sourcing agent
    const commissions = await Commission.find({ sourcingAgentId: sourcingAgent._id });
    
    // Calculate statistics
    const totalCommissions = commissions.reduce((total, commission) => total + commission.amount, 0);
    const pendingCommissions = commissions
      .filter(commission => commission.status === 'pending')
      .reduce((total, commission) => total + commission.amount, 0);
    const paidCommissions = commissions
      .filter(commission => commission.status === 'paid')
      .reduce((total, commission) => total + commission.amount, 0);
    
    // Get product statistics
    const products = await Product.find({ sourcingAgentId: sourcingAgent._id });
    const totalProducts = products.length;
    const activeProducts = products.filter(product => product.status === 'active').length;
    
    res.json({
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalProducts,
      activeProducts
    });
  } catch (err) {
    console.error('Error getting commission statistics:', err);
    res.status(500).send('Server error');
  }
};

// Admin: Approve or reject a product
exports.reviewProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status, commissionRate, rejectionReason } = req.body;
    
    // Find the product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Update product status
    product.status = status;
    
    if (status === 'active') {
      // Set commission rate if approved
      if (commissionRate) {
        product.commissionRate = commissionRate;
      }
    } else if (status === 'rejected') {
      // Set rejection reason if rejected
      product.rejectionReason = rejectionReason;
    }
    
    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error('Error reviewing product:', err);
    res.status(500).send('Server error');
  }
};

// Admin: Get all sourcing agents
exports.getAllSourcingAgents = async (req, res) => {
  try {
    const sourcingAgents = await SourcingAgent.find()
      .populate('userId', 'firstName lastName email phone');
    
    res.json(sourcingAgents);
  } catch (err) {
    console.error('Error getting all sourcing agents:', err);
    res.status(500).send('Server error');
  }
};

// Admin: Get all pending products
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('sourcingAgentId')
      .sort({ createdAt: 1 });
    
    // Populate user data for each sourcing agent
    for (let product of products) {
      await product.populate('sourcingAgentId.userId', 'firstName lastName email');
    }
    
    res.json(products);
  } catch (err) {
    console.error('Error getting pending products:', err);
    res.status(500).send('Server error');
  }
};

// Admin: Pay commissions
exports.payCommissions = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { commissionIds } = req.body;
    
    // Update all specified commissions to paid
    await Commission.updateMany(
      { _id: { $in: commissionIds } },
      { 
        status: 'paid',
        paidAt: new Date()
      }
    );
    
    res.json({ msg: 'Commissions paid successfully' });
  } catch (err) {
    console.error('Error paying commissions:', err);
    res.status(500).send('Server error');
  }
};
