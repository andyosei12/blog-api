const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {
  getBlogs,
  saveBlog,
  updateBlogStatus,
} = require('../services/blog.services');
const { registerUser, loginUser } = require('../services/user.services');

const router = express.Router();
router.use(cookieParser());

// index page
router.get('/', async (req, res) => {
  const blogs = await getBlogs();
  let user = null;
  if (req.cookies.jwt) {
    try {
      const decodedValue = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      user = decodedValue;
    } catch (err) {
      res.clearCookie('jwt');
    }
  }
  res.render('index', { pageTitle: 'Curated', blogs: blogs.items, user });
});

// login page
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

// signup page
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

// logout
router.get('/user/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

// middleware to check if user is logged in
router.use(async (req, res, next) => {
  if (req.cookies) {
    try {
      const decodedValue = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      res.locals.user = decodedValue;
      next();
    } catch (error) {
      res.redirect('/user/login');
    }
  } else {
    res.redirect('/user/login');
  }
});

router.get('/blogs', async (req, res) => {
  const query = req.query;
  const blogs = await getBlogs(query, res.locals.user.id);
  res.render('blogs', { pageTitle: 'Curated | Blogs', blogs: blogs.items });
});

router.get('/blogs/new', async (req, res) => {
  res.render('new-blog', { pageTitle: 'Curated | New Blog', error: null });
});

router.post('/blogs/new', async (req, res) => {
  const tags = req.body.tags.split(',');
  const author = res.locals.user.firstName + ' ' + res.locals.user.lastName;

  const blogDetails = {
    ...req.body,
    tags,
    author,
    user_id: res.locals.user.id,
  };
  const response = await saveBlog(blogDetails);
  if (response.error) {
    res.render('new-blog', {
      error: response.error,
      pageTitle: 'Curated | New Blog',
    });
  } else {
    res.redirect('/blogs');
  }
});

router.post('/blogs/:id/status', async (req, res) => {
  const id = req.params.id;
  const response = await updateBlogStatus(id);
  if (response.status === 200) {
    res.redirect('/blogs');
  }
});

module.exports = router;
