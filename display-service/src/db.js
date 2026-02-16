const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Display Service → MongoDB connected successfully');
  } catch (err) {
    console.error('Display Service → MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
