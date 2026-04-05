import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useCategoryOverview from '../hooks/useCategoryOverview';
import useScreener from '../hooks/useScreener';
import StatCard from './StatCard';
import AsOfDateSelector from './AsOfDateSelector';

const CategoryOverview = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const category = decodeURIComponent(name || '');
  const [asofDate, setAsofDate] = useState('');

  const { data: overview, isLoading: overviewLoading } = useCategoryOverview(category, asofDate);
  const { data: funds, isLoading: fundsLoading, totalFunds } = useScreener({
    category,
    asofDate,
  });

  const topByReturn = useMemo(() => {
    const sorted = [...funds].sort((a, b) => {
      const av = a.performance?.return1yr != null ? Number(a.performance.return1yr) : -Infinity;
      const bv = b.performance?.return1yr != null ? Number(b.performance.return1yr) : -Infinity;
      return bv - av;
    });
    return sorted.slice(0, 10);
  }, [funds]);

  const bottomByReturn = useMemo(() => {
    const sorted = [...funds]
      .filter((f) => f.performance?.return1yr != null)
      .sort((a, b) => Number(a.performance.return1yr) - Number(b.performance.return1yr));
    return sorted.slice(0, 5);
  }, [funds]);

  const cheapest = useMemo(() => {
    return [...funds]
      .filter((f) => f.fees?.mer != null)
      .sort((a, b) => Number(a.fees.mer) - Number(b.fees.mer))
      .slice(0, 5);
  }, [funds]);

  const fmtReturn = (v) => {
    if (v == null) return '—';
    const n = Number(v);
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  };

  const fmtPct = (v) => (v == null ? '—' : `${Number(v).toFixed(2)}%`);

  const isLoading = overviewLoading || fundsLoading;

  return (
    <Box>
      {/* Back */}
      <Box
        component="button"
        onClick={() => navigate(-1)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'var(--text-3)', background: 'none',
          border: 'none', cursor: 'pointer', mb: '24px', padding: 0,
          transition: 'color var(--transition)',
          '&:hover': { color: 'var(--emerald)' },
        }}
      >&#8592; Back</Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '32px' }}>
        <Box>
          <Box component="h1" sx={{
            fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 600,
            color: 'var(--text-1)', letterSpacing: '-0.03em', mb: '4px',
          }}>
            {category}
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
            Category overview
            {totalFunds > 0 && (
              <span style={{ color: 'var(--text-2)' }}> · {totalFunds} funds</span>
            )}
          </Box>
        </Box>
        <AsOfDateSelector value={asofDate} onChange={setAsofDate} />
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '60px' }}>
          <CircularProgress sx={{ color: 'var(--emerald)' }} />
        </Box>
      )}

      {!isLoading && overview && (
        <>
          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', mb: '28px' }}>
            <StatCard label="Funds in Category" value={overview.fund_count ? Number(overview.fund_count).toLocaleString() : '—'} />
            <StatCard
              label="Avg 1Y Return"
              value={fmtReturn(overview.avg_return_1yr)}
              valueColor={Number(overview.avg_return_1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
            />
            <StatCard label="Avg MER" value={fmtPct(overview.avg_mer)} />
            <StatCard label="Avg Rating" value={overview.avg_rating != null ? Number(overview.avg_rating).toFixed(1) : '—'} />
          </Box>

          {/* Range Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', mb: '28px' }}>
            <RangeCard
              label="1Y Return Range"
              min={fmtReturn(overview.min_return_1yr)}
              max={fmtReturn(overview.max_return_1yr)}
              median={fmtReturn(overview.median_return_1yr)}
            />
            <RangeCard
              label="MER Range"
              min={fmtPct(overview.min_mer)}
              max={fmtPct(overview.max_mer)}
              median={fmtPct(overview.avg_mer)}
              medianLabel="Avg"
            />
            <RangeCard
              label="Avg Annualized Returns"
              min={fmtReturn(overview.avg_return_3yr)}
              max={fmtReturn(overview.avg_return_5yr)}
              median={fmtReturn(overview.avg_return_1yr)}
              minLabel="3Y Avg"
              maxLabel="5Y Avg"
              medianLabel="1Y Avg"
            />
          </Box>

          {/* Top / Bottom / Cheapest */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <ListSection
              title="Top Performers (1Y)"
              items={topByReturn}
              metric={(f) => fmtReturn(f.performance?.return1yr)}
              metricColor={(f) => Number(f.performance?.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <ListSection
              title="Bottom Performers (1Y)"
              items={bottomByReturn}
              metric={(f) => fmtReturn(f.performance?.return1yr)}
              metricColor={(f) => Number(f.performance?.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <ListSection
              title="Lowest MER"
              items={cheapest}
              metric={(f) => fmtPct(f.fees?.mer)}
              metricColor={() => 'var(--emerald)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

/* Sub-components */

const RangeCard = ({
  label, min, max, median,
  minLabel = 'Min', maxLabel = 'Max', medianLabel = 'Median',
}) => (
  <Box sx={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
  }}>
    <Box sx={{
      fontSize: '11px', fontWeight: 600, color: 'var(--text-3)',
      textTransform: 'uppercase', letterSpacing: '0.06em', mb: '16px',
    }}>{label}</Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <RangeValue label={minLabel} value={min} />
      <RangeValue label={medianLabel} value={median} highlight />
      <RangeValue label={maxLabel} value={max} />
    </Box>
  </Box>
);

const RangeValue = ({ label, value, highlight }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ fontSize: '10px', color: 'var(--text-4)', mb: '4px', textTransform: 'uppercase' }}>{label}</Box>
    <Box sx={{
      fontFamily: 'var(--font-mono)', fontSize: highlight ? '18px' : '14px',
      color: highlight ? 'var(--text-1)' : 'var(--text-2)', fontWeight: highlight ? 600 : 400,
    }}>{value}</Box>
  </Box>
);

const ListSection = ({ title, items, metric, metricColor, onFundClick }) => (
  <Box sx={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  }}>
    <Box sx={{
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-head)', fontSize: '13px', fontWeight: 600,
      color: 'var(--text-2)', letterSpacing: '-0.01em',
    }}>{title}</Box>
    <Box>
      {items.map((fund, i) => (
        <Box
          key={fund._id}
          onClick={() => onFundClick(fund._id)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', cursor: 'pointer',
            transition: 'background var(--transition)',
            borderBottom: '1px solid rgba(30,41,59,0.3)',
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { background: 'var(--bg-surface-hover)' },
          }}
        >
          <Box sx={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-4)',
            width: '20px', textAlign: 'right', flexShrink: 0,
          }}>{i + 1}</Box>
          <Box sx={{
            flex: 1, fontSize: '13px', color: 'var(--text-1)', fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {fund.fundname || fund._name || 'N/A'}
          </Box>
          <Box sx={{
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            color: metricColor(fund), fontWeight: 500, flexShrink: 0,
          }}>
            {metric(fund)}
          </Box>
        </Box>
      ))}
      {items.length === 0 && (
        <Box sx={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
          No data available
        </Box>
      )}
    </Box>
  </Box>
);

export default CategoryOverview;
