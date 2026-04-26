const { pool } = require('../config/db');

const queryDashboardStats = async (asofDate) => {
  const dateClause = asofDate
    ? `AND s.monthenddate = $1::TEXT`
    : `AND s.monthenddate = (
        SELECT MAX(monthenddate) FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate] : [];

  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM ms.mv_fund_share_class_basic_info_ca_openend_latest) AS total_funds,
       (
         SELECT ROUND(SUM(DISTINCT latest_assets.fundnetassets)::NUMERIC, 0)
         FROM (
           SELECT DISTINCT ON (a._id)
             a._id,
             a.fundnetassets::NUMERIC AS fundnetassets
           FROM ms.fund_level_net_assets_ca_openend a
           WHERE a.fundnetassets IS NOT NULL
             ${asofDate ? 'AND a.netassetsdate <= $1::TEXT' : ''}
           ORDER BY a._id, a.netassetsdate DESC NULLS LAST
         ) latest_assets
       ) AS total_aum,
       ROUND(AVG(s.return1yr::NUMERIC), 2) AS avg_return_1yr,
       ROUND(AVG(f.mer::NUMERIC), 2) AS avg_mer,
       ROUND(AVG(r.ratingoverall::NUMERIC), 1) AS avg_rating,
       MAX(s.monthenddate) AS latest_date
     FROM ms.month_end_trailing_total_returns_ca_openend s
     LEFT JOIN ms.annual_report_fees_ca_openend f
       ON f._id = s._id AND f._timestampto IS NULL
     LEFT JOIN ms.morningstar_rating_ca_openend r
       ON r._id = s._id
       AND r.monthenddate = s.monthenddate
     WHERE s.return1yr IS NOT NULL
       ${dateClause}`,
    params,
  );
  return result.rows[0];
};

const queryTopPerformers = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND p.monthenddate = $1::TEXT`
    : `AND p.monthenddate = (
        SELECT MAX(monthenddate) FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `SELECT
       p._id,
       b.fundname,
       b.ticker,
       b.categoryname,
       b.securitytype,
       p.return1yr::NUMERIC,
       p.return3yr::NUMERIC,
       p.return5yr::NUMERIC,
       r.ratingoverall::NUMERIC
     FROM ms.month_end_trailing_total_returns_ca_openend p
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = p._id
     LEFT JOIN ms.morningstar_rating_ca_openend r
       ON r._id = p._id AND r.monthenddate = p.monthenddate
     WHERE p.return1yr IS NOT NULL
       ${dateClause}
     ORDER BY p.return1yr::NUMERIC DESC NULLS LAST
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
};

const queryBottomPerformers = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND p.monthenddate = $1::TEXT`
    : `AND p.monthenddate = (
        SELECT MAX(monthenddate) FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `SELECT
       p._id,
       b.fundname,
       b.ticker,
       b.categoryname,
       b.securitytype,
       p.return1yr::NUMERIC,
       p.return3yr::NUMERIC,
       p.return5yr::NUMERIC,
       r.ratingoverall::NUMERIC
     FROM ms.month_end_trailing_total_returns_ca_openend p
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = p._id
     LEFT JOIN ms.morningstar_rating_ca_openend r
       ON r._id = p._id AND r.monthenddate = p.monthenddate
     WHERE p.return1yr IS NOT NULL
       ${dateClause}
     ORDER BY p.return1yr::NUMERIC ASC NULLS LAST
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
};

const queryTopCategories = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND c.dayenddate = $1::DATE`
    : `AND c.dayenddate = (
        SELECT MAX(dayenddate) FROM ms.category_monthly_nav_trailing_performance_returns
        WHERE dayenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `WITH category_fund_counts AS (
       SELECT
         categorycode,
         COUNT(DISTINCT _id) AS fund_count
       FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
       WHERE categorycode IS NOT NULL
       GROUP BY categorycode
     )
     SELECT
       c.categorycode,
       c.categoryname,
       c.dayenddate::TEXT AS dayenddate,
       c.return1yr::NUMERIC AS return1yr,
       c.return3yr::NUMERIC AS return3yr,
       c.returnytd::NUMERIC AS returnytd,
       COALESCE(f.fund_count, 0) AS fund_count
     FROM ms.category_monthly_nav_trailing_performance_returns c
     LEFT JOIN category_fund_counts f ON f.categorycode = c.categorycode
     WHERE c.return1yr IS NOT NULL
       ${dateClause}
     ORDER BY c.return1yr::NUMERIC DESC NULLS LAST, COALESCE(f.fund_count, 0) DESC, c.categoryname ASC
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
};

const queryBottomCategories = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND c.dayenddate = $1::DATE`
    : `AND c.dayenddate = (
        SELECT MAX(dayenddate) FROM ms.category_monthly_nav_trailing_performance_returns
        WHERE dayenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `WITH category_fund_counts AS (
       SELECT
         categorycode,
         COUNT(DISTINCT _id) AS fund_count
       FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
       WHERE categorycode IS NOT NULL
       GROUP BY categorycode
     )
     SELECT
       c.categorycode,
       c.categoryname,
       c.dayenddate::TEXT AS dayenddate,
       c.return1yr::NUMERIC AS return1yr,
       c.return3yr::NUMERIC AS return3yr,
       c.returnytd::NUMERIC AS returnytd,
       COALESCE(f.fund_count, 0) AS fund_count
     FROM ms.category_monthly_nav_trailing_performance_returns c
     LEFT JOIN category_fund_counts f ON f.categorycode = c.categorycode
     WHERE c.return1yr IS NOT NULL
       ${dateClause}
     ORDER BY c.return1yr::NUMERIC ASC NULLS LAST, COALESCE(f.fund_count, 0) DESC, c.categoryname ASC
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
};

const queryLargestFlows = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND f.estfundlevelnetflowdatemoend = $1::TEXT`
    : `AND f.estfundlevelnetflowdatemoend = (
        SELECT MAX(estfundlevelnetflowdatemoend) FROM ms.fund_flow_details_ca_openend
        WHERE estfundlevelnetflowdatemoend IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `(SELECT
       f._id,
       b.fundname,
       b.ticker,
       b.categoryname,
       f.estfundlevelnetflow1momoend::NUMERIC AS flow_1m,
       f.estfundlevelnetflow1yrmoend::NUMERIC AS flow_1yr,
       'inflow' AS direction
     FROM ms.fund_flow_details_ca_openend f
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = f._id
     WHERE f.estfundlevelnetflow1momoend IS NOT NULL
       ${dateClause}
     ORDER BY f.estfundlevelnetflow1momoend::NUMERIC DESC NULLS LAST
     LIMIT ${limitParam})
    UNION ALL
    (SELECT
       f._id,
       b.fundname,
       b.ticker,
       b.categoryname,
       f.estfundlevelnetflow1momoend::NUMERIC AS flow_1m,
       f.estfundlevelnetflow1yrmoend::NUMERIC AS flow_1yr,
       'outflow' AS direction
     FROM ms.fund_flow_details_ca_openend f
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = f._id
     WHERE f.estfundlevelnetflow1momoend IS NOT NULL
       ${dateClause}
     ORDER BY f.estfundlevelnetflow1momoend::NUMERIC ASC NULLS LAST
     LIMIT ${limitParam})`,
    params,
  );
  return result.rows;
};

const queryLargestFlowCategories = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND f.estfundlevelnetflowdatemoend = $1::TEXT`
    : `AND f.estfundlevelnetflowdatemoend = (
        SELECT MAX(estfundlevelnetflowdatemoend) FROM ms.fund_flow_details_ca_openend
        WHERE estfundlevelnetflowdatemoend IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `WITH category_flows AS (
       SELECT
         b.categoryname,
         COUNT(DISTINCT f._id) AS fund_count,
         SUM(DISTINCT f.estfundlevelnetflow1momoend::NUMERIC) AS flow_1m,
         SUM(DISTINCT f.estfundlevelnetflow1yrmoend::NUMERIC) AS flow_1yr
       FROM ms.fund_flow_details_ca_openend f
       JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = f._id
       WHERE f.estfundlevelnetflow1momoend IS NOT NULL
         AND b.categoryname IS NOT NULL
         ${dateClause}
       GROUP BY b.categoryname
     )
     (SELECT
        categoryname,
        fund_count,
        flow_1m,
        flow_1yr,
        'inflow' AS direction
      FROM category_flows
      WHERE flow_1m > 0
      ORDER BY flow_1m DESC, fund_count DESC, categoryname ASC
      LIMIT ${limitParam})
     UNION ALL
     (SELECT
        categoryname,
        fund_count,
        flow_1m,
        flow_1yr,
        'outflow' AS direction
      FROM category_flows
      WHERE flow_1m < 0
      ORDER BY flow_1m ASC, fund_count DESC, categoryname ASC
      LIMIT ${limitParam})`,
    params,
  );
  return result.rows;
};

const queryHighestRated = async (asofDate, limit = 10) => {
  const dateClause = asofDate
    ? `AND r.monthenddate = $1::TEXT`
    : `AND r.monthenddate = (
        SELECT MAX(monthenddate) FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL
      )`;
  const params = asofDate ? [asofDate, limit] : [limit];
  const limitParam = asofDate ? '$2' : '$1';

  const result = await pool.query(
    `SELECT
       r._id,
       b.fundname,
       b.ticker,
       b.categoryname,
       b.securitytype,
       r.ratingoverall::NUMERIC,
       r.rating3year::NUMERIC,
       r.rating5year::NUMERIC,
       p.return1yr::NUMERIC,
       p.return3yr::NUMERIC
     FROM ms.morningstar_rating_ca_openend r
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = r._id
     LEFT JOIN ms.month_end_trailing_total_returns_ca_openend p
       ON p._id = r._id
       AND p.monthenddate = r.monthenddate
     WHERE r.ratingoverall IS NOT NULL
       AND r.ratingoverall::NUMERIC >= 4
       ${dateClause}
     ORDER BY r.ratingoverall::NUMERIC DESC, p.return1yr::NUMERIC DESC NULLS LAST
     LIMIT ${limitParam}`,
    params,
  );
  return result.rows;
};

const queryCategoryOverview = async (category, asofDate) => {
  const dateClause = asofDate
    ? `AND p.monthenddate = $2::TEXT`
    : `AND p.monthenddate = (
        SELECT MAX(monthenddate) FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE monthenddate IS NOT NULL
      )`;
  const params = asofDate ? [category, asofDate] : [category];

  const result = await pool.query(
    `SELECT
       COUNT(DISTINCT p._id) AS fund_count,
       ROUND(AVG(p.return1yr::NUMERIC), 2) AS avg_return_1yr,
       ROUND(AVG(p.return3yr::NUMERIC), 2) AS avg_return_3yr,
       ROUND(AVG(p.return5yr::NUMERIC), 2) AS avg_return_5yr,
       ROUND(MIN(p.return1yr::NUMERIC), 2) AS min_return_1yr,
       ROUND(MAX(p.return1yr::NUMERIC), 2) AS max_return_1yr,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.return1yr::NUMERIC), 2) AS median_return_1yr,
       ROUND(AVG(f.mer::NUMERIC), 2) AS avg_mer,
       ROUND(MIN(f.mer::NUMERIC), 2) AS min_mer,
       ROUND(MAX(f.mer::NUMERIC), 2) AS max_mer,
       ROUND(AVG(r.ratingoverall::NUMERIC), 1) AS avg_rating,
       ROUND(AVG(a.fundnetassets::NUMERIC), 0) AS avg_aum
     FROM ms.month_end_trailing_total_returns_ca_openend p
     JOIN ms.mv_fund_share_class_basic_info_ca_openend_latest b ON b._id = p._id
     LEFT JOIN ms.annual_report_fees_ca_openend f ON f._id = p._id AND f._timestampto IS NULL
     LEFT JOIN ms.morningstar_rating_ca_openend r
       ON r._id = p._id AND r.monthenddate = p.monthenddate
     LEFT JOIN ms.fund_level_net_assets_ca_openend a
       ON a._id = p._id
       AND a.netassetsdate = (
         SELECT MAX(netassetsdate) FROM ms.fund_level_net_assets_ca_openend
         WHERE _id = p._id AND netassetsdate IS NOT NULL
       )
     WHERE b.categoryname = $1
       ${dateClause}`,
    params,
  );
  return result.rows[0];
};

module.exports = {
  queryDashboardStats,
  queryTopPerformers,
  queryBottomPerformers,
  queryTopCategories,
  queryBottomCategories,
  queryLargestFlows,
  queryLargestFlowCategories,
  queryHighestRated,
  queryCategoryOverview,
};
