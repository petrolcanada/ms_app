import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SEO from './SEO';

const fadeKeyframes = `
@keyframes landingFadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

const AnimatedSection = ({ children, sx, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationPlayState = 'running';
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        animation: 'landingFadeUp 700ms ease both',
        animationPlayState: 'paused',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

const featureCards = [
  {
    icon: '🔍',
    title: 'Fund Explorer',
    desc: 'Browse and search across thousands of mutual funds and ETFs with advanced filtering.',
  },
  {
    icon: '📊',
    title: 'Smart Screener',
    desc: 'Rank funds by returns, fees, ratings, risk metrics, and more with customizable criteria.',
  },
  {
    icon: '⚖️',
    title: 'Side-by-Side Compare',
    desc: 'Compare up to 4 funds across all data domains in a unified view.',
  },
  {
    icon: '📈',
    title: 'Historical Analysis',
    desc: 'Track performance, flows, and assets over time with interactive charts.',
  },
  {
    icon: '🗂️',
    title: '8 Data Domains',
    desc: 'Deep dive into basic info, performance, rankings, fees, ratings, risk, flows, and assets.',
  },
  {
    icon: '⭐',
    title: 'Watchlist',
    desc: 'Save and track your favorite funds with personalized alerts.',
  },
];

const LandingPage = () => {
  return (
    <>
      <SEO path="/" />
      <style>{fadeKeyframes}</style>

      <Box sx={{ background: 'var(--bg-void)', minHeight: '100vh', color: 'var(--text-1)' }}>
        {/* ── Accent line ── */}
        <Box
          sx={{
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, var(--emerald), var(--blue), transparent)',
            opacity: 0.5,
          }}
        />

        {/* ── Navbar ── */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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

              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  gap: '8px',
                }}
              >
                <Box
                  component="a"
                  href="#features"
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius)',
                    transition: 'color var(--transition)',
                    '&:hover': { color: 'var(--text-1)' },
                  }}
                >
                  Features
                </Box>
                <Box
                  component="a"
                  href="#pricing"
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius)',
                    transition: 'color var(--transition)',
                    '&:hover': { color: 'var(--text-1)' },
                  }}
                >
                  Pricing
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            </Box>
          </Box>
        </Box>

        {/* ── Hero ── */}
        <AnimatedSection
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            pt: { xs: '64px', md: '100px' },
            pb: { xs: '48px', md: '72px' },
            textAlign: 'center',
          }}
        >
          <Box
            component="h1"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '36px', sm: '48px', md: '56px' },
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--text-1)',
              mb: '20px',
            }}
          >
            See Through Every Fund
          </Box>

          <Box
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: { xs: '15px', md: '17px' },
              color: 'var(--text-3)',
              maxWidth: '640px',
              mx: 'auto',
              lineHeight: 1.7,
              mb: '36px',
            }}
          >
            Powerful analytics for mutual funds and ETFs across US and Canadian markets. Screen,
            compare, and analyze with institutional-grade data.
          </Box>

          <Box sx={{ display: 'flex', gap: '14px', justifyContent: 'center', mb: '56px' }}>
            <Box
              component={Link}
              to="/signup"
              sx={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                padding: '11px 28px',
                borderRadius: 'var(--radius)',
                background: 'var(--emerald)',
                transition: 'opacity var(--transition)',
                '&:hover': { opacity: 0.88 },
              }}
            >
              Start Free
            </Box>
            <Box
              component="a"
              href="#pricing"
              sx={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-2)',
                textDecoration: 'none',
                padding: '11px 28px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                transition: 'all var(--transition)',
                '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
              }}
            >
              View Pricing
            </Box>
          </Box>

          {/* Dashboard preview */}
          <Box
            sx={{
              maxWidth: '820px',
              mx: 'auto',
              p: '1px',
              borderRadius: 'var(--radius-lg)',
              background:
                'linear-gradient(135deg, var(--emerald) 0%, var(--blue) 50%, var(--emerald) 100%)',
              opacity: 0.92,
            }}
          >
            <Box
              sx={{
                background: 'var(--bg-base)',
                borderRadius: '11px',
                p: { xs: '20px', md: '32px' },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: '16px',
                }}
              >
                {[
                  { label: 'Funds Covered', value: '12,400+', color: 'var(--emerald)' },
                  { label: 'Data Domains', value: '8', color: 'var(--blue)' },
                  { label: 'Real-time Screener', value: '✓', color: 'var(--emerald)' },
                  { label: 'Side-by-Side Compare', value: '✓', color: 'var(--blue)' },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      p: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        fontFamily: 'var(--font-head)',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: item.color,
                        mb: '4px',
                      }}
                    >
                      {item.value}
                    </Box>
                    <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>{item.label}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </AnimatedSection>

        {/* ── Features ── */}
        <AnimatedSection
          id="features"
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            py: { xs: '56px', md: '88px' },
          }}
        >
          <Box
            component="h2"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '26px', md: '34px' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              color: 'var(--text-1)',
              mb: '48px',
            }}
          >
            Everything you need to analyze funds
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: '20px',
            }}
          >
            {featureCards.map((f) => (
              <Box
                key={f.title}
                sx={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  p: '28px',
                  transition: 'all 250ms ease',
                  '&:hover': {
                    borderColor: 'var(--emerald)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ fontSize: '28px', mb: '14px' }}>{f.icon}</Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    mb: '8px',
                  }}
                >
                  {f.title}
                </Box>
                <Box sx={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text-3)' }}>
                  {f.desc}
                </Box>
              </Box>
            ))}
          </Box>
        </AnimatedSection>

        {/* ── Pricing ── */}
        <AnimatedSection
          id="pricing"
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            py: { xs: '56px', md: '88px' },
          }}
        >
          <Box
            component="h2"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '26px', md: '34px' },
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
              fontSize: '14px',
              color: 'var(--text-3)',
              textAlign: 'center',
              mb: '48px',
            }}
          >
            Start free, upgrade when you need more.
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: '24px',
              maxWidth: '760px',
              mx: 'auto',
            }}
          >
            {/* Free */}
            <Box
              sx={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                p: '32px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  mb: '4px',
                }}
              >
                Free
              </Box>
              <Box sx={{ fontSize: '13px', color: 'var(--text-3)', mb: '20px' }}>
                For individual investors getting started.
              </Box>
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '36px',
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  mb: '24px',
                }}
              >
                $0
                <Box
                  component="span"
                  sx={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-3)' }}
                >
                  /month
                </Box>
              </Box>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '28px', flex: 1 }}
              >
                {[
                  'Limited screener access',
                  '5 watchlist slots',
                  'Basic fund detail',
                  'Compare up to 2 funds',
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ color: 'var(--emerald)' }}>✓</span>
                    {item}
                  </Box>
                ))}
              </Box>
              <Box
                component={Link}
                to="/signup"
                sx={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '11px 0',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  transition: 'all var(--transition)',
                  '&:hover': { borderColor: 'var(--border-hover)' },
                }}
              >
                Get Started
              </Box>
            </Box>

            {/* Pro */}
            <Box
              sx={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--emerald)',
                borderRadius: 'var(--radius-lg)',
                p: '32px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.08)',
              }}
            >
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
                Popular
              </Box>
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  mb: '4px',
                }}
              >
                Pro
              </Box>
              <Box sx={{ fontSize: '13px', color: 'var(--text-3)', mb: '20px' }}>
                For serious investors and analysts.
              </Box>
              <Box
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '36px',
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  mb: '24px',
                }}
              >
                $19
                <Box
                  component="span"
                  sx={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-3)' }}
                >
                  /month
                </Box>
              </Box>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mb: '28px', flex: 1 }}
              >
                {[
                  'Unlimited screener access',
                  'Unlimited watchlist',
                  'Full data domains',
                  'Compare 4+ funds',
                  'CSV export',
                  'Priority support',
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{ color: 'var(--emerald)' }}>✓</span>
                    {item}
                  </Box>
                ))}
              </Box>
              <Box
                component={Link}
                to="/signup"
                sx={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '11px 0',
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
        </AnimatedSection>

        {/* ── Footer ── */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid var(--border)',
            mt: '40px',
          }}
        >
          <Box
            sx={{
              maxWidth: '1200px',
              mx: 'auto',
              px: { xs: '16px', sm: '24px', md: '32px' },
              py: '40px',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <Box>
              <Link
                to="/"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--text-1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: 'var(--emerald)', fontSize: '18px' }}>&#9670;</span>
                FundLens
              </Link>
              <Box sx={{ fontSize: '12px', color: 'var(--text-4)', mt: '8px' }}>
                Data sourced from Morningstar
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {[
                { label: 'Terms', to: '/terms' },
                { label: 'Privacy', to: '/privacy' },
                { label: 'Pricing', href: '#pricing' },
              ].map((link) =>
                link.to ? (
                  <Box
                    key={link.label}
                    component={Link}
                    to={link.to}
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-3)',
                      textDecoration: 'none',
                      transition: 'color var(--transition)',
                      '&:hover': { color: 'var(--text-1)' },
                    }}
                  >
                    {link.label}
                  </Box>
                ) : (
                  <Box
                    key={link.label}
                    component="a"
                    href={link.href}
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-3)',
                      textDecoration: 'none',
                      transition: 'color var(--transition)',
                      '&:hover': { color: 'var(--text-1)' },
                    }}
                  >
                    {link.label}
                  </Box>
                ),
              )}
            </Box>

            <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
              © 2026 FundLens. All rights reserved.
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LandingPage;
