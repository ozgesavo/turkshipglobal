const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Payment type: subscription, commission, etc.
  type: {
    type: String,
    enum: ['subscription', 'commission', 'refund', 'other'],
    required: true
  },
  
  // Amount and currency
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  
  // Status of the payment
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'other'],
    required: true
  },
  
  // Transaction ID from payment processor
  transactionId: {
    type: String
  },
  
  // Related entities
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  dropshipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dropshipper'
  },
  sourcingAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SourcingAgent'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Payment details
  details: {
    type: Object
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
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
