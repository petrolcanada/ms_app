const { pool } = require('../config/db');

const getByUserId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT * FROM watchlists WHERE user_id = $1 ORDER BY added_at DESC',
    [userId],
  );
  return rows;
};

const add = async (userId, { fundId, fundName, ticker, categoryName, securityType }) => {
  const { rows } = await pool.query(
    `INSERT INTO watchlists (user_id, fund_id, fund_name, ticker, category_name, security_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, fund_id) DO NOTHING
     RETURNING *`,
    [userId, fundId, fundName || null, ticker || null, categoryName || null, securityType || null],
  );
  return rows[0] || null;
};

const remove = async (userId, fundId) => {
  await pool.query(
    'DELETE FROM watchlists WHERE user_id = $1 AND fund_id = $2',
    [userId, fundId],
  );
};

const clearAll = async (userId) => {
  await pool.query('DELETE FROM watchlists WHERE user_id = $1', [userId]);
};

const count = async (userId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM watchlists WHERE user_id = $1',
    [userId],
  );
  return rows[0].count;
};

const bulkUpsert = async (userId, items) => {
  if (!items.length) return 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let upserted = 0;
    for (const item of items) {
      const { rowCount } = await client.query(
        `INSERT INTO watchlists (user_id, fund_id, fund_name, ticker, category_name, security_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, fund_id) DO UPDATE SET
           fund_name = COALESCE(EXCLUDED.fund_name, watchlists.fund_name),
           ticker = COALESCE(EXCLUDED.ticker, watchlists.ticker),
           category_name = COALESCE(EXCLUDED.category_name, watchlists.category_name),
           security_type = COALESCE(EXCLUDED.security_type, watchlists.security_type)`,
        [userId, item.fundId, item.fundName || null, item.ticker || null, item.categoryName || null, item.securityType || null],
      );
      upserted += rowCount;
    }

    await client.query('COMMIT');
    return upserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getByUserId,
  add,
  remove,
  clearAll,
  count,
  bulkUpsert,
};
