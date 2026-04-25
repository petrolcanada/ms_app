import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import AppCard from '../ui/AppCard';
import { designTokens } from '../../design/tokens';

const { cssVars } = designTokens;

export const ChartCard = ({ title, children, sx }) => (
  <AppCard
    title={title}
    variant="surface"
    sx={{
      padding: '20px',
      mb: '16px',
      ...sx,
    }}
  >
    {children}
  </AppCard>
);

export const ChartLoading = () => (
  <AppCard
    variant="surface"
    sx={{
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
    }}
  >
    <CircularProgress size={28} sx={{ color: cssVars.color.positive }} />
  </AppCard>
);

export const ChartEmpty = ({ label }) => (
  <AppCard
    variant="surface"
    sx={{
      padding: '40px 20px',
      textAlign: 'center',
      color: cssVars.color.textDisabled,
      fontSize: '13px',
    }}
  >
    {label}
  </AppCard>
);

export default ChartCard;
