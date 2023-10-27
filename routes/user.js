const express = require('express');
const {
  registerUser,
  loginUser,
  getAuthUserBlogs,
} = require('../controllers/user');
const validateUserCreation = require('../middlewares/auth/validateUserCreation');
const validateLogin = require('../middlewares/auth/validateLogin');
const verifyUser = require('../middlewares/auth/verifyUser');
const AppError = require('../utils/appError');

const router = express.Router();

router.post('/signup', validateUserCreation, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/blogs', verifyUser, getAuthUserBlogs);

router.all('*', (req, res, next) => {
  const err = new AppError(
    `${req.originalUrl} was not found on this server`,
    404
  );
  next(err);
});

module.exports = router;
