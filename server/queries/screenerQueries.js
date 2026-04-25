const { pool } = require('../config/db');
const { ALL_SCREENER_SORT_KEYS } = require('../constants/screenerOutputColumns');

const SORTABLE_COLUMNS = Object.fromEntries(ALL_SCREENER_SORT_KEYS.map((k) => [k, k]));

/**
 * Server-side sorted & paginated screener query.
 *
 * Wraps the fn_get_screener_at_date() set-returning function with
 * ORDER BY / LIMIT / OFFSET and uses COUNT(*) OVER() to return
 * the unfiltered total in a single round-trip.
 */
const queryScreener = async ({
  search,
  category,
  assetManager,
  type,
  asofDate,
  sortBy,
  sortDir,
  limit,
  offset,
}) => {
  const args = [];
  const params = [];
  let idx = 1;

  if (category) {
    args.push(`p_category := $${idx}`);
    params.push(category);
    idx++;
  }
  if (assetManager) {
    args.push(`p_asset_manager := $${idx}`);
    params.push(assetManager);
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

  const fnCall =
    args.length > 0
      ? `ms.fn_get_screener_at_date(${args.join(', ')})`
      : `ms.fn_get_screener_at_date()`;

  const sortColumn = SORTABLE_COLUMNS[sortBy] || 'return1yr';
  const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
  const nullsOrder = 'NULLS LAST';

  let whereClause = '';
  if (search) {
    whereClause = `
      WHERE (
        fundname ILIKE $${idx}
        OR ticker ILIKE $${idx}
        OR _id ILIKE $${idx}
      )
    `;
    params.push(`%${search}%`);
    idx++;
  }

  const limitParam = `$${idx}`;
  const offsetParam = `$${idx + 1}`;
  params.push(limit, offset);

  const queryText = `
    SELECT *, COUNT(*) OVER() AS _total_count
    FROM ${fnCall}
    ${whereClause}
    ORDER BY ${sortColumn} ${direction} ${nullsOrder}, _id ASC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(queryText, params);
  const total = result.rows.length > 0 ? parseInt(result.rows[0]._total_count) : 0;
  const rows = result.rows.map(({ _total_count, ...rest }) => rest);

  return { rows, total };
};

module.exports = { queryScreener, SORTABLE_COLUMNS };
