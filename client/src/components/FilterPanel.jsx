import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useCategories } from '../hooks/useCategories';

/**
 * FilterPanel Component
 * Provides dropdown filters for fund type and category
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter values { type: string, category: string }
 * @param {function} props.onFilterChange - Callback function called when filters change
 */
const FilterPanel = ({ filters, onFilterChange }) => {
  // Fetch categories from API with automatic fallback to defaults
  const { data: categories = [], isLoading } = useCategories();
  const handleTypeChange = (event) => {
    onFilterChange({
      ...filters,
      type: event.target.value,
    });
  };

  const handleCategoryChange = (event) => {
    onFilterChange({
      ...filters,
      category: event.target.value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      type: '',
      category: '',
    });
  };

  const hasActiveFilters = filters.type || filters.category;

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="type-filter-label">Fund Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={filters.type || ''}
              onChange={handleTypeChange}
              label="Fund Type"
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              <MenuItem value="Mutual Fund">Mutual Fund</MenuItem>
              <MenuItem value="ETF">ETF</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={filters.category || ''}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {hasActiveFilters && (
          <Grid item xs={12} sm={4} md={2}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        )}

        <Grid item xs={12} sm={12} md="auto">
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <FilterListIcon sx={{ mr: 0.5, fontSize: 20 }} />
            {hasActiveFilters ? (
              <span style={{ fontSize: '0.875rem' }}>
                {[filters.type, filters.category].filter(Boolean).length} filter(s) active
              </span>
            ) : (
              <span style={{ fontSize: '0.875rem' }}>No filters applied</span>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterPanel;
