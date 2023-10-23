const express = require('express');
const { getBlogs } = require('../services/blog.services');

const router = express.Router();

router.get('/', async (req, res) => {
  const blogs = await getBlogs();
  console.log(blogs);
  res.render('index', { pageTitle: 'Curated', blogs: blogs.items });
});

module.exports = router;
