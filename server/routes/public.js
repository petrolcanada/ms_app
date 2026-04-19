const express = require('express');
const router = express.Router();
const { getPublicDashboard, getPublicAvailableDates } = require('../controllers/publicController');

router.get('/dashboard', getPublicDashboard);
router.get('/available-dates', getPublicAvailableDates);

module.exports = router;
