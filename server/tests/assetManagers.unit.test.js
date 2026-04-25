const request = require('supertest');
const express = require('express');

jest.mock('../queries/assetManagerQueries', () => ({
  queryAllAssetManagers: jest.fn(),
  queryAssetManagerOverview: jest.fn(),
}));

const {
  queryAllAssetManagers,
  queryAssetManagerOverview,
} = require('../queries/assetManagerQueries');
const assetManagersRouter = require('../routes/assetManagers');
const { errorHandler } = require('../middleware/errorHandler');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/asset-managers', assetManagersRouter);
  app.use(errorHandler);
  return app;
};

describe('asset manager routes', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('returns distinct asset manager names from the query layer', async () => {
    queryAllAssetManagers.mockResolvedValue(['AGF Investments Inc', 'RBC Global Asset Management']);

    const response = await request(createApp()).get('/api/asset-managers');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(['AGF Investments Inc', 'RBC Global Asset Management']);
    expect(queryAllAssetManagers).toHaveBeenCalledTimes(1);
  });

  test('returns overview payload with totals, categories, rank quality, and leaders', async () => {
    const overview = {
      assetManager: 'RBC Global Asset Management',
      asofDate: '2026-03-31',
      totals: { fundCount: 2, categoryCount: 1, totalAum: 3000, flow1m: 100 },
      relativeQuality: { avgExcessReturn1yr: 1.2, topQuartileCount: 1 },
      categories: [{ categoryname: 'Canadian Equity', fundCount: 2 }],
      leaders: { bestOutperformers: [{ _id: 'F1' }] },
    };
    queryAssetManagerOverview.mockResolvedValue(overview);

    const response = await request(createApp()).get(
      '/api/asset-managers/RBC%20Global%20Asset%20Management/overview?asofDate=2026-03-31',
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(overview);
    expect(queryAssetManagerOverview).toHaveBeenCalledWith(
      'RBC Global Asset Management',
      '2026-03-31',
    );
  });

  test('rejects invalid overview as-of dates', async () => {
    const response = await request(createApp()).get(
      '/api/asset-managers/RBC%20Global%20Asset%20Management/overview?asofDate=bad-date',
    );

    expect(response.status).toBe(400);
    expect(queryAssetManagerOverview).not.toHaveBeenCalled();
  });
});
