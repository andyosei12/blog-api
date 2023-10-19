const express = require('express');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  updateBlogState,
  deleteBlog,
} = require('../controllers/blog');
const validateBlogCreation = require('../middlewares/blog/validateBlogCreation');
const verifyUser = require('../middlewares/auth/verifyUser');

const router = express.Router();

router.post('/', verifyUser, validateBlogCreation, createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.patch('/:id', verifyUser, updateBlog);
router.patch('/:id/status', verifyUser, updateBlogState);
router.delete('/:id', verifyUser, deleteBlog);

router.get('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
