// src/models/Document.js - Document model for file management
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  originalName: String,
  filename: String,
  path: String,
  size: {
    type: Number,
    min: [0, 'File size cannot be negative']
  },
  formattedSize: String,
  mimetype: String,
  type: {
    type: String,
    enum: ['PDF', 'DOCX', 'DOC', 'XLSX', 'XLS', 'JPG', 'JPEG', 'PNG', 'TXT', 'Folder'],
    required: [true, 'Document type is required']
  },
  folder: {
    type: String,
    enum: ['my-drive', 'shared', 'recycle', 'templates'],
    default: 'my-drive'
  },
  isFolder: {
    type: Boolean,
    default: false
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },

  // Folder specific fields
  itemCount: {
    type: Number,
    default: 0
  },

  // Access control
  visibility: {
    type: String,
    enum: ['private', 'public', 'restricted'],
    default: 'private'
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Document metadata
  tags: [String],
  category: {
    type: String,
    enum: [
      'HR Documents',
      'Policies',
      'Templates',
      'Reports',
      'Contracts',
      'Employee Records',
      'Financial',
      'Legal',
      'Training Materials',
      'Other'
    ]
  },
  description: String,

  // Version control
  version: {
    type: Number,
    default: 1
  },
  versionHistory: [{
    version: Number,
    filename: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    changes: String
  }],

  // Security
  isEncrypted: {
    type: Boolean,
    default: false
  },
  password: String,

  // System fields
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  lastAccessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAccessedAt: Date,

  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ name: 'text', description: 'text', tags: 'text' });
documentSchema.index({ folder: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ visibility: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for formatted upload date
documentSchema.virtual('uploadDate').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return this.createdAt.toLocaleDateString();
});

// Virtual for file extension
documentSchema.virtual('extension').get(function() {
  if (this.isFolder) return null;
  return this.name.split('.').pop()?.toLowerCase();
});

// Static method to get documents by folder
documentSchema.statics.getByFolder = function(folder) {
  return this.find({ folder }).populate('uploadedBy', 'name').sort({ createdAt: -1 });
};

// Static method to search documents
documentSchema.statics.searchDocuments = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).populate('uploadedBy', 'name');
};

// Static method to get documents by user
documentSchema.statics.getUserDocuments = function(userId) {
  return this.find({ uploadedBy: userId }).sort({ createdAt: -1 });
};

// Method to share document
documentSchema.methods.shareWith = function(userId, permission = 'view') {
  // Remove existing share if present
  this.sharedWith = this.sharedWith.filter(share => 
    !share.user.equals(userId)
  );

  // Add new share
  this.sharedWith.push({
    user: userId,
    permission: permission,
    sharedAt: new Date()
  });

  return this.save();
};

// Method to move to folder
documentSchema.methods.moveToFolder = function(folder) {
  this.folder = folder;
  return this.save();
};

// Method to increment download count
documentSchema.methods.incrementDownload = function(userId = null) {
  this.downloadCount += 1;
  if (userId) {
    this.lastAccessedBy = userId;
    this.lastAccessedAt = new Date();
  }
  return this.save();
};

// Pre-save middleware to format file size
documentSchema.pre('save', function(next) {
  if (this.isModified('size') && this.size) {
    const bytes = this.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      this.formattedSize = '0 Bytes';
    } else {
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      this.formattedSize = `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
    }
  }
  next();
});

// Transform output
documentSchema.methods.toJSON = function() {
  const documentObject = this.toObject({ virtuals: true });

  // Don't expose file path and password in API responses
  delete documentObject.path;
  delete documentObject.password;

  return documentObject;
};

module.exports = mongoose.model('Document', documentSchema);
