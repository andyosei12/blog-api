const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: true,
      message: 'Authorization header required',
    });
  }
  const [_, token] = req.headers.authorization.split(' ');
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // check for jwt expiration
    if (user.exp * 1000 < Date.now()) {
      return res.status(401).json({
        error: true,
        message: 'Token expired',
      });
    }
    req.userId = user.id;
    req.username = user.firstName + ' ' + user.lastName;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: 'Invalid token',
    });
  }
};

module.exports = verifyUser;
