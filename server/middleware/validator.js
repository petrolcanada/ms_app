/**
 * Validation middleware for API requests
 */

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
      return res.status(400).json({
        error: {
          message: 'Invalid pagination parameter',
          details: 'Page must be a positive integer (>= 1)',
        },
      });
    }
  }
  
  // Validate limit parameter
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        error: {
          message: 'Invalid pagination parameter',
          details: 'Limit must be a positive integer (> 0)',
        },
      });
    }
    
    // Optional: Set maximum limit to prevent excessive data retrieval
    if (limitNum > 100) {
      return res.status(400).json({
        error: {
          message: 'Invalid pagination parameter',
          details: 'Limit cannot exceed 100',
        },
      });
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
    return res.status(400).json({
      error: {
        message: 'Invalid filter parameter',
        details: 'Search must be a string',
      },
    });
  }
  
  // Validate type parameter
  if (type !== undefined && typeof type !== 'string') {
    return res.status(400).json({
      error: {
        message: 'Invalid filter parameter',
        details: 'Type must be a string',
      },
    });
  }
  
  // Validate category parameter
  if (category !== undefined && typeof category !== 'string') {
    return res.status(400).json({
      error: {
        message: 'Invalid filter parameter',
        details: 'Category must be a string',
      },
    });
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
    return res.status(400).json({
      error: {
        message: 'Invalid fund ID',
        details: 'Fund ID must be a non-empty string',
      },
    });
  }
  
  next();
};

module.exports = {
  validatePagination,
  validateFilters,
  validateFundId,
};
