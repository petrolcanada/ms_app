import React from 'react';
import Box from '@mui/material/Box';

const SIGNAL_CONFIG = {
  strong: {
    label: 'Strong',
    color: 'var(--emerald)',
    bg: 'var(--emerald-soft)',
    glow: true,
  },
  buy: {
    label: 'Buy',
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.10)',
    glow: false,
  },
  hold: {
    label: 'Hold',
    color: 'var(--blue)',
    bg: 'var(--blue-soft)',
    glow: false,
  },
  weak: {
    label: 'Weak',
    color: 'var(--amber)',
    bg: 'var(--amber-soft)',
    glow: false,
  },
  avoid: {
    label: 'Avoid',
    color: 'var(--red)',
    bg: 'var(--red-soft)',
    glow: false,
  },
};

const SignalBadge = ({ signal, size = 'small' }) => {
  const key = (signal || '').toLowerCase();
  const config = SIGNAL_CONFIG[key];
  if (!config) return null;

  const isLarge = size === 'large';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLarge ? '8px' : '6px',
        fontSize: isLarge ? '12px' : '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: isLarge ? '6px 14px' : '4px 10px',
        borderRadius: 'var(--radius-pill)',
        color: config.color,
        background: config.bg,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: isLarge ? '8px' : '6px',
          height: isLarge ? '8px' : '6px',
          borderRadius: '50%',
          background: config.color,
          boxShadow: config.glow ? `0 0 ${isLarge ? '8px' : '6px'} ${config.color}` : 'none',
          flexShrink: 0,
        }}
      />
      {config.label}
    </Box>
  );
};

export default SignalBadge;
