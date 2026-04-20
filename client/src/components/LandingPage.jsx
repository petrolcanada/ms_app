import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SEO from './SEO';
import usePublicDashboard from '../hooks/usePublicDashboard';
import usePublicAvailableDates from '../hooks/usePublicAvailableDates';
import { METRIC_COLUMNS } from '../config/screenerMetrics';
import screenerPreview from '../assets/screener-preview.png';

const fadeKeyframes = `
@keyframes landingFadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const classifyScreenerGroup = (group) => {
  if (group.startsWith('Performance')) return 'Performance';
  if (group === 'Category ranks') return 'Category ranks';
  if (group === 'Fees') return 'Fees';
  if (group.startsWith('Risk')) return 'Risk';
  if (group.startsWith('Ratings')) return 'Ratings';
  if (group === 'Fund flows') return 'Fund flows';
  if (group === 'Assets & flows') return 'Assets';
  return group;
};

const SCREENER_FAMILY_ORDER = [
  'Performance',
  'Category ranks',
  'Fees',
  'Risk',
  'Ratings',
  'Fund flows',
  'Assets',
];

const SCREENER_FAMILY_STATS = SCREENER_FAMILY_ORDER.map((family) => ({
  family,
  count: METRIC_COLUMNS.filter((column) => classifyScreenerGroup(column.group) === family).length,
}));

const deskModules = [
  {
    title: 'Screen the full universe',
    body: `Rank funds across ${METRIC_COLUMNS.length} live metrics before you ever open a detail page.`,
  },
  {
    title: 'Stack the signals',
    body: 'Put performance, fees, risk, ratings, flows, and assets beside each other so the shortlist tightens quickly.',
  },
  {
    title: 'Move into compare',
    body: 'Once the screener gives you conviction, carry the shortlist into compare and deeper fund-level research.',
  },
];

const RESEARCH_DOMAIN_COUNT = 8;
const SCREENER_METRIC_COUNT = METRIC_COLUMNS.length;

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'A clean entry point for individual investors.',
    features: ['Screener access', 'Core screening', '2-fund compare', '5 watchlist slots'],
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

const ScreenerShowcase = ({ stats, asOfDate, screenerFamilies }) => (
  <Box
    sx={{
      position: 'relative',
      background: 'linear-gradient(180deg, #110d1d 0%, #0b0814 100%)',
      borderRadius: '28px',
      border: '1px solid rgba(145, 116, 255, 0.24)',
      boxShadow: '0 34px 90px rgba(7, 6, 13, 0.45)',
      overflow: 'hidden',
      p: { xs: '18px', md: '24px' },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '14px',
        mb: '20px',
      }}
    >
      <Box>
        <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', mb: '8px' }}>
          Actual product capture
        </Box>
        <Box
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: { xs: '28px', md: '42px' },
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: '#fff',
            lineHeight: 0.98,
            mb: '10px',
            maxWidth: '640px',
          }}
        >
          Show the real screener, not an invented mock.
        </Box>
        <Box sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.66)', maxWidth: '620px' }}>
          The landing page now uses an actual FundLens screener capture so visitors can see the
          ranked table, heatmap signals, and metric layout before they click through.
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {[
          `${formatNumber(SCREENER_METRIC_COUNT)} metrics`,
          `${formatNumber(stats?.total_funds)} funds`,
          `${RESEARCH_DOMAIN_COUNT} domains`,
        ].map((item) => (
          <Box
            key={item}
            sx={{
              px: '12px',
              py: '7px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#fff',
              background: 'rgba(111, 76, 245, 0.18)',
              border: '1px solid rgba(145, 116, 255, 0.24)',
            }}
          >
            {item}
          </Box>
        ))}
      </Box>
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', xl: '280px minmax(0, 1fr)' },
        gap: '20px',
      }}
    >
      <Box sx={{ display: 'grid', gap: '14px' }}>
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '10px' }}>
            Screener surface
          </Box>
          <Box sx={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>
            {formatNumber(SCREENER_METRIC_COUNT)}
          </Box>
          <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            metrics live in the screener
          </Box>
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
            Universe coverage
          </Box>
          <Box sx={{ fontSize: '13px', fontWeight: 700, color: '#fff', mb: '6px' }}>
            {formatNumber(stats?.total_funds)} funds, {RESEARCH_DOMAIN_COUNT} domains
          </Box>
          <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)' }}>
            Public snapshot as of {asOfDate}
          </Box>
        </Box>
        <Box
          sx={{
            p: '14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '10px' }}>
            Coverage split
          </Box>
          <Box sx={{ display: 'grid', gap: '8px' }}>
            {screenerFamilies.slice(0, 4).map((item) => (
              <Box
                key={item.family}
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
                <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)' }}>{item.family}</Box>
                <Box sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--emerald)' }}>
                  {formatNumber(item.count)}
                </Box>
              </Box>
            ))}
          </Box>
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
          <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', mb: '8px' }}>
            Why the screenshot matters
          </Box>
          <Box sx={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.76)' }}>
            It shows the real table density, real fund rows, and real metric columns. That lands
            harder than a stylized preview box.
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#090711',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              right: '18px',
              zIndex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <Box
              sx={{
                px: '12px',
                py: '8px',
                borderRadius: '999px',
                background: 'rgba(7, 6, 13, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Actual screener screenshot
            </Box>
            <Box
              sx={{
                px: '12px',
                py: '8px',
                borderRadius: '999px',
                background: 'rgba(7, 6, 13, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.78)',
              }}
            >
              Dark desk view
            </Box>
          </Box>
          <Box
            component="img"
            src={screenerPreview}
            alt="Actual FundLens screener showing ranked funds, signal badges, and sortable metric columns."
            sx={{
              display: 'block',
              width: '100%',
              height: { xs: '380px', md: '760px' },
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              p: '18px',
              background: 'linear-gradient(180deg, rgba(9,7,17,0) 0%, rgba(9,7,17,0.92) 100%)',
            }}
          >
            <Box sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', mb: '6px' }}>
              Captured from the live product
            </Box>
            <Box
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: 700,
                color: '#fff',
                maxWidth: '640px',
              }}
            >
              Ranked rows, heatmap cells, signal badges, sortable columns, and plan limits all show
              up exactly the way a visitor will experience them.
            </Box>
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
  const screenerMetricCountLabel = formatNumber(SCREENER_METRIC_COUNT);
  const overviewMetrics = [
    { label: 'Screener metrics', value: screenerMetricCountLabel },
    { label: 'Funds covered', value: formatNumber(stats?.total_funds) },
    { label: 'Research domains', value: String(RESEARCH_DOMAIN_COUNT) },
  ];
  const summaryMetrics = [
    { label: 'Screener metrics', value: screenerMetricCountLabel },
    { label: 'Funds covered', value: formatNumber(stats?.total_funds) },
    { label: 'Research domains', value: String(RESEARCH_DOMAIN_COUNT) },
    { label: 'Average rating', value: formatRating(stats?.avg_rating) },
    { label: 'Avg MER', value: formatMer(stats?.avg_mer) },
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
              {['Screener', 'Coverage', 'Pricing'].map((item) => (
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
              {screenerMetricCountLabel}-metric fund screener
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
            Screen the fund universe before you research it.
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
            FundLens now leads with the product surface that matters most for marketing: a live
            screener with {screenerMetricCountLabel} metrics across performance, category ranks,
            fees, risk, ratings, flows, and assets. The Kraken-inspired refresh keeps the page
            cleaner, but the real hook is how fast the screener gets a visitor from universe to
            shortlist.
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
              to="/screener"
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
              Open the screener
            </Box>
            <Box
              component={Link}
              to="/signup"
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
              Start free
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

          <ScreenerShowcase
            stats={stats}
            asOfDate={asOfDate}
            screenerFamilies={SCREENER_FAMILY_STATS}
          />
        </AnimatedSection>

        <AnimatedSection
          id="screener"
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
              The screener is the pitch.
            </Box>
            <Box sx={{ maxWidth: '640px', mx: 'auto', color: 'var(--text-3)', lineHeight: 1.75 }}>
              Instead of advertising vague “research tools,” the page now shows concrete screener
              coverage. Visitors can immediately see how wide the metric surface is and how the
              shortlist workflow works.
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
          id="coverage"
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
                  Screener proof
                </Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: { xs: '28px', md: '36px' },
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Concrete coverage, not generic claims
                </Box>
              </Box>
              <Box
                component={Link}
                to="/screener"
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
                View screener
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
