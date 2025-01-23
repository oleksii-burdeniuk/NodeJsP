const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  updateUserData,
  alerts,
} = viewsController;

router.use(authController.isLoggedIn);

router.use(alerts);

router.get('/', getOverview);

router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);
router.get('/me', getAccount);

router.get('/my-tours', getMyTours);

router.post('/submit-user-data', updateUserData);

module.exports = router;
