const winston = require('winston');
const path = require('path');


const logsDir = path.join(__dirname, '..', 'logs');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(), // Add a timestamp
    winston.format.json() // Log in JSON format
  ),
  transports: [
    // Log to the console
    new winston.transports.Console({
      format: winston.format.simple(), 
    }),
   
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'), // All logs
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
    }),
  ],
});



// Example usage
logger.info('Winston logging is set up!');
module.exports = logger;