const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const createToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = createToken;
