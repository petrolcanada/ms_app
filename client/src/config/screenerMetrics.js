/**
 * Screener metric registry + row shaping.
 * Keep key lists in sync with server/constants/screenerOutputColumns.js
 * and server/db/sql/functions/09_screener_at_date.sql.
 */

const RANK_PERCENTILE_SORT_KEYS = [
  'rankytd',
  'rank1mth',
  'rank2mth',
  'rank3mth',
  'rank6mth',
  'rank9mth',
  'rank1yr',
  'rank2yr',
  'rank3yr',
  'rank4yr',
  'rank5yr',
  'rank6yr',
  'rank7yr',
  'rank8yr',
  'rank9yr',
  'rank10yr',
  'rank15yr',
  'rank20yr',
];

const PERF_TRAILING_SORT_KEYS = [
  'return1mth',
  'return2mth',
  'return3mth',
  'return6mth',
  'return9mth',
  'return1yr',
  'return2yr',
  'return3yr',
  'return4yr',
  'return5yr',
  'return6yr',
  'return7yr',
  'return8yr',
  'return9yr',
  'return10yr',
  'return15yr',
  'return20yr',
  'returnytd',
  'returnsinceinception',
];

const PERF_CUMULATIVE_SORT_KEYS = [
  'cumulativereturn2yr',
  'cumulativereturn3yr',
  'cumulativereturn4yr',
  'cumulativereturn5yr',
  'cumulativereturn6yr',
  'cumulativereturn7yr',
  'cumulativereturn8yr',
  'cumulativereturn9yr',
  'cumulativereturn10yr',
  'cumulativereturn15yr',
  'cumulativereturn20yr',
  'cumulativereturnsinceinception',
];

const FEE_SORT_KEYS = [
  'mer',
  'interimnetexpenseratio',
  'tradingexpenseratio',
  'prospectusnetexpenseratio',
  'prospectusgrossexpenseratio',
  'prospectusmgmtfee',
];

const RISK_ABS_SORT_KEYS = [
  'stddev1yr',
  'stddev3yr',
  'stddev5yr',
  'stddev10yr',
  'stddev15yr',
  'stddev20yr',
  'maxdrawdown1yr',
  'maxdrawdown3yr',
  'maxdrawdown5yr',
  'maxdrawdown10yr',
  'skewness1yr',
  'skewness3yr',
  'skewness5yr',
  'kurtosis1yr',
  'kurtosis3yr',
  'kurtosis5yr',
  'sharperatio1yr',
  'sharperatio3yr',
  'sharperatio5yr',
  'sharperatio10yr',
];

const RISK_REL_SORT_KEYS = [
  'alpha1yr',
  'alpha3yr',
  'alpha5yr',
  'alpha10yr',
  'alpha15yr',
  'alpha20yr',
  'beta1yr',
  'beta3yr',
  'beta5yr',
  'beta10yr',
  'beta15yr',
  'beta20yr',
  'rsquared1yr',
  'rsquared3yr',
  'rsquared5yr',
  'rsquared10yr',
  'captureratioupside1yr',
  'captureratioupside3yr',
  'captureratioupside5yr',
  'captureratioupside10yr',
  'captureratiodownside1yr',
  'captureratiodownside3yr',
  'captureratiodownside5yr',
  'captureratiodownside10yr',
  'informationratio1yr',
  'informationratio3yr',
  'informationratio5yr',
  'informationratio10yr',
];

const RATING_SORT_KEYS = [
  'rating3year',
  'rating5year',
  'rating10year',
  'ratingoverall',
  'riskadjustedreturn3yr',
  'riskadjustedreturn5yr',
  'riskadjustedreturn10yr',
  'riskadjustedreturnoverall',
  'performancescore3yr',
  'performancescore5yr',
  'performancescore10yr',
  'performancescoreoverall',
  'riskscore3yr',
  'riskscore5yr',
  'riskscore10yr',
  'riskscoreoverall',
  'numberoffunds3year',
  'numberoffunds5year',
  'numberoffunds10year',
  'numberoffundsoverall',
  'perfcatrank3year',
  'perfcatrank5year',
  'perfcatrank10year',
  'riskcatrank3year',
  'riskcatrank5year',
  'riskcatrank10year',
  'ratingcatrank3year',
  'ratingcatrank5year',
  'ratingcatrank10year',
];

const FLOW_SORT_KEYS = [
  'estfundlevelnetflow1momoend',
  'estfundlevelnetflow3momoend',
  'estfundlevelnetflow6momoend',
  'estfundlevelnetflow1yrmoend',
  'estfundlevelnetflow3yrmoend',
  'estfundlevelnetflow5yrmoend',
  'estfundlevelnetflow10yrmoend',
  'estfundlevelnetflow15yrmoend',
  'estfundlevelnetflowytdmoend',
];

const pick = (row, keys) => Object.fromEntries(keys.map((k) => [k, row[k]]));

export function mapScreenerRow(row) {
  return {
    _id: row._id,
    fundname: row.fundname,
    ticker: row.ticker,
    categoryname: row.categoryname,
    securitytype: row.securitytype,
    metrics: row,
    performance: {
      ...pick(row, PERF_TRAILING_SORT_KEYS),
      ...pick(row, PERF_CUMULATIVE_SORT_KEYS),
    },
    rankings: pick(row, RANK_PERCENTILE_SORT_KEYS),
    fees: pick(row, FEE_SORT_KEYS),
    risk: {
      ...pick(row, RISK_ABS_SORT_KEYS),
      ...pick(row, RISK_REL_SORT_KEYS),
    },
    ratings: pick(row, RATING_SORT_KEYS),
    flows: pick(row, FLOW_SORT_KEYS),
    assets: { fundnetassets: row.fundnetassets },
  };
}

const HORIZON = {
  return1mth: '1M',
  return2mth: '2M',
  return3mth: '3M',
  return6mth: '6M',
  return9mth: '9M',
  return1yr: '1Y',
  return2yr: '2Y',
  return3yr: '3Y',
  return4yr: '4Y',
  return5yr: '5Y',
  return6yr: '6Y',
  return7yr: '7Y',
  return8yr: '8Y',
  return9yr: '9Y',
  return10yr: '10Y',
  return15yr: '15Y',
  return20yr: '20Y',
  returnytd: 'YTD',
  returnsinceinception: 'Since incept.',
};

const CUM_HORIZON = {
  cumulativereturn2yr: '2Y tot.',
  cumulativereturn3yr: '3Y tot.',
  cumulativereturn4yr: '4Y tot.',
  cumulativereturn5yr: '5Y tot.',
  cumulativereturn6yr: '6Y tot.',
  cumulativereturn7yr: '7Y tot.',
  cumulativereturn8yr: '8Y tot.',
  cumulativereturn9yr: '9Y tot.',
  cumulativereturn10yr: '10Y tot.',
  cumulativereturn15yr: '15Y tot.',
  cumulativereturn20yr: '20Y tot.',
  cumulativereturnsinceinception: 'Since incept. tot.',
};

const FLOW_HORIZON = {
  estfundlevelnetflow1momoend: '1M',
  estfundlevelnetflow3momoend: '3M',
  estfundlevelnetflow6momoend: '6M',
  estfundlevelnetflow1yrmoend: '1Y',
  estfundlevelnetflow3yrmoend: '3Y',
  estfundlevelnetflow5yrmoend: '5Y',
  estfundlevelnetflow10yrmoend: '10Y',
  estfundlevelnetflow15yrmoend: '15Y',
  estfundlevelnetflowytdmoend: 'YTD',
};

const CATEGORY_RANK_PERCENTILE_COLUMNS = [
  ['rankytd', 'YTD'],
  ['rank1mth', '1M'],
  ['rank2mth', '2M'],
  ['rank3mth', '3M'],
  ['rank6mth', '6M'],
  ['rank9mth', '9M'],
  ['rank1yr', '1Y'],
  ['rank2yr', '2Y'],
  ['rank3yr', '3Y'],
  ['rank4yr', '4Y'],
  ['rank5yr', '5Y'],
  ['rank6yr', '6Y'],
  ['rank7yr', '7Y'],
  ['rank8yr', '8Y'],
  ['rank9yr', '9Y'],
  ['rank10yr', '10Y'],
  ['rank15yr', '15Y'],
  ['rank20yr', '20Y'],
].map(([key, horizon]) => ({
  key,
  group: 'Category ranks',
  label: `Rank % (${horizon})`,
  rankLabel: `Category rank % (${horizon}, low better)`,
  apiField: key,
  valuePath: `rankings.${key}`,
  type: 'heat',
  higherIsBetter: false,
  format: 'rankpct',
}));

const perfTrailingCols = PERF_TRAILING_SORT_KEYS.map((key) => ({
  key,
  group: 'Performance (trailing)',
  label: `Return (${HORIZON[key]})`,
  rankLabel: `Trailing return (${HORIZON[key]})`,
  apiField: key,
  valuePath: `performance.${key}`,
  type: 'heat',
  higherIsBetter: true,
  format: 'return',
}));

const perfCumCols = PERF_CUMULATIVE_SORT_KEYS.map((key) => ({
  key,
  group: 'Performance (cumulative)',
  label: `Cum. (${CUM_HORIZON[key]})`,
  rankLabel: `Cumulative total return (${CUM_HORIZON[key]})`,
  apiField: key,
  valuePath: `performance.${key}`,
  type: 'heat',
  higherIsBetter: true,
  format: 'return',
}));

const feeCols = [
  { key: 'mer', label: 'MER', rankLabel: 'MER (low better)', type: 'mer', format: 'pct' },
  {
    key: 'interimnetexpenseratio',
    label: 'Interim net exp.',
    rankLabel: 'Interim net expense ratio',
  },
  { key: 'tradingexpenseratio', label: 'Trading exp.', rankLabel: 'Trading expense ratio' },
  {
    key: 'prospectusnetexpenseratio',
    label: 'Prospectus net exp.',
    rankLabel: 'Prospectus net expense ratio',
  },
  {
    key: 'prospectusgrossexpenseratio',
    label: 'Prospectus gross exp.',
    rankLabel: 'Prospectus gross expense ratio',
  },
  {
    key: 'prospectusmgmtfee',
    label: 'Prospectus mgmt fee',
    rankLabel: 'Prospectus management fee',
  },
].map((f) => ({
  ...f,
  group: 'Fees',
  apiField: f.key,
  valuePath: `fees.${f.key}`,
  type: f.type || 'numeric',
  higherIsBetter: false,
  format: f.format || 'pct',
}));

const riskAbsStdCols = [
  'stddev1yr',
  'stddev3yr',
  'stddev5yr',
  'stddev10yr',
  'stddev15yr',
  'stddev20yr',
].map((key) => {
  const h = key.replace('stddev', '').replace('yr', 'Y');
  return {
    key,
    group: 'Risk (volatility)',
    label: `Std dev (${h})`,
    rankLabel: `Std dev (${h}, low better)`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: false,
    format: 'pct',
  };
});

const riskAbsDdCols = ['maxdrawdown1yr', 'maxdrawdown3yr', 'maxdrawdown5yr', 'maxdrawdown10yr'].map(
  (key) => {
    const h = key.replace('maxdrawdown', '').replace('yr', 'Y');
    return {
      key,
      group: 'Risk (drawdown)',
      label: `Max DD (${h})`,
      rankLabel: `Max drawdown (${h}, low better)`,
      apiField: key,
      valuePath: `risk.${key}`,
      type: 'heat',
      higherIsBetter: false,
      format: 'pct',
    };
  },
);

const riskAbsSkewCols = ['skewness1yr', 'skewness3yr', 'skewness5yr'].map((key) => {
  const h = key.replace('skewness', '').replace('yr', 'Y');
  return {
    key,
    group: 'Risk (skewness)',
    label: `Skew (${h})`,
    rankLabel: `Skewness (${h})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  };
});

const riskAbsKurtCols = ['kurtosis1yr', 'kurtosis3yr', 'kurtosis5yr'].map((key) => {
  const h = key.replace('kurtosis', '').replace('yr', 'Y');
  return {
    key,
    group: 'Risk (kurtosis)',
    label: `Kurt (${h})`,
    rankLabel: `Kurtosis (${h})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  };
});

const riskAbsSharpeCols = [
  'sharperatio1yr',
  'sharperatio3yr',
  'sharperatio5yr',
  'sharperatio10yr',
].map((key) => {
  const h = key.replace('sharperatio', '').replace('yr', 'Y');
  return {
    key,
    group: 'Risk (Sharpe)',
    label: `Sharpe (${h})`,
    rankLabel: `Sharpe ratio (${h})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  };
});

const relHorizon = (key, prefix) => {
  const rest = key.slice(prefix.length).replace('yr', 'Y');
  return rest;
};

const riskRelAlphaCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('alpha')).map((key) => ({
  key,
  group: 'Risk vs bench (alpha)',
  label: `Alpha (${relHorizon(key, 'alpha')})`,
  rankLabel: `Alpha (${relHorizon(key, 'alpha')})`,
  apiField: key,
  valuePath: `risk.${key}`,
  type: 'heat',
  higherIsBetter: true,
  format: 'num',
}));

const riskRelBetaCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('beta')).map((key) => ({
  key,
  group: 'Risk vs bench (beta)',
  label: `Beta (${relHorizon(key, 'beta')})`,
  rankLabel: `Beta (${relHorizon(key, 'beta')})`,
  apiField: key,
  valuePath: `risk.${key}`,
  type: 'heat',
  higherIsBetter: false,
  format: 'num',
}));

const riskRelRsCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('rsquared')).map((key) => ({
  key,
  group: 'Risk vs bench (R²)',
  label: `R² (${relHorizon(key, 'rsquared')})`,
  rankLabel: `R-squared (${relHorizon(key, 'rsquared')})`,
  apiField: key,
  valuePath: `risk.${key}`,
  type: 'heat',
  higherIsBetter: true,
  format: 'num',
}));

const riskRelCapUpCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('captureratioupside')).map(
  (key) => ({
    key,
    group: 'Risk vs bench (capture)',
    label: `Cap. up (${relHorizon(key, 'captureratioupside')})`,
    rankLabel: `Capture upside (${relHorizon(key, 'captureratioupside')})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  }),
);

const riskRelCapDnCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('captureratiodownside')).map(
  (key) => ({
    key,
    group: 'Risk vs bench (capture)',
    label: `Cap. down (${relHorizon(key, 'captureratiodownside')})`,
    rankLabel: `Capture downside (${relHorizon(key, 'captureratiodownside')})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  }),
);

const riskRelIrCols = RISK_REL_SORT_KEYS.filter((k) => k.startsWith('informationratio')).map(
  (key) => ({
    key,
    group: 'Risk vs bench (info ratio)',
    label: `Info ratio (${relHorizon(key, 'informationratio')})`,
    rankLabel: `Information ratio (${relHorizon(key, 'informationratio')})`,
    apiField: key,
    valuePath: `risk.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  }),
);

const ratingStarCols = ['rating3year', 'rating5year', 'rating10year', 'ratingoverall'].map(
  (key) => {
    const lbl =
      key === 'ratingoverall' ? 'Overall' : key.replace('rating', '').replace('year', 'Y');
    return {
      key,
      group: 'Ratings (stars)',
      label: `Stars (${lbl})`,
      rankLabel: `Star rating (${lbl})`,
      apiField: key,
      valuePath: `ratings.${key}`,
      type: 'stars',
      higherIsBetter: true,
      format: 'num',
    };
  },
);

const ratingRarCols = [
  'riskadjustedreturn3yr',
  'riskadjustedreturn5yr',
  'riskadjustedreturn10yr',
  'riskadjustedreturnoverall',
].map((key) => {
  const h =
    key === 'riskadjustedreturnoverall'
      ? 'overall'
      : key.replace('riskadjustedreturn', '').replace('yr', 'Y');
  return {
    key,
    group: 'Ratings (risk-adj. return)',
    label: `Risk-adj. ret. (${h})`,
    rankLabel: `Risk-adjusted return (${h})`,
    apiField: key,
    valuePath: `ratings.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
  };
});

const ratingPerfScoreCols = [
  'performancescore3yr',
  'performancescore5yr',
  'performancescore10yr',
  'performancescoreoverall',
].map((key) => {
  const h =
    key === 'performancescoreoverall'
      ? 'overall'
      : key.replace('performancescore', '').replace('yr', 'Y');
  return {
    key,
    group: 'Ratings (perf. score)',
    label: `Perf. score (${h})`,
    apiField: key,
    valuePath: `ratings.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
    rankLabel: `Performance score (${h})`,
  };
});

const ratingRiskScoreCols = [
  'riskscore3yr',
  'riskscore5yr',
  'riskscore10yr',
  'riskscoreoverall',
].map((key) => {
  const h =
    key === 'riskscoreoverall' ? 'overall' : key.replace('riskscore', '').replace('yr', 'Y');
  return {
    key,
    group: 'Ratings (risk score)',
    label: `Risk score (${h})`,
    apiField: key,
    valuePath: `ratings.${key}`,
    type: 'heat',
    higherIsBetter: true,
    format: 'num',
    rankLabel: `Risk score (${h})`,
  };
});

const ratingNfCols = [
  'numberoffunds3year',
  'numberoffunds5year',
  'numberoffunds10year',
  'numberoffundsoverall',
].map((key) => {
  const h =
    key === 'numberoffundsoverall'
      ? 'overall'
      : key.replace('numberoffunds', '').replace('year', 'Y');
  return {
    key,
    group: 'Ratings (category size)',
    label: `# Funds (${h})`,
    apiField: key,
    valuePath: `ratings.${key}`,
    type: 'numeric',
    higherIsBetter: true,
    format: 'num',
    rankLabel: `Funds in category (${h})`,
  };
});

const ratingCatRankCols = [
  ['perfcatrank3year', 'Perf cat.', '3Y'],
  ['perfcatrank5year', 'Perf cat.', '5Y'],
  ['perfcatrank10year', 'Perf cat.', '10Y'],
  ['riskcatrank3year', 'Risk cat.', '3Y'],
  ['riskcatrank5year', 'Risk cat.', '5Y'],
  ['riskcatrank10year', 'Risk cat.', '10Y'],
  ['ratingcatrank3year', 'Rating cat.', '3Y'],
  ['ratingcatrank5year', 'Rating cat.', '5Y'],
  ['ratingcatrank10year', 'Rating cat.', '10Y'],
].map(([key, g, h]) => ({
  key,
  group: 'Ratings (category ranks)',
  label: `${g} rank (${h})`,
  apiField: key,
  valuePath: `ratings.${key}`,
  type: 'heat',
  higherIsBetter: true,
  format: 'num',
  rankLabel: `${g} rank (${h})`,
}));

const flowCols = FLOW_SORT_KEYS.map((key) => ({
  key,
  group: 'Fund flows',
  label: `Net flow (${FLOW_HORIZON[key]})`,
  rankLabel: `Fund-level net flow (${FLOW_HORIZON[key]})`,
  apiField: key,
  valuePath: `flows.${key}`,
  type: 'numeric',
  higherIsBetter: true,
  format: 'aum',
}));

const aumCol = {
  key: 'fundnetassets',
  group: 'Assets & flows',
  label: 'AUM',
  rankLabel: 'AUM',
  apiField: 'fundnetassets',
  valuePath: 'assets.fundnetassets',
  type: 'numeric',
  higherIsBetter: true,
  format: 'aum',
};

export const METRIC_COLUMNS = [
  ...perfTrailingCols,
  ...perfCumCols,
  ...CATEGORY_RANK_PERCENTILE_COLUMNS,
  ...feeCols,
  ...riskAbsStdCols,
  ...riskAbsDdCols,
  ...riskAbsSkewCols,
  ...riskAbsKurtCols,
  ...riskAbsSharpeCols,
  ...riskRelAlphaCols,
  ...riskRelBetaCols,
  ...riskRelRsCols,
  ...riskRelCapUpCols,
  ...riskRelCapDnCols,
  ...riskRelIrCols,
  ...ratingStarCols,
  ...ratingRarCols,
  ...ratingPerfScoreCols,
  ...ratingRiskScoreCols,
  ...ratingNfCols,
  ...ratingCatRankCols,
  ...flowCols,
  aumCol,
];

export const METRIC_COLUMN_ORDER = METRIC_COLUMNS.map((col) => col.key);
export const METRIC_BY_KEY = Object.fromEntries(METRIC_COLUMNS.map((col) => [col.key, col]));

/** Default template; keys must exist in METRIC_BY_KEY. */
export const DEFAULT_METRIC_KEYS = [
  'return1yr',
  'return3yr',
  'return5yr',
  'return10yr',
  'mer',
  'sharperatio3yr',
  'ratingoverall',
  'fundnetassets',
];

/** Older saved column prefs → current keys. */
const LEGACY_METRIC_KEY_ALIASES = {
  sharpe: 'sharperatio3yr',
  rating: 'ratingoverall',
};

export function normalizeStoredMetricKeys(rawKeys) {
  return rawKeys.map((k) => LEGACY_METRIC_KEY_ALIASES[k] || k).filter((k) => METRIC_BY_KEY[k]);
}
