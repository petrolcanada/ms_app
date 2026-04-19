import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api';
import SEO from './SEO';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For investors who want a clearer entry point into the research workflow.',
    features: [
      'Explorer access',
      'Basic screening',
      '2-fund compare',
      '5 watchlist slots',
      'Dashboard overview',
    ],
    cta: 'Create account',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For analysts who want the full desk without visual clutter.',
    features: [
      'Unlimited screener',
      'Unlimited watchlist',
      'Full 8 data domains',
      '4+ fund compare',
      'CSV export',
      'Historical analysis',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: null,
    highlighted: true,
  },
];

const BrandMark = ({ size = 24 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: `${Math.round(size * 0.3)}px`,
      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
      boxShadow: '0 14px 34px rgba(111, 76, 245, 0.24)',
      position: 'relative',
      flexShrink: 0,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: `${Math.max(5, Math.round(size * 0.26))}px`,
        borderRadius: `${Math.round(size * 0.18)}px`,
        border: '1.5px solid rgba(255,255,255,0.84)',
      },
    }}
  />
);

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = React.useState('');

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setCheckoutError('');
    try {
      const response = await checkoutService.createSession();
      window.location.href = response.data.url;
    } catch (error) {
      const message = error?.response?.data?.error?.message || error.message || '';
      if (message.includes('not configured')) {
        setCheckoutError('Payments are not configured yet. Contact support to enable checkout.');
      } else {
        setCheckoutError('Something went wrong while opening checkout. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', color: 'var(--text-1)' }}>
      <SEO
        title="Pricing"
        description="Simple, transparent pricing for FundLens. Start free, upgrade when you need the full research desk."
        path="/pricing"
      />

      <Box
        sx={{
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(111, 76, 245, 0.8) 50%, transparent 100%)',
        }}
      />

      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--glass-nav)',
          backdropFilter: 'blur(22px) saturate(1.25)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.25)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box
          sx={{
            maxWidth: '1240px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            minHeight: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--text-1)',
            }}
          >
            <BrandMark />
            <Box>
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontWeight: 800,
                  fontSize: '18px',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                FundLens
              </Box>
              <Box sx={{ fontSize: '10px', color: 'var(--text-4)', letterSpacing: '0.08em' }}>
                RESEARCH DESK
              </Box>
            </Box>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <Box
                component={Link}
                to="/dashboard"
                sx={{
                  px: '16px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                Dashboard
              </Box>
            ) : (
              <>
                <Box
                  component={Link}
                  to="/login"
                  sx={{
                    px: '16px',
                    py: '10px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-2)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  Log in
                </Box>
                <Box
                  component={Link}
                  to="/signup"
                  sx={{
                    px: '18px',
                    py: '10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    boxShadow: '0 16px 32px rgba(111, 76, 245, 0.24)',
                  }}
                >
                  Start free
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: '1100px',
          mx: 'auto',
          px: { xs: '16px', sm: '24px', md: '32px' },
          pt: { xs: '52px', md: '86px' },
          pb: '88px',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: '34px' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              px: '14px',
              py: '8px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-2)',
              fontSize: '12px',
              fontWeight: 600,
              mb: '18px',
            }}
          >
            <BrandMark size={18} />
            Professional pricing
          </Box>

          <Box
            component="h1"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '36px', md: '58px' },
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 0.98,
              maxWidth: '760px',
              mx: 'auto',
              mb: '16px',
            }}
          >
            One clean interface. Two simple plans.
          </Box>

          <Box sx={{ fontSize: '16px', color: 'var(--text-3)', maxWidth: '640px', mx: 'auto' }}>
            The visual refresh does not complicate the business model. Start with the essentials,
            then unlock the full research desk when you need more depth.
          </Box>
        </Box>

        {checkoutError && (
          <Box
            sx={{
              background: 'var(--red-soft)',
              border: '1px solid rgba(224, 72, 99, 0.24)',
              borderRadius: '18px',
              px: '18px',
              py: '14px',
              fontSize: '13px',
              color: 'var(--red)',
              textAlign: 'center',
              mb: '22px',
            }}
          >
            {checkoutError}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: '18px',
          }}
        >
          {tiers.map((tier) => (
            <Box
              key={tier.name}
              sx={{
                p: { xs: '26px', sm: '30px' },
                borderRadius: '26px',
                border: tier.highlighted
                  ? '1px solid var(--accent-ring)'
                  : '1px solid var(--border)',
                background: tier.highlighted
                  ? 'linear-gradient(180deg, var(--accent-soft), rgba(255,255,255,0.03))'
                  : 'rgba(255,255,255,0.03)',
                boxShadow: 'var(--shadow-panel)',
              }}
            >
              <Box sx={{ fontSize: '12px', color: 'var(--text-4)', mb: '8px' }}>
                {tier.highlighted ? 'Recommended for active research' : 'Starter plan'}
              </Box>

              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '32px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  mb: '6px',
                }}
              >
                {tier.name}
              </Box>

              <Box sx={{ color: 'var(--text-3)', mb: '18px', minHeight: { md: '42px' } }}>
                {tier.description}
              </Box>

              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '48px',
                  fontWeight: 800,
                  letterSpacing: '-0.06em',
                  mb: '22px',
                }}
              >
                {tier.price}
                <Box
                  component="span"
                  sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-4)' }}
                >
                  /month
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gap: '11px', mb: '26px' }}>
                {tier.features.map((feature) => (
                  <Box
                    key={feature}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-2)',
                      fontSize: '13px',
                    }}
                  >
                    <Box
                      sx={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: tier.highlighted ? 'var(--accent-strong)' : 'var(--emerald)',
                      }}
                    />
                    {feature}
                  </Box>
                ))}
              </Box>

              {tier.ctaLink ? (
                <Box
                  component={Link}
                  to={tier.ctaLink}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    px: '18px',
                    py: '13px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-1)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {tier.cta}
                </Box>
              ) : (
                <Box
                  component="button"
                  onClick={handleUpgrade}
                  sx={{
                    width: '100%',
                    px: '18px',
                    py: '13px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 18px 34px rgba(111, 76, 245, 0.24)',
                  }}
                >
                  {user?.plan === 'pro' ? 'Current plan' : tier.cta}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: '30px',
            p: '18px 20px',
            borderRadius: '22px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.03)',
            display: 'grid',
            gap: '6px',
            textAlign: 'center',
          }}
        >
          <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
            All plans include US and Canadian fund data sourced from Morningstar.
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-4)' }}>
            Questions about access or billing?{' '}
            <Box component="span" sx={{ color: 'var(--accent-strong)' }}>
              support@fundlens.app
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid var(--border)', py: '24px' }}>
        <Box
          sx={{
            maxWidth: '1240px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: '14px',
          }}
        >
          <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
            Copyright 2026 FundLens. All rights reserved.
          </Box>
          <Box sx={{ display: 'flex', gap: '18px' }}>
            <Box
              component={Link}
              to="/terms"
              sx={{ fontSize: '12px', color: 'var(--text-4)', textDecoration: 'none' }}
            >
              Terms
            </Box>
            <Box
              component={Link}
              to="/privacy"
              sx={{ fontSize: '12px', color: 'var(--text-4)', textDecoration: 'none' }}
            >
              Privacy
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Pricing;
