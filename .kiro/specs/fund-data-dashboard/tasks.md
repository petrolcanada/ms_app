# Implementation Plan: Fund Data Dashboard

## Overview

This implementation plan provides a structured approach to building the fund data dashboard application. The tasks are organized to build the backend API first, then the frontend React application, with incremental testing throughout. Since the actual data model is complex with 10+ tables, these tasks focus on establishing the foundational structure and patterns that you'll extend with your specific queries and features.

## Tasks

- [x] 1. Initialize project structure and dependencies
  - Create root directory with `client/` and `server/` folders
  - Initialize package.json for both client and server
  - Install backend dependencies: express, pg, dotenv, cors, helmet
  - Install frontend dependencies: react, react-router-dom, @mui/material, @tanstack/react-query, axios
  - Create .gitignore files
  - _Requirements: 7.2, 8.1_

- [x] 2. Set up backend server foundation
  - [x] 2.1 Create database connection pool
    - Implement `server/config/db.js` with PostgreSQL connection pool
    - Configure connection parameters from environment variables
    - Add connection error handling
    - _Requirements: 9.1_
  
  - [x] 2.2 Create Express server with middleware
    - Implement `server/server.js` with Express app initialization
    - Configure CORS, helmet, and JSON parsing middleware
    - Set up basic error handling middleware
    - Start server on configured port
    - _Requirements: 8.1_
  
  - [ ]* 2.3 Write unit tests for database connection
    - Test connection pool initialization
    - Test connection error handling
    - _Requirements: 9.1_

- [x] 3. Implement sample API endpoint (funds list)
  - [x] 3.1 Create funds route and controller
    - Implement `server/routes/funds.js` with GET /api/funds endpoint
    - Implement `server/controllers/fundController.js` with getAllFunds function
    - Add pagination support (page, limit query parameters)
    - Add basic search and filter support (search, type, category)
    - _Requirements: 6.1, 6.2, 6.3, 8.1_
  
  - [x] 3.2 Add request validation middleware
    - Implement `server/middleware/validator.js`
    - Validate pagination parameters (page >= 1, limit > 0)
    - Validate filter parameters
    - _Requirements: 10.2_
  
  - [ ]* 3.3 Write property test for pagination
    - **Property 10: Pagination correctness**
    - **Validates: Requirements 8.1**
  
  - [ ]* 3.4 Write property test for filter correctness
    - **Property 9: Filter correctness**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 4. Implement fund detail endpoint
  - [ ] 4.1 Create fund detail route and controller
    - Add GET /api/funds/:id endpoint to funds route
    - Implement getFundById function in fundController
    - Join with related tables (fees, managers, performance) as needed
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 8.2_
  
  - [ ]* 4.2 Write property test for API response structure
    - **Property 2: API response structure validity**
    - **Validates: Requirements 1.4**
  
  - [ ]* 4.3 Write property test for numeric precision
    - **Property 3: Numeric precision for fees**
    - **Validates: Requirements 2.3**

- [ ] 5. Implement error handling
  - [ ] 5.1 Create centralized error handler
    - Implement `server/middleware/errorHandler.js`
    - Handle database errors (503 for connection issues)
    - Handle validation errors (400 with details)
    - Handle not found errors (404)
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 5.2 Write property test for error responses
    - **Property 11: Error response structure**
    - **Validates: Requirements 8.5**
  
  - [ ]* 5.3 Write property test for invalid parameters
    - **Property 13: Invalid parameter handling**
    - **Validates: Requirements 10.2**

- [ ] 6. Checkpoint - Test backend API
  - Ensure all backend tests pass
  - Manually test API endpoints with sample requests
  - Ask the user if questions arise

- [ ] 7. Set up React frontend foundation
  - [ ] 7.1 Create React app structure
    - Set up `client/src/` with App.jsx and index.jsx
    - Configure React Router with basic routes
    - Set up MUI theme in `client/src/theme.js`
    - Wrap app with ThemeProvider
    - _Requirements: 7.2_
  
  - [ ] 7.2 Configure React Query
    - Create QueryClient in App.jsx
    - Wrap app with QueryClientProvider
    - Configure default query options (staleTime, cacheTime)
    - _Requirements: 8.1_
  
  - [ ] 7.3 Create API service layer
    - Implement `client/src/services/api.js` with Axios instance
    - Configure base URL from environment variables
    - Add request/response interceptors for error handling
    - _Requirements: 8.1_

- [ ] 8. Implement fund list view
  - [ ] 8.1 Create FundList component
    - Implement `client/src/components/FundList.jsx`
    - Display funds in MUI DataGrid or Table
    - Show columns: name, ticker, type, category, MER, rank
    - Add loading and error states
    - _Requirements: 1.1, 1.2, 2.1, 5.1_
  
  - [ ] 8.2 Create custom hook for funds data
    - Implement `client/src/hooks/useFunds.js`
    - Use React Query's useQuery to fetch funds
    - Handle pagination state
    - Handle filter state
    - _Requirements: 8.1_
  
  - [ ]* 8.3 Write property test for complete field rendering
    - **Property 1: Complete field rendering**
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 3.1, 3.3, 4.1, 4.2, 5.1, 5.2**

- [ ] 9. Implement search and filter functionality
  - [ ] 9.1 Create SearchBar component
    - Implement `client/src/components/SearchBar.jsx`
    - Add debounced text input
    - Emit search term changes to parent
    - _Requirements: 6.1_
  
  - [ ] 9.2 Create FilterPanel component
    - Implement `client/src/components/FilterPanel.jsx`
    - Add dropdown for fund type (Mutual Fund, ETF)
    - Add dropdown for category
    - Emit filter changes to parent
    - _Requirements: 6.2, 6.3_
  
  - [ ] 9.3 Integrate search and filters with FundList
    - Add SearchBar and FilterPanel to FundList
    - Update useFunds hook to accept search and filter parameters
    - Update API calls with query parameters
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 9.4 Write property test for search term matching
    - **Property 8: Search term matching**
    - **Validates: Requirements 6.1**

- [ ] 10. Implement fund detail view
  - [ ] 10.1 Create FundDetail component
    - Implement `client/src/components/FundDetail.jsx`
    - Display comprehensive fund information in sections
    - Show basic info, fees, managers, performance
    - Add loading and error states
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3_
  
  - [ ] 10.2 Create custom hook for fund detail
    - Implement `client/src/hooks/useFundDetail.js`
    - Use React Query's useQuery to fetch single fund
    - Handle loading and error states
    - _Requirements: 8.2_
  
  - [ ] 10.3 Add routing for fund detail
    - Add route in App.jsx for /funds/:id
    - Add navigation from FundList to FundDetail
    - _Requirements: 1.1_
  
  - [ ]* 10.4 Write property test for multiple managers display
    - **Property 4: Multiple managers display**
    - **Validates: Requirements 3.2**

- [ ] 11. Implement error handling in frontend
  - [ ] 11.1 Create ErrorBoundary component
    - Implement `client/src/components/ErrorBoundary.jsx`
    - Catch React errors and display fallback UI
    - Provide retry and navigation actions
    - _Requirements: 10.4, 10.5_
  
  - [ ] 11.2 Create ErrorDisplay component
    - Implement `client/src/components/ErrorDisplay.jsx`
    - Display user-friendly error messages
    - Add retry button and back/home navigation
    - _Requirements: 10.4, 10.5_
  
  - [ ] 11.3 Add error handling to API service
    - Transform API errors to user-friendly messages
    - Remove technical details (stack traces, etc.)
    - _Requirements: 10.4_
  
  - [ ]* 11.4 Write property test for user-friendly errors
    - **Property 14: User-friendly error messages**
    - **Validates: Requirements 10.4**
  
  - [ ]* 11.5 Write property test for error UI actions
    - **Property 15: Error UI actions**
    - **Validates: Requirements 10.5**

- [ ] 12. Add responsive design and styling
  - [ ] 12.1 Configure MUI responsive breakpoints
    - Update theme.js with custom breakpoints if needed
    - Test components on different screen sizes
    - _Requirements: 7.1_
  
  - [ ] 12.2 Make FundList responsive
    - Add horizontal scrolling for table on mobile
    - Adjust column visibility based on screen size
    - _Requirements: 7.1, 7.3_
  
  - [ ] 12.3 Make FundDetail responsive
    - Use MUI Grid for responsive layout
    - Stack sections vertically on mobile
    - _Requirements: 7.1_

- [ ] 13. Add utility functions and formatters
  - [ ] 13.1 Create backend formatters
    - Implement `server/utils/formatters.js`
    - Add function to format decimals to 2 places
    - Add function to format percentages
    - _Requirements: 2.3, 4.4_
  
  - [ ] 13.2 Create frontend formatters
    - Implement `client/src/utils/formatters.js`
    - Add currency formatter
    - Add percentage formatter
    - Add date formatter
    - _Requirements: 2.3, 4.4_
  
  - [ ]* 13.3 Write property test for performance metric formatting
    - **Property 6: Performance metric formatting**
    - **Validates: Requirements 4.4**

- [ ] 14. Final integration and testing
  - [ ] 14.1 Create environment configuration files
    - Create `.env.example` for both client and server
    - Document required environment variables
    - Add instructions to README
    - _Requirements: 9.1_
  
  - [ ] 14.2 Test complete user flows
    - Test searching and filtering funds
    - Test viewing fund details
    - Test error scenarios
    - Test responsive behavior
    - _Requirements: All_
  
  - [ ] 14.3 Update README with setup instructions
    - Add installation steps
    - Add database connection setup
    - Add how to run client and server
    - Add API endpoint documentation
    - _Requirements: All_

- [ ] 15. Final checkpoint
  - Ensure all tests pass
  - Verify application runs correctly
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation focuses on establishing patterns and structure
- You'll extend these patterns with your specific complex queries and additional features
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The backend uses JavaScript (Node.js) and frontend uses JavaScript (React)
