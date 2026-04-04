const { pool } = require('../config/db');

const SECURITYTYPE_CASE = `CASE securitytype WHEN 'FO' THEN 'Mutual Fund' WHEN 'FE' THEN 'ETF' ELSE securitytype END AS securitytype`;

const FUND_LIST_COLUMNS = `
  _id,
  _name,
  fundname,
  legalname,
  ticker,
  categoryname,
  globalcategoryname,
  broadassetclass,
  currency,
  domicile,
  inceptiondate,
  providercompanyname,
  legalstructure,
  securitytype
`;

/**
 * For CTE queries against the raw temporal table, securitytype still stores
 * codes (FO/FE). This variant swaps in the CASE WHEN translation.
 */
const FUND_LIST_COLUMNS_TEMPORAL = FUND_LIST_COLUMNS.replace(
  /\bsecuritytype\s*$/m,
  SECURITYTYPE_CASE,
);

const FUND_DETAIL_COLUMNS = `
  data_inserted_at,
  status_code,
  status_message,
  _id,
  _idtype,
  amfcategory,
  ausinvestmentvehicleregionareacode,
  ausinvestmentvehicleregionareacodeisoalpha2,
  advisorycompanyid,
  advisorycompanyname,
  aggregatedcategoryname,
  brandingid,
  brandingname,
  broadassetclass,
  broadcategorygroup,
  broadcategorygroupid,
  canadarisklevelverbal,
  canadatimehorizon,
  categorycode,
  categorycurrencyid,
  categoryname,
  currency,
  currencyid,
  custodiancompanyid,
  custodiancompanyname,
  distributionfrequency,
  distributionstatus,
  distributorcompanies,
  dividenddistributionfrequencydetails,
  domicile,
  domicileid,
  exchangeid,
  fixeddistribution,
  fundid,
  fundlegalname,
  fundname,
  fundservdetails,
  fundservs,
  fundstandardname,
  globalcategoryid,
  globalcategoryname,
  globalfundreports,
  highnetworth,
  ific,
  inceptiondate,
  indexstrategybox,
  indexstrategyboxverbal,
  invesmtentdecisionmakingprocess,
  investmentphilsophy,
  legalname,
  legalstructure,
  localphone,
  mexcode,
  mstarid,
  morningstarindexid,
  morningstarindexname,
  multilingualnames,
  operationready,
  performanceid,
  performanceready,
  previousfundname,
  previousfundnameenddate,
  productfocus,
  producttype,
  providercompanyid,
  providercompanyname,
  providercompanyphonenumber,
  providercompanywebsite,
  registeredunder1940act,
  restrictedfund,
  restructuredate,
  securitytype,
  shareclasstype,
  terminationdate,
  ticker,
  tollfreephone,
  ukreportingstartdate,
  ukreportingstatus,
  umbrellacompanyid,
  umbrellacompanyname,
  valor,
  wkn,
  _name,
  _hashkey,
  _runid,
  _timestampfrom,
  _timestampto,
  fault_faultstring,
  fault_detail_errorcode,
  morningstarcategorygroupid,
  morningstarcategorygroupname,
  _currencyid,
  prospectusobjective
`;

const LATEST_VIEW = 'ms.mv_fund_share_class_basic_info_ca_openend_latest';
const TEMPORAL_TABLE = 'ms.fund_share_class_basic_info_ca_openend';

/**
 * Build WHERE clause and params for search + filter criteria.
 * securitytype is already stored as 'ETF' / 'Mutual Fund' in both the MV
 * and the CTE, so no reverse mapping is needed.
 */
const buildFilterClause = ({ search, type, category }, startParam = 1) => {
  let clause = '';
  const params = [];
  let p = startParam;

  if (search) {
    clause += ` AND (
      fundname ILIKE $${p}
      OR legalname ILIKE $${p}
      OR ticker ILIKE $${p}
      OR _name ILIKE $${p}
    )`;
    params.push(`%${search}%`);
    p++;
  }

  if (type) {
    clause += ` AND securitytype = $${p}`;
    params.push(type);
    p++;
  }

  if (category) {
    clause += ` AND categoryname = $${p}`;
    params.push(category);
    p++;
  }

  return { clause, params, nextParam: p };
};

/**
 * When asofDate is provided, wrap the temporal table in a CTE that
 * filters by monthenddate (one row per _id per month-end).
 * The CTE uses FUND_LIST_COLUMNS_TEMPORAL which translates FO/FE codes.
 * When omitted, use the fast _latest materialized view (already translated).
 */
const buildSourceExpr = (asofDate, params) => {
  if (!asofDate) {
    return { source: LATEST_VIEW, startParam: 1 };
  }
  params.push(asofDate);
  const dateParam = params.length;
  const cte = `asof_basic_info AS (
    SELECT ${FUND_LIST_COLUMNS_TEMPORAL}
    FROM ${TEMPORAL_TABLE}
    WHERE monthenddate = $${dateParam}::text
  )`;
  return { cte, source: 'asof_basic_info', startParam: dateParam + 1 };
};

const queryFundList = async ({ search, type, category, limit, offset, asofDate }) => {
  const sourceParams = [];
  const { cte, source, startParam } = buildSourceExpr(asofDate, sourceParams);
  const { clause, params: filterParams, nextParam } = buildFilterClause({ search, type, category }, startParam);

  const allParams = [...sourceParams, ...filterParams];

  const body = `
    SELECT ${FUND_LIST_COLUMNS}
    FROM ${source}
    WHERE 1=1${clause}
    ORDER BY fundname ASC
    LIMIT $${nextParam} OFFSET $${nextParam + 1}
  `;
  allParams.push(limit, offset);

  const queryText = cte ? `WITH ${cte}\n${body}` : body;
  return pool.query(queryText, allParams);
};

const queryFundCount = async ({ search, type, category, asofDate }) => {
  const sourceParams = [];
  const { cte, source, startParam } = buildSourceExpr(asofDate, sourceParams);
  const { clause, params: filterParams } = buildFilterClause({ search, type, category }, startParam);

  const allParams = [...sourceParams, ...filterParams];

  const body = `
    SELECT COUNT(*) as total
    FROM ${source}
    WHERE 1=1${clause}
  `;

  const queryText = cte ? `WITH ${cte}\n${body}` : body;
  const result = await pool.query(queryText, allParams);
  return parseInt(result.rows[0].total);
};

const queryFundById = async (id) => {
  const queryText = `
    SELECT ${FUND_DETAIL_COLUMNS}
    FROM ${LATEST_VIEW}
    WHERE _id = $1
  `;

  return pool.query(queryText, [id]);
};

module.exports = {
  queryFundList,
  queryFundCount,
  queryFundById,
};
