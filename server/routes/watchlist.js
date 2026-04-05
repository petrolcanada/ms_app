const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { planLimits } = require('../middleware/planGate');
const watchlistService = require('../services/watchlistService');

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await watchlistService.getByUserId(req.user.id);
    res.json({ items });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { fundId, fundName, ticker, categoryName, securityType } = req.body;
    const limit = planLimits[req.user.plan].watchlistLimit;
    const current = await watchlistService.count(req.user.id);

    if (current >= limit) {
      return res.status(403).json({
        error: { message: `Watchlist limit reached (${limit})`, status: 403, upgrade: true },
      });
    }

    const item = await watchlistService.add(req.user.id, { fundId, fundName, ticker, categoryName, securityType });
    res.status(201).json({ item });
  }),
);

router.delete(
  '/:fundId',
  asyncHandler(async (req, res) => {
    await watchlistService.remove(req.user.id, req.params.fundId);
    res.json({ message: 'Removed' });
  }),
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await watchlistService.clearAll(req.user.id);
    res.json({ message: 'Cleared' });
  }),
);

router.post(
  '/sync',
  asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: { message: 'items must be an array', status: 400 } });
    }

    const limit = planLimits[req.user.plan].watchlistLimit;
    const current = await watchlistService.count(req.user.id);
    const allowed = Math.max(0, limit - current);
    const toSync = items.slice(0, allowed === Infinity ? items.length : allowed);

    const mapped = toSync.map((i) => ({
      fundId: i._id,
      fundName: i.fundname,
      ticker: i.ticker,
      categoryName: i.categoryname,
      securityType: i.securitytype,
    }));

    const synced = await watchlistService.bulkUpsert(req.user.id, mapped);
    res.json({ synced });
  }),
);

module.exports = router;
