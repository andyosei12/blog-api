const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

const app = express();
app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/blogs', blogRouter);

// globah error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    data: null,
    error: 'Server Error',
  });
});

module.exports = app;
