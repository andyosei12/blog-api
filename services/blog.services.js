const BlogModel = require('../models/blog');
const APIFeatures = require('../utils/apiFeatures');

// This function retrieves all blogs for all users
// or all blogs for a specific user
// depending on the userId parameter
const getBlogs = async (reqQuery = {}, userId = null) => {
  try {
    let features;
    if (!userId) {
      // Getting all published blogs
      features = new APIFeatures(BlogModel.find(), reqQuery)
        .filter({ state: 'published' })
        .sort()
        .paginate()
        .search();
    } else {
      // Getting all blogs created by a user whether published or draft
      features = new APIFeatures(BlogModel.find(), reqQuery)
        .filter({ user_id: userId })
        .sort()
        .paginate()
        .search();
    }

    const blogs = await features.query;
    return {
      code: 200,
      items: blogs,
    };
  } catch (error) {
    return {
      code: 500,
      error: error.message,
    };
  }
};

// Creates a new blog
const saveBlog = async (blog) => {
  const blogTitle = blog.title;
  try {
    const existingBlog = await BlogModel.findOne({
      user_id: blog.user_id,
      title: blogTitle,
    }).collation({
      locale: 'en',
      strength: 2,
    });
    if (existingBlog) {
      return {
        code: 409,
        error: 'Blog already exists',
      };
    }
    const newBlog = await BlogModel.create({ ...blog });
    return {
      code: 201,
      blog: newBlog,
    };
  } catch (error) {
    return {
      code: 500,
      error: error.message,
    };
  }
};

// Get a blog and also increments the read count by 1
const findBlogAndUpdate = async (id) => {
  try {
    const blog = await BlogModel.findOneAndUpdate(
      { _id: id },
      { $inc: { read_count: 1 } },
      { new: true }
    );
    return {
      blog,
      status: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

// Get a blog without the increment of a read count.
const getBlog = async (id) => {
  try {
    const blog = await BlogModel.findOne({ _id: id });
    return {
      blog,
      status: 200,
    };
  } catch {
    return {
      error: true,
      message: error.message,
    };
  }
};

// Update a blog status from draft to published
const updateBlogStatus = async (id) => {
  try {
    const blog = await BlogModel.findOneAndUpdate(
      { _id: id },
      { state: 'published' },
      { new: true }
    );
    return {
      blog,
      status: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

// Update blog details
const updateBlog = async (body, id) => {
  try {
    const blog = await BlogModel.findOneAndUpdate(
      { _id: id },
      { ...body },
      { new: true }
    );
    return {
      blog,
      status: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

// Delete a blog
const deleteBlog = async (id) => {
  try {
    await BlogModel.findOneAndDelete({ _id: id });
    return {
      message: 'Blog deleted successfully',
      status: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

module.exports = {
  getBlogs,
  saveBlog,
  updateBlogStatus,
  getBlog,
  updateBlog,
  deleteBlog,
  findBlogAndUpdate,
};
