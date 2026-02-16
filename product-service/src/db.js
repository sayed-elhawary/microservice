// product-service/src/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Product Service → MongoDB connected successfully');
  } catch (err) {
    console.error('Product Service → MongoDB connection error:', err.message);
    process.exit(1); // إيقاف السيرفر لو الاتصال فشل
  }
};

module.exports = connectDB;
