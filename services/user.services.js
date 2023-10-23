const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

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

    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
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
    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        id: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
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
