import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import AsOfDateSelector from './AsOfDateSelector';
import SEO from './SEO';
import StatCard from './StatCard';
import useCategoryConstituents from '../hooks/useCategoryConstituents';

const PANEL_SX = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '28px',
  border: '1px solid var(--border)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
  boxShadow: 'var(--shadow-panel)',
};

const MER_BUCKETS = [
  { label: '<0.50%', min: -Infinity, max: 0.5 },
  { label: '0.50-0.99%', min: 0.5, max: 1 },
  { label: '1.00-1.49%', min: 1, max: 1.5 },
  { label: '1.50-1.99%', min: 1.5, max: 2 },
  { label: '2.00%+', min: 2, max: Infinity },
];

const RETURN_BUCKETS = [
  { label: '<0%', min: -Infinity, max: 0 },
  { label: '0-4.99%', min: 0, max: 5 },
  { label: '5-9.99%', min: 5, max: 10 },
  { label: '10-14.99%', min: 10, max: 15 },
  { label: '15%+', min: 15, max: Infinity },
];

const AUM_BUCKETS = [
  { label: '<$100M', min: -Infinity, max: 1e8 },
  { label: '$100M-$500M', min: 1e8, max: 5e8 },
  { label: '$500M-$1B', min: 5e8, max: 1e9 },
  { label: '$1B-$5B', min: 1e9, max: 5e9 },
  { label: '$5B+', min: 5e9, max: Infinity },
];

const RATING_BUCKETS = ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star', 'Unrated'];
const EMPTY_FUNDS = [];

const chartGridStyle = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  opacity: 0.55,
};

const axisStyle = {
  fontSize: 11,
  fill: 'var(--text-4)',
  fontFamily: 'var(--font-mono)',
};

const formatDateLabel = (iso) => {
  if (!iso) return '--';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatNumber = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '--';
  return Number(value).toLocaleString();
};

const formatPercent = (value, { signed = false, digits = 2 } = {}) => {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const number = Number(value);
  const prefix = signed && number > 0 ? '+' : '';
  return `${prefix}${number.toFixed(digits)}%`;
};

const formatRating = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '--';
  return `${Number(value).toFixed(1)} / 5`;
};

const formatMoneyCompact = (value, { signed = false, digits = 1 } = {}) => {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const number = Number(value);
  const abs = Math.abs(number);
  const sign = signed ? (number > 0 ? '+' : number < 0 ? '-' : '') : number < 0 ? '-' : '';

  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const numericValues = (funds, selector) =>
  funds
    .map((fund) => selector(fund))
    .filter((value) => value != null && !Number.isNaN(Number(value)))
    .map((value) => Number(value));

const average = (values) => {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const sum = (values) => values.reduce((total, value) => total + value, 0);

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const share = (part, total) => {
  if (!total) return null;
  return (part / total) * 100;
};

const buildRangeDistribution = (values, buckets) => {
  const total = values.length;

  return {
    total,
    buckets: buckets.map((bucket) => {
      const count = values.filter((value) => value >= bucket.min && value < bucket.max).length;
      return {
        label: bucket.label,
        count,
        share: total ? (count / total) * 100 : 0,
      };
    }),
  };
};

const buildRatingDistribution = (funds) => {
  const values = funds.map((fund) => fund.ratings?.ratingoverall);
  const total = values.length;

  return {
    total,
    buckets: RATING_BUCKETS.map((label) => {
      const count = values.filter((value) => {
        if (label === 'Unrated') {
          return value == null || Number.isNaN(Number(value));
        }
        return Number(value) === Number(label[0]);
      }).length;

      return {
        label,
        count,
        share: total ? (count / total) * 100 : 0,
      };
    }),
  };
};

const formatBucketSample = (count, noun) => {
  if (!count) return `No ${noun.toLowerCase()} disclosures`;
  return `${formatNumber(count)} ${noun.toLowerCase()} disclosures`;
};

const CategoryOverview = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const category = decodeURIComponent(name || '');
  const [asofDate, setAsofDate] = useState('');

  const handleOpenScreener = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (asofDate) params.set('asofDate', asofDate);
    const query = params.toString();
    navigate(query ? `/screener?${query}` : '/screener');
  };

  const { data, isLoading, isError, error } = useCategoryConstituents(category, asofDate);

  const funds = data?.funds ?? EMPTY_FUNDS;
  const totalFunds = data?.totalFunds || 0;
  const limited = data?.limited;
  const planLimit = data?.planLimit;

  const analytics = useMemo(() => {
    const merValues = numericValues(funds, (fund) => fund.fees?.mer);
    const return1yrValues = numericValues(funds, (fund) => fund.performance?.return1yr);
    const return3yrValues = numericValues(funds, (fund) => fund.performance?.return3yr);
    const ratingValues = numericValues(funds, (fund) => fund.ratings?.ratingoverall);
    const aumValues = numericValues(funds, (fund) => fund.assets?.fundnetassets);
    const flow1mValues = numericValues(funds, (fund) => fund.flows?.estfundlevelnetflow1momoend);

    const totalAum = sum(aumValues);
    const positiveReturnCount = return1yrValues.filter((value) => value > 0).length;
    const highlyRatedCount = ratingValues.filter((value) => value >= 4).length;
    const inflowCount = flow1mValues.filter((value) => value > 0).length;
    const netFlow1m = sum(flow1mValues);

    const topPerformers = [...funds]
      .filter((fund) => fund.performance?.return1yr != null)
      .sort(
        (left, right) => Number(right.performance.return1yr) - Number(left.performance.return1yr),
      )
      .slice(0, 6);

    const lowestMer = [...funds]
      .filter((fund) => fund.fees?.mer != null)
      .sort((left, right) => Number(left.fees.mer) - Number(right.fees.mer))
      .slice(0, 6);

    const largestFunds = [...funds]
      .filter((fund) => fund.assets?.fundnetassets != null)
      .sort((left, right) => Number(right.assets.fundnetassets) - Number(left.assets.fundnetassets))
      .slice(0, 6);

    const top10AumShare = share(
      sum(
        [...funds]
          .filter((fund) => fund.assets?.fundnetassets != null)
          .sort(
            (left, right) => Number(right.assets.fundnetassets) - Number(left.assets.fundnetassets),
          )
          .slice(0, 10)
          .map((fund) => Number(fund.assets.fundnetassets)),
      ),
      totalAum,
    );

    const feeDistribution = buildRangeDistribution(merValues, MER_BUCKETS);
    const returnDistribution = buildRangeDistribution(return1yrValues, RETURN_BUCKETS);
    const aumDistribution = buildRangeDistribution(aumValues, AUM_BUCKETS);
    const ratingDistribution = buildRatingDistribution(funds);

    const scatterData = funds
      .filter((fund) => fund.fees?.mer != null && fund.performance?.return1yr != null)
      .map((fund) => {
        const aum = fund.assets?.fundnetassets != null ? Number(fund.assets.fundnetassets) : 0;
        return {
          x: Number(fund.fees.mer),
          y: Number(fund.performance.return1yr),
          z: Math.max(70, Math.log10(Math.max(aum, 1)) * 52),
          aum,
          mer: Number(fund.fees.mer),
          return1yr: Number(fund.performance.return1yr),
          fundname: fund.fundname || 'Unknown fund',
          ticker: fund.ticker || '--',
          rating: fund.ratings?.ratingoverall != null ? Number(fund.ratings.ratingoverall) : null,
        };
      });

    const dominantMerBand = [...feeDistribution.buckets].sort(
      (left, right) => right.count - left.count,
    )[0];
    const dominantReturnBand = [...returnDistribution.buckets].sort(
      (left, right) => right.count - left.count,
    )[0];

    return {
      avgMer: average(merValues),
      medianMer: median(merValues),
      avgReturn1yr: average(return1yrValues),
      medianReturn1yr: median(return1yrValues),
      avgReturn3yr: average(return3yrValues),
      avgRating: average(ratingValues),
      totalAum,
      netFlow1m,
      positiveReturnShare: share(positiveReturnCount, return1yrValues.length),
      highlyRatedShare: share(highlyRatedCount, ratingValues.length),
      inflowShare: share(inflowCount, flow1mValues.length),
      top10AumShare,
      feeDistribution,
      returnDistribution,
      aumDistribution,
      ratingDistribution,
      topPerformers,
      lowestMer,
      largestFunds,
      scatterData,
      dominantMerBand,
      dominantReturnBand,
      returnSample: return1yrValues.length,
      merSample: merValues.length,
      ratingSample: ratingValues.length,
      aumSample: aumValues.length,
    };
  }, [funds]);

  return (
    <Box>
      <SEO
        title={`${category} Category Overview`}
        path={`/categories/${encodeURIComponent(category)}`}
        noIndex
      />

      <Box
        component="button"
        onClick={() => navigate(-1)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-3)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          mb: '24px',
          padding: 0,
          transition: 'color var(--transition)',
          '&:hover': { color: 'var(--accent-strong)' },
        }}
      >
        {'<- Back'}
      </Box>

      <Box
        sx={{
          ...PANEL_SX,
          mb: '24px',
          px: { xs: '20px', md: '28px' },
          py: { xs: '22px', md: '28px' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '-36% auto auto 56%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'rgba(111, 76, 245, 0.18)',
            filter: 'blur(82px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto auto -38% -8%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(23, 201, 120, 0.12)',
            filter: 'blur(72px)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 320px' },
            gap: '20px',
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
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: '14px',
              }}
            >
              Category overall
            </Box>

            <Box
              component="h1"
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '30px', md: '42px' },
                fontWeight: 800,
                letterSpacing: '-0.06em',
                lineHeight: 0.96,
                mb: '10px',
                maxWidth: '720px',
              }}
            >
              {category}
            </Box>

            <Box
              sx={{
                color: 'var(--text-3)',
                lineHeight: 1.75,
                maxWidth: '760px',
                mb: '20px',
              }}
            >
              Read the category as a pool instead of a leaderboard: fee pressure, return breadth,
              ratings mix, capital concentration, and where individual funds sit inside the spread.
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '20px' }}>
              <InsightPill label="Funds tracked" value={formatNumber(totalFunds)} />
              <InsightPill
                label="Median MER"
                value={formatPercent(analytics.medianMer, { digits: 2 })}
              />
              <InsightPill
                label="Positive 1Y share"
                value={formatPercent(analytics.positiveReturnShare, { digits: 0 })}
              />
              <InsightPill
                label="4-5 star share"
                value={formatPercent(analytics.highlyRatedShare, { digits: 0 })}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '20px' }}>
              <Box
                component="button"
                onClick={handleOpenScreener}
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
                View Funds In Screener
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: '14px',
                  py: '10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-3)',
                  fontSize: '12px',
                }}
              >
                Drill into the full fund list with the same category and date context.
              </Box>
            </Box>

            {limited && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  px: '12px',
                  py: '9px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(244, 184, 96, 0.22)',
                  background: 'var(--amber-soft)',
                  color: 'var(--amber)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Distribution reflects the visible {formatNumber(planLimit || totalFunds)} funds on
                this plan.
              </Box>
            )}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
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
                  As of {formatDateLabel(asofDate)}
                </Box>
              </Box>
              <AsOfDateSelector value={asofDate} onChange={setAsofDate} compact />
            </Box>

            <HighlightRow
              label="Most common MER band"
              value={analytics.dominantMerBand?.label || '--'}
              detail={formatBucketSample(analytics.merSample, 'MER')}
            />
            <HighlightRow
              label="Most common 1Y band"
              value={analytics.dominantReturnBand?.label || '--'}
              detail={formatBucketSample(analytics.returnSample, 'return')}
            />
            <HighlightRow
              label="Net flow posture"
              value={formatMoneyCompact(analytics.netFlow1m, { signed: true })}
              detail={
                analytics.inflowShare != null
                  ? `${formatPercent(analytics.inflowShare, { digits: 0 })} of disclosed funds were in inflow`
                  : 'Flow data unavailable'
              }
            />
            <HighlightRow
              label="Top-10 capital share"
              value={formatPercent(analytics.top10AumShare, { digits: 0 })}
              detail={
                analytics.totalAum
                  ? `${formatMoneyCompact(analytics.totalAum)} aggregate AUM in category`
                  : 'AUM disclosures unavailable'
              }
            />
          </Box>
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '72px' }}>
          <CircularProgress sx={{ color: 'var(--accent)' }} />
        </Box>
      )}

      {isError && (
        <Box
          sx={{
            ...PANEL_SX,
            px: '20px',
            py: '18px',
            color: 'var(--red)',
            background: 'var(--red-soft)',
            borderColor: 'rgba(224, 72, 99, 0.24)',
          }}
        >
          {error?.message || 'Failed to load category data.'}
        </Box>
      )}

      {!isLoading && !isError && totalFunds === 0 && (
        <Box
          sx={{
            ...PANEL_SX,
            px: '24px',
            py: '40px',
            textAlign: 'center',
            color: 'var(--text-3)',
          }}
        >
          No category data is available for this date.
        </Box>
      )}

      {!isLoading && !isError && totalFunds > 0 && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: '16px',
              mb: '24px',
            }}
          >
            <StatCard label="Total AUM" value={formatMoneyCompact(analytics.totalAum)} />
            <StatCard
              label="Avg 1Y Return"
              value={formatPercent(analytics.avgReturn1yr, { signed: true })}
              valueColor={
                analytics.avgReturn1yr == null
                  ? undefined
                  : analytics.avgReturn1yr >= 0
                    ? 'var(--emerald)'
                    : 'var(--red)'
              }
            />
            <StatCard label="Median MER" value={formatPercent(analytics.medianMer)} />
            <StatCard label="Avg Rating" value={formatRating(analytics.avgRating)} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
              gap: '20px',
              mb: '24px',
            }}
          >
            <DistributionCard
              title="MER distribution"
              subtitle={formatBucketSample(analytics.merSample, 'MER')}
              items={analytics.feeDistribution.buckets}
              accent="var(--accent)"
            />
            <DistributionCard
              title="1Y return distribution"
              subtitle={formatBucketSample(analytics.returnSample, 'return')}
              items={analytics.returnDistribution.buckets}
              accent="var(--emerald)"
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(320px, 0.85fr)' },
              gap: '20px',
              mb: '24px',
            }}
          >
            <ScatterPanel
              data={analytics.scatterData}
              merMedian={analytics.medianMer}
              returnMedian={analytics.medianReturn1yr}
            />
            <Box sx={{ display: 'grid', gap: '20px' }}>
              <DistributionCard
                title="Rating mix"
                subtitle={`${formatNumber(totalFunds)} funds in category`}
                items={analytics.ratingDistribution.buckets}
                accent="var(--amber)"
              />
              <DistributionCard
                title="AUM size buckets"
                subtitle={formatBucketSample(analytics.aumSample, 'AUM')}
                items={analytics.aumDistribution.buckets}
                accent="var(--blue)"
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: '20px',
            }}
          >
            <RankedFundsCard
              title="Best 1Y performers"
              subtitle="Highest trailing 1-year return"
              funds={analytics.topPerformers}
              metric={(fund) => formatPercent(fund.performance?.return1yr, { signed: true })}
              metricColor={(fund) =>
                Number(fund.performance?.return1yr) >= 0 ? 'var(--emerald)' : 'var(--red)'
              }
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <RankedFundsCard
              title="Lowest MER"
              subtitle="Cheapest fee profile in category"
              funds={analytics.lowestMer}
              metric={(fund) => formatPercent(fund.fees?.mer)}
              metricColor={() => 'var(--accent-strong)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <RankedFundsCard
              title="Largest funds"
              subtitle="Largest disclosed fund net assets"
              funds={analytics.largestFunds}
              metric={(fund) => formatMoneyCompact(fund.assets?.fundnetassets)}
              metricColor={() => 'var(--text-1)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
          </Box>
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
      px: '14px',
      py: '10px',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.03)',
      color: 'var(--text-2)',
      fontSize: '12px',
      fontWeight: 600,
    }}
  >
    <Box sx={{ color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </Box>
    <Box sx={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{value}</Box>
  </Box>
);

const HighlightRow = ({ label, value, detail }) => (
  <Box
    sx={{
      p: '14px',
      borderRadius: '18px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        mb: '4px',
      }}
    >
      <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>{label}</Box>
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text-1)',
        }}
      >
        {value}
      </Box>
    </Box>
    <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>{detail}</Box>
  </Box>
);

const DistributionCard = ({ title, subtitle, items, accent }) => (
  <Box sx={{ ...PANEL_SX, p: '22px' }}>
    <Box sx={{ mb: '18px' }}>
      <Box
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '24px',
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

    <Box sx={{ display: 'grid', gap: '12px' }}>
      {items.map((item) => (
        <Box key={item.label}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              mb: '6px',
            }}
          >
            <Box sx={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>
              {item.label}
            </Box>
            <Box sx={{ fontSize: '12px', color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
              {formatNumber(item.count)} | {formatPercent(item.share, { digits: 0 })}
            </Box>
          </Box>
          <Box
            sx={{
              height: '10px',
              borderRadius: '999px',
              background: 'var(--bar-track)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${item.share}%`,
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.18))`,
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

const ScatterPanel = ({ data, merMedian, returnMedian }) => (
  <Box sx={{ ...PANEL_SX, p: '22px' }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '16px',
        flexWrap: 'wrap',
        mb: '18px',
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
            mb: '4px',
          }}
        >
          MER vs 1Y return
        </Box>
        <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
          Bubble size maps to fund net assets. Lower left is cheaper but weaker, upper left is the
          efficient quadrant.
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <MiniLegend label="Median MER" value={formatPercent(merMedian)} />
        <MiniLegend label="Median 1Y" value={formatPercent(returnMedian, { signed: true })} />
      </Box>
    </Box>

    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 16, right: 8, bottom: 6, left: 0 }}>
          <CartesianGrid {...chartGridStyle} />
          <XAxis
            type="number"
            dataKey="x"
            name="MER"
            tick={axisStyle}
            tickFormatter={(value) => `${value}%`}
            domain={['dataMin - 0.15', 'dataMax + 0.15']}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="1Y Return"
            tick={axisStyle}
            tickFormatter={(value) => `${value}%`}
            width={56}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <ZAxis type="number" dataKey="z" range={[70, 460]} />
          <Tooltip cursor={{ stroke: 'var(--border)' }} content={<ScatterTooltip />} />
          <Scatter data={data}>
            {data.map((point) => (
              <Cell
                key={`${point.ticker}-${point.fundname}`}
                fill={point.y >= 0 ? 'var(--emerald)' : 'var(--red)'}
                fillOpacity={0.72}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    ) : (
      <EmptyCardMessage label="Not enough MER and return disclosures to draw the scatter map." />
    )}
  </Box>
);

const MiniLegend = ({ label, value }) => (
  <Box
    sx={{
      px: '10px',
      py: '8px',
      borderRadius: '14px',
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.03)',
    }}
  >
    <Box sx={{ fontSize: '10px', color: 'var(--text-4)', textTransform: 'uppercase' }}>{label}</Box>
    <Box sx={{ fontSize: '13px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
      {value}
    </Box>
  </Box>
);

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <Box
      sx={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        p: '12px 14px',
        boxShadow: 'var(--shadow-soft)',
        minWidth: '220px',
      }}
    >
      <Box sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', mb: '2px' }}>
        {point.fundname}
      </Box>
      <Box sx={{ fontSize: '11px', color: 'var(--text-4)', mb: '10px' }}>{point.ticker}</Box>
      <TooltipMetric label="MER" value={formatPercent(point.mer)} />
      <TooltipMetric label="1Y Return" value={formatPercent(point.return1yr, { signed: true })} />
      <TooltipMetric label="AUM" value={formatMoneyCompact(point.aum)} />
      <TooltipMetric
        label="Rating"
        value={point.rating != null ? `${point.rating.toFixed(0)} stars` : 'Unrated'}
      />
    </Box>
  );
};

const TooltipMetric = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '12px' }}>
    <Box sx={{ color: 'var(--text-4)' }}>{label}</Box>
    <Box sx={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{value}</Box>
  </Box>
);

const RankedFundsCard = ({ title, subtitle, funds, metric, metricColor, onFundClick }) => (
  <Box sx={{ ...PANEL_SX }}>
    <Box
      sx={{
        px: '22px',
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

    <Box sx={{ p: '6px 0' }}>
      {funds.length === 0 ? (
        <EmptyCardMessage label="No funds available for this ranking." />
      ) : (
        funds.map((fund, index) => (
          <Box
            key={fund._id}
            onClick={() => onFundClick(fund._id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              px: '22px',
              py: '12px',
              cursor: 'pointer',
              transition: 'background var(--transition)',
              '&:hover': { background: 'var(--bg-surface-hover)' },
              '&:hover .fund-name': { color: 'var(--accent-strong)' },
            }}
          >
            <Box
              sx={{
                width: '26px',
                fontSize: '12px',
                textAlign: 'right',
                color: 'var(--text-4)',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                className="fund-name"
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color var(--transition)',
                }}
              >
                {fund.fundname || 'Unknown fund'}
              </Box>
              <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
                {fund.ticker || '--'}
                {fund.ratings?.ratingoverall
                  ? ` | ${Number(fund.ratings.ratingoverall).toFixed(0)} stars`
                  : ''}
              </Box>
            </Box>
            <Box
              sx={{
                fontSize: '13px',
                fontWeight: 700,
                color: metricColor(fund),
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}
            >
              {metric(fund)}
            </Box>
          </Box>
        ))
      )}
    </Box>
  </Box>
);

const EmptyCardMessage = ({ label }) => (
  <Box
    sx={{ px: '22px', py: '30px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}
  >
    {label}
  </Box>
);

export default CategoryOverview;
