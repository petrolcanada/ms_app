import React from 'react';
import Box from '@mui/material/Box';

const PerfBar = ({ label, value, percentage, labelWidth = '60px' }) => {
  const isPositive = percentage >= 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '12px' }}>
      <Box
        sx={{
          fontSize: '12px',
          color: 'var(--text-3)',
          width: labelWidth,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          flex: 1,
          height: '24px',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${Math.min(Math.abs(percentage), 100)}%`,
            borderRadius: '4px',
            background: isPositive
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.3), var(--emerald))'
              : 'linear-gradient(90deg, var(--red), rgba(239, 68, 68, 0.3))',
            transition: 'width 800ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </Box>
      <Box
        sx={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
          width: '65px',
          textAlign: 'right',
          flexShrink: 0,
          color: isPositive ? 'var(--emerald)' : 'var(--red)',
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

export default PerfBar;
