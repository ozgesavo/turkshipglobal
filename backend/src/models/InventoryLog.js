const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  changeAmount: {
    type: Number,
    required: true
  },
  changeType: {
    type: String,
    enum: ['manual', 'order', 'return', 'adjustment', 'sync'],
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
InventoryLogSchema.index({ productId: 1, createdAt: -1 });
InventoryLogSchema.index({ variantId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
