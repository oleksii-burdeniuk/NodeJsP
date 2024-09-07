const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour should have a name'],
    unique: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour should have a price'],
  },
  priceDiscount: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    required: [true, 'A tour should have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour should have a maxGroupSize'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour should have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour should have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour should have a imageCover'],
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // select: false,
  },
  startDates: {
    type: [Date],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
