const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  setTourAndUserIds,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.get('/', protect, getAllReviews);
router.get('/:id', getReview);

router.use(protect);
router.post('/', protect, setTourAndUserIds, createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
