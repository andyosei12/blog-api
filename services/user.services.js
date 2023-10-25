const dotenv = require('dotenv');
const User = require('../models/user');
const createToken = require('../utils/createToken');

const registerUser = async ({ first_name, last_name, email, password }) => {
  //   Check if email exists
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        code: 409,
        error: true,
        message: 'User already exists',
      };
    }

    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
    });

    const token = createToken(user);
    return {
      code: 201,
      data: {
        token,
        user,
      },
      message: 'User added successfully',
    };
  } catch (err) {
    return {
      code: 500,
      error: true,
      message: err.message,
    };
  }
};

const loginUser = async ({ email, password }) => {
  //   Check if user exists
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        error: true,
        message: 'User does not exist. Try signing up',
        code: 404,
      };
    }

    const validPassword = await user.isValidPassword(password);
    if (!validPassword) {
      return {
        error: true,
        code: 401,
        message: 'Email or password is not correct',
      };
    }
    const token = createToken(user);
    return {
      code: 200,
      data: {
        token,
        user,
      },
      message: 'Login successfully',
    };
  } catch (error) {
    return {
      code: 500,
      error: true,
      message: error.message,
    };
  }
};

module.exports = { registerUser, loginUser };
