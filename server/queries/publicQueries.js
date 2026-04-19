const { pool } = require('../config/db');

const queryPublicDashboardStats = async () => {
  const result = await pool.query(`
    SELECT total_funds, avg_return_1yr, avg_mer, avg_rating, latest_date
    FROM ms_public.dashboard_stats_mv
    LIMIT 1
  `);
  return result.rows[0] || null;
};

const queryPublicTopPerformers = async () => {
  const result = await pool.query(`
    SELECT _id, fundname, ticker, categoryname, securitytype, return1yr, return3yr, return5yr, ratingoverall
    FROM ms_public.top_performers_mv
    ORDER BY display_order ASC
  `);
  return result.rows;
};

const queryPublicLargestFlows = async () => {
  const result = await pool.query(`
    SELECT _id, fundname, ticker, categoryname, flow_1m, flow_1yr, direction
    FROM ms_public.largest_flows_mv
    ORDER BY group_order ASC, display_order ASC
  `);
  return result.rows;
};

const queryPublicHighestRated = async () => {
  const result = await pool.query(`
    SELECT _id, fundname, ticker, categoryname, securitytype, ratingoverall, rating3year, rating5year, return1yr, return3yr
    FROM ms_public.highest_rated_mv
    ORDER BY display_order ASC
  `);
  return result.rows;
};

const queryPublicAvailableDates = async () => {
  const result = await pool.query(`
    SELECT monthenddate
    FROM ms_public.available_dates_mv
    ORDER BY display_order ASC
  `);
  return result.rows.map((row) => row.monthenddate);
};

const queryPublicSnapshotMeta = async (snapshotName) => {
  const result = await pool.query(
    `
      SELECT snapshot_name, published_at, source
      FROM ms_public.snapshot_meta
      WHERE snapshot_name = $1
      LIMIT 1
    `,
    [snapshotName],
  );
  return result.rows[0] || null;
};

module.exports = {
  queryPublicDashboardStats,
  queryPublicTopPerformers,
  queryPublicLargestFlows,
  queryPublicHighestRated,
  queryPublicAvailableDates,
  queryPublicSnapshotMeta,
};
