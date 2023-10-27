const BlogModel = require('../models/blog');
const logger = require('../logger');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a blog
const createBlog = catchAsync(async (req, res, next) => {
  logger.info('Creating a new blog');
  // Check if the blog already esist
  const blogTitle = req.body.title;
  const existingBlog = await BlogModel.findOne({
    user_id: req.userId,
    title: blogTitle,
  }).collation({
    locale: 'en',
    strength: 2,
  });

  if (existingBlog) {
    logger.error('Blog already exists');
    const err = new AppError('Blog already exists', 409);
    return next(err);
  }

  // Create the blog
  const blog = await BlogModel.create({
    user_id: req.userId,
    author: req.username,
    ...req.body,
  });

  logger.info('Blog created successfully');
  return res.status(201).json({
    blog,
    message: 'Blog created successfully',
  });
});

// Get all blogs
const getAllBlogs = catchAsync(async (req, res, next) => {
  logger.info('Getting all blogs');
  const features = new APIFeatures(BlogModel.find(), req.query)
    .filter({ state: 'published' })
    .sort()
    .paginate()
    .search();
  const blogs = await features.query;
  logger.info('Blogs fetched successfully');
  return res.status(200).json({
    blogs,
    message: 'Success',
  });
});

const getBlogById = catchAsync(async (req, res, next) => {
  logger.info('Getting a blog by id');
  const blogId = req.params.id;
  const blog = await BlogModel.findOneAndUpdate(
    { _id: blogId },
    { $inc: { read_count: 1 } },
    { new: true }
  );

  logger.info('Blog fetched successfully');
  return res.status(200).json({
    blog,
    message: 'Blog fetched successfully',
  });
});

const updateBlog = catchAsync(async (req, res, next) => {
  logger.info('Updating a blog');
  const userId = req.userId;
  const blogId = req.params.id;
  const update = req.body;

  const blog = await BlogModel.findOneAndUpdate(
    { _id: blogId, user_id: userId },
    { ...update },
    { new: true, runValidators: true }
  );

  if (!blog) {
    logger.error('Blog not found');
    const err = new AppError('Blog not found', 404);
    return next(err);
  }

  logger.info('Blog updated successfully');
  return res.status(200).json({
    blog,
    message: 'Blog updated successfully',
  });
});

const updateBlogState = catchAsync(async (req, res, next) => {
  logger.info('Updating a blog state');
  const userId = req.userId;
  const blogId = req.params.id;

  const blog = await BlogModel.findOneAndUpdate(
    { _id: blogId, user_id: userId },
    { state: 'published' },
    { new: true }
  );

  if (!blog) {
    logger.error('Blog not found');
    const err = new AppError('Blog not found', 404);
    return next(err);
  }

  logger.info('Blog state updated successfully');
  return res.status(200).json({
    blog,
    message: 'Blog state updated successfully',
  });
});

const deleteBlog = catchAsync(async (req, res, next) => {
  logger.info('Deleting a blog');
  const userId = req.userId;
  const blogId = req.params.id;
  const blog = await BlogModel.findOneAndDelete({
    _id: blogId,
    user_id: userId,
  });

  if (!blog) {
    logger.error('Blog not found');
    const err = new AppError('Blog not found', 404);
    return next(err);
  }

  logger.info('Blog deleted successfully');
  return res.status(200).json({
    blog: {
      title: blog.title,
      id: blog._id,
    },
    message: 'Blog deleted successfully',
  });
});

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  updateBlogState,
  deleteBlog,
};
