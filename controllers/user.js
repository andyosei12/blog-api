const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('../logger');
const UserModel = require('../models/user');
const BlogModel = require('../models/blog');

dotenv.config();

const registerUser = async (req, res) => {
  //   Check if email exists
  logger.info('(User) => register process started');
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'User already exists',
      });
    }

    const user = await UserModel.create({
      ...req.body,
    });

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    logger.info('(User) => register process successful');
    return res.status(201).json({
      token,
      user,
      message: 'User added successfully',
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'An error occured',
      err: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  const email = req.body.email;
  const passwordInput = req.body.password;
  logger.info('(User) => login process started');
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User does not exist. Try signing up',
      });
    }

    const validPassword = await user.isValidPassword(passwordInput);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Email or password is not correct',
      });
    }
    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successfully',
      token,
      user,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: 'An error occured',
    });
  }
};

const getAuthUserBlogs = async (req, res) => {
  logger.info('(User) => getAuthUserBlogs process started');
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit'];
  excludedFields.forEach((el) => delete queryObj[el]);
  try {
    const userId = req.userId;
    let query = BlogModel.find({
      ...queryObj,
      user_id: userId,
    }).collation({
      locale: 'en',
      strength: 2,
    });

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-created_at');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numBlogs = await BlogModel.countDocuments();
      if (skip >= numBlogs) {
        throw new Error('This page does not exist');
      }
    }

    const blogs = await query;
    logger.info('Blogs fetched successfully');
    return res.status(200).json({
      blogs,
      message: 'Success',
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      error: true,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAuthUserBlogs,
};
