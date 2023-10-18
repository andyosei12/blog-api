const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/auth');

const app = express();
app.use(morgan('dev'));

app.use(express.json());

app.use('/api/v1/user', userRouter);

module.exports = app;
