const fs = require('fs');

const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.log(err);
  });
// read file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// import data to db

const importData = async () => {
  console.log('importData');
  try {
    await Tour.create(tours);
    console.log('all was uploaded');
  } catch (err) {
    console.log('Error:', err);
  } finally {
    process.exit(0);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('all was deleted');
  } catch (err) {
    console.log('Error:', err);
  } finally {
    process.exit(0);
  }
};

if (process.argv.includes('--import')) {
  importData();
} else if (process.argv.includes('--delete')) {
  deleteData();
} else {
  console.log('process.argv', process.argv);
}
