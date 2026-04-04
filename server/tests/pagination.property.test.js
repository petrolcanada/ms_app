const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const { getAllFunds } = require('../controllers/fundController');
const { validatePagination, validateFilters } = require('../middleware/validator');
const { errorHandler } = require('../middleware/errorHandler');
const { pool } = require('../config/db');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/api/funds', validatePagination, validateFilters, getAllFunds);
  app.use(errorHandler);
  return app;
};

describe('Property 10: Pagination correctness', () => {
  let app;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  afterAll(async () => {
    await pool.end();
  });
  
  test('For any page number P and limit L, the API should return exactly L items (or fewer if on the last page)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 20 }),
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          expect(response.status).toBe(200);
          
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
          
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination).toHaveProperty('page', page);
          expect(response.body.pagination).toHaveProperty('limit', limit);
          expect(response.body.pagination).toHaveProperty('total');
          expect(response.body.pagination).toHaveProperty('totalPages');
          
          const { data, pagination } = response.body;
          const { total, totalPages } = pagination;
          
          const expectedOffset = (page - 1) * limit;
          const expectedItemsOnPage = Math.min(limit, Math.max(0, total - expectedOffset));
          
          if (page <= totalPages) {
            expect(data.length).toBeLessThanOrEqual(limit);
            expect(data.length).toBe(expectedItemsOnPage);
          } else {
            expect(data.length).toBe(0);
          }
          
          expect(totalPages).toBe(Math.ceil(total / limit));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('For any page number P and limit L, items should correspond to the correct slice of the dataset', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        fc.constantFrom(5, 10, 20),
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          expect(response.status).toBe(200);
          
          const { data, pagination } = response.body;
          const { total } = pagination;
          
          const expectedOffset = (page - 1) * limit;
          
          if (data.length > 0) {
            expect(expectedOffset).toBeLessThan(total);
            
            const remainingItems = total - expectedOffset;
            const expectedCount = Math.min(limit, remainingItems);
            expect(data.length).toBe(expectedCount);
          } else {
            expect(expectedOffset).toBeGreaterThanOrEqual(total);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('Pagination should handle edge cases correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(1, 2, 100),
        fc.constantFrom(1, 10, 100),
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('pagination');
          
          const { data, pagination } = response.body;
          
          expect(data.length).toBeLessThanOrEqual(limit);
          
          expect(pagination.page).toBe(page);
          expect(pagination.limit).toBe(limit);
          expect(pagination.total).toBeGreaterThanOrEqual(0);
          expect(pagination.totalPages).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
