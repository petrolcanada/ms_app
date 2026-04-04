import React from 'react';
import Box from '@mui/material/Box';

const MetricRow = ({ label, value, valueColor, useBodyFont = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Box component="span" sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: useBodyFont ? 'var(--font-body)' : 'var(--font-mono)',
          fontSize: '13px',
          color: valueColor || 'var(--text-1)',
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

export default MetricRow;
