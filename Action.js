// src/models/Action.js - Action model for task and workflow management
const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Action type is required'],
    enum: [
      'Lock Salary',
      'Generate Report',
      'Process Payroll',
      'Send Reminder',
      'Approve Leave',
      'Review Employee',
      'Update Policy',
      'Backup Data',
      'Send Notification',
      'Other'
    ]
  },
  target: {
    type: String,
    required: [true, 'Action target is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'payroll',
      'reports',
      'employee-management',
      'compliance',
      'notifications',
      'maintenance',
      'security',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  // Scheduling
  scheduledFor: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  nextRunAt: Date,

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startedAt: Date,
  completedAt: Date,

  // Results and logs
  result: {
    success: Boolean,
    message: String,
    data: mongoose.Schema.Types.Mixed
  },

  executionLogs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug'],
      default: 'info'
    },
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],

  // Dependencies
  dependencies: [{
    action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action'
    },
    type: {
      type: String,
      enum: ['blocks', 'triggers', 'requires']
    }
  }],

  // Notifications
  notifyOnCompletion: {
    type: Boolean,
    default: false
  },
  notificationRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Approval workflow (if required)
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvalComments: String,

  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
actionSchema.index({ status: 1 });
actionSchema.index({ category: 1 });
actionSchema.index({ priority: 1 });
actionSchema.index({ assignedTo: 1 });
actionSchema.index({ scheduledFor: 1 });
actionSchema.index({ createdAt: -1 });

// Compound indexes
actionSchema.index({ status: 1, priority: -1 });
actionSchema.index({ assignedTo: 1, status: 1 });

// Virtual for time elapsed
actionSchema.virtual('timeElapsed').get(function() {
  if (!this.startedAt) return null;
  const endTime = this.completedAt || new Date();
  return Math.round((endTime - this.startedAt) / (1000 * 60)); // minutes
});

// Virtual for is overdue
actionSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledFor || this.status === 'Completed') return false;
  return new Date() > this.scheduledFor;
});

// Static method to get actions by status
actionSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get user actions
actionSchema.statics.getUserActions = function(userId, status = null) {
  const query = { assignedTo: userId };
  if (status) query.status = status;

  return this.find(query)
    .populate('assignedBy', 'name')
    .sort({ scheduledFor: 1, createdAt: -1 });
};

// Static method to get overdue actions
actionSchema.statics.getOverdueActions = function() {
  return this.find({
    scheduledFor: { $lt: new Date() },
    status: { $nin: ['Completed', 'Cancelled'] }
  }).populate('assignedTo', 'name email');
};

// Method to start action
actionSchema.methods.start = function() {
  this.status = 'In Progress';
  this.startedAt = new Date();
  this.progress = 10;

  this.executionLogs.push({
    level: 'info',
    message: 'Action started',
    details: { startedAt: this.startedAt }
  });

  return this.save();
};

// Method to complete action
actionSchema.methods.complete = function(result = {}) {
  this.status = 'Completed';
  this.completedAt = new Date();
  this.progress = 100;
  this.result = result;

  this.executionLogs.push({
    level: 'info',
    message: 'Action completed',
    details: { completedAt: this.completedAt, result }
  });

  // Schedule next run if recurring
  if (this.isRecurring && this.recurringPattern) {
    this.scheduleNextRun();
  }

  return this.save();
};

// Method to fail action
actionSchema.methods.fail = function(error) {
  this.status = 'Failed';
  this.result = {
    success: false,
    message: error.message || 'Action failed'
  };

  this.executionLogs.push({
    level: 'error',
    message: 'Action failed',
    details: { error: error.message || error }
  });

  return this.save();
};

// Method to add execution log
actionSchema.methods.addLog = function(level, message, details = null) {
  this.executionLogs.push({
    level,
    message,
    details
  });
  return this.save();
};

// Method to schedule next run (for recurring actions)
actionSchema.methods.scheduleNextRun = function() {
  if (!this.recurringPattern) return;

  const now = new Date();
  let nextRun = new Date(now);

  switch (this.recurringPattern) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      nextRun.setMonth(now.getMonth() + 3);
      break;
    case 'yearly':
      nextRun.setFullYear(now.getFullYear() + 1);
      break;
  }

  this.nextRunAt = nextRun;
  return this.save();
};

// Transform output
actionSchema.methods.toJSON = function() {
  const actionObject = this.toObject({ virtuals: true });
  return actionObject;
};

module.exports = mongoose.model('Action', actionSchema);
