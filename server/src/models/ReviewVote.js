const mongoose = require('mongoose');

/**
 * Tracks individual user votes (like/dislike) on reviews.
 * Prevents double-voting: one vote per user per review.
 */
const reviewVoteSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, { timestamps: true });

// One vote per user per review
reviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ReviewVote', reviewVoteSchema);
