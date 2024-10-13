const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('./emailController');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies?.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies?.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.sighUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });
  if (!newUser) {
    return next(new AppError(`Error occurred while creating new user`, 404));
  }
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // if (typeof email !== 'string')
  //   return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not logged in please log in to get access', 401),
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belong to this Token is no longer exist', 401),
    );

  const passwordChanged = freshUser.changedPasswordAfter(decoded.iat);
  if (passwordChanged)
    return next(
      new AppError(
        'The password is not correct or was changed please login again',
        401,
      ),
    );
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  const callback = (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform that action', 403),
      );
    }
    next();
  };
  return callback;
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('There is no user wth that email address', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/
  resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a path request with your new password confirmation password to: ${resetURL}.\n
  If you didn't request password change you ca ignore that email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token valid for 10 min',
      message,
    });

    res.status(200).json({ message: 'token sent to email', status: 'success' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    return next(
      new AppError('There was an error sending an email try later', 500),
    );
  }

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 404));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { newPassword, newPasswordConfirm, password } = req.body;

  if (!newPasswordConfirm || !password || !newPassword)
    return next(new AppError('Please provide old and new password', 400));

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  const newUser = await user.save();
  createSendToken(newUser, 200, res);
});
