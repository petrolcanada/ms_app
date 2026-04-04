const { listFunds, getFundDetail } = require('../services/fundService');

/**
 * @route GET /api/funds
 */
const getAllFunds = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const category = req.query.category || '';
    const asofDate = req.asofDate || req.query.asofDate || '';

    const result = await listFunds({ page, limit, search, type, category, asofDate: asofDate || undefined });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching funds:', err);
    next(err);
  }
};

/**
 * @route GET /api/funds/:id
 */
const getFundById = async (req, res, next) => {
  try {
    const fund = await getFundDetail(req.params.id);

    res.status(200).json({ data: fund });
  } catch (err) {
    console.error('Error fetching fund:', err);
    next(err);
  }
};

module.exports = {
  getAllFunds,
  getFundById,
};
