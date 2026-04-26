const { pool } = require('../config/db');

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const sum = (values) =>
  values.reduce((total, value) => {
    const numeric = toNumber(value);
    return numeric === null ? total : total + numeric;
  }, 0);

const sumDistinct = (values) =>
  sum([...new Set(values.map(toNumber).filter((value) => value !== null))]);

const average = (values) => {
  const numericValues = values.map(toNumber).filter((value) => value !== null);
  if (numericValues.length === 0) return null;
  return sum(numericValues) / numericValues.length;
};

const median = (values) => {
  const numericValues = values
    .map(toNumber)
    .filter((value) => value !== null)
    .sort((left, right) => left - right);
  if (numericValues.length === 0) return null;
  const middle = Math.floor(numericValues.length / 2);
  if (numericValues.length % 2) return numericValues[middle];
  return (numericValues[middle - 1] + numericValues[middle]) / 2;
};

const round = (value, digits = 2) => {
  const numeric = toNumber(value);
  if (numeric === null) return null;
  const factor = 10 ** digits;
  return Math.round(numeric * factor) / factor;
};

const excessReturn = (row, fundKey, categoryKey) => {
  const fundReturn = toNumber(row[fundKey]);
  const categoryReturn = toNumber(row[categoryKey]);
  return fundReturn === null || categoryReturn === null ? null : fundReturn - categoryReturn;
};

const queryAllAssetManagers = async () => {
  const result = await pool.query(
    `
      SELECT DISTINCT TRIM(brandingname) AS brandingname
      FROM ms.mv_fund_share_class_basic_info_ca_openend_latest
      WHERE brandingname IS NOT NULL
        AND TRIM(brandingname) <> ''
      ORDER BY brandingname ASC
    `,
  );

  return result.rows.map((row) => row.brandingname);
};

const queryAssetManagerRows = async (assetManager, asofDate) => {
  const params = [assetManager, asofDate || null];
  const result = await pool.query(
    `
      WITH target_date AS (
        SELECT COALESCE(
          $2::DATE,
          (
            SELECT MAX(monthenddate::DATE)
            FROM ms.month_end_trailing_total_returns_ca_openend
            WHERE monthenddate IS NOT NULL
          )
        ) AS asof_date
      ),
      funds AS (
        SELECT f.*
        FROM target_date td
        CROSS JOIN LATERAL ms.fn_get_screener_at_date(
          NULL::TEXT,
          NULL::TEXT,
          td.asof_date,
          $1
        ) f
      )
      SELECT
        f.*,
        td.asof_date::TEXT AS asof_date,
        cat.return1yr::NUMERIC AS cat_return1yr,
        cat.return3yr::NUMERIC AS cat_return3yr,
        cat.return5yr::NUMERIC AS cat_return5yr
      FROM target_date td
      JOIN funds f ON TRUE
      LEFT JOIN ms.category_monthly_nav_trailing_performance_returns cat
        ON cat.categorycode = f.categorycode
        AND cat.dayenddate = td.asof_date
      ORDER BY f.fundnetassets DESC NULLS LAST, f.fundname ASC
    `,
    params,
  );

  return result.rows;
};

const buildLeader = (row) => ({
  _id: row._id,
  fundname: row.fundname,
  ticker: row.ticker,
  categoryname: row.categoryname,
  securitytype: row.securitytype,
  brandingname: row.brandingname,
  return1yr: round(row.return1yr),
  return3yr: round(row.return3yr),
  return5yr: round(row.return5yr),
  categoryReturn1yr: round(row.cat_return1yr),
  excessReturn1yr: round(excessReturn(row, 'return1yr', 'cat_return1yr')),
  rank1yr: round(row.rank1yr),
  fundnetassets: round(row.fundnetassets, 0),
  flow1m: round(row.estfundlevelnetflow1momoend, 0),
  flowYtd: round(row.estfundlevelnetflowytdmoend, 0),
  flow1yr: round(row.estfundlevelnetflow1yrmoend, 0),
});

const topBy = (rows, selector, direction = 'desc', limit = 8) =>
  rows
    .filter((row) => toNumber(selector(row)) !== null)
    .sort((left, right) => {
      const diff = toNumber(selector(left)) - toNumber(selector(right));
      return direction === 'asc' ? diff : -diff;
    })
    .slice(0, limit)
    .map(buildLeader);

const queryAssetManagerOverview = async (assetManager, asofDate) => {
  const rows = await queryAssetManagerRows(assetManager, asofDate);
  const asof = rows[0]?.asof_date || asofDate || null;
  const totalAum = sumDistinct(rows.map((row) => row.fundnetassets));
  const categoryGroups = new Map();

  rows.forEach((row) => {
    const key = row.categorycode || row.categoryname || 'Uncategorized';
    if (!categoryGroups.has(key)) {
      categoryGroups.set(key, []);
    }
    categoryGroups.get(key).push(row);
  });

  const categories = [...categoryGroups.values()]
    .map((groupRows) => {
      const first = groupRows[0] || {};
      const categoryAum = sumDistinct(groupRows.map((row) => row.fundnetassets));
      const topQuartileCount = groupRows.filter((row) => {
        const rank = toNumber(row.rank1yr);
        return rank !== null && rank <= 25;
      }).length;

      return {
        categorycode: first.categorycode || null,
        categoryname: first.categoryname || 'Uncategorized',
        fundCount: groupRows.length,
        totalAum: round(categoryAum, 0),
        aumShare: totalAum > 0 ? round((categoryAum / totalAum) * 100, 1) : null,
        avgReturn1yr: round(average(groupRows.map((row) => row.return1yr))),
        avgReturn3yr: round(average(groupRows.map((row) => row.return3yr))),
        avgReturn5yr: round(average(groupRows.map((row) => row.return5yr))),
        categoryReturn1yr: round(average(groupRows.map((row) => row.cat_return1yr))),
        excessReturn1yr: round(
          average(groupRows.map((row) => excessReturn(row, 'return1yr', 'cat_return1yr'))),
        ),
        excessReturn3yr: round(
          average(groupRows.map((row) => excessReturn(row, 'return3yr', 'cat_return3yr'))),
        ),
        excessReturn5yr: round(
          average(groupRows.map((row) => excessReturn(row, 'return5yr', 'cat_return5yr'))),
        ),
        avgMer: round(average(groupRows.map((row) => row.mer))),
        avgRating: round(average(groupRows.map((row) => row.ratingoverall)), 1),
        avgRank1yr: round(average(groupRows.map((row) => row.rank1yr))),
        topQuartileCount,
        topQuartileShare: groupRows.length
          ? round((topQuartileCount / groupRows.length) * 100, 1)
          : null,
        flow1m: round(sumDistinct(groupRows.map((row) => row.estfundlevelnetflow1momoend)), 0),
        flowYtd: round(sumDistinct(groupRows.map((row) => row.estfundlevelnetflowytdmoend)), 0),
        flow1yr: round(sumDistinct(groupRows.map((row) => row.estfundlevelnetflow1yrmoend)), 0),
      };
    })
    .sort(
      (left, right) =>
        right.totalAum - left.totalAum || left.categoryname.localeCompare(right.categoryname),
    );

  const topQuartileCount = rows.filter((row) => {
    const rank = toNumber(row.rank1yr);
    return rank !== null && rank <= 25;
  }).length;

  const overview = {
    assetManager,
    asofDate: asof,
    totals: {
      fundCount: rows.length,
      categoryCount: categories.length,
      totalAum: round(totalAum, 0),
      avgMer: round(average(rows.map((row) => row.mer))),
      medianMer: round(median(rows.map((row) => row.mer))),
      avgReturn1yr: round(average(rows.map((row) => row.return1yr))),
      avgReturn3yr: round(average(rows.map((row) => row.return3yr))),
      avgReturn5yr: round(average(rows.map((row) => row.return5yr))),
      avgRating: round(average(rows.map((row) => row.ratingoverall)), 1),
      flow1m: round(sumDistinct(rows.map((row) => row.estfundlevelnetflow1momoend)), 0),
      flowYtd: round(sumDistinct(rows.map((row) => row.estfundlevelnetflowytdmoend)), 0),
      flow1yr: round(sumDistinct(rows.map((row) => row.estfundlevelnetflow1yrmoend)), 0),
    },
    relativeQuality: {
      avgExcessReturn1yr: round(
        average(rows.map((row) => excessReturn(row, 'return1yr', 'cat_return1yr'))),
      ),
      avgExcessReturn3yr: round(
        average(rows.map((row) => excessReturn(row, 'return3yr', 'cat_return3yr'))),
      ),
      avgExcessReturn5yr: round(
        average(rows.map((row) => excessReturn(row, 'return5yr', 'cat_return5yr'))),
      ),
      avgRank1yr: round(average(rows.map((row) => row.rank1yr))),
      topQuartileCount,
      topQuartileShare: rows.length ? round((topQuartileCount / rows.length) * 100, 1) : null,
    },
    categories,
    leaders: {
      bestOutperformers: topBy(
        rows,
        (row) => excessReturn(row, 'return1yr', 'cat_return1yr'),
        'desc',
      ),
      bestRanked: topBy(rows, (row) => row.rank1yr, 'asc'),
      largestFunds: topBy(rows, (row) => row.fundnetassets, 'desc'),
      largestInflows: topBy(rows, (row) => row.estfundlevelnetflow1momoend, 'desc'),
      largestOutflows: topBy(rows, (row) => row.estfundlevelnetflow1momoend, 'asc'),
      strongestCategories: [...categories]
        .filter((category) => category.excessReturn1yr !== null)
        .sort((left, right) => right.excessReturn1yr - left.excessReturn1yr)
        .slice(0, 8),
    },
  };

  return overview;
};

module.exports = {
  queryAllAssetManagers,
  queryAssetManagerOverview,
};
