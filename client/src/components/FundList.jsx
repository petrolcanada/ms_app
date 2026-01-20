import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Typography,
  Chip,
} from '@mui/material';
import { useFunds } from '../hooks/useFunds';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';

/**
 * FundList Component
 * Displays a paginated table of funds with loading and error states
 * Shows columns: name, ticker, type, category, MER, rank
 * Includes search and filter functionality
 */
const FundList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); // MUI TablePagination uses 0-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
  });

  // Fetch funds data using custom hook (API uses 1-based page indexing)
  const { data, isLoading, isFetching, isError, error } = useFunds({
    page: page + 1, // Convert to 1-based for API
    limit: rowsPerPage,
    search: searchTerm,
    type: filters.type,
    category: filters.category,
  });

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(0); // Reset to first page when searching
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  }, []);

  const handleFundClick = useCallback((fundId) => {
    navigate(`/funds/${fundId}`);
  }, [navigate]);

  const funds = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        Funds List
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by fund name, ticker, or legal name..."
        />
      </Box>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Error state */}
      {isError && (
        <Box sx={{ my: 2 }}>
          <Alert severity="error">
            <Typography variant="body1" fontWeight="bold">
              Error loading funds
            </Typography>
            <Typography variant="body2">
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Loading state - show spinner overlay without unmounting components */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Table - only show when not loading */}
      {!isLoading && (
        <Paper sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
          {/* Background fetching indicator */}
          {isFetching && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: 'primary.main',
                zIndex: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.4 },
                  '50%': { opacity: 1 },
                },
              }}
            />
          )}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="funds table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Ticker</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Inception Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Domicile</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No funds found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                funds.map((fund) => (
                  <TableRow
                    key={fund._id}
                    hover
                    onClick={() => handleFundClick(fund._id)}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {fund.fundname || fund._name || 'N/A'}
                      </Typography>
                      {fund.legalname && fund.legalname !== fund.fundname && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {fund.legalname}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {fund.ticker || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fund.securitytype || fund.legalstructure || 'N/A'}
                        size="small"
                        color={fund.securitytype === 'ETF' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {fund.categoryname || fund.globalcategoryname || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fund.inceptiondate
                          ? new Date(fund.inceptiondate).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fund.domicile || 'N/A'}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      )}
    </Box>
  );
};

export default FundList;
