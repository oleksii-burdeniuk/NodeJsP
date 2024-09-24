// review / rating / createdAt / ref To User / ref to tour /
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review should have a text'],
      trim: true,
      maxLength: [640, 'A review should have a text less oe equal 640'],
      minLength: [1, 'A review should have a name more oe equal 1'],
    },
    rating: {
      type: Number,
      required: [true, 'A review should have a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review should have a User'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review should have a Tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name ',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
