const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/display/products
// Public endpoint - يعرض كل المنتجات مع اسم صاحب المنتج
// GET /api/display/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });  // أحدث المنتجات أولاً

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching products'
    });
  }
});
// اختياري: endpoint لمنتج واحد حسب الـ ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
