const winston = require('winston');
const Transport = require('winston-transport');
const Sentry = require('@sentry/node');

// Custom transport to send logs to Sentry
class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
  }
  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    
    // Only send warning or higher to Sentry to prevent noise
    if (info.level === 'error' || info.level === 'critical') {
      if (info.error instanceof Error) {
        Sentry.captureException(info.error);
      } else {
        Sentry.captureMessage(info.message, 'error');
      }
    } else if (info.level === 'warn') {
      Sentry.captureMessage(info.message, 'warning');
    }
    callback();
  }
}

// Define custom levels to include critical
const customLevels = {
  levels: { critical: 0, error: 1, warn: 2, info: 3, debug: 4 },
  colors: { critical: 'red', error: 'red', warn: 'yellow', info: 'green', debug: 'blue' }
};
winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new SentryTransport({ level: 'warn' })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
