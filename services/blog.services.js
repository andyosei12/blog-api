const BlogModel = require('../models/blog');
const APIFeatures = require('../utils/apiFeatures');

const getBlogs = async (reqQuery = {}, userId = null) => {
  try {
    let features;
    if (!userId) {
      features = new APIFeatures(BlogModel.find(), reqQuery)
        .filter({ state: 'published' })
        .sort()
        .paginate()
        .search();
    } else {
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
    console.log(error.message);
    return {
      code: 500,
      error: error.message,
    };
  }
};

const saveBlog = async (blog) => {
  try {
    const newBlog = await BlogModel.create(blog);
    return {
      code: 201,
      data: newBlog,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        code: 409,
        error: 'Blog already exists',
      };
    }
    return {
      code: 500,
      error: error.message,
    };
  }
};

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
