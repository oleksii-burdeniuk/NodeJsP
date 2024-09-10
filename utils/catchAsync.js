const catchAsync = (fn) => {
  const result = (req, res, next) => {
    fn(req, res, next).catch(next);
  };
  return result;
};

module.exports = catchAsync;
