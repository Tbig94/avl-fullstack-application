const { transports, createLogger, format } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
    format.simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join('logs', '/error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join('logs', '/combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;
