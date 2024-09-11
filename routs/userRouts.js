const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = usersController;
const {
  sighUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = authController;
// '/api/v1/users'
const router = express.Router();

router.post('/signup', sighUp);
router.post('/login', login);

router.patch('/updatePassword', protect, updatePassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(protect, getAllUsers).post(protect, createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
