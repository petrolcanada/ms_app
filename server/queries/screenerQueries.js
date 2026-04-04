const { pool } = require('../config/db');

/**
 * Single-query screener: joins basic-info, performance, fees, risk,
 * ratings, and assets into one lean result set.
 * The SQL function auto-discovers the latest monthenddate when asofDate is NULL.
 *
 * Builds the function call dynamically to work around PostgreSQL's inability
 * to infer types for NULL parameters in function calls with DEFAULT args.
 */
const queryScreener = async ({ category, type, asofDate }) => {
  const args = [];
  const params = [];
  let idx = 1;

  if (category) {
    args.push(`p_category := $${idx}`);
    params.push(category);
    idx++;
  }
  if (type) {
    args.push(`p_type := $${idx}`);
    params.push(type);
    idx++;
  }
  if (asofDate) {
    args.push(`p_asof_date := $${idx}::DATE`);
    params.push(asofDate);
    idx++;
  }

  const call = args.length > 0
    ? `SELECT * FROM ms.fn_get_screener_at_date(${args.join(', ')})`
    : `SELECT * FROM ms.fn_get_screener_at_date()`;

  const result = await pool.query(call, params);
  return result.rows;
};

module.exports = { queryScreener };
