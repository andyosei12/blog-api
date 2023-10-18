const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connect = (url) => {
  mongoose.connect(
    url || process.env.MONGODB_URL || 'mongodb://localhost:27017'
  );
  mongoose.connection.on('connected', () => {
    console.log('Connection made successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.log('Error in connecting to the db');
    console.log(err);
  });
};

module.exports = {
  connect,
};
