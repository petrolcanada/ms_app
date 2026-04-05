const { queryPerformanceHistory, queryFlowHistory, queryAssetsHistory } = require('../queries/historyQueries');

const fetchPerformanceHistory = async (fundId, startDate, endDate) => {
  const rows = await queryPerformanceHistory(fundId, startDate, endDate);
  return { fundId, data: rows };
};

const fetchFlowHistory = async (fundId, startDate, endDate) => {
  const rows = await queryFlowHistory(fundId, startDate, endDate);
  return { fundId, data: rows };
};

const fetchAssetsHistory = async (fundId, startDate, endDate) => {
  const rows = await queryAssetsHistory(fundId, startDate, endDate);
  return { fundId, data: rows };
};

module.exports = {
  fetchPerformanceHistory,
  fetchFlowHistory,
  fetchAssetsHistory,
};
