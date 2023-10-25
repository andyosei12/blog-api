const BlogModel = require('../models/blog');
const logger = require('../logger');
const APIFeatures = require('../utils/apiFeatures');

// Create a blog
const createBlog = async (req, res) => {
  logger.info('Creating a new blog');
  const blogTitle = req.body.title;
  try {
    // Check if the blog already esist
    const existingBlog = await BlogModel.findOne({
      title: blogTitle,
      user_id: req.userId,
    }).collation({
      locale: 'en',
      strength: 2,
    });
    if (existingBlog) {
      logger.warn('Blog already exists');
      return res.status(409).json({
        error: true,
        message: 'Blog already exists',
      });
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  logger.info('Getting all blogs');

  try {
    // Execution
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
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  logger.info('Getting a blog by id');
  const blogId = req.params.id;
  try {
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
  } catch (error) {
    logger.error(error);
    res.status(404).json({
      error: true,
      message: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  logger.info('Updating a blog');
  const userId = req.userId;
  const blogId = req.params.id;
  const update = req.body;

  try {
    const blog = await BlogModel.findOneAndUpdate(
      { _id: blogId, user_id: userId },
      { ...update },
      { new: true, runValidators: true }
    );

    if (!blog) {
      logger.warn('Blog not found');
      return res.status(404).json({
        error: true,
        message: 'Blog not found',
      });
    }

    logger.info('Blog updated successfully');
    return res.status(200).json({
      blog,
      message: 'Blog updated successfully',
    });
  } catch (error) {
    logger.error(error);
    res.status(404).json({
      error: true,
      message: error.message,
    });
  }
};

const updateBlogState = async (req, res) => {
  logger.info('Updating a blog state');
  const userId = req.userId;
  const blogId = req.params.id;

  try {
    const blog = await BlogModel.findOneAndUpdate(
      { _id: blogId, user_id: userId },
      { state: 'published' },
      { new: true }
    );

    if (!blog) {
      logger.warn('Blog not found');
      return res.status(404).json({
        error: true,
        message: 'Blog not found',
      });
    }

    logger.info('Blog state updated successfully');
    return res.status(200).json({
      blog,
      message: 'Blog state updated successfully',
    });
  } catch (error) {
    logger.error(error);
    res.status(404).json({
      error: true,
      message: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  logger.info('Deleting a blog');
  const userId = req.userId;
  const blogId = req.params.id;
  try {
    const blog = await BlogModel.findOneAndDelete({
      _id: blogId,
      user_id: userId,
    });

    if (!blog) {
      logger.warn('Blog not found');
      return res.status(404).json({
        error: true,
        message: 'Blog not found',
      });
    }

    logger.info('Blog deleted successfully');
    return res.status(200).json({
      blog,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    logger.error(error);
    res.status(404).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  updateBlogState,
  deleteBlog,
};
