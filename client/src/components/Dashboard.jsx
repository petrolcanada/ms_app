import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useDashboard from '../hooks/useDashboard';
import useAvailableDates from '../hooks/useAvailableDates';
import StatCard from './StatCard';
import StarRating from './StarRating';
import SEO from './SEO';
import OnboardingTour from './OnboardingTour';

const quickLinks = [
  { label: 'Fund Explorer', sub: 'Browse the full universe', route: '/explorer' },
  { label: 'Screener', sub: 'Rank and filter with precision', route: '/screener' },
  { label: 'Watchlist', sub: 'Track your saved ideas', route: '/watchlist' },
  { label: 'Compare', sub: 'Read funds side by side', route: '/compare' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: dates } = useAvailableDates();
  const latestDate = dates?.[0];
  const { data, isLoading, isError } = useDashboard();

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

  const formatMoney = (value) => {
    if (value == null) return '--';
    const number = Number(value);
    const abs = Math.abs(number);
    const sign = number >= 0 ? '+' : '-';
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
    return `${sign}$${abs.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '420px' }}
      >
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box
        sx={{
          background: 'var(--red-soft)',
          border: '1px solid rgba(224, 72, 99, 0.24)',
          borderRadius: '20px',
          px: '20px',
          py: '18px',
          color: 'var(--red)',
          fontSize: '13px',
        }}
      >
        Failed to load dashboard data.
      </Box>
    );
  }

  const { stats, topPerformers, largestFlows, highestRated } = data;
  const inflows = largestFlows?.filter((fund) => fund.direction === 'inflow') || [];
  const outflows = largestFlows?.filter((fund) => fund.direction === 'outflow') || [];
  const asOfDate = formatDateLabel(stats?.latest_date || latestDate);

  return (
    <Box>
      <SEO title="Dashboard" path="/dashboard" noIndex />
      <OnboardingTour />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '30px',
          border: '1px solid var(--border)',
          background:
            'linear-gradient(180deg, rgba(111, 76, 245, 0.12), rgba(255,255,255,0.02) 32%, rgba(255,255,255,0.02) 100%)',
          boxShadow: 'var(--shadow-panel)',
          p: { xs: '22px', md: '30px' },
          mb: '26px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '-40% auto auto 62%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(111, 76, 245, 0.18)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' },
            gap: '18px',
            alignItems: 'start',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                px: '12px',
                py: '7px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--accent-ring)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-strong)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mb: '16px',
              }}
            >
              Market overview
            </Box>

            <Box
              component="h1"
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '34px', md: '44px' },
                fontWeight: 800,
                letterSpacing: '-0.06em',
                lineHeight: 0.96,
                mb: '10px',
                maxWidth: '720px',
              }}
            >
              A cleaner desk for fund intelligence.
            </Box>

            <Box sx={{ color: 'var(--text-3)', lineHeight: 1.75, maxWidth: '700px', mb: '20px' }}>
              The dashboard now leans on Kraken-style restraint: darker analysis panels, stronger
              hierarchy, and a light mode that stays cool instead of warm.
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  px: '14px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-2)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                As of {asOfDate}
              </Box>
              <Box
                component="button"
                onClick={() => navigate('/screener')}
                sx={{
                  px: '16px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 18px 34px rgba(111, 76, 245, 0.24)',
                }}
              >
                Open screener
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: '18px',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)',
              display: 'grid',
              gap: '14px',
            }}
          >
            <Box
              sx={{
                fontSize: '12px',
                color: 'var(--text-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Desk focus
            </Box>
            {[
              {
                label: 'Funds covered',
                value: stats?.total_funds ? Number(stats.total_funds).toLocaleString() : '--',
              },
              {
                label: 'Average rating',
                value: stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '--',
              },
              {
                label: 'Average 1Y return',
                value: formatReturn(stats?.avg_return_1yr),
                positive: Number(stats?.avg_return_1yr) >= 0,
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '12px 14px',
                  borderRadius: '16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>{item.label}</Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '20px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color:
                      typeof item.positive === 'boolean'
                        ? item.positive
                          ? 'var(--emerald)'
                          : 'var(--red)'
                        : 'var(--text-1)',
                  }}
                >
                  {item.value}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: '16px',
          mb: '24px',
        }}
      >
        <StatCard
          label="Total Funds"
          value={stats?.total_funds ? Number(stats.total_funds).toLocaleString() : '--'}
        />
        <StatCard
          label="Avg 1-Year Return"
          value={formatReturn(stats?.avg_return_1yr)}
          valueColor={Number(stats?.avg_return_1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
        />
        <StatCard
          label="Avg MER"
          value={stats?.avg_mer != null ? `${Number(stats.avg_mer).toFixed(2)}%` : '--'}
        />
        <StatCard
          label="Avg Rating"
          value={stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '--'}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: '14px',
          mb: '24px',
        }}
      >
        {quickLinks.map((link, index) => (
          <QuickLink
            key={link.label}
            label={link.label}
            sub={link.sub}
            accent={index === 1}
            onClick={() => navigate(link.route)}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' },
          gap: '20px',
          mb: '24px',
        }}
      >
        <SectionCard title="Top Performers" subtitle="1-year return">
          {(topPerformers || []).slice(0, 8).map((fund, index) => (
            <FundRow
              key={fund._id}
              rank={index + 1}
              fund={fund}
              metric={formatReturn(fund.return1yr)}
              metricColor={Number(fund.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!topPerformers || topPerformers.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard title="Highest Rated" subtitle="Analyst quality at a glance">
          {(highestRated || []).slice(0, 8).map((fund, index) => (
            <FundRow
              key={fund._id}
              rank={index + 1}
              fund={fund}
              metric={<StarRating rating={fund.ratingoverall} />}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!highestRated || highestRated.length === 0) && <EmptyState />}
        </SectionCard>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, 1fr)' },
          gap: '20px',
        }}
      >
        <SectionCard title="Largest Inflows" subtitle="1-month flow momentum">
          {inflows.map((fund, index) => (
            <FundRow
              key={fund._id}
              rank={index + 1}
              fund={fund}
              metric={formatMoney(fund.flow_1m)}
              metricColor="var(--emerald)"
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {inflows.length === 0 && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Outflows" subtitle="1-month capital pressure">
          {outflows.map((fund, index) => (
            <FundRow
              key={fund._id}
              rank={index + 1}
              fund={fund}
              metric={formatMoney(fund.flow_1m)}
              metricColor="var(--red)"
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {outflows.length === 0 && <EmptyState />}
        </SectionCard>
      </Box>
    </Box>
  );
};

const QuickLink = ({ label, sub, onClick, accent = false }) => (
  <Box
    onClick={onClick}
    sx={{
      position: 'relative',
      overflow: 'hidden',
      background: accent
        ? 'linear-gradient(180deg, var(--accent-soft), rgba(255,255,255,0.02))'
        : 'rgba(255,255,255,0.03)',
      border: accent ? '1px solid var(--accent-ring)' : '1px solid var(--border)',
      borderRadius: '22px',
      padding: '20px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-panel)',
      transition: 'all var(--transition)',
      '&:hover': {
        transform: 'translateY(-2px)',
        borderColor: accent ? 'var(--accent-strong)' : 'var(--border-hover)',
      },
    }}
  >
    <Box
      sx={{
        fontSize: '11px',
        color: 'var(--text-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: '12px',
      }}
    >
      Module
    </Box>
    <Box
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: '24px',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        mb: '6px',
      }}
    >
      {label}
    </Box>
    <Box sx={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.65 }}>{sub}</Box>
  </Box>
);

const SectionCard = ({ title, subtitle, children }) => (
  <Box
    sx={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border)',
      borderRadius: '26px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-panel)',
    }}
  >
    <Box
      sx={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '16px',
      }}
    >
      <Box>
        <Box
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-1)',
          }}
        >
          {title}
        </Box>
        <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>{subtitle}</Box>
      </Box>
    </Box>
    <Box sx={{ padding: '6px 0' }}>{children}</Box>
  </Box>
);

const FundRow = ({ rank, fund, metric, metricColor, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 22px',
      cursor: 'pointer',
      transition: 'background var(--transition)',
      '&:hover': { background: 'var(--bg-surface-hover)' },
      '&:hover .fund-name': { color: 'var(--accent-strong)' },
    }}
  >
    <Box
      sx={{
        width: '28px',
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-4)',
        flexShrink: 0,
      }}
    >
      {rank}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box
        className="fund-name"
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color var(--transition)',
        }}
      >
        {fund.fundname || fund._name || 'N/A'}
      </Box>
      <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
        {fund.ticker || '--'}
        {fund.categoryname ? ` · ${fund.categoryname}` : ''}
      </Box>
    </Box>
    <Box
      sx={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 600,
        color: metricColor || 'var(--text-2)',
        flexShrink: 0,
      }}
    >
      {metric}
    </Box>
  </Box>
);

const EmptyState = () => (
  <Box sx={{ padding: '28px 22px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
    No data available.
  </Box>
);

export default Dashboard;
