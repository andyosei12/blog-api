const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { getBlogs } = require('../services/blog.services');
const { registerUser, loginUser } = require('../services/user.services');

const router = express.Router();
router.use(cookieParser());

router.get('/', async (req, res) => {
  const blogs = await getBlogs();
  let user = null;
  if (req.cookies.jwt) {
    const decodedValue = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    user = decodedValue;
  }
  res.render('index', { pageTitle: 'Curated', blogs: blogs.items, user });
});

router.get('/user/login', async (req, res) => {
  res.render('login', { pageTitle: 'Login', error: null });
});

router.post('/user/login', async (req, res) => {
  const response = await loginUser(req.body);
  if (response.error) {
    return res.render('login', {
      error: response.message,
      pageTitle: 'Curated | Login',
    });
  } else {
    res.cookie('jwt', response.data.token);
    res.redirect('/');
  }
});

router.get('/user/signup', async (req, res) => {
  res.render('signup', { pageTitle: 'Signup', error: null });
});

router.post('/user/signup', async (req, res) => {
  const response = await registerUser(req.body);
  if (response.error) {
    return res.render('signup', {
      error: response.message,
      pageTitle: 'Curated | Create an account',
    });
  } else {
    res.cookie('jwt', response.data.token);
    res.redirect('/');
  }
});

router.get('/user/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

module.exports = router;
