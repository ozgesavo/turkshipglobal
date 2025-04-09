const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
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
  features: [{
    type: String,
    trim: true
  }],
  productLimit: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 3 // Default 3%
  },
  isActive: {
    type: Boolean,
    default: true
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
SubscriptionPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
