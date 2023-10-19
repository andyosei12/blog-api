const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/auth');
const blogRouter = require('./routes/blog');

const app = express();
app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/blogs', blogRouter);

module.exports = app;
