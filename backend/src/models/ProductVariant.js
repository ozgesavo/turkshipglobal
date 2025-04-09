const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  // Reference to the parent product
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Variant specific details
  sku: {
    type: String,
    trim: true
  },
  
  // Price information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  
  // Inventory management
  inventoryQuantity: {
    type: Number,
    default: 0
  },
  inventoryPolicy: {
    type: String,
    enum: ['deny', 'continue'],
    default: 'deny'
  },
  
  // Variant options (e.g., color: "Red", size: "Large")
  options: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Variant-specific images
  images: [{
    type: String
  }],
  
  // Weight and dimensions for shipping calculations
  weight: {
    type: Number,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },
  dimensions: {
    length: {
      type: Number,
      min: 0
    },
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['cm', 'mm', 'in'],
      default: 'cm'
    }
  },
  
  // Barcode/UPC/EAN
  barcode: {
    type: String,
    trim: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Shopify specific fields for integration
  shopifyVariantId: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
ProductVariantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProductVariant', ProductVariantSchema);
