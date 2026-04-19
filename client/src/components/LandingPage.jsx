import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SEO from './SEO';
import usePublicDashboard from '../hooks/usePublicDashboard';
import usePublicAvailableDates from '../hooks/usePublicAvailableDates';

const fadeKeyframes = `
@keyframes landingFadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const deskModules = [
  {
    title: 'Explorer',
    body: 'Search the full universe quickly, then narrow to the exact mandate, structure, and domicile you need.',
  },
  {
    title: 'Screener',
    body: 'Sort conviction ideas with tighter ranking, cleaner filters, and a surface that reads like a professional desk.',
  },
  {
    title: 'Compare',
    body: 'Keep multiple funds in view at once so fees, performance, flows, and risk signals stay easy to parse.',
  },
];

const RESEARCH_DOMAIN_COUNT = 8;

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'A clean entry point for individual investors.',
    features: ['Explorer access', 'Basic screening', '2-fund compare', '5 watchlist slots'],
    cta: 'Start free',
    to: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'Full desk workflow for serious research.',
    features: [
      'Unlimited screening',
      'Unlimited watchlist',
      'Full data domains',
      'Export and compare',
    ],
    cta: 'See Pro',
    to: '/pricing',
    featured: true,
  },
];

const AnimatedSection = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        animation: 'landingFadeUp 700ms ease both',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

const BrandMark = ({ size = 26 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: `${Math.round(size * 0.3)}px`,
      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
      boxShadow: '0 14px 34px rgba(111, 76, 245, 0.26)',
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

const formatDateLabel = (iso) => {
  if (!iso) return '--';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatReturn = (value) => {
  if (value == null) return '--';
  const number = Number(value);
  return `${number >= 0 ? '+' : ''}${number.toFixed(2)}%`;
};

const formatNumber = (value) => {
  if (value == null) return '--';
  return Number(value).toLocaleString();
};

const formatRating = (value) => {
  if (value == null) return '--';
  return Number(value).toFixed(1);
};

const formatMer = (value) => {
  if (value == null) return '--';
  return `${Number(value).toFixed(2)}%`;
};

const PreviewShell = ({ stats, asOfDate }) => (
  <Box
    sx={{
      position: 'relative',
      background: 'linear-gradient(180deg, #110d1d 0%, #0b0814 100%)',
      borderRadius: '26px',
      border: '1px solid rgba(145, 116, 255, 0.24)',
      boxShadow: '0 34px 90px rgba(7, 6, 13, 0.45)',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <Box sx={{ display: 'flex', gap: '8px' }}>
        {['#FF627A', '#F4B860', '#17C978'].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: dot,
              opacity: 0.9,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        {['Explorer', 'Screen', 'Compare'].map((tab, index) => (
          <Box
            key={tab}
            sx={{
              px: '10px',
              py: '4px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: index === 0 ? '#fff' : 'rgba(255,255,255,0.55)',
              background: index === 0 ? 'rgba(111, 76, 245, 0.18)' : 'transparent',
              border: index === 0 ? '1px solid rgba(145, 116, 255, 0.24)' : '1px solid transparent',
            }}
          >
            {tab}
          </Box>
        ))}
      </Box>
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr) 240px' },
      }}
    >
      <Box
        sx={{
          padding: '18px',
          borderRight: { md: '1px solid rgba(255,255,255,0.06)' },
          borderBottom: { xs: '1px solid rgba(255,255,255,0.06)', md: 'none' },
          display: 'grid',
          gap: '14px',
        }}
      >
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '10px' }}>
            Funds covered
          </Box>
          <Box sx={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>
            {formatNumber(stats?.total_funds)}
          </Box>
          <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>live on the dashboard</Box>
        </Box>
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background: 'rgba(111, 76, 245, 0.12)',
            border: '1px solid rgba(145, 116, 255, 0.16)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '10px' }}>
            Research coverage
          </Box>
          <Box sx={{ fontSize: '13px', fontWeight: 700, color: '#fff', mb: '6px' }}>
            {RESEARCH_DOMAIN_COUNT} live data domains
          </Box>
          <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)' }}>
            Dashboard as of {asOfDate}
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gap: '8px' }}>
          {[
            { label: 'Average rating', value: formatRating(stats?.avg_rating) },
            { label: 'Average MER', value: formatMer(stats?.avg_mer) },
            { label: 'Average 1Y return', value: formatReturn(stats?.avg_return_1yr) },
          ].map((item, index) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '10px 12px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)' }}>{item.label}</Box>
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color:
                    index === 2 && Number(stats?.avg_return_1yr) < 0
                      ? 'var(--red)'
                      : index === 2
                        ? 'var(--emerald)'
                        : '#fff',
                }}
              >
                {item.value}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          padding: '18px',
          borderRight: { md: '1px solid rgba(255,255,255,0.06)' },
          borderBottom: { xs: '1px solid rgba(255,255,255,0.06)', md: 'none' },
        }}
      >
        <Box
          sx={{
            height: '100%',
            minHeight: '280px',
            borderRadius: '22px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
            p: '18px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '18px' }}>
            <Box>
              <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)' }}>
                Dashboard average
              </Box>
              <Box sx={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>1-year return</Box>
            </Box>
            <Box
              sx={{
                px: '10px',
                py: '6px',
                borderRadius: '999px',
                background: 'rgba(23, 201, 120, 0.12)',
                color: 'var(--emerald)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {formatReturn(stats?.avg_return_1yr)}
            </Box>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              inset: '92px 18px 18px',
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${index * 24}%`,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${index * 18}%`,
                  borderLeft: '1px solid rgba(255,255,255,0.04)',
                }}
              />
            ))}
            <Box
              component="svg"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#6F4CF5" />
                  <stop offset="100%" stopColor="#A89DFF" />
                </linearGradient>
              </defs>
              <path
                d="M0,172 C48,150 92,138 140,126 C188,114 216,126 264,92 C312,58 348,54 400,76 C452,98 498,110 546,84 C568,74 586,56 600,38"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ padding: '18px', display: 'grid', gap: '12px' }}>
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '12px' }}>
            Dashboard snapshot
          </Box>
          {[
            { label: 'Total funds', value: formatNumber(stats?.total_funds) },
            { label: 'Average rating', value: formatRating(stats?.avg_rating) },
            { label: 'Average MER', value: formatMer(stats?.avg_mer) },
            { label: 'Research domains', value: String(RESEARCH_DOMAIN_COUNT) },
          ].map((item, index) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: index === 3 ? 0 : '0 0 10px',
                mb: index === 3 ? 0 : '10px',
                borderBottom: index === 3 ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Box>
                <Box sx={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{item.label}</Box>
                <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.48)' }}>
                  Live dashboard stat
                </Box>
              </Box>
              <Box
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: item.label === 'Average MER' ? 'var(--text-3)' : 'var(--emerald)',
                }}
              >
                {item.value}
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background:
              'linear-gradient(180deg, rgba(111, 76, 245, 0.18), rgba(111, 76, 245, 0.08))',
            border: '1px solid rgba(145, 116, 255, 0.18)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '8px' }}>Desk note</Box>
          <Box sx={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.76)' }}>
            The interface stays quiet until it matters. Strong type, darker panels, and fewer colors
            make the data read faster.
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

const LandingPage = () => {
  const { data: datesResponse } = usePublicAvailableDates();
  const latestDate = datesResponse?.data?.[0];
  const { data: dashboardResponse } = usePublicDashboard();
  const stats = dashboardResponse?.data?.stats;
  const asOfDate = formatDateLabel(stats?.latest_date || latestDate);
  const overviewMetrics = [
    { label: 'Funds covered', value: formatNumber(stats?.total_funds) },
    { label: 'Research domains', value: String(RESEARCH_DOMAIN_COUNT) },
    { label: 'Average 1Y return', value: formatReturn(stats?.avg_return_1yr) },
  ];
  const summaryMetrics = [
    { label: 'Total funds', value: formatNumber(stats?.total_funds) },
    { label: 'Average rating', value: formatRating(stats?.avg_rating) },
    {
      label: 'Avg 1-year return',
      value: formatReturn(stats?.avg_return_1yr),
      positive: Number(stats?.avg_return_1yr) >= 0,
    },
    { label: 'Avg MER', value: formatMer(stats?.avg_mer) },
    { label: 'Research domains', value: String(RESEARCH_DOMAIN_COUNT) },
    { label: 'Data as of', value: asOfDate },
  ];

  return (
    <>
      <SEO path="/" />
      <style>{fadeKeyframes}</style>

      <Box sx={{ minHeight: '100vh', color: 'var(--text-1)' }}>
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
              maxWidth: '1320px',
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
                  PROFESSIONAL RESEARCH
                </Box>
              </Box>
            </Link>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '6px' }}>
              {['Workflow', 'Pricing', 'Why it reads better'].map((item) => (
                <Box
                  key={item}
                  component="a"
                  href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    px: '14px',
                    py: '9px',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'all var(--transition)',
                    '&:hover': {
                      color: 'var(--text-1)',
                      background: 'var(--accent-soft)',
                    },
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Box
                component={Link}
                to="/login"
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-2)',
                  textDecoration: 'none',
                  px: '16px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  transition: 'all var(--transition)',
                  '&:hover': { color: 'var(--text-1)', borderColor: 'var(--border-hover)' },
                }}
              >
                Log in
              </Box>
              <Box
                component={Link}
                to="/signup"
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  textDecoration: 'none',
                  px: '18px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                  boxShadow: '0 16px 32px rgba(111, 76, 245, 0.24)',
                  transition: 'transform var(--transition), box-shadow var(--transition)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 20px 40px rgba(111, 76, 245, 0.28)',
                  },
                }}
              >
                Start free
              </Box>
            </Box>
          </Box>
        </Box>

        <AnimatedSection
          sx={{
            maxWidth: '1320px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            pt: { xs: '56px', md: '88px' },
            pb: { xs: '44px', md: '64px' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: '18px',
            }}
          >
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
              }}
            >
              <BrandMark size={18} />
              Kraken-inspired visual refresh
            </Box>
          </Box>

          <Box
            component="h1"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '38px', sm: '56px', md: '72px' },
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 0.98,
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
              mb: '20px',
            }}
          >
            Professional fund research with a calmer trading-desk feel.
          </Box>

          <Box
            sx={{
              fontSize: { xs: '15px', md: '18px' },
              color: 'var(--text-3)',
              textAlign: 'center',
              maxWidth: '760px',
              mx: 'auto',
              lineHeight: 1.75,
              mb: '30px',
            }}
          >
            FundLens now leans into cooler neutrals, sharper hierarchy, and darker desk surfaces so
            the data looks deliberate instead of decorative. Live landing metrics now mirror the
            dashboard instead of relying on placeholder marketing numbers.
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              mb: '34px',
            }}
          >
            <Box
              component={Link}
              to="/signup"
              sx={{
                px: '22px',
                py: '13px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 18px 34px rgba(111, 76, 245, 0.24)',
              }}
            >
              Open the desk
            </Box>
            <Box
              component={Link}
              to="/pricing"
              sx={{
                px: '22px',
                py: '13px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
              }}
            >
              See pricing
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: '12px',
              maxWidth: '900px',
              mx: 'auto',
              mb: '34px',
            }}
          >
            {overviewMetrics.map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  p: '16px 18px',
                  borderRadius: '18px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                    color: 'var(--text-1)',
                  }}
                >
                  {stat.value}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>{stat.label}</Box>
              </Box>
            ))}
          </Box>

          <PreviewShell stats={stats} asOfDate={asOfDate} />
        </AnimatedSection>

        <AnimatedSection
          id="workflow"
          sx={{
            maxWidth: '1320px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            py: { xs: '40px', md: '72px' },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: '34px' }}>
            <Box
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '30px', md: '46px' },
                fontWeight: 800,
                letterSpacing: '-0.05em',
                mb: '10px',
              }}
            >
              Built to read faster.
            </Box>
            <Box sx={{ maxWidth: '640px', mx: 'auto', color: 'var(--text-3)', lineHeight: 1.75 }}>
              The visual system borrows from Kraken&apos;s restraint: fewer competing accents, more
              structure, and dark panels where the data deserves the eye.
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: '18px',
            }}
          >
            {deskModules.map((module, index) => (
              <Box
                key={module.title}
                sx={{
                  p: '22px',
                  borderRadius: '24px',
                  border: '1px solid var(--border)',
                  background:
                    index === 1
                      ? 'linear-gradient(180deg, var(--accent-soft), rgba(255,255,255,0.02))'
                      : 'rgba(255,255,255,0.03)',
                  boxShadow: 'var(--shadow-panel)',
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    background: index === 1 ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    color: index === 1 ? 'var(--accent-strong)' : 'var(--text-2)',
                    fontSize: '12px',
                    fontWeight: 700,
                    mb: '16px',
                  }}
                >
                  0{index + 1}
                </Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    mb: '10px',
                  }}
                >
                  {module.title}
                </Box>
                <Box sx={{ color: 'var(--text-3)', lineHeight: 1.75 }}>{module.body}</Box>
              </Box>
            ))}
          </Box>
        </AnimatedSection>

        <AnimatedSection
          id="why-it-reads-better"
          sx={{
            maxWidth: '1320px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            py: { xs: '18px', md: '40px' },
          }}
        >
          <Box
            sx={{
              p: { xs: '20px', md: '24px' },
              borderRadius: '24px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)',
              boxShadow: 'var(--shadow-panel)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: '18px',
              }}
            >
              <Box>
                <Box sx={{ fontSize: '12px', color: 'var(--text-4)', mb: '6px' }}>
                  Dashboard snapshot
                </Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: { xs: '28px', md: '36px' },
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Live desk metrics at a glance
                </Box>
              </Box>
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
                View dashboard
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
                gap: '10px',
              }}
            >
              {summaryMetrics.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: '14px',
                    borderRadius: '18px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Box
                    sx={{
                      fontFamily: 'var(--font-head)',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--text-1)',
                      letterSpacing: '-0.04em',
                      mb: '6px',
                    }}
                  >
                    {item.value}
                  </Box>
                  <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>{item.label}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </AnimatedSection>

        <AnimatedSection
          id="pricing"
          sx={{
            maxWidth: '1100px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            py: { xs: '48px', md: '84px' },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: '34px' }}>
            <Box
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '30px', md: '46px' },
                fontWeight: 800,
                letterSpacing: '-0.05em',
                mb: '10px',
              }}
            >
              Straightforward pricing.
            </Box>
            <Box sx={{ color: 'var(--text-3)' }}>
              The redesign is cleaner. The plan structure stays simple.
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: '18px',
            }}
          >
            {pricingTiers.map((tier) => (
              <Box
                key={tier.name}
                sx={{
                  p: '28px',
                  borderRadius: '26px',
                  border: tier.featured
                    ? '1px solid var(--accent-ring)'
                    : '1px solid var(--border)',
                  background: tier.featured
                    ? 'linear-gradient(180deg, var(--accent-soft), rgba(255,255,255,0.03))'
                    : 'rgba(255,255,255,0.03)',
                  boxShadow: 'var(--shadow-panel)',
                }}
              >
                <Box sx={{ fontSize: '12px', color: 'var(--text-4)', mb: '8px' }}>
                  {tier.featured ? 'Recommended desk setup' : 'Entry access'}
                </Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '30px',
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                    mb: '6px',
                  }}
                >
                  {tier.name}
                </Box>
                <Box sx={{ color: 'var(--text-3)', mb: '18px' }}>{tier.description}</Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '44px',
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
                <Box sx={{ display: 'grid', gap: '10px', mb: '24px' }}>
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
                          background: tier.featured ? 'var(--accent-strong)' : 'var(--emerald)',
                        }}
                      />
                      {feature}
                    </Box>
                  ))}
                </Box>
                <Box
                  component={Link}
                  to={tier.to}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    px: '18px',
                    py: '13px',
                    borderRadius: 'var(--radius-pill)',
                    background: tier.featured
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
                      : 'var(--bg-surface)',
                    border: tier.featured ? 'none' : '1px solid var(--border)',
                    color: tier.featured ? '#fff' : 'var(--text-1)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {tier.cta}
                </Box>
              </Box>
            ))}
          </Box>
        </AnimatedSection>

        <Box
          component="footer"
          sx={{
            borderTop: '1px solid var(--border)',
            mt: '24px',
          }}
        >
          <Box
            sx={{
              maxWidth: '1320px',
              mx: 'auto',
              px: { xs: '16px', sm: '24px', md: '32px' },
              py: '28px 36px',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: '18px',
              alignItems: { xs: 'flex-start', md: 'center' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrandMark size={22} />
              <Box>
                <Box
                  sx={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.03em' }}
                >
                  FundLens
                </Box>
                <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
                  Cooler light mode. Stronger desk hierarchy.
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13px' }}>
              {[
                { label: 'Pricing', to: '/pricing' },
                { label: 'Terms', to: '/terms' },
                { label: 'Privacy', to: '/privacy' },
              ].map((link) => (
                <Box
                  key={link.label}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    '&:hover': { color: 'var(--text-1)' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LandingPage;
