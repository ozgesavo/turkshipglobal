const User = require('../models/User');
const Dropshipper = require('../models/Dropshipper');
const DropshipperSupplier = require('../models/DropshipperSupplier');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new dropshipper
exports.registerDropshipper = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      storeName,
      storeUrl
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      userType: 'dropshipper',
      preferredLanguage: req.body.preferredLanguage || 'en'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create dropshipper profile
    const dropshipper = new Dropshipper({
      userId: user._id,
      storeName,
      storeUrl
    });

    // Save dropshipper
    await dropshipper.save();

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get dropshipper profile
exports.getDropshipperProfile = async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id }).populate('userId', '-password');
    
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    res.json(dropshipper);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update dropshipper profile
exports.updateDropshipperProfile = async (req, res) => {
  try {
    const {
      storeName,
      storeUrl,
      shopifyStoreId,
      shopifyApiKey,
      shopifyApiSecret,
      shopifyAccessToken
    } = req.body;

    // Build dropshipper object
    const dropshipperFields = {};
    if (storeName) dropshipperFields.storeName = storeName;
    if (storeUrl) dropshipperFields.storeUrl = storeUrl;
    if (shopifyStoreId) dropshipperFields.shopifyStoreId = shopifyStoreId;
    if (shopifyApiKey) dropshipperFields.shopifyApiKey = shopifyApiKey;
    if (shopifyApiSecret) dropshipperFields.shopifyApiSecret = shopifyApiSecret;
    if (shopifyAccessToken) dropshipperFields.shopifyAccessToken = shopifyAccessToken;

    let dropshipper = await Dropshipper.findOne({ userId: req.user.id });

    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    // Update dropshipper
    dropshipper = await Dropshipper.findOneAndUpdate(
      { userId: req.user.id },
      { $set: dropshipperFields },
      { new: true }
    );

    res.json(dropshipper);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ approvalStatus: 'approved' })
      .populate('userId', 'firstName lastName email')
      .select('-shopifyApiSecret');

    res.json(suppliers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get supplier details
exports.getSupplierDetails = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .select('-shopifyApiSecret');

    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    res.status(500).send('Server error');
  }
};

// Connect with a supplier
exports.connectWithSupplier = async (req, res) => {
  try {
    const { supplierId } = req.body;

    // Check if supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    // Check if supplier is approved
    if (supplier.approvalStatus !== 'approved') {
      return res.status(400).json({ msg: 'Supplier is not approved yet' });
    }

    // Get dropshipper
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    // Check if already connected
    const existingConnection = await DropshipperSupplier.findOne({
      dropshipperId: dropshipper._id,
      supplierId
    });

    if (existingConnection) {
      return res.status(400).json({ msg: 'Already connected with this supplier' });
    }

    // Create new connection
    const connection = new DropshipperSupplier({
      dropshipperId: dropshipper._id,
      supplierId,
      status: 'active'
    });

    await connection.save();

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get connected suppliers
exports.getConnectedSuppliers = async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    const connections = await DropshipperSupplier.find({
      dropshipperId: dropshipper._id,
      status: 'active'
    }).populate({
      path: 'supplierId',
      select: '-shopifyApiSecret',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    });

    res.json(connections.map(conn => conn.supplierId));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Disconnect from a supplier
exports.disconnectFromSupplier = async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    // Find and update connection
    const connection = await DropshipperSupplier.findOneAndUpdate(
      {
        dropshipperId: dropshipper._id,
        supplierId: req.params.supplierId
      },
      { status: 'inactive' },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ msg: 'Connection not found' });
    }

    res.json({ msg: 'Disconnected from supplier' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get supplier products
exports.getSupplierProducts = async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    // Check if connected to supplier
    const connection = await DropshipperSupplier.findOne({
      dropshipperId: dropshipper._id,
      supplierId: req.params.supplierId,
      status: 'active'
    });

    if (!connection) {
      return res.status(403).json({ msg: 'Not connected to this supplier' });
    }

    // Get products
    const products = await Product.find({
      supplierId: req.params.supplierId,
      status: 'active'
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Import product to Shopify
exports.importProductToShopify = async (req, res) => {
  try {
    const { productId } = req.body;

    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper profile not found' });
    }

    // Check if Shopify credentials are set
    if (!dropshipper.shopifyApiKey || !dropshipper.shopifyAccessToken || !dropshipper.shopifyStoreId) {
      return res.status(400).json({ msg: 'Shopify credentials not set' });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if connected to supplier
    const connection = await DropshipperSupplier.findOne({
      dropshipperId: dropshipper._id,
      supplierId: product.supplierId,
      status: 'active'
    });

    if (!connection) {
      return res.status(403).json({ msg: 'Not connected to this supplier' });
    }

    // TODO: Implement actual Shopify API integration
    // This would involve using the Shopify API to create a product
    // For now, we'll just return a success message

    res.json({ msg: 'Product imported to Shopify successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
