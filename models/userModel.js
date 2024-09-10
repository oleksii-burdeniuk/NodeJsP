const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User should have a name'],
      trim: true,
      maxLength: [40, 'A tour should have a name less oe equal 80'],
      minLength: [1, 'A tour should have a name more than 1 character'],
    },
    email: {
      type: String,
      required: [true, 'User should have an email'],
      validate: {
        validator: function (val) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailPattern.test(val);
        },
        message: 'The email ({VALUE}) is not valid',
      },
      photo: {
        type: String,
      },
    },
    password: {
      type: String,
      required: [true, 'User should have a name'],
      trim: true,
      minLength: [6, 'A password  should be at lest 6 characters'],
      maxLength: [40, 'A password  should be not more than 80 characters'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'User should have a name'],
      trim: true,
      minLength: [6, 'A password  should be at lest 6 characters'],
      maxLength: [40, 'A password  should be not more than 80 characters'],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: `The confirmation password is not correct:  ({VALUE})`,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = userSchema;
