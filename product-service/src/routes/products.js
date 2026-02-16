const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Product = require('../models/Product');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });  // Stores images in uploads folder

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const product = new Product({ name, price, description, imageUrl, createdBy: req.userId });
    await product.save();
    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
