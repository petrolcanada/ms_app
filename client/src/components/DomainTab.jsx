import React from 'react';
import Box from '@mui/material/Box';

const DomainCard = ({ title, children, fullWidth = false }) => (
  <Box
    sx={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      transition: 'border-color var(--transition)',
      gridColumn: fullWidth ? '1 / -1' : 'auto',
      '&:hover': { borderColor: 'var(--border-hover)' },
    }}
  >
    {title && (
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-2)',
          letterSpacing: '-0.01em',
          mb: '20px',
        }}
      >
        {title}
      </Box>
    )}
    {children}
  </Box>
);

const DomainGrid = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px' }}>
    {children}
  </Box>
);

export { DomainCard, DomainGrid };
