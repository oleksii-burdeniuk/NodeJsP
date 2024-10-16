const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('multer');

const upload = multer({ dest: 'public/img/users' });

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = usersController;
const {
  sighUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} = authController;
// '/api/v1/users'
const router = express.Router();

router.post('/signup', sighUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// protect all routs after
router.use(protect);
router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me', getMe, getUser);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
