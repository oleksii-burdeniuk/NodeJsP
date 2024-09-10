const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id);

  if (!tour) {
    return next(new AppError(`No tour found with that id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(`No tour found with that id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError(`No tour found with that id`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: { message: 'deleted successfully' },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: { $avg: '$ratingsAverage' },
        maxRating: { $max: '$rating' },
        minRating: { $min: '$rating' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        maxGroupSize: { $max: '$maxGroupSize' },
        minGroupSize: { $min: '$maxGroupSize' },
        maxDiscount: { $max: '$priceDiscount' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
      },
    },
    { $sort: { numRatings: -1 } },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01 `),
          $lte: new Date(`${year}-12-31 `),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numToursStart: -1 } },
    // { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: { results: plan.length, plan },
  });
});
