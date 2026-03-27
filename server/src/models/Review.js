const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  objectType: {
    type: String,
    enum: ['course', 'professor', 'ta'],
    required: true
  },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'objectType'
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymous: {
    type: Boolean,
    default: true
  },
  ratings: {
    difficulty: { type: Number, min: 1, max: 5 },
    wouldTakeAgain: { type: Boolean },
    assignmentDifficulty: { type: Number, min: 1, max: 5 },
    examType: { type: String, enum: ['online', 'offline', 'mixed'] },
    examStyle: { type: String, enum: ['objective', 'subjective', 'both'] }
  },
  tags: [{ type: String }],
  grade: { type: String },
  attendanceMandatory: { type: Boolean },
  textbookUsed: { type: Boolean },
  reviewText: {
    type: String,
    maxlength: 350
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

reviewSchema.index({ userId: 1, objectId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
