const dotenv = require('dotenv');
const logger = require('./logger');
const db = require('./db');
const app = require('./api');

dotenv.config();

const port = process.env.PORT || 5000;

db.connect();

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
