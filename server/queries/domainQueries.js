const { pool } = require('../config/db');

const DOMAIN_FUNCTIONS = {
  basicInfo:    'ms.fn_get_basic_info_at_date',
  performance:  'ms.fn_get_performance_at_date',
  rankings:     'ms.fn_get_rankings_at_date',
  fees:         'ms.fn_get_all_fees_at_date',
  ratings:      'ms.fn_get_ratings_at_date',
  risk:         'ms.fn_get_all_risk_at_date',
  flows:        'ms.fn_get_flows_at_date',
  assets:       'ms.fn_get_assets_at_date',
};

const queryLatestMonthEndDate = async () => {
  // Diagnostic: check if the table is reachable and has data
  const countResult = await pool.query(
    `SELECT COUNT(*) AS cnt FROM ms.month_end_trailing_total_returns_ca_openend`
  );
  const totalRows = countResult.rows[0]?.cnt;
  console.log('[queryLatestMonthEndDate] total rows in table:', totalRows);

  if (Number(totalRows) === 0) {
    console.log('[queryLatestMonthEndDate] table is empty');
    return null;
  }

  // Sample a few distinct monthenddate values so we can see what exists
  const sampleResult = await pool.query(`
    SELECT DISTINCT monthenddate
    FROM ms.month_end_trailing_total_returns_ca_openend
    WHERE monthenddate IS NOT NULL
    ORDER BY monthenddate DESC
    LIMIT 5
  `);
  console.log('[queryLatestMonthEndDate] latest dates:', sampleResult.rows.map(r => r.monthenddate));

  return sampleResult.rows[0]?.monthenddate || null;
};

const queryDomain = async (domainKey, fundIds, asofDate) => {
  const fn = DOMAIN_FUNCTIONS[domainKey];
  if (!fn) {
    throw new Error(`Unknown domain: ${domainKey}`);
  }
  const result = await pool.query(`SELECT * FROM ${fn}($1, $2)`, [fundIds, asofDate]);
  return result.rows;
};

const queryMultipleDomains = async (domainKeys, fundIds, asofDate) => {
  const promises = domainKeys.map(key => queryDomain(key, fundIds, asofDate));
  const results = await Promise.all(promises);

  const domainRows = {};
  domainKeys.forEach((key, i) => {
    domainRows[key] = results[i];
  });
  return domainRows;
};

const queryAvailableMonthEndDates = async () => {
  const result = await pool.query(`
    SELECT DISTINCT monthenddate
    FROM ms.month_end_trailing_total_returns_ca_openend
    WHERE monthenddate IS NOT NULL
    ORDER BY monthenddate DESC
  `);
  return result.rows.map(r => r.monthenddate);
};

module.exports = {
  DOMAIN_FUNCTIONS,
  queryLatestMonthEndDate,
  queryAvailableMonthEndDates,
  queryDomain,
  queryMultipleDomains,
};
