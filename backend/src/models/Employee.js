const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Employee Schema
const employeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerType: {
    type: String,
    enum: ['supplier', 'dropshipper'],
    required: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    required: true,
    // This will reference either Supplier or Dropshipper based on employerType
    refPath: 'employerType'
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  permissions: {
    manageProducts: {
      type: Boolean,
      default: false
    },
    manageOrders: {
      type: Boolean,
      default: false
    },
    manageInventory: {
      type: Boolean,
      default: false
    },
    manageEmployees: {
      type: Boolean,
      default: false
    },
    viewReports: {
      type: Boolean,
      default: false
    },
    manageSettings: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  hireDate: {
    type: Date,
    default: Date.now
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
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
