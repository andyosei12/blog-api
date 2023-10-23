const BlogModel = require('../models/blog');

const getBlogs = async (reqQuery = {}, userId = null) => {
  const queryObj = { ...reqQuery };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);
  try {
    let query;
    if (!userId) {
      query = BlogModel.find({
        ...queryObj,
        state: 'published',
      }).collation({
        locale: 'en',
        strength: 2,
      });
    } else {
      query = BlogModel.find({
        ...queryObj,
        user_id: userId,
      }).collation({
        locale: 'en',
        strength: 2,
      });
    }

    // Sorting
    if (reqQuery.sort) {
      const sortBy = reqQuery.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-created_at');
    }

    // Pagination
    const page = reqQuery.page * 1 || 1;
    const limit = reqQuery.limit * 1 || 20;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (reqQuery.page) {
      const numBlogs = await BlogModel.countDocuments();
      if (skip >= numBlogs) {
        throw new Error('This page does not exist');
      }
    }

    // Searching
    if (reqQuery.search) {
      const search = reqQuery.search;
      query = query.find({
        $text: {
          $search: search,
        },
      });
    }
    const blogs = await query;
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

const saveBlog = async (blog) => {
  try {
    const newBlog = await BlogModel.create(blog);
    return {
      code: 201,
      data: newBlog,
    };
  } catch (error) {
    return {
      code: 500,
      error: error.message,
    };
  }
};

module.exports = {
  getBlogs,
  saveBlog,
};
