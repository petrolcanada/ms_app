const request = require('supertest');
const express = require('express');
const publicRouter = require('../routes/public');
const { errorHandler } = require('../middleware/errorHandler');
const { pool } = require('../config/db');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/public', publicRouter);
  app.use(errorHandler);
  return app;
};

describe('Public dashboard integration', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('GET /api/public/dashboard returns the public snapshot payload', async () => {
    jest.setTimeout(20000);

    const [statsResult, topResult, flowResult, ratedResult, metaResult] = await Promise.all([
      pool.query(`
        SELECT total_funds, avg_return_1yr, avg_mer, avg_rating, latest_date
        FROM ms_public.dashboard_stats_mv
        LIMIT 1
      `),
      pool.query('SELECT COUNT(*) AS count FROM ms_public.top_performers_mv'),
      pool.query('SELECT COUNT(*) AS count FROM ms_public.largest_flows_mv'),
      pool.query('SELECT COUNT(*) AS count FROM ms_public.highest_rated_mv'),
      pool.query(`
        SELECT published_at, source
        FROM ms_public.snapshot_meta
        WHERE snapshot_name = 'dashboard'
      `),
    ]);

    expect(statsResult.rows.length).toBe(1);
    expect(metaResult.rows.length).toBe(1);

    const response = await request(app).get('/api/public/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.stats');
    expect(response.body).toHaveProperty('data.topPerformers');
    expect(response.body).toHaveProperty('data.largestFlows');
    expect(response.body).toHaveProperty('data.highestRated');
    expect(response.body).toHaveProperty('meta.publishedAt');
    expect(response.body.meta.source).toBe('ms_public');

    const stats = response.body.data.stats;
    const statsRow = statsResult.rows[0];

    expect(Number(stats.total_funds)).toBe(Number(statsRow.total_funds));
    expect(String(stats.avg_return_1yr)).toBe(String(statsRow.avg_return_1yr));
    expect(String(stats.avg_mer)).toBe(String(statsRow.avg_mer));
    expect(String(stats.avg_rating)).toBe(String(statsRow.avg_rating));
    expect(String(stats.latest_date)).toBe(String(statsRow.latest_date));

    expect(response.body.data.topPerformers).toHaveLength(Number(topResult.rows[0].count));
    expect(response.body.data.largestFlows).toHaveLength(Number(flowResult.rows[0].count));
    expect(response.body.data.highestRated).toHaveLength(Number(ratedResult.rows[0].count));

    expect(new Date(response.body.meta.publishedAt).getTime()).toBe(
      new Date(metaResult.rows[0].published_at).getTime(),
    );
  });

  test('GET /api/public/available-dates returns descending dates with snapshot metadata', async () => {
    jest.setTimeout(20000);

    const [datesResult, metaResult] = await Promise.all([
      pool.query(`
        SELECT monthenddate
        FROM ms_public.available_dates_mv
        ORDER BY display_order ASC
        LIMIT 10
      `),
      pool.query(`
        SELECT published_at, source
        FROM ms_public.snapshot_meta
        WHERE snapshot_name = 'available_dates'
      `),
    ]);

    expect(metaResult.rows.length).toBe(1);

    const response = await request(app).get('/api/public/available-dates');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.meta.source).toBe('ms_public');
    expect(response.body.data.slice(0, 10)).toEqual(
      datesResult.rows.map((row) => row.monthenddate),
    );
    expect(new Date(response.body.meta.publishedAt).getTime()).toBe(
      new Date(metaResult.rows[0].published_at).getTime(),
    );
  });
});
