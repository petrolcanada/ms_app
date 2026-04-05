const { queryPerformanceHistory, queryFlowHistory, queryAssetsHistory } = require('../queries/historyQueries');

const fetchPerformanceHistory = async (fundId, startDate, endDate) => {
  const rows = await queryPerformanceHistory(fundId, startDate, endDate);
  return { data: rows, meta: { fundId } };
};

const fetchFlowHistory = async (fundId, startDate, endDate) => {
  const rows = await queryFlowHistory(fundId, startDate, endDate);
  return { data: rows, meta: { fundId } };
};

const fetchAssetsHistory = async (fundId, startDate, endDate) => {
  const rows = await queryAssetsHistory(fundId, startDate, endDate);
  return { data: rows, meta: { fundId } };
};

module.exports = {
  fetchPerformanceHistory,
  fetchFlowHistory,
  fetchAssetsHistory,
};
