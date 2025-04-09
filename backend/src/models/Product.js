const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Update Product Schema to include sourcingAgentId
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  sourcingAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'SourcingAgent'
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String
  },
  shortDescription: {
    type: String,
    required: true
  },
  longDescription: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  imageUrl: {
    type: String
  },
  additionalImages: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0
    },
    internationalShipping: {
      type: Boolean,
      default: true
    },
    shippingRestrictions: {
      type: [String],
      default: []
    }
  },
  commissionRate: {
    type: Number,
    default: 3, // Default 3% commission
    min: 0,
    max: 20
  },
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
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure either supplierId or sourcingAgentId is provided, but not both
  if ((this.supplierId && this.sourcingAgentId) || (!this.supplierId && !this.sourcingAgentId)) {
    const error = new Error('Product must be associated with either a Supplier or a Sourcing Agent, but not both');
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
