const Tour = require('../models/tourModel');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, (match) => `$${match}`); // { gte, gt, lte, lt }

    this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
  }
}

exports.aliasTopPours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: { message: err },
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, (match) => `$${match}`); // { gte, gt, lte, lt }

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(`${sortBy} _id`);
    } else {
      query = query.sort('-createdAt _id');
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;
    const totalTours = await Tour.countDocuments();
    const remained =
      totalTours - skip - limit <= 0 ? 0 : totalTours - skip - limit;

    if (req.query.page && skip >= totalTours) {
      return res.status(404).json({
        status: 'fail',
        message: 'This page does not exist',
      });
    }

    query = query.skip(skip).limit(limit);
    const tours = await query;
    res.status(200).json({
      page,
      totalTours,
      previous: skip,
      remained,
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: { message: err },
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: { message: err },
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: { message: err },
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
      data: { message: 'deleted successfully' },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: { message: err },
    });
  }
};
