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

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: dates } = useAvailableDates();
  const latestDate = dates?.[0];
  const { data, isLoading, isError } = useDashboard();

  const formatDateLabel = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fmtReturn = (v) => {
    if (v == null) return '—';
    const n = Number(v);
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  };

  const fmtMoney = (v) => {
    if (v == null) return '—';
    const n = Number(v);
    const abs = Math.abs(n);
    const sign = n >= 0 ? '+' : '-';
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
    return `${sign}$${abs.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: 'var(--emerald)' }} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{
        background: 'var(--red-soft)', border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius)', padding: '20px', color: 'var(--red)', fontSize: '13px',
      }}>
        Failed to load dashboard data.
      </Box>
    );
  }

  const { stats, topPerformers, largestFlows, highestRated } = data;
  const inflows = largestFlows?.filter((f) => f.direction === 'inflow') || [];
  const outflows = largestFlows?.filter((f) => f.direction === 'outflow') || [];

  return (
    <Box>
      <SEO title="Dashboard" path="/dashboard" noIndex />
      <OnboardingTour />
      {/* Header */}
      <Box sx={{ mb: '32px' }}>
        <Box component="h1" sx={{
          fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 600,
          color: 'var(--text-1)', letterSpacing: '-0.03em', mb: '4px',
        }}>
          Dashboard
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
          Market overview as of{' '}
          <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>
            {formatDateLabel(stats?.latest_date || latestDate)}
          </span>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: '16px', mb: '32px' }}>
        <StatCard
          label="Total Funds"
          value={stats?.total_funds ? Number(stats.total_funds).toLocaleString() : '—'}
        />
        <StatCard
          label="Avg 1-Year Return"
          value={fmtReturn(stats?.avg_return_1yr)}
          valueColor={Number(stats?.avg_return_1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
        />
        <StatCard
          label="Avg MER"
          value={stats?.avg_mer != null ? `${Number(stats.avg_mer).toFixed(2)}%` : '—'}
        />
        <StatCard
          label="Avg Rating"
          value={stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '—'}
        />
      </Box>

      {/* Quick Links */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: '12px', mb: '32px' }}>
        <QuickLink label="Fund Explorer" sub="Browse all funds" onClick={() => navigate('/explorer')} />
        <QuickLink label="Screener" sub="Rank and filter" onClick={() => navigate('/screener')} />
        <QuickLink label="Watchlist" sub="Your saved funds" onClick={() => navigate('/watchlist')} />
        <QuickLink label="Compare" sub="Side-by-side" onClick={() => navigate('/compare')} />
      </Box>

      {/* Top Performers + Highest Rated */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '20px', mb: '24px' }}>
        <SectionCard title="Top Performers (1Y Return)">
          {(topPerformers || []).slice(0, 8).map((fund, i) => (
            <FundRow
              key={fund._id}
              rank={i + 1}
              fund={fund}
              metric={fmtReturn(fund.return1yr)}
              metricColor={Number(fund.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!topPerformers || topPerformers.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard title="Highest Rated">
          {(highestRated || []).slice(0, 8).map((fund, i) => (
            <FundRow
              key={fund._id}
              rank={i + 1}
              fund={fund}
              metric={<StarRating rating={fund.ratingoverall} />}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!highestRated || highestRated.length === 0) && <EmptyState />}
        </SectionCard>
      </Box>

      {/* Flows */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '20px' }}>
        <SectionCard title="Largest Inflows (1M)">
          {inflows.map((fund, i) => (
            <FundRow
              key={fund._id}
              rank={i + 1}
              fund={fund}
              metric={fmtMoney(fund.flow_1m)}
              metricColor="var(--emerald)"
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {inflows.length === 0 && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Outflows (1M)">
          {outflows.map((fund, i) => (
            <FundRow
              key={fund._id}
              rank={i + 1}
              fund={fund}
              metric={fmtMoney(fund.flow_1m)}
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

/* Sub-components */

const QuickLink = ({ label, sub, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
      transition: 'all var(--transition)',
      '&:hover': { borderColor: 'var(--emerald)', transform: 'translateY(-2px)' },
    }}
  >
    <Box sx={{
      fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 600,
      color: 'var(--text-1)', mb: '4px',
    }}>{label}</Box>
    <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>{sub}</Box>
  </Box>
);

const SectionCard = ({ title, children }) => (
  <Box sx={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  }}>
    <Box sx={{
      padding: '16px 20px', borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 600,
      color: 'var(--text-2)', letterSpacing: '-0.01em',
    }}>{title}</Box>
    <Box sx={{ padding: '4px 0' }}>{children}</Box>
  </Box>
);

const FundRow = ({ rank, fund, metric, metricColor, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 20px', cursor: 'pointer',
      transition: 'background var(--transition)',
      '&:hover': { background: 'var(--bg-surface-hover)' },
      '&:hover .fund-name': { color: 'var(--blue)' },
    }}
  >
    <Box sx={{
      fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-4)',
      width: '24px', textAlign: 'right', flexShrink: 0,
    }}>{rank}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box className="fund-name" sx={{
        fontSize: '13px', fontWeight: 500, color: 'var(--text-1)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        transition: 'color var(--transition)',
      }}>
        {fund.fundname || fund._name || 'N/A'}
      </Box>
      <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
        {fund.ticker || '—'} {fund.categoryname ? `· ${fund.categoryname}` : ''}
      </Box>
    </Box>
    <Box sx={{
      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
      color: metricColor || 'var(--text-2)', flexShrink: 0,
    }}>{metric}</Box>
  </Box>
);

const EmptyState = () => (
  <Box sx={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
    No data available
  </Box>
);

export default Dashboard;
