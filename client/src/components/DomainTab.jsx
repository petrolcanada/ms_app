import React from 'react';
import Box from '@mui/material/Box';
import AppCard from './ui/AppCard';
import { designTokens } from '../design/tokens';

const { cssVars } = designTokens;

const DomainCard = ({ title, children, fullWidth = false }) => (
  <AppCard
    title={title}
    fullWidth={fullWidth}
    variant="surface"
    sx={{
      padding: '24px',
      transition: 'border-color var(--transition)',
      '&:hover': { borderColor: cssVars.color.borderHover },
    }}
  >
    {children}
  </AppCard>
);

const DomainGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
      gap: '16px',
    }}
  >
    {children}
  </Box>
);

export { DomainCard, DomainGrid };
