const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  // Subscriber information
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subscription plan
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  
  // Subscription status
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'pending'],
    default: 'pending'
  },
  
  // Billing information
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  interval: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  canceledAt: {
    type: Date
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'other'],
    required: true
  },
  paymentDetails: {
    type: Object
  },
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true
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
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
