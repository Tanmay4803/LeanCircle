# Create the Reimbursement model (src/models/Reimbursement.js)
reimbursement_model_content = '''// src/models/Reimbursement.js - Reimbursement model for expense management
const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    trim: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Travel',
      'Food & Beverages', 
      'Accommodation',
      'Transportation',
      'Medical',
      'Office Supplies',
      'Training',
      'Utilities',
      'Internet',
      'Phone Bills',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  date: {
    type: Date,
    required: [true, 'Expense date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Expense date cannot be in the future'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined', 'Processing'],
    default: 'Pending'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  invoices: {
    type: Number,
    default: 0,
    min: [0, 'Number of invoices cannot be negative']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Approval workflow
  approvalHistory: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approverName: String,
    action: {
      type: String,
      enum: ['Approved', 'Declined', 'Requested Changes']
    },
    comments: String,
    actionDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvalComments: String,
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentDate: Date,
  paymentReference: String,
  
  // System fields
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reimbursementSchema.index({ employeeId: 1 });
reimbursementSchema.index({ employee: 1 });
reimbursementSchema.index({ category: 1 });
reimbursementSchema.index({ status: 1 });
reimbursementSchema.index({ date: -1 });
reimbursementSchema.index({ createdAt: -1 });

// Virtual for formatted amount
reimbursementSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR'
  }).format(this.amount);
});

// Static method to get reimbursements by status
reimbursementSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('employee', 'firstName lastName employeeId');
};

// Static method to get employee reimbursements
reimbursementSchema.statics.getEmployeeReimbursements = function(employeeId, status = null) {
  const query = { employeeId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .sort({ createdAt: -1 });
};

// Static method to get reimbursements by date range
reimbursementSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate('employee', 'firstName lastName employeeId');
};

// Method to approve reimbursement
reimbursementSchema.methods.approve = function(approverId, approverName, comments = '') {
  this.status = 'Approved';
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  this.approvalHistory.push({
    approver: approverId,
    approverName: approverName,
    action: 'Approved',
    comments: comments,
    actionDate: new Date()
  });
  
  return this.save();
};

// Method to decline reimbursement
reimbursementSchema.methods.decline = function(approverId, approverName, comments = '') {
  this.status = 'Declined';
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  this.approvalHistory.push({
    approver: approverId,
    approverName: approverName,
    action: 'Declined',
    comments: comments,
    actionDate: new Date()
  });
  
  return this.save();
};

// Transform output
reimbursementSchema.methods.toJSON = function() {
  const reimbursementObject = this.toObject({ virtuals: true });
  return reimbursementObject;
};

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
'''

with open('src/models/Reimbursement.js', 'w') as f:
    f.write(reimbursement_model_content)

print("✅ Created src/models/Reimbursement.js")