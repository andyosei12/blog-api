module.exports = (err, req, res, next) => {
  if (err.name == 'CastError') {
    err.message = `Resource not found. Invalid: ${err.path}`;
    err.statusCode = 404;

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (err.code === 11000) {
    err.message = `Duplicate field value entered`;
    err.statusCode = 400;

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
