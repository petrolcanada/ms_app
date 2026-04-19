import React from 'react';
import Box from '@mui/material/Box';

const StatCard = ({ label, value, change, changeDirection, valueColor }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-panel)',
        transition:
          'border-color var(--transition), transform var(--transition), box-shadow var(--transition)',
        '&:hover': {
          borderColor: 'var(--border-hover)',
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-strong)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          opacity: 0.7,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '-40% auto auto 60%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(111, 76, 245, 0.12)',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mb: '12px',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: { xs: '28px', md: '32px' },
          fontWeight: 800,
          color: valueColor || 'var(--text-1)',
          letterSpacing: '-0.05em',
          lineHeight: 1.1,
          position: 'relative',
          zIndex: 1,
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
            mt: '10px',
            padding: '4px 9px',
            borderRadius: 'var(--radius-pill)',
            color: changeDirection === 'up' ? 'var(--emerald)' : 'var(--red)',
            background: changeDirection === 'up' ? 'var(--emerald-soft)' : 'var(--red-soft)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {changeDirection === 'up' ? '\u2191' : '\u2193'} {change}
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
