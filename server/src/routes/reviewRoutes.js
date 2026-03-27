const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review Routes
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/like', reviewController.likeReview);
router.post('/:id/dislike', reviewController.dislikeReview);

module.exports = router;
