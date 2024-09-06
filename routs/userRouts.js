const express = require('express');
const usersController = require('../controllers/userController');
const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  usersController;

// '/api/v1/users'
const router = express.Router();
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
