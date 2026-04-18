const { fetchSingleDomain, fetchMultipleDomains, fetchAvailableDates } = require('../services/domainService');

const makeSingleDomainHandler = (domainKey) => async (req, res, next) => {
  try {
    const { fundIds } = req.body;
    const asofDate = req.asofDate || req.body.asofDate;

    const result = await fetchSingleDomain(domainKey, fundIds, asofDate);

    res.status(200).json(result);
  } catch (err) {
    console.error(`Error fetching ${domainKey} domain:`, err);
    next(err);
  }
};

const getBasicInfoAtDate              = makeSingleDomainHandler('basicInfo');
const getPerformanceAtDate            = makeSingleDomainHandler('performance');
const getRankingsAtDate               = makeSingleDomainHandler('rankings');
const getFeesAtDate                   = makeSingleDomainHandler('fees');
const getRatingsAtDate                = makeSingleDomainHandler('ratings');
const getRiskAtDate                   = makeSingleDomainHandler('risk');
const getFlowsAtDate                  = makeSingleDomainHandler('flows');
const getAssetsAtDate                 = makeSingleDomainHandler('assets');
const getCategoryPerformanceAtDate    = makeSingleDomainHandler('categoryPerformance');

/**
 * @route POST /api/funds/domains
 */
const getFundDomainsAtDate = async (req, res, next) => {
  try {
    const { fundIds, domains } = req.body;
    const asofDate = req.asofDate || req.body.asofDate;

    const result = await fetchMultipleDomains(domains, fundIds, asofDate);

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching fund domains:', err);
    next(err);
  }
};

const getAvailableDates = async (req, res, next) => {
  try {
    const dates = await fetchAvailableDates();
    res.status(200).json({ data: dates });
  } catch (err) {
    console.error('Error fetching available dates:', err);
    next(err);
  }
};

module.exports = {
  getBasicInfoAtDate,
  getPerformanceAtDate,
  getRankingsAtDate,
  getFeesAtDate,
  getRatingsAtDate,
  getRiskAtDate,
  getFlowsAtDate,
  getAssetsAtDate,
  getCategoryPerformanceAtDate,
  getFundDomainsAtDate,
  getAvailableDates,
};
