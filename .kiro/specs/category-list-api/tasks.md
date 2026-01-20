# Implementation Plan: Category List API

## Overview

This implementation plan adds a backend API endpoint to retrieve distinct category names from the database and integrates it with the existing FilterPanel component on the frontend. The tasks are organized to build the backend endpoint first, then update the frontend to consume it, with testing throughout.

## Tasks

- [x] 1. Create backend category endpoint
  - [x] 1.1 Create category controller
    - Create `server/controllers/categoryController.js`
    - Implement `getAllCategories` function
    - Query: `SELECT DISTINCT categoryname FROM ms.mv_fund_share_class_basic_info_ca_openend_latest`
    - Return categories as JSON array in `data` field
    - Add error handling for database failures
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_
  
  - [x] 1.2 Create category routes
    - Create `server/routes/categories.js`
    - Add GET /api/categories endpoint
    - Export router
    - _Requirements: 1.1_
  
  - [x] 1.3 Register category routes in server
    - Update `server/server.js`
    - Import and register category routes with `/api/categories` prefix
    - _Requirements: 1.1_
  
  - [ ]* 1.4 Write property test for no duplicates
    - **Property 1: No duplicate categories**
    - **Validates: Requirements 1.2**
  
  - [ ]* 1.5 Write property test for valid JSON structure
    - **Property 2: Valid JSON structure**
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [x] 2. Create frontend category hook
  - [x] 2.1 Create useCategories custom hook
    - Create `client/src/hooks/useCategories.js`
    - Use React Query's useQuery to fetch categories from /api/categories
    - Configure staleTime: Infinity (categories don't change frequently)
    - Configure cacheTime: 1 hour
    - Configure retry: 1 (only retry once on failure)
    - Add fallback to default categories on error
    - Add placeholder data for immediate rendering
    - _Requirements: 3.1, 3.2, 3.5, 4.3, 5.3, 5.4, 5.5_
  
  - [ ]* 2.2 Write property test for fallback on error
    - **Property 3: Fallback on error**
    - **Validates: Requirements 4.3, 4.5**
  
  - [ ]* 2.3 Write property test for single fetch per session
    - **Property 4: Single fetch per session**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [-] 3. Update FilterPanel component
  - [x] 3.1 Integrate useCategories hook
    - Update `client/src/components/FilterPanel.jsx`
    - Import and use useCategories hook
    - Remove hardcoded DEFAULT_CATEGORIES constant (move to hook)
    - Use categories from hook data
    - Remove availableCategories prop (no longer needed)
    - Handle loading state (optional)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 3.2 Test FilterPanel with dynamic categories
    - Manually test that dropdown populates with database categories
    - Test that filtering still works correctly
    - Test fallback behavior when API is unavailable
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Add API service method
  - [ ] 4.1 Update API service (optional)
    - If needed, add explicit method in `client/src/services/api.js` for fetching categories
    - Otherwise, useCategories hook can call api.get directly
    - _Requirements: 3.1_

- [ ] 5. Final testing and validation
  - [ ] 5.1 Test complete flow
    - Start backend server
    - Start frontend application
    - Verify category dropdown loads with database categories
    - Verify filtering by category works correctly
    - Test error scenarios (stop database, check fallback)
    - _Requirements: All_
  
  - [ ] 5.2 Verify performance
    - Check that API response time is under 500ms
    - Verify categories are cached and not refetched unnecessarily
    - _Requirements: 1.5, 5.3, 5.4, 5.5_

- [ ] 6. Checkpoint
  - Ensure all tests pass
  - Verify application works end-to-end
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The backend uses JavaScript (Node.js) and frontend uses JavaScript (React)
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- This feature integrates with existing fund-data-dashboard components
