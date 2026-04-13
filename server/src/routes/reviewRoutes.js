const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public
router.get('/', reviewController.getReviews);

// Protected — requires login
router.post('/', requireAuth, reviewController.createReview);
router.put('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);
router.post('/:id/vote', requireAuth, reviewController.voteReview);

module.exports = router;
