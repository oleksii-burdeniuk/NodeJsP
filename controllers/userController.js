const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: { users },
    message: 'The Api is not ready yet',
  });
});
exports.getUser = (req, res) => {
  const user = User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { user },
    message: 'The Api is not ready yet',
  });
};
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  if (!user) {
    return next(new AppError(`No tour found with that id`, 404));
  }
  res.status(201).json({
    status: 'success',
    data: { user },
    message: 'The Api is not ready yet',
  });
});

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The Api is not ready yet',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The Api is not ready yet',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        `It is forbidden to use this api to update password. Please use "/updatePassword" to update password `,
        404,
      ),
    );

  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: {
      user: null,
    },
  });
});
