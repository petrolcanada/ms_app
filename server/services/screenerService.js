const { queryScreener } = require('../queries/screenerQueries');

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

const cacheKey = ({ category, type, asofDate, sortBy, sortDir, limit, offset }) =>
  `${category || ''}|${type || ''}|${asofDate || ''}|${sortBy || ''}|${sortDir || ''}|${limit}|${offset}`;

const getScreenerData = async ({ category, type, asofDate, sortBy, sortDir, limit, offset }) => {
  const key = cacheKey({ category, type, asofDate, sortBy, sortDir, limit, offset });
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.value;
  }

  const { rows, total } = await queryScreener({ category, type, asofDate, sortBy, sortDir, limit, offset });
  const value = { data: rows, meta: { total } };

  cache.set(key, { value, ts: Date.now() });

  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    for (let i = 0; i < oldest.length - 100; i++) cache.delete(oldest[i][0]);
  }

  return value;
};

module.exports = { getScreenerData };
