# Create the Employee model (src/models/Employee.js)
employee_model_content = '''// src/models/Employee.js - Employee model for HR management
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [30, 'First name cannot be more than 30 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [30, 'Last name cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\\+]?[1-9]?\\d{1,14}$/, 'Please provide a valid phone number']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Human Resources',
      'Engineering', 
      'Marketing',
      'Sales',
      'Finance',
      'Operations',
      'Design',
      'All departments'
    ]
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ['Employee', 'Manager', 'Team Lead', 'Director', 'CEO', 'Co-founder'],
    default: 'Employee'
  },
  joinDate: {
    type: Date,
    required: [true, 'Join date is required'],
    default: Date.now
  },
  address: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  dateOfBirth: Date,
  
  // Salary Information
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  ctc: {
    type: Number,
    min: [0, 'CTC cannot be negative']
  },
  incentives: {
    type: Number,
    default: 0,
    min: [0, 'Incentives cannot be negative']
  },
  bonus: {
    type: Number,
    default: 0,
    min: [0, 'Bonus cannot be negative']
  },
  
  // Additional Information
  portfolio: {
    type: String,
    default: '0%'
  },
  pfNumber: {
    type: String,
    trim: true
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Bank Details
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branch: String
  },
  
  // Avatar/Profile Picture
  avatar: {
    type: String,
    default: function() {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
  },
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for full name
employeeSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for years of service
employeeSchema.virtual('yearsService').get(function() {
  const years = Math.floor((Date.now() - this.joinDate) / (365.25 * 24 * 60 * 60 * 1000));
  return Math.max(0, years);
});

// Indexes for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

// Pre-save middleware to generate employee ID if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `#${(2345578 + count).toString()}`;
  }
  
  // Update avatar when name changes
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.avatar = `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  
  next();
});

// Static method to get employees by department
employeeSchema.statics.getByDepartment = function(department) {
  return this.find({ department, status: 'Active' });
};

// Static method to search employees
employeeSchema.statics.searchEmployees = function(searchTerm) {
  const searchRegex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
      { position: searchRegex },
      { department: searchRegex }
    ]
  });
};

// Transform output
employeeSchema.methods.toJSON = function() {
  const employeeObject = this.toObject({ virtuals: true });
  return employeeObject;
};

module.exports = mongoose.model('Employee', employeeSchema);
'''

with open('src/models/Employee.js', 'w') as f:
    f.write(employee_model_content)

print("✅ Created src/models/Employee.js")