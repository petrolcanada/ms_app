import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useDashboard from '../hooks/useDashboard';
import useAvailableDates from '../hooks/useAvailableDates';
import StatCard from './StatCard';
import SEO from './SEO';
import OnboardingTour from './OnboardingTour';

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

  const formatAum = (value) => {
    if (value == null) return '--';
    const number = Math.abs(Number(value));
    if (number >= 1e12) return `$${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `$${(number / 1e9).toFixed(1)}B`;
    if (number >= 1e6) return `$${(number / 1e6).toFixed(0)}M`;
    return `$${number.toLocaleString()}`;
  };

  const formatFundCount = (value) => {
    if (value == null) return 'Pool size unavailable';
    return `${Number(value).toLocaleString()} funds`;
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

  const {
    stats,
    topPerformers,
    bottomPerformers,
    topCategories,
    bottomCategories,
    largestFlows,
    largestFlowCategories,
  } = data;
  const categoryInflows =
    largestFlowCategories?.filter((category) => category.direction === 'inflow') || [];
  const categoryOutflows =
    largestFlowCategories?.filter((category) => category.direction === 'outflow') || [];
  const fundInflows = largestFlows?.filter((fund) => fund.direction === 'inflow') || [];
  const fundOutflows = largestFlows?.filter((fund) => fund.direction === 'outflow') || [];
  const asOfDate = formatDateLabel(stats?.latest_date || latestDate);
  const topCategoriesAsOfDate = topCategories?.[0]?.dayenddate
    ? formatDateLabel(topCategories[0].dayenddate)
    : '';
  const avgReturnPositive =
    stats?.avg_return_1yr != null ? Number(stats.avg_return_1yr) >= 0 : undefined;

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
                label: 'Total AUM',
                value: formatAum(stats?.total_aum),
              },
              {
                label: 'Average 1Y return',
                value: formatReturn(stats?.avg_return_1yr),
                positive: avgReturnPositive,
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '16px',
          mb: '24px',
        }}
      >
        <StatCard
          label="Total Funds"
          value={stats?.total_funds ? Number(stats.total_funds).toLocaleString() : '--'}
        />
        <StatCard label="Total AUM" value={formatAum(stats?.total_aum)} />
        <StatCard
          label="Avg 1-Year Return"
          value={formatReturn(stats?.avg_return_1yr)}
          valueColor={
            avgReturnPositive == null
              ? undefined
              : avgReturnPositive
                ? 'var(--emerald)'
                : 'var(--red)'
          }
        />
      </Box>

      <DashboardGroup
        eyebrow="Category specific"
        title="Category leaders and laggards"
        description="Return and flow cards grouped around category-level moves."
      >
        <SectionCard
          title="Top Performers"
          subtitle={
            topCategoriesAsOfDate
              ? `Category 1Y return | ${topCategoriesAsOfDate}`
              : 'Category 1Y return'
          }
        >
          {(topCategories || []).slice(0, 10).map((category, index) => (
            <CategoryRow
              key={`${category.categorycode || category.categoryname}-top-${index}`}
              rank={index + 1}
              category={category}
              metric={formatReturn(category.return1yr)}
              metricColor={Number(category.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              sublabel={formatFundCount(category.fund_count)}
              onClick={() => navigate(`/categories/${encodeURIComponent(category.categoryname)}`)}
            />
          ))}
          {(!topCategories || topCategories.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard
          title="Bottom Performers"
          subtitle={
            topCategoriesAsOfDate
              ? `Category 1Y return | ${topCategoriesAsOfDate}`
              : 'Category 1Y return'
          }
        >
          {(bottomCategories || []).slice(0, 10).map((category, index) => (
            <CategoryRow
              key={`${category.categorycode || category.categoryname}-bottom-${index}`}
              rank={index + 1}
              category={category}
              metric={formatReturn(category.return1yr)}
              metricColor={Number(category.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              sublabel={formatFundCount(category.fund_count)}
              onClick={() => navigate(`/categories/${encodeURIComponent(category.categoryname)}`)}
            />
          ))}
          {(!bottomCategories || bottomCategories.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Inflows" subtitle="Summed 1-month category flows">
          {categoryInflows.map((category, index) => (
            <CategoryRow
              key={`${category.categoryname}-inflow-${index}`}
              rank={index + 1}
              category={category}
              metric={formatMoney(category.flow_1m)}
              metricColor="var(--emerald)"
              sublabel={formatFundCount(category.fund_count)}
              onClick={() => navigate(`/categories/${encodeURIComponent(category.categoryname)}`)}
            />
          ))}
          {categoryInflows.length === 0 && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Outflows" subtitle="Summed 1-month category flows">
          {categoryOutflows.map((category, index) => (
            <CategoryRow
              key={`${category.categoryname}-outflow-${index}`}
              rank={index + 1}
              category={category}
              metric={formatMoney(category.flow_1m)}
              metricColor="var(--red)"
              sublabel={formatFundCount(category.fund_count)}
              onClick={() => navigate(`/categories/${encodeURIComponent(category.categoryname)}`)}
            />
          ))}
          {categoryOutflows.length === 0 && <EmptyState />}
        </SectionCard>
      </DashboardGroup>

      <DashboardGroup
        eyebrow="Fund specific"
        title="Fund winners, losers, and flow extremes"
        description="Direct fund rankings separated from the category summaries."
      >
        <SectionCard title="Top Performers" subtitle="Fund 1Y return">
          {(topPerformers || []).slice(0, 10).map((fund, index) => (
            <FundRow
              key={`${fund._id}-top-${index}`}
              rank={index + 1}
              fund={fund}
              metric={formatReturn(fund.return1yr)}
              metricColor={Number(fund.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!topPerformers || topPerformers.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard title="Bottom Performers" subtitle="Fund 1Y return">
          {(bottomPerformers || []).slice(0, 10).map((fund, index) => (
            <FundRow
              key={`${fund._id}-bottom-${index}`}
              rank={index + 1}
              fund={fund}
              metric={formatReturn(fund.return1yr)}
              metricColor={Number(fund.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {(!bottomPerformers || bottomPerformers.length === 0) && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Inflows" subtitle="Fund 1-month net flows">
          {fundInflows.map((fund, index) => (
            <FundRow
              key={`${fund._id}-inflow-${index}`}
              rank={index + 1}
              fund={fund}
              metric={formatMoney(fund.flow_1m)}
              metricColor="var(--emerald)"
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {fundInflows.length === 0 && <EmptyState />}
        </SectionCard>

        <SectionCard title="Largest Outflows" subtitle="Fund 1-month net flows">
          {fundOutflows.map((fund, index) => (
            <FundRow
              key={`${fund._id}-outflow-${index}`}
              rank={index + 1}
              fund={fund}
              metric={formatMoney(fund.flow_1m)}
              metricColor="var(--red)"
              onClick={() => navigate(`/funds/${fund._id}`)}
            />
          ))}
          {fundOutflows.length === 0 && <EmptyState />}
        </SectionCard>
      </DashboardGroup>
    </Box>
  );
};

const DashboardGroup = ({ eyebrow, title, description, children }) => (
  <Box
    sx={{
      mb: '24px',
      p: { xs: '18px', md: '22px' },
      borderRadius: '28px',
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      boxShadow: 'var(--shadow-panel)',
    }}
  >
    <Box sx={{ mb: '18px' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: '10px',
          py: '6px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.03)',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: '20px',
      }}
    >
      {children}
    </Box>
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

const CategoryRow = ({ rank, category, metric, metricColor, sublabel, onClick }) => (
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
      '&:hover .category-name': { color: 'var(--accent-strong)' },
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
        className="category-name"
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
        {category.categoryname || 'Uncategorized'}
      </Box>
      <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>{sublabel}</Box>
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
        {fund.categoryname ? ` | ${fund.categoryname}` : ''}
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
