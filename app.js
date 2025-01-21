const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const hpp = require('hpp');

const AppError = require('./utils/appError');

const tourRouter = require('./routs/tourRouts');
const userRouter = require('./routs/userRouts');
const reviewRouter = require('./routs/reviewRouts');
const viewRouter = require('./routs/viewRoutes');

const errorController = require('./controllers/errorController');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.options('*', cors());
// Access-Control-Allow-Origin *
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://api.mapbox.com',
        ],
        styleSrc: ["'self'", 'https://api.mapbox.com'], // For mapbox CSS if needed
        frameSrc: ["'self'", 'https://js.stripe.com'],
      },
    },
  }),
);
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
app.use(cookieParser());

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

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = Date.now();
  console.log('req.cookies', req.cookies);
  next();
});

// ROUTES

// app.get('/', (req, res) => {
//   res.status(200).render('base');
// });

const toursUrl = '/api/v1/tours';
const usersUrl = '/api/v1/users';
const reviewsUrl = '/api/v1/reviews';

app.use('/', viewRouter);
app.use(usersUrl, userRouter);
app.use(toursUrl, tourRouter);
app.use(reviewsUrl, reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
