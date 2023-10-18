const express = require('express');
const morgan = require('morgan');
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Hello',
  });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
