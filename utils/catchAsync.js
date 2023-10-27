const logger = require('../logger');

// A utility function to propagate async errors to the global error handler
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      logger.error(err);
      next(err);
    });
  };
};
