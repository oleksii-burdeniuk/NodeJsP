const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User should have a name'],
      trim: true,
      maxLength: [40, 'A tour should have a name less oe equal 80'],
      minLength: [1, 'A tour should have a name more than 1 character'],
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    email: {
      type: String,
      unique: [true, 'This Email already in use'],
      required: [true, 'User should have an email'],
      lowercase: true,
      validate: [validator.isEmail, 'Email is not correct ({VALUE)'],
    },
    password: {
      type: String,
      required: [true, 'User should have a name'],
      trim: true,
      minLength: [6, 'A password  should be at lest 6 characters'],
      maxLength: [40, 'A password  should be not more than 80 characters'],
      select: false,
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
    photo: String,
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const res = await bcrypt.compare(candidatePassword, userPassword);
  return res;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('save', function (next) {
  if (!this.isDirectModified('password' || this.isNew)) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
