const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routs/tourRouts');
const userRouter = require('./routs/userRouts');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

const toursUrl = '/api/v1/tours';
const usersUrl = '/api/v1/users';

app.use(usersUrl, userRouter);
app.use(toursUrl, tourRouter);

module.exports = app;
