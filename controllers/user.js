const logger = require('../logger');
const UserModel = require('../models/user');
const BlogModel = require('../models/blog');
const APIFeatures = require('../utils/apiFeatures');
const createToken = require('../utils/createToken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const registerUser = catchAsync(async (req, res, next) => {
  logger.info('(User) => register process started');
  // check if user already exists
  const existingUser = await UserModel.findOne({ email: req.body.email });
  if (existingUser) {
    const err = new AppError('User already exists', 409);
    return next(err);
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
});

const loginUser = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const passwordInput = req.body.password;
  logger.info('(User) => login process started');

  const user = await UserModel.findOne({ email });
  if (!user) {
    const err = new AppError('User does not exist. Try signing up', 404);
    return next(err);
  }

  // Validate user password
  const validPassword = await user.isValidPassword(passwordInput);
  if (!validPassword) {
    const err = new AppError('Email or password is not correct', 401);
    return next(err);
  }

  // Create a jwt token
  const token = createToken(user);
  return res.status(200).json({
    message: 'Login successfully',
    token,
    user,
  });
});

// Get all blogs created by a user
const getAuthUserBlogs = catchAsync(async (req, res, next) => {
  logger.info('(User) => getAuthUserBlogs process started');
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
});

module.exports = {
  registerUser,
  loginUser,
  getAuthUserBlogs,
};
