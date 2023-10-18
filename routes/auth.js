const express = require('express');
const { registerUser, loginUser } = require('../controllers/user');
const validateUserCreation = require('../middlewares/auth/validateUserCreation');
const validateLogin = require('../middlewares/auth/validateLogin');

const router = express.Router();

router.post('/signup', validateUserCreation, registerUser);
router.post('/login', validateLogin, loginUser);

router.get('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
