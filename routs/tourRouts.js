const express = require('express');
const tourController = require('../controllers/tourController');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopPours,
} = tourController;

// '/api/v1/tours'
const router = express.Router();

// router.param('id', checkId);

router.route('/').get(getAllTours).post(createTour);
router.route('/top-5-cheap').get(aliasTopPours, getAllTours);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
