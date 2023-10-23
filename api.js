const path = require('path');
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const viewsRouter = require('./views/views.router');

const app = express();
app.use(morgan('dev'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/', viewsRouter);

// globah error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    data: null,
    error: 'Server Error',
    message: err.message,
  });
});

module.exports = app;
