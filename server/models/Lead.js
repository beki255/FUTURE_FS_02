const mongoose = require('mongoose');

// Define the Lead schema
const leadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  fromPublicForm: {
    type: Boolean,
    default: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number is too long']
  },
  photo: {
    type: String,
    default: null
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Requirements cannot exceed 500 characters']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['website', 'referral', 'social_media', 'email_campaign', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'pending_admin', 'pending', 'contacted', 'converted', 'rejected'],
    default: 'new'
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: String,
      required: true
    }
  }],
  followUpDate: {
    type: Date
  },
  convertedDate: {
    type: Date
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

// Update the updatedAt timestamp before saving
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
