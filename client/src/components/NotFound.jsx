import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SEO from './SEO';

const NotFound = () => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: '16px',
      textAlign: 'center',
    }}
  >
    <SEO title="Page Not Found" noIndex />

    <Box
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: { xs: '100px', md: '140px' },
        fontWeight: 800,
        color: 'var(--accent)',
        opacity: 0.18,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        userSelect: 'none',
      }}
    >
      404
    </Box>

    <Box
      component="h1"
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: { xs: '22px', md: '28px' },
        fontWeight: 600,
        color: 'var(--text-1)',
        mt: '-12px',
        mb: '12px',
      }}
    >
      Page not found
    </Box>

    <Box
      sx={{
        fontSize: '14px',
        color: 'var(--text-3)',
        maxWidth: '400px',
        lineHeight: 1.6,
        mb: '32px',
      }}
    >
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </Box>

    <Box
      component={Link}
      to="/"
      sx={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
        textDecoration: 'none',
        padding: '11px 28px',
        borderRadius: 'var(--radius)',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
        transition: 'opacity var(--transition)',
        '&:hover': { opacity: 0.88 },
      }}
    >
      Back to Home
    </Box>
  </Box>
);

export default NotFound;
