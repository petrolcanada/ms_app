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
    description: 'For individual investors getting started.',
    features: [
      'Limited screener (25 results)',
      '5 watchlist slots',
      'Basic fund detail',
      'Compare up to 2 funds',
      'Dashboard overview',
    ],
    cta: 'Get Started',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For serious investors and analysts.',
    features: [
      'Unlimited screener access',
      'Unlimited watchlist',
      'Full 8 data domains',
      'Compare 4+ funds',
      'CSV export',
      'Historical analysis',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: null,
    highlighted: true,
  },
];

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
      const res = await checkoutService.createSession();
      window.location.href = res.data.url;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err.message || '';
      if (msg.includes('not configured')) {
        setCheckoutError('Payments are not yet configured. Please contact support.');
      } else {
        setCheckoutError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ background: 'var(--bg-void)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <SEO
        title="Pricing"
        description="Simple, transparent pricing for FundLens. Start free, upgrade to Pro for unlimited access."
        path="/pricing"
      />
      <Box
        sx={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, var(--emerald), var(--blue), transparent)',
          opacity: 0.5,
        }}
      />

      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--glass-nav)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--text-1)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: 'var(--emerald)', fontSize: '20px' }}>&#9670;</span>
            FundLens
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <Box
                component={Link}
                to="/dashboard"
                sx={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-2)',
                  textDecoration: 'none',
                  padding: '7px 18px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  transition: 'all var(--transition)',
                  '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
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
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-2)',
                    textDecoration: 'none',
                    padding: '7px 18px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    transition: 'all var(--transition)',
                    '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
                  }}
                >
                  Log in
                </Box>
                <Box
                  component={Link}
                  to="/signup"
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '7px 20px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--emerald)',
                    transition: 'opacity var(--transition)',
                    '&:hover': { opacity: 0.88 },
                  }}
                >
                  Get Started
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          px: { xs: '16px', sm: '24px', md: '32px' },
          pt: { xs: '48px', md: '80px' },
          pb: '80px',
        }}
      >
        <Box
          component="h1"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: { xs: '30px', md: '42px' },
            fontWeight: 700,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            color: 'var(--text-1)',
            mb: '12px',
          }}
        >
          Simple, transparent pricing
        </Box>
        <Box
          sx={{
            fontSize: '15px',
            color: 'var(--text-3)',
            textAlign: 'center',
            mb: { xs: '40px', md: '56px' },
          }}
        >
          Start free. Upgrade when you need more power.
        </Box>

        {checkoutError && (
          <Box
            sx={{
              background: 'var(--red-soft)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              fontSize: '13px',
              color: 'var(--red)',
              textAlign: 'center',
              mb: '24px',
            }}
          >
            {checkoutError}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: '24px',
          }}
        >
          {tiers.map((tier) => (
            <Box
              key={tier.name}
              sx={{
                background: 'var(--bg-surface)',
                border: tier.highlighted ? '1px solid var(--emerald)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                p: { xs: '28px', sm: '36px' },
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: tier.highlighted ? '0 0 48px rgba(16, 185, 129, 0.08)' : 'none',
              }}
            >
              {tier.highlighted && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--emerald)',
                    padding: '3px 14px',
                    borderRadius: 'var(--radius-pill)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </Box>
              )}

              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  mb: '4px',
                }}
              >
                {tier.name}
              </Box>
              <Box sx={{ fontSize: '13px', color: 'var(--text-3)', mb: '24px' }}>
                {tier.description}
              </Box>
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '42px',
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  mb: '28px',
                }}
              >
                {tier.price}
                <Box
                  component="span"
                  sx={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-3)' }}
                >
                  /month
                </Box>
              </Box>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mb: '32px', flex: 1 }}
              >
                {tier.features.map((f) => (
                  <Box
                    key={f}
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>&#10003;</span>
                    {f}
                  </Box>
                ))}
              </Box>

              {tier.ctaLink ? (
                <Box
                  component={Link}
                  to={tier.ctaLink}
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: tier.highlighted ? '#fff' : 'var(--text-1)',
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '12px 0',
                    borderRadius: 'var(--radius)',
                    background: tier.highlighted ? 'var(--emerald)' : 'transparent',
                    border: tier.highlighted ? 'none' : '1px solid var(--border)',
                    transition: 'all var(--transition)',
                    '&:hover': tier.highlighted
                      ? { opacity: 0.88 }
                      : { borderColor: 'var(--border-hover)' },
                  }}
                >
                  {tier.cta}
                </Box>
              ) : (
                <Box
                  component="button"
                  onClick={handleUpgrade}
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center',
                    padding: '12px 0',
                    borderRadius: 'var(--radius)',
                    background: 'var(--emerald)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity var(--transition)',
                    '&:hover': { opacity: 0.88 },
                  }}
                >
                  {user?.plan === 'pro' ? 'Current Plan' : tier.cta}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* FAQ / details */}
        <Box sx={{ mt: '64px', textAlign: 'center' }}>
          <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '16px' }}>
            All plans include access to US and Canadian fund data sourced from Morningstar.
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-4)' }}>
            Questions? Contact us at{' '}
            <Box component="span" sx={{ color: 'var(--text-3)' }}>
              support@fundlens.app
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: '1px solid var(--border)', py: '28px' }}>
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
            &copy; 2026 FundLens. All rights reserved.
          </Box>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <Box
              component={Link}
              to="/terms"
              sx={{
                fontSize: '12px',
                color: 'var(--text-4)',
                textDecoration: 'none',
                '&:hover': { color: 'var(--text-2)' },
              }}
            >
              Terms
            </Box>
            <Box
              component={Link}
              to="/privacy"
              sx={{
                fontSize: '12px',
                color: 'var(--text-4)',
                textDecoration: 'none',
                '&:hover': { color: 'var(--text-2)' },
              }}
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
