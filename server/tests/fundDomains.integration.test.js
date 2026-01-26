const request = require('supertest');
const express = require('express');
const fundsRouter = require('../routes/funds');
const { pool } = require('../db/config/db');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/funds', fundsRouter);

  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      error: {
        message: err.message || 'Internal server error',
      },
    });
  });

  return app;
};

describe('Fund domains integration', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('combines basicInfo + performance for specific funds', async () => {
    jest.setTimeout(20000);

    const fundIds = ['F00000XGDA', 'F00001QJVO'];

    const dateResult = await pool.query(
      `
        SELECT monthenddate
        FROM ms.month_end_trailing_total_returns_ca_openend
        WHERE _id = ANY($1)
        GROUP BY monthenddate
        HAVING COUNT(DISTINCT _id) = $2
        ORDER BY monthenddate DESC
        LIMIT 1
      `,
      [fundIds, fundIds.length]
    );

    expect(dateResult.rows.length).toBe(1);
    const asofDate = dateResult.rows[0].monthenddate;

    const response = await request(app)
      .post('/api/funds/domains')
      .send({
        fundIds,
        asofDate,
        domains: ['basicInfo', 'performance'],
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('asofDate', asofDate);
    expect(Array.isArray(response.body.funds)).toBe(true);
    expect(response.body.funds.length).toBeGreaterThan(0);

    const funds = response.body.funds;
    fundIds.forEach(id => {
      const fund = funds.find(f => f.basicInfo && f.basicInfo._id === id);
      expect(fund).toBeDefined();
      expect(fund.basicInfo).toBeDefined();
      expect(fund.performance).toBeDefined();
      expect(fund.performance._id).toBe(id);
      expect(fund.performance.monthenddate).toBe(asofDate);
    });

    const perfResult = await pool.query(
      'SELECT * FROM ms.fn_get_performance_at_date($1, $2)',
      [fundIds, asofDate]
    );
    expect(perfResult.rows.length).toBeGreaterThanOrEqual(fundIds.length);
  });
});
