const {
  queryDashboardStats,
  queryTopPerformers,
  queryTopCategories,
  queryLargestFlowCategories,
  queryCategoryOverview,
} = require('../queries/dashboardQueries');

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const cached = async (key, fn) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.value;
  const value = await fn();
  cache.set(key, { value, ts: Date.now() });
  if (cache.size > 100) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    for (let i = 0; i < oldest.length - 50; i++) cache.delete(oldest[i][0]);
  }
  return value;
};

const fetchDashboardData = async (asofDate) => {
  return cached(`dashboard-v3|${asofDate || ''}`, async () => {
    const [stats, topPerformers, topCategories, largestFlowCategories] = await Promise.all([
      queryDashboardStats(asofDate),
      queryTopPerformers(asofDate, 10),
      queryTopCategories(asofDate, 10),
      queryLargestFlowCategories(asofDate, 10),
    ]);
    return { stats, topPerformers, topCategories, largestFlowCategories };
  });
};

const fetchCategoryOverview = async (category, asofDate) => {
  return cached(`cat-overview|${category}|${asofDate || ''}`, async () => {
    return queryCategoryOverview(category, asofDate);
  });
};

module.exports = {
  fetchDashboardData,
  fetchCategoryOverview,
};
