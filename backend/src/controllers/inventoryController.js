const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Update product inventory
exports.updateProductInventory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { productId, quantity, notes } = req.body;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if user is authorized (must be the supplier who owns the product)
    if (product.supplierId.toString() !== req.user.supplierId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this product inventory' });
    }
    
    // Calculate change amount
    const previousQuantity = product.inventoryQuantity || 0;
    const changeAmount = quantity - previousQuantity;
    
    // Update product inventory
    product.inventoryQuantity = quantity;
    await product.save();
    
    // Create inventory log
    const inventoryLog = new InventoryLog({
      productId: product._id,
      previousQuantity,
      newQuantity: quantity,
      changeAmount,
      changeType: 'manual',
      userId: req.user.id,
      notes
    });
    
    await inventoryLog.save();
    
    res.json({
      product,
      inventoryLog
    });
  } catch (err) {
    console.error('Error updating product inventory:', err);
    res.status(500).send('Server error');
  }
};

// Update variant inventory
exports.updateVariantInventory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { variantId, quantity, notes } = req.body;
    
    // Find the variant
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    
    // Find the product to check authorization
    const product = await Product.findById(variant.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if user is authorized (must be the supplier who owns the product)
    if (product.supplierId.toString() !== req.user.supplierId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this variant inventory' });
    }
    
    // Calculate change amount
    const previousQuantity = variant.inventoryQuantity || 0;
    const changeAmount = quantity - previousQuantity;
    
    // Update variant inventory
    variant.inventoryQuantity = quantity;
    await variant.save();
    
    // Create inventory log
    const inventoryLog = new InventoryLog({
      productId: product._id,
      variantId: variant._id,
      previousQuantity,
      newQuantity: quantity,
      changeAmount,
      changeType: 'manual',
      userId: req.user.id,
      notes
    });
    
    await inventoryLog.save();
    
    res.json({
      variant,
      inventoryLog
    });
  } catch (err) {
    console.error('Error updating variant inventory:', err);
    res.status(500).send('Server error');
  }
};

// Bulk update variant inventory
exports.bulkUpdateVariantInventory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { variants, notes } = req.body;
    
    // Process each variant update
    const results = [];
    const inventoryLogs = [];
    
    for (const variantData of variants) {
      const { id, quantity } = variantData;
      
      // Find the variant
      const variant = await ProductVariant.findById(id);
      if (!variant) {
        continue; // Skip if variant not found
      }
      
      // Find the product to check authorization
      const product = await Product.findById(variant.productId);
      if (!product) {
        continue; // Skip if product not found
      }
      
      // Check if user is authorized (must be the supplier who owns the product)
      if (product.supplierId.toString() !== req.user.supplierId.toString()) {
        continue; // Skip if not authorized
      }
      
      // Calculate change amount
      const previousQuantity = variant.inventoryQuantity || 0;
      const changeAmount = quantity - previousQuantity;
      
      // Update variant inventory
      variant.inventoryQuantity = quantity;
      await variant.save();
      
      // Create inventory log
      const inventoryLog = new InventoryLog({
        productId: product._id,
        variantId: variant._id,
        previousQuantity,
        newQuantity: quantity,
        changeAmount,
        changeType: 'manual',
        userId: req.user.id,
        notes
      });
      
      await inventoryLog.save();
      
      results.push(variant);
      inventoryLogs.push(inventoryLog);
    }
    
    res.json({
      variants: results,
      inventoryLogs
    });
  } catch (err) {
    console.error('Error bulk updating variant inventory:', err);
    res.status(500).send('Server error');
  }
};

// Get inventory logs for a product
exports.getProductInventoryLogs = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if user is authorized (must be the supplier who owns the product)
    if (product.supplierId.toString() !== req.user.supplierId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view inventory logs for this product' });
    }
    
    // Get inventory logs
    const inventoryLogs = await InventoryLog.find({ productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('variantId', 'options');
    
    res.json(inventoryLogs);
  } catch (err) {
    console.error('Error getting product inventory logs:', err);
    res.status(500).send('Server error');
  }
};

// Get inventory logs for a variant
exports.getVariantInventoryLogs = async (req, res) => {
  try {
    const { variantId } = req.params;
    
    // Find the variant
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    
    // Find the product to check authorization
    const product = await Product.findById(variant.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if user is authorized (must be the supplier who owns the product)
    if (product.supplierId.toString() !== req.user.supplierId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view inventory logs for this variant' });
    }
    
    // Get inventory logs
    const inventoryLogs = await InventoryLog.find({ variantId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email');
    
    res.json(inventoryLogs);
  } catch (err) {
    console.error('Error getting variant inventory logs:', err);
    res.status(500).send('Server error');
  }
};

// Get low stock products for a supplier
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    
    // Find products with low inventory
    const lowStockProducts = await Product.find({
      supplierId: req.user.supplierId,
      $or: [
        { inventoryQuantity: { $lte: threshold } },
        { inventoryQuantity: { $exists: false } }
      ]
    }).select('name sku inventoryQuantity images');
    
    // Find variants with low inventory
    const lowStockVariants = await ProductVariant.find({
      productId: { $in: await Product.find({ supplierId: req.user.supplierId }).distinct('_id') },
      $or: [
        { inventoryQuantity: { $lte: threshold } },
        { inventoryQuantity: { $exists: false } }
      ]
    }).populate('productId', 'name sku images');
    
    res.json({
      lowStockProducts,
      lowStockVariants
    });
  } catch (err) {
    console.error('Error getting low stock products:', err);
    res.status(500).send('Server error');
  }
};

// Sync inventory with Shopify (called by webhook)
exports.syncShopifyInventory = async (req, res) => {
  try {
    // This would be called by a Shopify webhook when inventory changes in Shopify
    const { shopifyProductId, shopifyVariantId, newQuantity } = req.body;
    
    // Find the product or variant by Shopify ID
    let product, variant;
    
    if (shopifyVariantId) {
      variant = await ProductVariant.findOne({ shopifyVariantId });
      if (variant) {
        product = await Product.findById(variant.productId);
      }
    } else if (shopifyProductId) {
      product = await Product.findOne({ shopifyProductId });
    }
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Update inventory
    if (variant) {
      // Update variant inventory
      const previousQuantity = variant.inventoryQuantity || 0;
      const changeAmount = newQuantity - previousQuantity;
      
      variant.inventoryQuantity = newQuantity;
      await variant.save();
      
      // Create inventory log
      const inventoryLog = new InventoryLog({
        productId: product._id,
        variantId: variant._id,
        previousQuantity,
        newQuantity,
        changeAmount,
        changeType: 'sync',
        userId: req.user.id, // This would be a system user in a real implementation
        notes: 'Synced from Shopify'
      });
      
      await inventoryLog.save();
    } else {
      // Update product inventory
      const previousQuantity = product.inventoryQuantity || 0;
      const changeAmount = newQuantity - previousQuantity;
      
      product.inventoryQuantity = newQuantity;
      await product.save();
      
      // Create inventory log
      const inventoryLog = new InventoryLog({
        productId: product._id,
        previousQuantity,
        newQuantity,
        changeAmount,
        changeType: 'sync',
        userId: req.user.id, // This would be a system user in a real implementation
        notes: 'Synced from Shopify'
      });
      
      await inventoryLog.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error syncing Shopify inventory:', err);
    res.status(500).send('Server error');
  }
};

// Update inventory after order (called by order processing system)
exports.updateInventoryAfterOrder = async (orderId, orderItems, userId) => {
  try {
    for (const item of orderItems) {
      if (item.variantId) {
        // Update variant inventory
        const variant = await ProductVariant.findById(item.variantId);
        if (!variant) continue;
        
        const previousQuantity = variant.inventoryQuantity || 0;
        const newQuantity = Math.max(0, previousQuantity - item.quantity);
        const changeAmount = newQuantity - previousQuantity;
        
        variant.inventoryQuantity = newQuantity;
        await variant.save();
        
        // Create inventory log
        const inventoryLog = new InventoryLog({
          productId: item.productId,
          variantId: item.variantId,
          previousQuantity,
          newQuantity,
          changeAmount,
          changeType: 'order',
          orderId,
          userId,
          notes: `Order #${orderId}`
        });
        
        await inventoryLog.save();
      } else {
        // Update product inventory
        const product = await Product.findById(item.productId);
        if (!product) continue;
        
        const previousQuantity = product.inventoryQuantity || 0;
        const newQuantity = Math.max(0, previousQuantity - item.quantity);
        const changeAmount = newQuantity - previousQuantity;
        
        product.inventoryQuantity = newQuantity;
        await product.save();
        
        // Create inventory log
        const inventoryLog = new InventoryLog({
          productId: item.productId,
          previousQuantity,
          newQuantity,
          changeAmount,
          changeType: 'order',
          orderId,
          userId,
          notes: `Order #${orderId}`
        });
        
        await inventoryLog.save();
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error updating inventory after order:', err);
    return false;
  }
};

// Get inventory statistics for a supplier
exports.getInventoryStatistics = async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments({ supplierId: req.user.supplierId });
    
    // Get low stock products count (threshold: 5)
    const lowStockProducts = await Product.countDocuments({
      supplierId: req.user.supplierId,
      $or: [
        { inventoryQuantity: { $lte: 5 } },
        { inventoryQuantity: { $exists: false } }
      ]
    });
    
    // Get out of stock products count
    const outOfStockProducts = await Product.countDocuments({
      supplierId: req.user.supplierId,
      $or: [
        { inventoryQuantity: 0 },
        { inventoryQuantity: { $exists: false } }
      ]
    });
    
    // Get total variants count
    const totalVariants = await ProductVariant.countDocuments({
      productId: { $in: await Product.find({ supplierId: req.user.supplierId }).distinct('_id') }
    });
    
    // Get low stock variants count (threshold: 5)
    const lowStockVariants = await ProductVariant.countDocuments({
      productId: { $in: await Product.find({ supplierId: req.user.supplierId }).distinct('_id') },
      $or: [
        { inventoryQuantity: { $lte: 5 } },
        { inventoryQuantity: { $exists: false } }
      ]
    });
    
    // Get out of stock variants count
    const outOfStockVariants = await ProductVariant.countDocuments({
      productId: { $in: await Product.find({ supplierId: req.user.supplierId }).distinct('_id') },
      $or: [
        { inventoryQuantity: 0 },
        { inventoryQuantity: { $exists: false } }
      ]
    });
    
    // Get recent inventory changes
    const recentChanges = await InventoryLog.find({
      productId: { $in: await Product.find({ supplierId: req.user.supplierId }).distinct('_id') }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name')
      .populate('variantId', 'options')
      .populate('userId', 'firstName lastName');
    
    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalVariants,
      lowStockVariants,
      outOfStockVariants,
      recentChanges
    });
  } catch (err) {
    console.error('Error getting inventory statistics:', err);
    res.status(500).send('Server error');
  }
};
