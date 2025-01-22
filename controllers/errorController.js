const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR', err);
      res.status(500).json({
        status: 'error',
        message: 'something went very wrong!',
      });
    }
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message);
};

const handleDuplicateFieldsErr = (err) => {
  const regex = /"([^"]*)"/g;
  const value = err.errmsg.match(regex);

  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message);
};

const handleJWTError = () => {
  const message = `Invalid Token Please login again`;
  return new AppError(message, 401);
};

const handleTokenExpiredError = () => {
  const message = `Token has been expired. Please login again`;
  return new AppError(message, 401);
};

const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsErr(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
module.exports = errorController;
