const express = require('express');
const {
  registerUser,
  loginUser,
  getAuthUserBlogs,
} = require('../controllers/user');
const validateUserCreation = require('../middlewares/auth/validateUserCreation');
const validateLogin = require('../middlewares/auth/validateLogin');
const verifyUser = require('../middlewares/auth/verifyUser');

const router = express.Router();

router.post('/signup', validateUserCreation, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/blogs', verifyUser, getAuthUserBlogs);

router.get('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
