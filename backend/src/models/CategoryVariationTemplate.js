const mongoose = require('mongoose');

const ProductVariationOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  additionalPrice: {
    type: Number,
    default: 0
  },
  additionalCost: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  }
});

const ProductVariationTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  options: [ProductVariationOptionSchema],
  required: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
});

const CategoryVariationTemplateSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  variationTypes: [ProductVariationTypeSchema],
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
CategoryVariationTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CategoryVariationTemplate', CategoryVariationTemplateSchema);
