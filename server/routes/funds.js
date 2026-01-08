const express = require('express');
const router = express.Router();
const { getAllFunds, getFundById } = require('../controllers/fundController');
const { validatePagination, validateFilters, validateFundId } = require('../middleware/validator');

// GET /api/funds - Get all funds with pagination and filters
router.get('/', validatePagination, validateFilters, getAllFunds);

// GET /api/funds/:id - Get single fund by ID
router.get('/:id', validateFundId, getFundById);

module.exports = router;
