const { pool } = require('../config/db');

const queryPerformanceHistory = async (fundId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT * FROM ms.fn_get_performance_history($1, $2::DATE, $3::DATE)`,
    [fundId, startDate, endDate]
  );
  return result.rows;
};

const queryFlowHistory = async (fundId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT * FROM ms.fn_get_flow_history($1, $2::DATE, $3::DATE)`,
    [fundId, startDate, endDate]
  );
  return result.rows;
};

const queryAssetsHistory = async (fundId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT * FROM ms.fn_get_assets_history($1, $2::DATE, $3::DATE)`,
    [fundId, startDate, endDate]
  );
  return result.rows;
};

module.exports = {
  queryPerformanceHistory,
  queryFlowHistory,
  queryAssetsHistory,
};
