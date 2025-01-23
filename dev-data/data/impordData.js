const fs = require('fs');

const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {})
  .then(() => {
    // console.log('Database connected successfully');
  })
  .catch((err) => {
    // console.log(err);
  });
// read file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// import data to db

const importData = async () => {
  // console.log('importData');
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    // console.log('all was uploaded');
  } catch (err) {
    // console.log('Error:', err);
  } finally {
    process.exit(0);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    // console.log('all was deleted');
  } catch (err) {
    // console.log('Error:', err);
  } finally {
    process.exit(0);
  }
};

if (process.argv.includes('--import')) {
  importData();
} else if (process.argv.includes('--delete')) {
  deleteData();
} else {
  // console.log('process.argv', process.argv);
}
