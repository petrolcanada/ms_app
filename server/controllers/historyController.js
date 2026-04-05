const { fetchPerformanceHistory, fetchFlowHistory, fetchAssetsHistory } = require('../services/historyService');

const getPerformanceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await fetchPerformanceHistory(id, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching performance history:', err);
    next(err);
  }
};

const getFlowHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await fetchFlowHistory(id, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching flow history:', err);
    next(err);
  }
};

const getAssetsHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const result = await fetchAssetsHistory(id, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching assets history:', err);
    next(err);
  }
};

module.exports = {
  getPerformanceHistory,
  getFlowHistory,
  getAssetsHistory,
};
