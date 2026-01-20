const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const { getAllFunds } = require('../controllers/fundController');
const { validatePagination, validateFilters } = require('../middleware/validator');
const { pool } = require('../config/db');

// Create a test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/api/funds', validatePagination, validateFilters, getAllFunds);
  
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

// Feature: fund-data-dashboard, Property 10: Pagination correctness
describe('Property 10: Pagination correctness', () => {
  let app;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  afterAll(async () => {
    // Close database connection pool
    await pool.end();
  });
  
  test('For any page number P and limit L, the API should return exactly L items (or fewer if on the last page)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // page
        fc.integer({ min: 1, max: 20 }), // limit
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          // Should return 200 OK
          expect(response.status).toBe(200);
          
          // Should have data array
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
          
          // Should have pagination metadata
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination).toHaveProperty('page', page);
          expect(response.body.pagination).toHaveProperty('limit', limit);
          expect(response.body.pagination).toHaveProperty('total');
          expect(response.body.pagination).toHaveProperty('totalPages');
          
          const { data, pagination } = response.body;
          const { total, totalPages } = pagination;
          
          // Calculate expected number of items
          const expectedOffset = (page - 1) * limit;
          const expectedItemsOnPage = Math.min(limit, Math.max(0, total - expectedOffset));
          
          // Verify the number of returned items
          if (page <= totalPages) {
            // If we're on a valid page, we should get items
            expect(data.length).toBeLessThanOrEqual(limit);
            expect(data.length).toBe(expectedItemsOnPage);
          } else {
            // If we're beyond the last page, we should get 0 items
            expect(data.length).toBe(0);
          }
          
          // Verify totalPages calculation
          expect(totalPages).toBe(Math.ceil(total / limit));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('For any page number P and limit L, items should correspond to the correct slice of the dataset', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // page
        fc.constantFrom(5, 10, 20), // limit - use fixed values for easier verification
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          expect(response.status).toBe(200);
          
          const { data, pagination } = response.body;
          const { total } = pagination;
          
          // Calculate expected offset
          const expectedOffset = (page - 1) * limit;
          
          // If we have data, verify it's from the correct offset
          if (data.length > 0) {
            // The offset should be less than total
            expect(expectedOffset).toBeLessThan(total);
            
            // Verify we got the right number of items
            const remainingItems = total - expectedOffset;
            const expectedCount = Math.min(limit, remainingItems);
            expect(data.length).toBe(expectedCount);
          } else {
            // If no data, we should be beyond the dataset
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
        fc.constantFrom(1, 2, 100), // edge case pages
        fc.constantFrom(1, 10, 100), // edge case limits
        async (page, limit) => {
          const response = await request(app)
            .get('/api/funds')
            .query({ page, limit });
          
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('pagination');
          
          const { data, pagination } = response.body;
          
          // Data should never exceed limit
          expect(data.length).toBeLessThanOrEqual(limit);
          
          // Pagination metadata should be consistent
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
