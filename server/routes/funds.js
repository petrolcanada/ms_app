const express = require('express');
const router = express.Router();
const {
  getAllFunds,
  getFundById,
  getBasicInfoAtDate,
  getPerformanceAtDate,
  getFundDomainsAtDate,
} = require('../controllers/fundController');
const {
  validatePagination,
  validateFilters,
  validateFundId,
  validateFundIdsBody,
  validateAsofDateBody,
  validateDomainsBody,
} = require('../middleware/validator');

// GET /api/funds - Get all funds with pagination and filters
router.get('/', validatePagination, validateFilters, getAllFunds);

// POST /api/funds/domains/basic-info - Get basic info domain by fund IDs
router.post('/domains/basic-info', validateFundIdsBody, validateAsofDateBody, getBasicInfoAtDate);

// POST /api/funds/domains/performance - Get performance domain by fund IDs
router.post('/domains/performance', validateFundIdsBody, validateAsofDateBody, getPerformanceAtDate);

// POST /api/funds/domains - Get multiple domains by fund IDs
router.post('/domains', validateFundIdsBody, validateAsofDateBody, validateDomainsBody, getFundDomainsAtDate);

// GET /api/funds/:id - Get single fund by ID
router.get('/:id', validateFundId, getFundById);

module.exports = router;
