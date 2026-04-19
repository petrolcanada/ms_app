const {
  queryPublicDashboardStats,
  queryPublicTopPerformers,
  queryPublicLargestFlows,
  queryPublicHighestRated,
  queryPublicAvailableDates,
  queryPublicSnapshotMeta,
} = require('../queries/publicQueries');

const buildMeta = (metaRow) => ({
  publishedAt: metaRow?.published_at || null,
  source: metaRow?.source || 'ms_public',
});

const fetchPublicDashboard = async () => {
  const [stats, topPerformers, largestFlows, highestRated, meta] = await Promise.all([
    queryPublicDashboardStats(),
    queryPublicTopPerformers(),
    queryPublicLargestFlows(),
    queryPublicHighestRated(),
    queryPublicSnapshotMeta('dashboard'),
  ]);

  return {
    data: {
      stats,
      topPerformers,
      largestFlows,
      highestRated,
    },
    meta: buildMeta(meta),
  };
};

const fetchPublicAvailableDates = async () => {
  const [dates, meta] = await Promise.all([
    queryPublicAvailableDates(),
    queryPublicSnapshotMeta('available_dates'),
  ]);

  return {
    data: dates,
    meta: buildMeta(meta),
  };
};

module.exports = {
  fetchPublicDashboard,
  fetchPublicAvailableDates,
};
