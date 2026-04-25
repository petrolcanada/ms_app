jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../config/db');
const { queryScreener } = require('../queries/screenerQueries');

describe('queryScreener asset manager filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockResolvedValue({ rows: [] });
  });

  test('passes assetManager to fn_get_screener_at_date as p_asset_manager', async () => {
    await queryScreener({
      search: 'income',
      category: 'Canadian Equity',
      assetManager: 'RBC Global Asset Management',
      type: 'ETF',
      asofDate: '2026-03-31',
      sortBy: 'return1yr',
      sortDir: 'desc',
      limit: 25,
      offset: 0,
    });

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('p_category := $1');
    expect(sql).toContain('p_asset_manager := $2');
    expect(sql).toContain('p_type := $3');
    expect(sql).toContain('p_asof_date := $4::DATE');
    expect(params).toEqual([
      'Canadian Equity',
      'RBC Global Asset Management',
      'ETF',
      '2026-03-31',
      '%income%',
      25,
      0,
    ]);
  });
});
