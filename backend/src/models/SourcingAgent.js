const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SourcingAgent Schema
const sourcingAgentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  specialties: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 5, // Default 5% commission
    min: 1,
    max: 20
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  socialMediaLinks: {
    instagram: String,
    linkedin: String,
    website: String
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
sourcingAgentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SourcingAgent', sourcingAgentSchema);
