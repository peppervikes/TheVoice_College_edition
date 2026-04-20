require('dotenv').config();

// Sentry must be initialized BEFORE importing app or express
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, 
  });
}

const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  logger.info('Connected to MongoDB');
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
})
.catch((err) => {
  logger.error('Database connection error:', err);
});
