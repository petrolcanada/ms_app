const express = require('express');
const router = express.Router();
const {
  getAllAssetManagers,
  getAssetManagerOverview,
} = require('../controllers/assetManagerController');
const { validateAsofDateQuery } = require('../middleware/validator');

router.get('/', getAllAssetManagers);
router.get('/:name/overview', validateAsofDateQuery, getAssetManagerOverview);

module.exports = router;
