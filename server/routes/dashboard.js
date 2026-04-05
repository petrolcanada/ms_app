const express = require('express');
const router = express.Router();
const { getDashboard, getCategoryOverview } = require('../controllers/dashboardController');
const { validateAsofDateQuery } = require('../middleware/validator');

router.get('/', validateAsofDateQuery, getDashboard);
router.get('/category/:category', validateAsofDateQuery, getCategoryOverview);

module.exports = router;
