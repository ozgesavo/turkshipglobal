const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ShippingRate Schema
const shippingRateSchema = new Schema({
  fromCountry: {
    type: String,
    required: true,
    default: 'Turkey'
  },
  toCountry: {
    type: String,
    required: true
  },
  carrier: {
    type: String,
    required: true,
    enum: ['PTT', 'PTT_Turpex', 'DHL', 'UPS', 'TNT', 'FedEx', 'Other']
  },
  weightRanges: [
    {
      minWeight: {
        type: Number,
        required: true
      },
      maxWeight: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  estimatedDeliveryDays: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  volumetricWeightFactor: {
    type: Number,
    default: 5000 // Standard volumetric weight factor (cm³/kg)
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
shippingRateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ShippingRate', shippingRateSchema);
