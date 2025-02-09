const logger = require('./logger')

// Middleware to log HTTP requests
const httpLoggerMiddleware = (req, res, next) => {
    const { method, url } = req;
    const clientIP = req.ip || req.connection.remoteAddress;
  
    logger.info('HTTP Request', {
      timestamp: new Date().toISOString(),
      method,
      url,
      clientIP,
    }); 
  
    next();
  };

  module.exports = httpLoggerMiddleware;