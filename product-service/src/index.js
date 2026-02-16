const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const productRoutes = require('./routes/products');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// اتصل بالداتابيز أول حاجة وانتظرها
(async () => {
  try {
    await connectDB();
    console.log('الاتصال تم بنجاح قبل بدء السيرفر');

    app.use('/api/products', productRoutes);

    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`Product service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('فشل الاتصال بـ MongoDB، السيرفر مش هيشتغل:', err);
    process.exit(1);
  }
})();
