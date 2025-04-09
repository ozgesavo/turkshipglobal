const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Supplier = require('../models/Supplier');
const { validationResult } = require('express-validator');
const slugify = require('slugify');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get supplier ID
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    // Check if supplier is approved
    if (supplier.approvalStatus !== 'approved') {
      return res.status(403).json({ msg: 'Supplier not approved yet' });
    }

    const {
      categoryId,
      sku,
      barcode,
      name,
      description,
      shortDescription,
      price,
      costPrice,
      weight,
      weightUnit,
      length,
      width,
      height,
      dimensionUnit,
      status
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ msg: 'Product with this SKU already exists' });
    }

    // Create slug from name
    const slug = slugify(name, { lower: true });

    // Create new product
    const product = new Product({
      supplierId: supplier._id,
      categoryId,
      sku,
      barcode,
      name,
      slug,
      description,
      shortDescription,
      price,
      costPrice,
      weight,
      weightUnit,
      length,
      width,
      height,
      dimensionUnit,
      status: status || 'draft'
    });

    // Save product
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all products for a supplier
exports.getSupplierProducts = async (req, res) => {
  try {
    // Get supplier ID
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier profile not found' });
    }

    // Get products
    const products = await Product.find({ supplierId: supplier._id });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user is supplier of this product or admin
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (req.user.userType !== 'admin' && (!supplier || product.supplierId.toString() !== supplier._id.toString())) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user is supplier of this product
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      categoryId,
      name,
      description,
      shortDescription,
      price,
      costPrice,
      weight,
      weightUnit,
      length,
      width,
      height,
      dimensionUnit,
      status,
      isFeatured
    } = req.body;

    // Build product object
    const productFields = {};
    if (categoryId) productFields.categoryId = categoryId;
    if (name) {
      productFields.name = name;
      productFields.slug = slugify(name, { lower: true });
    }
    if (description) productFields.description = description;
    if (shortDescription) productFields.shortDescription = shortDescription;
    if (price) productFields.price = price;
    if (costPrice) productFields.costPrice = costPrice;
    if (weight) productFields.weight = weight;
    if (weightUnit) productFields.weightUnit = weightUnit;
    if (length) productFields.length = length;
    if (width) productFields.width = width;
    if (height) productFields.height = height;
    if (dimensionUnit) productFields.dimensionUnit = dimensionUnit;
    if (status) productFields.status = status;
    if (isFeatured !== undefined) productFields.isFeatured = isFeatured;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user is supplier of this product
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Delete product
    await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true }
    );

    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a product variant
exports.createVariant = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user is supplier of this product
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      sku,
      barcode,
      price,
      costPrice,
      stockQuantity,
      weight,
      weightUnit,
      status
    } = req.body;

    // Check if SKU already exists
    const existingVariant = await ProductVariant.findOne({ sku });
    if (existingVariant) {
      return res.status(400).json({ msg: 'Variant with this SKU already exists' });
    }

    // Create new variant
    const variant = new ProductVariant({
      productId: product._id,
      sku,
      barcode,
      price,
      costPrice,
      stockQuantity,
      weight,
      weightUnit,
      status: status || 'active'
    });

    // Save variant
    await variant.save();

    res.json(variant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get all variants for a product
exports.getProductVariants = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Get variants
    const variants = await ProductVariant.find({ productId: product._id });

    res.json(variants);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update a variant
exports.updateVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.variantId);

    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }

    const product = await Product.findById(variant.productId);

    // Check if user is supplier of this product
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      price,
      costPrice,
      stockQuantity,
      weight,
      weightUnit,
      status
    } = req.body;

    // Build variant object
    const variantFields = {};
    if (price) variantFields.price = price;
    if (costPrice) variantFields.costPrice = costPrice;
    if (stockQuantity !== undefined) variantFields.stockQuantity = stockQuantity;
    if (weight) variantFields.weight = weight;
    if (weightUnit) variantFields.weightUnit = weightUnit;
    if (status) variantFields.status = status;

    // Update variant
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      req.params.variantId,
      { $set: variantFields },
      { new: true }
    );

    res.json(updatedVariant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a variant
exports.deleteVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.variantId);

    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }

    const product = await Product.findById(variant.productId);

    // Check if user is supplier of this product
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier || product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Delete variant
    await ProductVariant.findByIdAndUpdate(
      req.params.variantId,
      { status: 'inactive' },
      { new: true }
    );

    res.json({ msg: 'Variant deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    res.status(500).send('Server error');
  }
};
