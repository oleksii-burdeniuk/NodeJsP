const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Review.findById(id);

  if (!tour) {
    return next(new AppError(`No tour found with that id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError(`No tour found with that id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    return next(new AppError(`No review found with that id`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: { message: 'deleted successfully' },
  });
});
