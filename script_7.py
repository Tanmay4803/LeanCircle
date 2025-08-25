# Create the IT Declaration model (src/models/ITDeclaration.js)
it_declaration_model_content = '''// src/models/ITDeclaration.js - IT Declaration model for tax management
const mongoose = require('mongoose');

const itDeclarationSchema = new mongoose.Schema({
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
  financialYear: {
    type: String,
    required: [true, 'Financial year is required'],
    match: [/^\\d{4}-\\d{4}$/, 'Financial year must be in format YYYY-YYYY']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: [
      '80C',    // Life Insurance, PPF, ELSS, etc.
      '80D',    // Health Insurance
      '80E',    // Education Loan Interest
      '80G',    // Donations
      '24B',    // Home Loan Interest
      '80EE',   // First Time Home Buyer
      '80TTA',  // Savings Account Interest
      '80CCG',  // Rajiv Gandhi Equity Scheme
      'Other'
    ]
  },
  investmentType: {
    type: String,
    required: [true, 'Investment type is required'],
    enum: [
      'Life Insurance Policy',
      'Health Insurance',
      'Public Provident Fund (PPF)',
      'Equity Linked Savings Scheme (ELSS)',
      'National Savings Certificate (NSC)',
      'Fixed Deposit (5 years)',
      'Home Loan Principal',
      'Home Loan Interest',
      'Education Loan Interest',
      'Tuition Fees',
      'Donations',
      'Medical Insurance Premium',
      'Preventive Health Checkup',
      'Savings Account Interest',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative']
  },
  maxLimit: {
    type: Number,
    default: function() {
      // Set default limits based on section
      switch(this.section) {
        case '80C': return 150000;
        case '80D': return 25000;
        case '80E': return null; // No limit
        case '80G': return null; // Varies
        case '24B': return 200000;
        case '80EE': return 50000;
        case '80TTA': return 10000;
        default: return null;
      }
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rejected', 'Under Review'],
    default: 'Pending'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  // Document attachments
  documents: [{
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
  
  // Verification details
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationComments: String,
  
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
itDeclarationSchema.index({ employeeId: 1 });
itDeclarationSchema.index({ employee: 1 });
itDeclarationSchema.index({ financialYear: 1 });
itDeclarationSchema.index({ section: 1 });
itDeclarationSchema.index({ status: 1 });
itDeclarationSchema.index({ createdAt: -1 });

// Compound index for employee and financial year
itDeclarationSchema.index({ employee: 1, financialYear: 1 });

// Virtual for formatted amount
itDeclarationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Virtual to check if within limit
itDeclarationSchema.virtual('withinLimit').get(function() {
  if (!this.maxLimit) return true;
  return this.amount <= this.maxLimit;
});

// Static method to get declarations by financial year
itDeclarationSchema.statics.getByFinancialYear = function(financialYear) {
  return this.find({ financialYear }).populate('employee', 'firstName lastName employeeId');
};

// Static method to get employee declarations
itDeclarationSchema.statics.getEmployeeDeclarations = function(employeeId, financialYear = null) {
  const query = { employeeId };
  if (financialYear) query.financialYear = financialYear;
  
  return this.find(query)
    .populate('employee', 'firstName lastName employeeId')
    .sort({ createdAt: -1 });
};

// Static method to get declarations by section
itDeclarationSchema.statics.getBySection = function(section, financialYear = null) {
  const query = { section };
  if (financialYear) query.financialYear = financialYear;
  
  return this.find(query).populate('employee', 'firstName lastName employeeId');
};

// Method to approve declaration
itDeclarationSchema.methods.approve = function(verifierId, comments = '') {
  this.status = 'Completed';
  this.verifiedBy = verifierId;
  this.verifiedAt = new Date();
  this.verificationComments = comments;
  
  return this.save();
};

// Method to reject declaration
itDeclarationSchema.methods.reject = function(verifierId, comments = '') {
  this.status = 'Rejected';
  this.verifiedBy = verifierId;
  this.verifiedAt = new Date();
  this.verificationComments = comments;
  
  return this.save();
};

// Pre-save middleware to set total amount
itDeclarationSchema.pre('save', function(next) {
  if (!this.totalAmount) {
    this.totalAmount = this.amount;
  }
  next();
});

// Transform output
itDeclarationSchema.methods.toJSON = function() {
  const declarationObject = this.toObject({ virtuals: true });
  return declarationObject;
};

module.exports = mongoose.model('ITDeclaration', itDeclarationSchema);
'''

with open('src/models/ITDeclaration.js', 'w') as f:
    f.write(it_declaration_model_content)

print("✅ Created src/models/ITDeclaration.js")