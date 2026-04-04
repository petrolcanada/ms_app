import React from 'react';
import Box from '@mui/material/Box';

const StatCard = ({ label, value, change, changeDirection, valueColor }) => {
  return (
    <Box
      sx={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--transition), transform var(--transition)',
        '&:hover': {
          borderColor: 'var(--border-hover)',
          transform: 'translateY(-1px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--emerald), transparent)',
          opacity: 0,
          transition: 'opacity var(--transition)',
        },
        '&:hover::before': {
          opacity: 0.6,
        },
      }}
    >
      <Box
        sx={{
          fontSize: '12px',
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
          fontSize: '28px',
          fontWeight: 500,
          color: valueColor || 'var(--text-1)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </Box>
      {change && (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            mt: '8px',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            color: changeDirection === 'up' ? 'var(--emerald)' : 'var(--red)',
            background: changeDirection === 'up' ? 'var(--emerald-soft)' : 'var(--red-soft)',
          }}
        >
          {changeDirection === 'up' ? '\u2191' : '\u2193'} {change}
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
