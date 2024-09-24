const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/', protect, getAllReviews);
router.get('/:id', getReview);
router.post('/', protect, createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
