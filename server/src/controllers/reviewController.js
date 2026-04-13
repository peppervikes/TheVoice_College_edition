const Review = require('../models/Review');
const ReviewVote = require('../models/ReviewVote');

/**
 * POST /api/reviews
 * Create a new review. Requires authentication.
 * Enforces: one review per user per object (unique index).
 */
exports.createReview = async (req, res) => {
  try {
    const {
      objectType, objectId, universityId, anonymous,
      ratings, tags, grade, attendanceMandatory,
      textbookUsed, textReview
    } = req.body;

    if (!objectType || !objectId || !universityId) {
      return res.status(400).json({ error: 'objectType, objectId, and universityId are required.' });
    }

    const review = await Review.create({
      objectType,
      objectId,
      universityId,
      userId: req.user.id,
      anonymous: anonymous !== undefined ? anonymous : true,
      ratings,
      tags,
      grade,
      attendanceMandatory,
      textbookUsed,
      reviewText: textReview
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this object.' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/reviews
 * Get reviews for an object. Public access.
 * Query params: objectId, objectType, sort (recent|liked|highest|lowest), page, limit
 */
exports.getReviews = async (req, res) => {
  try {
    const { objectId, objectType, sort = 'recent', page = 1, limit = 20 } = req.query;

    if (!objectId) {
      return res.status(400).json({ error: 'objectId is required.' });
    }

    const filter = { objectId };
    if (objectType) filter.objectType = objectType;

    // Sorting options
    let sortOption = { createdAt: -1 }; // default: most recent
    if (sort === 'liked') sortOption = { likes: -1 };
    else if (sort === 'highest') sortOption = { 'ratings.difficulty': 1 }; // easiest first
    else if (sort === 'lowest') sortOption = { 'ratings.difficulty': -1 }; // hardest first

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/reviews/:id
 * Update own review. Requires authentication.
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review and verify ownership
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own reviews.' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['ratings', 'tags', 'grade', 'attendanceMandatory', 'textbookUsed', 'reviewText', 'anonymous'];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedReview = await Review.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete own review (or admin can delete any).
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(id);

    // Also clean up votes for this review
    await ReviewVote.deleteMany({ reviewId: id });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/reviews/:id/vote
 * Like or dislike a review. Requires authentication.
 * Body: { voteType: "like" | "dislike" }
 * Toggles vote if same type, switches if different type.
 */
exports.voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    if (!['like', 'dislike'].includes(voteType)) {
      return res.status(400).json({ error: 'voteType must be "like" or "dislike".' });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Check for existing vote
    const existingVote = await ReviewVote.findOne({ reviewId: id, userId: req.user.id });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote — remove it (toggle off)
        await ReviewVote.findByIdAndDelete(existingVote._id);
        await Review.findByIdAndUpdate(id, {
          $inc: { [voteType === 'like' ? 'likes' : 'dislikes']: -1 }
        });

        const updated = await Review.findById(id);
        return res.json({ success: true, action: 'removed', review: updated });
      } else {
        // Different vote — switch
        const oldType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();

        await Review.findByIdAndUpdate(id, {
          $inc: {
            [oldType === 'like' ? 'likes' : 'dislikes']: -1,
            [voteType === 'like' ? 'likes' : 'dislikes']: 1
          }
        });

        const updated = await Review.findById(id);
        return res.json({ success: true, action: 'switched', review: updated });
      }
    }

    // New vote
    await ReviewVote.create({ reviewId: id, userId: req.user.id, voteType });
    await Review.findByIdAndUpdate(id, {
      $inc: { [voteType === 'like' ? 'likes' : 'dislikes']: 1 }
    });

    const updated = await Review.findById(id);
    res.json({ success: true, action: 'voted', review: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
