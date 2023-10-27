const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {
  getBlogs,
  saveBlog,
  updateBlogStatus,
  getBlog,
  updateBlog,
  deleteBlog,
  findBlogAndUpdate,
} = require('../services/blog.services');
const { registerUser, loginUser } = require('../services/user.services');

const router = express.Router();
router.use(cookieParser());

// index page
router.get('/', async (req, res) => {
  const blogs = await getBlogs(req.query);
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

// login user
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

// signup user
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

// Get a blog
router.get('/blogs/:id', async (req, res) => {
  const { blog } = await findBlogAndUpdate(req.params.id);
  const tags = blog.tags.toLocaleString();
  const item = { ...blog._doc, tags };
  let user = null;
  if (req.cookies.jwt) {
    try {
      const decodedValue = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      user = decodedValue;
    } catch (err) {
      res.clearCookie('jwt');
    }
  }
  res.render('blog-details', {
    pageTitle: 'Curated | Blog Details',
    item,
    user,
  });
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

// Get all blogs of a logged in user
router.get('/blogs', async (req, res) => {
  const query = req.query;
  const blogs = await getBlogs(query, res.locals.user.id);
  res.render('blogs', {
    pageTitle: 'Curated | Blogs',
    blogs: blogs.items,
    error: null,
  });
});

// route to create a new blog
router.get('/user/blogs/new', async (req, res) => {
  res.render('new-blog', { pageTitle: 'Curated | New Blog', error: null });
});

// Add a blog
router.post('/user/blogs/new', async (req, res) => {
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

// update blog status
router.post('/blogs/:id/status', async (req, res) => {
  const id = req.params.id;
  const response = await updateBlogStatus(id);
  if (response.status === 200) {
    res.redirect('/blogs');
  }
});

// edit blog
router.get('/user/blogs/:id', async (req, res) => {
  const { blog } = await getBlog(req.params.id);
  const tags = blog.tags.toLocaleString();
  const item = { ...blog._doc, tags };

  res.render('edit-blog', {
    pageTitle: 'Curated | Edit Blog',
    error: null,
    item,
  });
});

// Get a blog details
router.get('/user/blogs/:id/details', async (req, res) => {
  const { blog } = await getBlog(req.params.id);
  const tags = blog.tags.toLocaleString();
  const item = { ...blog._doc, tags };

  res.render('blog-details', {
    pageTitle: 'Curated | Blog Details',
    error: null,
    item,
  });
});

// update blog
router.post('/user/blogs/:id', async (req, res) => {
  const response = await updateBlog(req.body, req.params.id);
  if (response.error) {
    res.render('edit-blog', {
      error: response.error,
      pageTitle: 'Curated | Edit Blog',
    });
  } else {
    res.redirect('/blogs');
  }
});

// delete blog
router.post('/user/blogs/:id/delete', async (req, res) => {
  const response = await deleteBlog(req.params.id);
  if (response.error) {
    res.render('blogs', {
      error: response.error,
      pageTitle: 'Curated | Edit Blog',
    });
  } else {
    res.redirect('/blogs');
  }
});

module.exports = router;
