const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Dropshipper Schema
const dropshipperSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  storeUrl: {
    type: String,
    trim: true
  },
  shopifyStoreId: {
    type: String,
    trim: true
  },
  shopifyApiKey: {
    type: String,
    trim: true
  },
  shopifyApiSecret: {
    type: String,
    trim: true
  },
  shopifyAccessToken: {
    type: String,
    trim: true
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
dropshipperSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Dropshipper', dropshipperSchema);
