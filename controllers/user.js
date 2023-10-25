const logger = require('../logger');
const UserModel = require('../models/user');
const BlogModel = require('../models/blog');
const APIFeatures = require('../utils/apiFeatures');
const createToken = require('../utils/createToken');

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

    const token = createToken(user);
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
    const token = createToken(user);
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
  try {
    const userId = req.userId;
    const features = new APIFeatures(BlogModel.find(), req.query)
      .filter({ user_id: userId })
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
