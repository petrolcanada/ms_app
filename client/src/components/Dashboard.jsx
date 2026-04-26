import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AsOfDateSelector from './AsOfDateSelector';
import SEO from './SEO';
import OnboardingTour from './OnboardingTour';
import KpiCard from './KpiCard';
import useDashboard from '../hooks/useDashboard';
import ActionPill, { PillSeparator as Separator } from './ui/ActionPill';
import AppCard from './ui/AppCard';

const EMPTY_LIST = [];

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatNumber = (value) => {
  const numeric = toNumber(value);
  return numeric === null ? '--' : numeric.toLocaleString();
};

const formatPercent = (value, { signed = false, digits = 2 } = {}) => {
  const numeric = toNumber(value);
  if (numeric === null) return '--';
  const sign = signed && numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(digits)}%`;
};

const formatMoney = (value, { signed = false } = {}) => {
  const numeric = toNumber(value);
  if (numeric === null) return '--';

  const abs = Math.abs(numeric);
  const sign = signed && numeric > 0 ? '+' : numeric < 0 ? '-' : '';

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const formatRating = (value) => {
  const numeric = toNumber(value);
  return numeric === null ? '--' : numeric.toFixed(1);
};

const formatDateLabel = (iso) => {
  if (!iso) return '--';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatFundCount = (value) => {
  const numeric = toNumber(value);
  if (numeric === null) return 'Fund count unavailable';
  return `${numeric.toLocaleString()} funds`;
};

const valueColor = (value) => {
  const numeric = toNumber(value);
  if (numeric === null) return 'var(--text-1)';
  return numeric >= 0 ? 'var(--emerald)' : 'var(--red)';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [asofDate, setAsofDate] = useState('');
  const { data, isLoading, isError } = useDashboard(asofDate);

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

  const stats = data.stats || {};
  const topPerformers = data.topPerformers || EMPTY_LIST;
  const bottomPerformers = data.bottomPerformers || EMPTY_LIST;
  const topCategories = data.topCategories || EMPTY_LIST;
  const bottomCategories = data.bottomCategories || EMPTY_LIST;
  const largestFlows = data.largestFlows || EMPTY_LIST;
  const largestFlowCategories = data.largestFlowCategories || EMPTY_LIST;

  const categoryInflows = largestFlowCategories.filter(
    (category) => category.direction === 'inflow',
  );
  const categoryOutflows = largestFlowCategories.filter(
    (category) => category.direction === 'outflow',
  );
  const fundInflows = largestFlows.filter((fund) => fund.direction === 'inflow');
  const fundOutflows = largestFlows.filter((fund) => fund.direction === 'outflow');

  const topCategory = topCategories[0] || null;
  const topFund = topPerformers[0] || null;
  const topFlowCategory = categoryInflows[0] || null;
  const resolvedDate = stats.latest_date || topCategory?.dayenddate || asofDate || '';
  const hasData = Boolean(
    toNumber(stats.total_funds) ||
    topCategories.length ||
    topPerformers.length ||
    largestFlows.length,
  );

  return (
    <Box>
      <SEO title="Dashboard" path="/dashboard" noIndex />
      <OnboardingTour />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: '32px',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 620px' }}>
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
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: '14px',
              }}
            >
              Dashboard
            </Box>

            <Box
              component="h1"
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '30px', md: '42px' },
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 0.98,
                mb: '14px',
                maxWidth: '760px',
              }}
            >
              Market leadership, with the same cleaner reading surface as Funds.
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                mb: '18px',
              }}
            >
              <ActionPill
                tone="neutral"
                value="Dashboard"
                action="Open screener"
                onClick={() => navigate('/screener')}
              />
              <Separator />
              <ActionPill
                tone="accent"
                value={topCategory?.categoryname || 'Categories'}
                action="Top category"
                onClick={() =>
                  navigate(
                    topCategory?.categoryname
                      ? `/categories/${encodeURIComponent(topCategory.categoryname)}`
                      : '/categories',
                  )
                }
              />
              <Separator />
              <ActionPill
                tone="emerald"
                value={topFund?.ticker || 'Top fund'}
                action="Open detail"
                onClick={() => navigate(topFund?._id ? `/funds/${topFund._id}` : '/funds')}
              />
            </Box>

            <Box sx={{ color: 'var(--text-3)', lineHeight: 1.75, maxWidth: '760px', mb: '20px' }}>
              Scan category leadership, fund winners and losers, and flow pressure from one quieter
              research surface. This follows the funds page more directly: no boxed hero, lighter
              cards, and the emphasis stays on the rankings.
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <InsightPill label="Funds tracked" value={formatNumber(stats.total_funds)} />
              <InsightPill
                label="Avg 1Y return"
                value={formatPercent(stats.avg_return_1yr, { signed: true })}
              />
              <InsightPill label="Avg MER" value={formatPercent(stats.avg_mer)} />
              <InsightPill label="Avg rating" value={formatRating(stats.avg_rating)} />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: '12px',
            width: '100%',
            maxWidth: { xs: '100%', lg: '360px' },
            justifyItems: { xs: 'start', lg: 'stretch' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', lg: 'flex-end' },
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <AsOfDateSelector value={asofDate} onChange={setAsofDate} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gap: '10px',
              width: '100%',
            }}
          >
            <Box
              sx={{
                px: '14px',
                py: '12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
              }}
            >
              <Box>
                <Box
                  sx={{
                    fontSize: '11px',
                    color: 'var(--text-4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mb: '4px',
                  }}
                >
                  Snapshot
                </Box>
                <Box sx={{ fontSize: '13px', color: 'var(--text-2)' }}>
                  As of {formatDateLabel(resolvedDate)}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              <SnapshotStat
                label="Total AUM"
                value={formatMoney(stats.total_aum)}
                detail={formatFundCount(stats.total_funds)}
              />
              <SnapshotStat
                label="Top category"
                value={topCategory?.categoryname || '--'}
                detail={
                  topCategory
                    ? `${formatPercent(topCategory.return1yr, { signed: true })} 1Y return`
                    : 'Category return unavailable'
                }
              />
              <SnapshotStat
                label="Top fund"
                value={topFund?.ticker || topFund?.fundname || '--'}
                detail={
                  topFund
                    ? `${formatPercent(topFund.return1yr, { signed: true })} | ${
                        topFund.categoryname || 'Uncategorized'
                      }`
                    : 'Fund return unavailable'
                }
              />
              <SnapshotStat
                label="1M flow leader"
                value={topFlowCategory?.categoryname || '--'}
                detail={
                  topFlowCategory
                    ? `${formatMoney(topFlowCategory.flow_1m, { signed: true })} net flow`
                    : 'Flow data unavailable'
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {!hasData && (
        <Box
          sx={{
            px: '24px',
            py: '40px',
            textAlign: 'center',
            color: 'var(--text-3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
          }}
        >
          No dashboard data is available for this date.
        </Box>
      )}

      {hasData && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px',
              mb: '24px',
            }}
          >
            <KpiCard label="Total AUM" value={formatMoney(stats.total_aum)} />
            <KpiCard
              label="Avg 1Y Return"
              value={formatPercent(stats.avg_return_1yr, { signed: true })}
              valueColor={valueColor(stats.avg_return_1yr)}
            />
            <KpiCard label="Avg MER" value={formatPercent(stats.avg_mer)} />
            <KpiCard label="Avg Rating" value={formatRating(stats.avg_rating)} />
          </Box>

          <SectionPanel
            eyebrow="Category tape"
            title="Category returns and flow pressure"
            description="Start with the category stack before drilling into single-fund moves."
          >
            <RankedListCard
              title="Top performers"
              subtitle={`Category 1Y return${resolvedDate ? ` | ${formatDateLabel(resolvedDate)}` : ''}`}
            >
              {topCategories.map((category, index) => (
                <RankedRow
                  key={`${category.categorycode || category.categoryname}-top-${index}`}
                  rank={index + 1}
                  title={category.categoryname || 'Uncategorized'}
                  subtitle={formatFundCount(category.fund_count)}
                  metric={formatPercent(category.return1yr, { signed: true })}
                  metricColor={valueColor(category.return1yr)}
                  onClick={() =>
                    navigate(`/categories/${encodeURIComponent(category.categoryname)}`)
                  }
                />
              ))}
              {topCategories.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard
              title="Bottom performers"
              subtitle={`Category 1Y return${resolvedDate ? ` | ${formatDateLabel(resolvedDate)}` : ''}`}
            >
              {bottomCategories.map((category, index) => (
                <RankedRow
                  key={`${category.categorycode || category.categoryname}-bottom-${index}`}
                  rank={index + 1}
                  title={category.categoryname || 'Uncategorized'}
                  subtitle={formatFundCount(category.fund_count)}
                  metric={formatPercent(category.return1yr, { signed: true })}
                  metricColor={valueColor(category.return1yr)}
                  onClick={() =>
                    navigate(`/categories/${encodeURIComponent(category.categoryname)}`)
                  }
                />
              ))}
              {bottomCategories.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard title="Largest inflows" subtitle="Summed 1-month category net flow">
              {categoryInflows.map((category, index) => (
                <RankedRow
                  key={`${category.categoryname}-inflow-${index}`}
                  rank={index + 1}
                  title={category.categoryname || 'Uncategorized'}
                  subtitle={formatFundCount(category.fund_count)}
                  metric={formatMoney(category.flow_1m, { signed: true })}
                  metricColor="var(--emerald)"
                  onClick={() =>
                    navigate(`/categories/${encodeURIComponent(category.categoryname)}`)
                  }
                />
              ))}
              {categoryInflows.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard title="Largest outflows" subtitle="Summed 1-month category net flow">
              {categoryOutflows.map((category, index) => (
                <RankedRow
                  key={`${category.categoryname}-outflow-${index}`}
                  rank={index + 1}
                  title={category.categoryname || 'Uncategorized'}
                  subtitle={formatFundCount(category.fund_count)}
                  metric={formatMoney(category.flow_1m, { signed: true })}
                  metricColor="var(--red)"
                  onClick={() =>
                    navigate(`/categories/${encodeURIComponent(category.categoryname)}`)
                  }
                />
              ))}
              {categoryOutflows.length === 0 && <EmptyState />}
            </RankedListCard>
          </SectionPanel>

          <SectionPanel
            eyebrow="Fund tape"
            title="Fund winners, losers, and flow extremes"
            description="The same dashboard, but drilled down to product-level leadership and pressure."
          >
            <RankedListCard
              title="Top performers"
              subtitle={`Fund 1Y return${resolvedDate ? ` | ${formatDateLabel(resolvedDate)}` : ''}`}
            >
              {topPerformers.map((fund, index) => (
                <RankedRow
                  key={`${fund._id}-top-${index}`}
                  rank={index + 1}
                  title={fund.fundname || fund._id || 'Unnamed fund'}
                  subtitle={`${fund.ticker || '--'} | ${fund.categoryname || 'Uncategorized'}`}
                  metric={formatPercent(fund.return1yr, { signed: true })}
                  metricColor={valueColor(fund.return1yr)}
                  onClick={() => navigate(`/funds/${fund._id}`)}
                />
              ))}
              {topPerformers.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard
              title="Bottom performers"
              subtitle={`Fund 1Y return${resolvedDate ? ` | ${formatDateLabel(resolvedDate)}` : ''}`}
            >
              {bottomPerformers.map((fund, index) => (
                <RankedRow
                  key={`${fund._id}-bottom-${index}`}
                  rank={index + 1}
                  title={fund.fundname || fund._id || 'Unnamed fund'}
                  subtitle={`${fund.ticker || '--'} | ${fund.categoryname || 'Uncategorized'}`}
                  metric={formatPercent(fund.return1yr, { signed: true })}
                  metricColor={valueColor(fund.return1yr)}
                  onClick={() => navigate(`/funds/${fund._id}`)}
                />
              ))}
              {bottomPerformers.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard title="Largest inflows" subtitle="Fund 1-month net flow">
              {fundInflows.map((fund, index) => (
                <RankedRow
                  key={`${fund._id}-inflow-${index}`}
                  rank={index + 1}
                  title={fund.fundname || fund._id || 'Unnamed fund'}
                  subtitle={`${fund.ticker || '--'} | ${fund.categoryname || 'Uncategorized'}`}
                  metric={formatMoney(fund.flow_1m, { signed: true })}
                  metricColor="var(--emerald)"
                  onClick={() => navigate(`/funds/${fund._id}`)}
                />
              ))}
              {fundInflows.length === 0 && <EmptyState />}
            </RankedListCard>

            <RankedListCard title="Largest outflows" subtitle="Fund 1-month net flow">
              {fundOutflows.map((fund, index) => (
                <RankedRow
                  key={`${fund._id}-outflow-${index}`}
                  rank={index + 1}
                  title={fund.fundname || fund._id || 'Unnamed fund'}
                  subtitle={`${fund.ticker || '--'} | ${fund.categoryname || 'Uncategorized'}`}
                  metric={formatMoney(fund.flow_1m, { signed: true })}
                  metricColor="var(--red)"
                  onClick={() => navigate(`/funds/${fund._id}`)}
                />
              ))}
              {fundOutflows.length === 0 && <EmptyState />}
            </RankedListCard>
          </SectionPanel>
        </>
      )}
    </Box>
  );
};

const InsightPill = ({ label, value }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      px: '12px',
      py: '8px',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.03)',
      color: 'var(--text-2)',
      fontSize: '12px',
    }}
  >
    <Box sx={{ color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </Box>
    <Box sx={{ color: 'var(--text-1)', fontWeight: 700 }}>{value}</Box>
  </Box>
);

const SnapshotStat = ({ label, value, detail }) => (
  <Box
    sx={{
      p: '14px',
      borderRadius: '18px',
      border: '1px solid var(--border)',
      background: 'var(--bg-surface)',
    }}
  >
    <Box
      sx={{
        fontSize: '11px',
        color: 'var(--text-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: '8px',
      }}
    >
      {label}
    </Box>
    <Box
      sx={{
        color: 'var(--text-1)',
        fontSize: '15px',
        fontWeight: 700,
        lineHeight: 1.35,
        mb: detail ? '6px' : 0,
      }}
    >
      {value}
    </Box>
    {detail && (
      <Box sx={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.45 }}>{detail}</Box>
    )}
  </Box>
);

const SectionPanel = ({ eyebrow, title, description, children }) => (
  <Box sx={{ mb: '24px' }}>
    <Box sx={{ mb: '18px' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: '10px',
          py: '6px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-3)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          mb: '10px',
        }}
      >
        {eyebrow}
      </Box>
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: { xs: '28px', md: '32px' },
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: 'var(--text-1)',
          mb: '6px',
        }}
      >
        {title}
      </Box>
      <Box sx={{ color: 'var(--text-4)', fontSize: '13px', lineHeight: 1.7 }}>{description}</Box>
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '18px',
      }}
    >
      {children}
    </Box>
  </Box>
);

const RankedListCard = ({ title, subtitle, children }) => (
  <AppCard variant="surface" sx={{ p: 0, overflow: 'hidden' }}>
    <Box
      sx={{
        px: '20px',
        py: '18px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text-1)',
          mb: '4px',
        }}
      >
        {title}
      </Box>
      <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>{subtitle}</Box>
    </Box>
    <Box sx={{ display: 'grid' }}>{children}</Box>
  </AppCard>
);

const RankedRow = ({ rank, title, subtitle, metric, metricColor, onClick }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      display: 'grid',
      gridTemplateColumns: '28px minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      px: '20px',
      py: '13px',
      cursor: 'pointer',
      transition: 'background var(--transition)',
      '& + &': {
        borderTop: '1px solid var(--border)',
      },
      '&:hover': {
        background: 'var(--bg-surface-hover)',
      },
      '&:hover .ranked-row-title': {
        color: 'var(--accent-strong)',
      },
    }}
  >
    <Box
      sx={{
        color: 'var(--text-4)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
      }}
    >
      {rank}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Box
        className="ranked-row-title"
        sx={{
          color: 'var(--text-1)',
          fontSize: '13px',
          fontWeight: 650,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color var(--transition)',
        }}
      >
        {title}
      </Box>
      <Box
        sx={{
          color: 'var(--text-4)',
          fontSize: '11px',
          mt: '3px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle}
      </Box>
    </Box>
    <Box
      sx={{
        color: metricColor || 'var(--text-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {metric}
    </Box>
  </Box>
);

const EmptyState = () => (
  <Box
    sx={{ px: '20px', py: '28px', color: 'var(--text-4)', fontSize: '13px', textAlign: 'center' }}
  >
    No data available.
  </Box>
);

export default Dashboard;
