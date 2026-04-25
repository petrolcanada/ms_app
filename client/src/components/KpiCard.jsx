import React from 'react';
import Box from '@mui/material/Box';
import { designTokens } from '../design/tokens';
import AppCard from './ui/AppCard';

const { cssVars, typography } = designTokens;

const KpiCard = ({ label, value, sub, valueColor, delay = 0 }) => {
  return (
    <AppCard
      variant="surface"
      sx={{
        padding: '20px',
        transition: 'border-color var(--transition), transform var(--transition)',
        animation: 'slideUp 500ms ease both',
        animationDelay: `${delay}ms`,
        '&:hover': {
          borderColor: cssVars.color.borderHover,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          fontSize: '11px',
          fontWeight: 500,
          color: cssVars.color.textSubtle,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          mb: '8px',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          ...typography.metricValue,
          color: valueColor || 'var(--text-1)',
        }}
      >
        {value}
      </Box>
      {sub && (
        <Box sx={{ fontSize: '11px', color: cssVars.color.textSubtle, mt: '6px' }}>{sub}</Box>
      )}
    </AppCard>
  );
};

export default KpiCard;
