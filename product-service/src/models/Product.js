// product-service/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالبًا'],
  },
  description: {
    type: String,
    required: [true, 'الوصف مطلوب'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'رابط الصورة مطلوب'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,   // ← هنا المفتاح
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,   // يضيف createdAt و updatedAt تلقائيًا
});

module.exports = mongoose.model('Product', productSchema);
