/**
 * Centralized Error Handler Middleware
 * Handles different types of errors and returns appropriate HTTP responses
 * Requirements: 10.1, 10.2, 10.3
 */

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Determine if error is a database connection error
 */
const isDatabaseConnectionError = (err) => {
  // PostgreSQL connection error codes
  const connectionErrorCodes = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
  ];
  
  return connectionErrorCodes.includes(err.code) || 
         err.message?.toLowerCase().includes('connection') ||
         err.message?.toLowerCase().includes('connect econnrefused');
};

/**
 * Determine if error is a validation error
 */
const isValidationError = (err) => {
  return err.name === 'ValidationError' || 
         err.statusCode === 400 ||
         err.message?.toLowerCase().includes('validation');
};

/**
 * Determine if error is a not found error
 */
const isNotFoundError = (err) => {
  return err.statusCode === 404 || 
         err.message?.toLowerCase().includes('not found');
};

/**
 * Format error response based on error type
 */
const formatErrorResponse = (err, req) => {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.url;
  
  // Database connection errors (503)
  if (isDatabaseConnectionError(err)) {
    return {
      statusCode: 503,
      error: {
        message: 'Database temporarily unavailable',
        status: 503,
        timestamp,
        path,
      },
    };
  }
  
  // Validation errors (400)
  if (isValidationError(err)) {
    return {
      statusCode: 400,
      error: {
        message: err.message || 'Validation error',
        status: 400,
        timestamp,
        path,
        details: err.details || err.errors || undefined,
      },
    };
  }
  
  // Not found errors (404)
  if (isNotFoundError(err)) {
    return {
      statusCode: 404,
      error: {
        message: err.message || 'Resource not found',
        status: 404,
        timestamp,
        path,
      },
    };
  }
  
  // Default to 500 for unknown errors
  const statusCode = err.statusCode || 500;
  return {
    statusCode,
    error: {
      message: err.message || 'Internal server error',
      status: statusCode,
      timestamp,
      path,
    },
  };
};

/**
 * Main error handler middleware
 * Must be registered after all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.originalUrl || req.url,
    method: req.method,
  });
  
  // Format error response
  const { statusCode, error } = formatErrorResponse(err, req);
  
  // Add stack trace in development mode only
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(error);
};

/**
 * 404 Not Found handler for undefined routes
 * Should be registered after all valid routes but before error handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 * Usage: asyncHandler(async (req, res, next) => { ... })
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  isDatabaseConnectionError,
  isValidationError,
  isNotFoundError,
};
