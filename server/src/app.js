const express = require('express');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(cors());
app.use(express.json());

const objectRoutes = require('./routes/objectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const flagRoutes = require('./routes/flagRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', objectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/flags', flagRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'University Review Platform API is running.' });
});

module.exports = app;
