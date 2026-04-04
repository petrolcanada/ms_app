import React from 'react';
import Box from '@mui/material/Box';
import { useCategories } from '../hooks/useCategories';

const selectStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-2)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  padding: '10px 16px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 180ms ease',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23475569' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
  whiteSpace: 'nowrap',
};

const FilterPanel = ({ filters, onFilterChange }) => {
  const { data: categories = [] } = useCategories();

  const handleTypeChange = (e) => {
    onFilterChange({ ...filters, type: e.target.value });
  };

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  return (
    <>
      <Box
        component="select"
        value={filters.type || ''}
        onChange={handleTypeChange}
        sx={{
          ...selectStyle,
          '&:hover': { borderColor: 'var(--border-hover)', background: 'var(--bg-surface-hover)', color: 'var(--text-1)' },
        }}
      >
        <option value="">All Types</option>
        <option value="Mutual Fund">Mutual Fund</option>
        <option value="ETF">ETF</option>
      </Box>
      <Box
        component="select"
        value={filters.category || ''}
        onChange={handleCategoryChange}
        sx={{
          ...selectStyle,
          '&:hover': { borderColor: 'var(--border-hover)', background: 'var(--bg-surface-hover)', color: 'var(--text-1)' },
        }}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Box>
    </>
  );
};

export default FilterPanel;
