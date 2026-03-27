const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { objectType, objectId, anonymous, ratings, textReview } = req.body;
    // For MVP, user comes from body or dummy. In real scenario: req.user.id
    const userId = req.body.userId || "000000000000000000000000"; 
    const universityId = req.body.universityId || "000000000000000000000000";
    
    const review = await Review.create({
      objectType,
      objectId,
      universityId,
      userId,
      anonymous,
      ratings,
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

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const review = await Review.findByIdAndUpdate(id, updateData, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.likeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.dislikeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, { new: true });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
