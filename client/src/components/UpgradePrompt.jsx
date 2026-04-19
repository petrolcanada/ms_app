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
          border: '1px solid rgba(244, 184, 96, 0.24)',
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
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            whiteSpace: 'nowrap',
            boxShadow: '0 14px 28px rgba(111, 76, 245, 0.22)',
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
        background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
        boxShadow: '0 22px 46px rgba(111, 76, 245, 0.2)',
      }}
    >
      <Box
        sx={{
          background: 'var(--bg-surface)',
          borderRadius: '19px',
          p: { xs: '24px', sm: '32px' },
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--accent-soft)',
            color: 'var(--accent-strong)',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            mb: '14px',
          }}
        >
          PRO
        </Box>

        <Box
          component="h3"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-1)',
            mb: '10px',
          }}
        >
          Unlock {feature}
        </Box>

        <Box
          sx={{
            fontSize: '14px',
            color: 'var(--text-3)',
            lineHeight: 1.7,
            maxWidth: '420px',
            mx: 'auto',
            mb: '24px',
          }}
        >
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
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 18px 34px rgba(111, 76, 245, 0.22)',
          }}
        >
          Upgrade to Pro
        </Box>
      </Box>
    </Box>
  );
};

export default UpgradePrompt;
