/**
 * Validation middleware for API requests
 */

const { AppError } = require('./errorHandler');

/**
 * Validate pagination parameters
 * Ensures page >= 1 and limit > 0
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  // Validate page parameter
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      const error = new AppError('Page must be a positive integer (>= 1)', 400);
      error.details = 'Invalid pagination parameter';
      return next(error);
    }
  }
  
  // Validate limit parameter
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      const error = new AppError('Limit must be a positive integer (> 0)', 400);
      error.details = 'Invalid pagination parameter';
      return next(error);
    }
    
    // Optional: Set maximum limit to prevent excessive data retrieval
    if (limitNum > 100) {
      const error = new AppError('Limit cannot exceed 100', 400);
      error.details = 'Invalid pagination parameter';
      return next(error);
    }
  }
  
  next();
};

/**
 * Validate filter parameters
 * Ensures filter values are non-empty strings
 */
const validateFilters = (req, res, next) => {
  const { search, type, category } = req.query;
  
  // Validate search parameter
  if (search !== undefined && typeof search !== 'string') {
    const error = new AppError('Search must be a string', 400);
    error.details = 'Invalid filter parameter';
    return next(error);
  }
  
  // Validate type parameter
  if (type !== undefined && typeof type !== 'string') {
    const error = new AppError('Type must be a string', 400);
    error.details = 'Invalid filter parameter';
    return next(error);
  }
  
  // Validate category parameter
  if (category !== undefined && typeof category !== 'string') {
    const error = new AppError('Category must be a string', 400);
    error.details = 'Invalid filter parameter';
    return next(error);
  }
  
  next();
};

/**
 * Validate fund ID parameter
 * Ensures ID is a non-empty string
 */
const validateFundId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim() === '') {
    const error = new AppError('Fund ID must be a non-empty string', 400);
    error.details = 'Invalid fund ID';
    return next(error);
  }
  
  next();
};

module.exports = {
  validatePagination,
  validateFilters,
  validateFundId,
};
