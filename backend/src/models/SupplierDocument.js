const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Supplier Document Schema
const supplierDocumentSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  documentType: {
    type: String,
    enum: ['business_license', 'tax_certificate', 'id_proof', 'other'],
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupplierDocument', supplierDocumentSchema);
