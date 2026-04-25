const { getScreenerData } = require('../services/screenerService');
const { SORTABLE_COLUMNS } = require('../queries/screenerQueries');

const PER_PAGE = 25;

/**
 * @route GET /api/funds/screener
 */
const getScreener = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const assetManager = req.query.assetManager || '';
    const type = req.query.type || '';
    const asofDate = req.asofDate || req.query.asofDate || '';

    const sortBy = SORTABLE_COLUMNS[req.query.sortBy] ? req.query.sortBy : 'return1yr';
    const sortDir = req.query.sortDir === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.limit) || PER_PAGE));

    const planLimit = req.planLimits?.screenerLimit ?? Infinity;
    const offset = (page - 1) * pageSize;

    if (planLimit < Infinity && offset >= planLimit) {
      return res.status(200).json({
        data: [],
        meta: { total: planLimit, page, pageSize, totalPages: Math.ceil(planLimit / pageSize) },
        limited: true,
        planLimit,
      });
    }

    const effectiveLimit = planLimit < Infinity ? Math.min(pageSize, planLimit - offset) : pageSize;

    const result = await getScreenerData({
      search: search || undefined,
      category: category || undefined,
      assetManager: assetManager || undefined,
      type: type || undefined,
      asofDate: asofDate || undefined,
      sortBy,
      sortDir,
      limit: effectiveLimit,
      offset,
    });

    const actualTotal = result.meta.total;
    const visibleTotal = planLimit < Infinity ? Math.min(actualTotal, planLimit) : actualTotal;

    res.status(200).json({
      data: result.data,
      meta: {
        total: visibleTotal,
        page,
        pageSize,
        totalPages: Math.ceil(visibleTotal / pageSize),
      },
      ...(planLimit < Infinity && actualTotal > planLimit ? { limited: true, planLimit } : {}),
    });
  } catch (err) {
    console.error('Error fetching screener data:', err);
    next(err);
  }
};

module.exports = { getScreener };
