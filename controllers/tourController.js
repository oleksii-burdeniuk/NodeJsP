const fs = require('fs');
// const Tour = require('../models/tourModel');

const toursSimplePath = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursSimplePath));

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Name or price is not defined' });
  }

  next();
};

exports.checkId = (req, res, next, val) => {
  const id = val;
  const tour = tours.find((item) => +item.id === +id);

  if (!tour) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'Cant find that tour' });
  }

  next();
};

exports.getTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((item) => +item.id === +id);

  res.status(200).json({
    status: 'success',
    results: 1,
    data: { tour },
  });
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newObject = { ...req.body, id: newId };
  tours.push(newObject);
  fs.writeFile(toursSimplePath, JSON.stringify(tours), () => {});
  res.status(201).json({
    status: 'success',
    data: { tour: newObject },
  });
};

exports.updateTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((item) => +item.id === +id);
  const index = tours.indexOf(tour);
  const newData = req.body;
  const updatedTour = { ...tour, ...newData };
  tours[index] = updatedTour;
  fs.writeFile(toursSimplePath, JSON.stringify(tours), () => {});

  res.status(203).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const { id } = req.params;
  const newTours = tours.filter((tour) => +tour.id !== +id);
  fs.writeFile(toursSimplePath, JSON.stringify(newTours), () => {});

  res.status(204).json({
    status: 'success',
    data: {},
  });
};
