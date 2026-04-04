const { getScreenerData } = require('../services/screenerService');

/**
 * @route GET /api/funds/screener
 */
const getScreener = async (req, res, next) => {
  try {
    const category = req.query.category || '';
    const type = req.query.type || '';
    const asofDate = req.asofDate || req.query.asofDate || '';

    const result = await getScreenerData({
      category: category || undefined,
      type: type || undefined,
      asofDate: asofDate || undefined,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching screener data:', err);
    next(err);
  }
};

module.exports = { getScreener };
