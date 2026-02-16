const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const displayRoutes = require('./routes/display');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/display', displayRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Display Service is running 🚀' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something broke!' });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Display Service running on port ${PORT}`);
});
