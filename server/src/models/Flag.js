const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  reasonText: {
    type: String,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Flag', flagSchema);
