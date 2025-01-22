const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new AppError(`No document found with that id`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: { message: 'deleted successfully' },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError(`No document found with that id`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: { data: document },
      req: req.body,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    if (!newDocument) {
      return next(new AppError(`Error occurred when creating document`, 404));
    }

    res.status(201).json({
      status: 'success',
      data: { data: newDocument },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) {
      return next(new AppError(`No document found with that id`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: { data: document },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow nested get reviews on tour
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const document = await features.query.explain();
    const document = await features.query;

    res.status(200).json({
      status: 'success',
      results: document.length,
      data: { data: document },
    });
  });
