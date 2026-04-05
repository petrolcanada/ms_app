const express = require('express');
const router = express.Router();
const { getAllFunds, getFundById } = require('../controllers/fundController');
const {
  getBasicInfoAtDate,
  getPerformanceAtDate,
  getRankingsAtDate,
  getFeesAtDate,
  getRatingsAtDate,
  getRiskAtDate,
  getFlowsAtDate,
  getAssetsAtDate,
  getFundDomainsAtDate,
  getAvailableDates,
} = require('../controllers/domainController');
const { getScreener } = require('../controllers/screenerController');
const {
  getPerformanceHistory,
  getFlowHistory,
  getAssetsHistory,
} = require('../controllers/historyController');
const {
  validatePagination,
  validateFilters,
  validateFundId,
  validateFundIdsBody,
  validateAsofDateBody,
  validateAsofDateQuery,
  validateDomainsBody,
} = require('../middleware/validator');
const { optionalAuth } = require('../middleware/auth');
const { attachLimits } = require('../middleware/planGate');

// GET /api/funds/screener - plan-limited screener
router.get('/screener', optionalAuth, attachLimits, validateFilters, validateAsofDateQuery, (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (data?.data && Array.isArray(data.data) && req.planLimits?.screenerLimit < Infinity) {
      const limit = req.planLimits.screenerLimit;
      if (data.data.length > limit) {
        data.data = data.data.slice(0, limit);
        data.limited = true;
        data.planLimit = limit;
      }
    }
    return originalJson(data);
  };
  next();
}, getScreener);

// GET /api/funds - Get all funds with pagination, filters, and optional as-of date
router.get('/', validatePagination, validateFilters, validateAsofDateQuery, getAllFunds);

// POST /api/funds/domains/basic-info
router.post('/domains/basic-info', validateFundIdsBody, validateAsofDateBody, getBasicInfoAtDate);

// POST /api/funds/domains/performance
router.post('/domains/performance', validateFundIdsBody, validateAsofDateBody, getPerformanceAtDate);

// POST /api/funds/domains/rankings
router.post('/domains/rankings', validateFundIdsBody, validateAsofDateBody, getRankingsAtDate);

// POST /api/funds/domains/fees
router.post('/domains/fees', validateFundIdsBody, validateAsofDateBody, getFeesAtDate);

// POST /api/funds/domains/ratings
router.post('/domains/ratings', validateFundIdsBody, validateAsofDateBody, getRatingsAtDate);

// POST /api/funds/domains/risk
router.post('/domains/risk', validateFundIdsBody, validateAsofDateBody, getRiskAtDate);

// POST /api/funds/domains/flows
router.post('/domains/flows', validateFundIdsBody, validateAsofDateBody, getFlowsAtDate);

// POST /api/funds/domains/assets
router.post('/domains/assets', validateFundIdsBody, validateAsofDateBody, getAssetsAtDate);

// GET /api/funds/domains/available-dates
router.get('/domains/available-dates', getAvailableDates);

// POST /api/funds/domains - Get multiple domains by fund IDs
router.post('/domains', validateFundIdsBody, validateAsofDateBody, validateDomainsBody, getFundDomainsAtDate);

// GET /api/funds/:id/history/performance
router.get('/:id/history/performance', validateFundId, getPerformanceHistory);

// GET /api/funds/:id/history/flows
router.get('/:id/history/flows', validateFundId, getFlowHistory);

// GET /api/funds/:id/history/assets
router.get('/:id/history/assets', validateFundId, getAssetsHistory);

// GET /api/funds/:id - Get single fund by ID (must be last to avoid capturing /domains)
router.get('/:id', validateFundId, getFundById);

module.exports = router;
