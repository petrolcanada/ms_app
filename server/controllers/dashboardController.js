const { fetchDashboardData, fetchCategoryOverview } = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const asofDate = req.asofDate || req.query.asofDate || '';
    const result = await fetchDashboardData(asofDate || undefined);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    next(err);
  }
};

const getCategoryOverview = async (req, res, next) => {
  try {
    const { category } = req.params;
    const asofDate = req.asofDate || req.query.asofDate || '';
    const result = await fetchCategoryOverview(category, asofDate || undefined);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Error fetching category overview:', err);
    next(err);
  }
};

module.exports = { getDashboard, getCategoryOverview };
