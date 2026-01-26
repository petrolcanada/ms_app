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

/**
 * Validate fundIds in request body
 * Ensures fundIds is a non-empty array of non-empty strings
 */
const validateFundIdsBody = (req, res, next) => {
  const { fundIds } = req.body;
  
  if (!Array.isArray(fundIds) || fundIds.length === 0) {
    const error = new AppError('fundIds must be a non-empty array', 400);
    error.details = 'Invalid fundIds';
    return next(error);
  }
  
  const invalidId = fundIds.find(id => typeof id !== 'string' || id.trim() === '');
  if (invalidId !== undefined) {
    const error = new AppError('fundIds must contain non-empty strings', 400);
    error.details = 'Invalid fundIds';
    return next(error);
  }
  
  if (fundIds.length > 100) {
    const error = new AppError('fundIds cannot exceed 100 items', 400);
    error.details = 'Invalid fundIds';
    return next(error);
  }
  
  next();
};

/**
 * Validate asofDate in request body
 * Ensures asofDate is provided and is a valid date
 */
const validateAsofDateBody = (req, res, next) => {
  const { asofDate } = req.body;
  
  if (!asofDate) {
    const error = new AppError('asofDate is required (YYYY-MM-DD)', 400);
    error.details = 'Missing asofDate';
    return next(error);
  }
  
  if (typeof asofDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(asofDate)) {
    const error = new AppError('asofDate must be a valid date (YYYY-MM-DD)', 400);
    error.details = 'Invalid asofDate';
    return next(error);
  }
  
  const parsed = new Date(`${asofDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    const error = new AppError('asofDate must be a valid date (YYYY-MM-DD)', 400);
    error.details = 'Invalid asofDate';
    return next(error);
  }
  
  const [year, month, day] = asofDate.split('-').map(Number);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    const error = new AppError('asofDate must be a valid date (YYYY-MM-DD)', 400);
    error.details = 'Invalid asofDate';
    return next(error);
  }
  
  req.asofDate = asofDate;
  next();
};

/**
 * Validate requested domains in request body
 */
const validateDomainsBody = (req, res, next) => {
  const { domains } = req.body;
  
  if (!Array.isArray(domains) || domains.length === 0) {
    const error = new AppError('domains must be a non-empty array', 400);
    error.details = 'Invalid domains';
    return next(error);
  }
  
  const allowed = new Set([
    'basicInfo',
    'performance',
    'fees',
    'ratings',
    'risk',
    'flows',
    'assets',
  ]);
  const invalid = domains.find(domain => !allowed.has(domain));
  if (invalid) {
    const error = new AppError('domains must include only basicInfo, performance, fees, ratings, risk, flows, or assets', 400);
    error.details = 'Invalid domains';
    return next(error);
  }
  
  next();
};

module.exports = {
  validatePagination,
  validateFilters,
  validateFundId,
  validateFundIdsBody,
  validateAsofDateBody,
  validateDomainsBody,
};
