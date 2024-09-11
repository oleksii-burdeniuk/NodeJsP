const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
// const hpp = require('hpp');

const AppError = require('./utils/appError');

const tourRouter = require('./routs/tourRouts');
const userRouter = require('./routs/userRouts');
const errorController = require('./controllers/errorController');

const app = express();
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

//  BODY PARSER, LIMITING DATA SEND THRO BODY
app.use(express.json({ limit: '10kb' }));

// PREVENT PASSING   {"$gt":""} TO GET ACCESS TO USER
app.use(mongoSanitize());

// PREVENT PASSING   HTML CODE
app.use(xss());

// PREVENT parameter pollution
// app.use(
//   hpp({
//     whitelist: ['duration'],
//   }),
// );

app.use(express.static(`${__dirname}/public`));

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

const toursUrl = '/api/v1/tours';
const usersUrl = '/api/v1/users';

app.use(usersUrl, userRouter);
app.use(toursUrl, tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
