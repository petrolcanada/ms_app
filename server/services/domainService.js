const { queryDomain, queryMultipleDomains, queryLatestMonthEndDate, queryAvailableMonthEndDates } = require('../queries/domainQueries');
const { AppError } = require('../middleware/errorHandler');

/**
 * Merge rows from multiple domains into a single array keyed by _id.
 * Each element is { [domainKey]: rowObject, ... }.
 */
const mergeDomainRows = (domainRows) => {
  const merged = new Map();

  Object.entries(domainRows).forEach(([key, rows]) => {
    if (!Array.isArray(rows)) return;
    rows.forEach(row => {
      const fund = merged.get(row._id) || {};
      fund[key] = row;
      merged.set(row._id, fund);
    });
  });

  return Array.from(merged.values());
};

const resolveAsofDate = async (asofDate) => {
  if (asofDate) return asofDate;
  const latest = await queryLatestMonthEndDate();
  if (!latest) throw new AppError('No month-end data available in the database', 503);
  console.log(`Auto-resolved asofDate to latest monthenddate: ${latest}`);
  return latest;
};

const fetchSingleDomain = async (domainKey, fundIds, asofDate) => {
  const effectiveDate = await resolveAsofDate(asofDate);
  const rows = await queryDomain(domainKey, fundIds, effectiveDate);
  return { data: rows, meta: { asofDate: effectiveDate } };
};

const fetchMultipleDomains = async (domainKeys, fundIds, asofDate) => {
  const effectiveDate = await resolveAsofDate(asofDate);
  const domainRows = await queryMultipleDomains(domainKeys, fundIds, effectiveDate);

  let funds = [];
  if (Object.keys(domainRows).length > 0) {
    funds = mergeDomainRows(domainRows);
  }

  return { data: funds, meta: { asofDate: effectiveDate } };
};

const fetchAvailableDates = async () => {
  const dates = await queryAvailableMonthEndDates();
  return dates.map(d => {
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  });
};

module.exports = {
  fetchSingleDomain,
  fetchMultipleDomains,
  fetchAvailableDates,
};
