const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// DropshipperSupplier Schema
const dropshipperSupplierSchema = new Schema({
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DropshipperSupplier', dropshipperSupplierSchema);
