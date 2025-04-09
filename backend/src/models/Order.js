const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Order Schema
const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  dropshipperId: {
    type: Schema.Types.ObjectId,
    ref: 'Dropshipper',
    required: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  shippingAddress: {
    name: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      variantId: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
      },
      shopifyProductId: String,
      shopifyVariantId: String,
      name: String,
      sku: String,
      quantity: Number,
      price: Number,
      totalPrice: Number
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  payoutAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  shippingMethod: {
    type: String
  },
  notes: {
    type: String
  },
  statusHistory: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }
  ],
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
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Add status change to history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Status updated'
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);
