const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// --- Security Middleware ---
app.use(helmet());
app.use(cookieParser());

// CORS – allow frontend origin (configure for production)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent abuse

// --- Rate Limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window per IP
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                    // Stricter limit for auth endpoints
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const objectRoutes = require('./routes/objectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const flagRoutes = require('./routes/flagRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', objectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/flags', flagRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'University Review Platform API is running.',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Global Error Handler ---
// Catches any unhandled errors from route handlers
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry.' });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message
  });
});

module.exports = app;
