import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';

const UpgradePrompt = ({ feature, limit, compact = false }) => {
  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--amber-soft)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius)',
          padding: '10px 16px',
        }}
      >
        <Box sx={{ fontSize: '13px', color: 'var(--amber)', fontWeight: 500 }}>
          {limit != null
            ? `You've reached the limit of ${limit}. Upgrade to Pro for unlimited ${feature}.`
            : `Upgrade to Pro for unlimited ${feature}.`}
        </Box>
        <Box
          component={Link}
          to="/pricing"
          sx={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            background: 'var(--amber)',
            padding: '5px 14px',
            borderRadius: 'var(--radius)',
            whiteSpace: 'nowrap',
            transition: 'opacity var(--transition)',
            '&:hover': { opacity: 0.88 },
          }}
        >
          Upgrade
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: '1px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--emerald), var(--blue))',
      }}
    >
      <Box
        sx={{
          background: 'var(--bg-surface)',
          borderRadius: '11px',
          p: { xs: '24px', sm: '32px' },
          textAlign: 'center',
        }}
      >
        <Box sx={{ fontSize: '32px', mb: '14px' }}>🔓</Box>

        <Box
          component="h3"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-1)',
            mb: '10px',
          }}
        >
          Unlock {feature}
        </Box>

        <Box sx={{ fontSize: '14px', color: 'var(--text-3)', lineHeight: 1.6, maxWidth: '400px', mx: 'auto', mb: '24px' }}>
          {limit != null
            ? `You've used ${limit} of your free allowance. Upgrade to Pro to unlock unlimited ${feature} and more.`
            : `This feature is available on the Pro plan. Upgrade to unlock full access to ${feature} and more.`}
        </Box>

        <Box
          component={Link}
          to="/pricing"
          sx={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            display: 'inline-block',
            padding: '11px 32px',
            borderRadius: 'var(--radius)',
            background: 'var(--emerald)',
            transition: 'opacity var(--transition)',
            '&:hover': { opacity: 0.88 },
          }}
        >
          Upgrade to Pro
        </Box>
      </Box>
    </Box>
  );
};

export default UpgradePrompt;
