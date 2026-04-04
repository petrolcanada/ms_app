import React from 'react';
import Box from '@mui/material/Box';

const KpiCard = ({ label, value, sub, valueColor, delay = 0 }) => {
  return (
    <Box
      sx={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        transition: 'border-color var(--transition), transform var(--transition)',
        animation: 'slideUp 500ms ease both',
        animationDelay: `${delay}ms`,
        '&:hover': {
          borderColor: 'var(--border-hover)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: '8px',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          fontFamily: 'var(--font-mono)',
          fontSize: '24px',
          fontWeight: 500,
          color: valueColor || 'var(--text-1)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Box>
      {sub && (
        <Box sx={{ fontSize: '11px', color: 'var(--text-3)', mt: '6px' }}>
          {sub}
        </Box>
      )}
    </Box>
  );
};

export default KpiCard;
