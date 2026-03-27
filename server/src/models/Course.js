const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String, // e.g., "admin"
  }
}, { timestamps: true });

courseSchema.index({ universityId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
