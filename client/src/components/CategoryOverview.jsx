import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
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
import { designTokens } from '../design/tokens';
import { axisStyle, chartGridStyle } from './charts/rechartsTheme';
import HorizontalBarChartPanel from './charts/HorizontalBarChartPanel';
import useCategories from '../hooks/useCategories';
import useCategoryConstituents from '../hooks/useCategoryConstituents';
import ActionPill, { PillSeparator as Separator } from './ui/ActionPill';

const PANEL_SX = {
  ...designTokens.card.panel,
  position: 'relative',
  overflow: 'hidden',
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

const formatAxisPercent = (value, { digits = 2 } = {}) => {
  if (value == null || Number.isNaN(Number(value))) return '--';
  return `${new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number(value))}%`;
};

const formatPinnedFundLabel = (value) => {
  if (!value) return '--';
  const compact = value
    .replace(/\b(Fund|Portfolio|Trust|ETF|Series|Class)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (compact.length <= 28) return compact;
  return `${compact.slice(0, 25).trimEnd()}...`;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeRange = (value, min, max, fallback = 0.5) => {
  if (value == null || !Number.isFinite(value)) return fallback;
  if (min == null || max == null || min === max) return fallback;
  return clamp((value - min) / (max - min), 0, 1);
};

const ratioToColor = (score) => {
  const low = { r: 239, g: 68, b: 68 };
  const high = { r: 16, g: 185, b: 129 };
  const blend = clamp(score ?? 0.5, 0, 1);
  const r = Math.round(low.r + (high.r - low.r) * blend);
  const g = Math.round(low.g + (high.g - low.g) * blend);
  const b = Math.round(low.b + (high.b - low.b) * blend);
  return `rgb(${r}, ${g}, ${b})`;
};

const SCATTER_LABEL_PLACEMENTS = [
  {
    name: 'upperRight',
    labelDx: 28,
    labelDy: -38,
    textAnchor: 'start',
    boxWidth: 156,
    xOffset: 0.12,
    yOffset: -0.14,
    boxWidthNorm: 0.22,
  },
  {
    name: 'upperLeft',
    labelDx: -28,
    labelDy: -38,
    textAnchor: 'end',
    boxWidth: 156,
    xOffset: -0.12,
    yOffset: -0.14,
    boxWidthNorm: 0.22,
  },
  {
    name: 'lowerRight',
    labelDx: 28,
    labelDy: 38,
    textAnchor: 'start',
    boxWidth: 156,
    xOffset: 0.12,
    yOffset: 0.14,
    boxWidthNorm: 0.22,
  },
  {
    name: 'lowerLeft',
    labelDx: -28,
    labelDy: 38,
    textAnchor: 'end',
    boxWidth: 156,
    xOffset: -0.12,
    yOffset: 0.14,
    boxWidthNorm: 0.22,
  },
  {
    name: 'right',
    labelDx: 34,
    labelDy: -8,
    textAnchor: 'start',
    boxWidth: 156,
    xOffset: 0.14,
    yOffset: -0.02,
    boxWidthNorm: 0.22,
  },
  {
    name: 'left',
    labelDx: -34,
    labelDy: -8,
    textAnchor: 'end',
    boxWidth: 156,
    xOffset: -0.14,
    yOffset: -0.02,
    boxWidthNorm: 0.22,
  },
  {
    name: 'farUpperRight',
    labelDx: 52,
    labelDy: -54,
    textAnchor: 'start',
    boxWidth: 160,
    xOffset: 0.2,
    yOffset: -0.2,
    boxWidthNorm: 0.23,
  },
  {
    name: 'farUpperLeft',
    labelDx: -52,
    labelDy: -54,
    textAnchor: 'end',
    boxWidth: 160,
    xOffset: -0.2,
    yOffset: -0.2,
    boxWidthNorm: 0.23,
  },
  {
    name: 'farLowerRight',
    labelDx: 52,
    labelDy: 54,
    textAnchor: 'start',
    boxWidth: 160,
    xOffset: 0.2,
    yOffset: 0.2,
    boxWidthNorm: 0.23,
  },
  {
    name: 'farLowerLeft',
    labelDx: -52,
    labelDy: 54,
    textAnchor: 'end',
    boxWidth: 160,
    xOffset: -0.2,
    yOffset: 0.2,
    boxWidthNorm: 0.23,
  },
  {
    name: 'outerLeft',
    labelDx: -82,
    labelDy: -8,
    textAnchor: 'end',
    boxWidth: 164,
    xOffset: -0.28,
    yOffset: -0.02,
    boxWidthNorm: 0.24,
  },
  {
    name: 'outerLowerLeft',
    labelDx: -86,
    labelDy: 42,
    textAnchor: 'end',
    boxWidth: 164,
    xOffset: -0.3,
    yOffset: 0.15,
    boxWidthNorm: 0.24,
  },
  {
    name: 'outerRight',
    labelDx: 82,
    labelDy: -8,
    textAnchor: 'start',
    boxWidth: 164,
    xOffset: 0.28,
    yOffset: -0.02,
    boxWidthNorm: 0.24,
  },
  {
    name: 'outerLowerRight',
    labelDx: 86,
    labelDy: 42,
    textAnchor: 'start',
    boxWidth: 164,
    xOffset: 0.3,
    yOffset: 0.15,
    boxWidthNorm: 0.24,
  },
];

const SCATTER_LABEL_SAFE_BOUNDS = {
  left: -0.34,
  right: 1.34,
  top: -0.22,
  bottom: 1.22,
};

const normalizeScatterCoord = (value, min, max) => {
  if (min == null || max == null || min === max) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
};

const buildScatterPlacementRect = (point, placement, bounds) => {
  const xNorm = normalizeScatterCoord(point.x, bounds.xMin, bounds.xMax);
  const yNorm = normalizeScatterCoord(point.y, bounds.yMin, bounds.yMax);
  const centerX = xNorm + placement.xOffset;
  const centerY = 1 - yNorm + placement.yOffset;
  const width = placement.boxWidthNorm;
  const height = 0.085;
  const left = placement.textAnchor === 'start' ? centerX - 0.012 : centerX - width + 0.012;
  const top = centerY - height / 2;

  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    centerX,
    centerY,
  };
};

const rectsOverlap = (left, right) =>
  left.left < right.right &&
  left.right > right.left &&
  left.top < right.bottom &&
  left.bottom > right.top;

const scoreScatterPlacement = (point, placement, points, bounds, reservedRects = []) => {
  const rect = buildScatterPlacementRect(point, placement, bounds);
  const xNorm = normalizeScatterCoord(point.x, bounds.xMin, bounds.xMax);
  const yNorm = 1 - normalizeScatterCoord(point.y, bounds.yMin, bounds.yMax);
  let score = 0;

  const overflow =
    Math.max(0, SCATTER_LABEL_SAFE_BOUNDS.left - rect.left) +
    Math.max(0, rect.right - SCATTER_LABEL_SAFE_BOUNDS.right) +
    Math.max(0, SCATTER_LABEL_SAFE_BOUNDS.top - rect.top) +
    Math.max(0, rect.bottom - SCATTER_LABEL_SAFE_BOUNDS.bottom);

  score += overflow * 80;

  points.forEach((other) => {
    if (other.pointId === point.pointId) return;

    const otherX = normalizeScatterCoord(other.x, bounds.xMin, bounds.xMax);
    const otherY = 1 - normalizeScatterCoord(other.y, bounds.yMin, bounds.yMax);
    const bubblePad = 0.03 + ((other.bubbleSize || 0) / 100) * 0.04;
    const bubbleRect = {
      left: otherX - bubblePad,
      right: otherX + bubblePad,
      top: otherY - bubblePad,
      bottom: otherY + bubblePad,
    };

    if (rectsOverlap(rect, bubbleRect)) {
      score += 60;
    }

    const connectorRect = {
      left: Math.min(xNorm, rect.centerX) - 0.03,
      right: Math.max(xNorm, rect.centerX) + 0.03,
      top: Math.min(yNorm, rect.centerY) - 0.03,
      bottom: Math.max(yNorm, rect.centerY) + 0.03,
    };

    if (rectsOverlap(connectorRect, bubbleRect)) {
      score += 12;
    }

    const dx = otherX - rect.centerX;
    const dy = otherY - rect.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.16) {
      score += (0.16 - distance) * 80;
    }
  });

  reservedRects.forEach((reserved) => {
    if (rectsOverlap(rect, reserved)) {
      score += 100;
    }
  });

  return { score, rect };
};

const chooseScatterPlacement = (point, points, bounds, reservedRects = [], placements) => {
  if (!point) return null;

  let best = null;

  (placements || SCATTER_LABEL_PLACEMENTS).forEach((placement) => {
    const candidate = scoreScatterPlacement(point, placement, points, bounds, reservedRects);
    if (!best || candidate.score < best.score) {
      best = { ...candidate, placement };
    }
  });

  return best;
};

const buildPinnedScatterFund = (fund, placement) => {
  if (!fund) return null;

  return {
    ...fund,
    pinLabel: formatPinnedFundLabel(fund.fundname),
    ...(placement || SCATTER_LABEL_PLACEMENTS[0]),
  };
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

const sumDistinct = (values) => sum([...new Set(values)]);

const getFlow1m = (fund) => fund.flows?.estfundlevelnetflow1momoend;

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

const pickScatterStandouts = (points) => {
  const ratioPoints = points.filter(
    (point) => point.mer > 0 && Number.isFinite(point.return1yr / point.mer),
  );

  if (!ratioPoints.length) return { highest: null, lowest: null };

  const sorted = [...ratioPoints].sort((left, right) => {
    const leftRatio = left.return1yr / left.mer;
    const rightRatio = right.return1yr / right.mer;

    if (rightRatio !== leftRatio) return rightRatio - leftRatio;
    if (right.return1yr !== left.return1yr) return right.return1yr - left.return1yr;
    if (left.mer !== right.mer) return left.mer - right.mer;
    return right.aum - left.aum;
  });

  const highest = sorted[0] || null;
  const lowest = sorted[sorted.length - 1] || null;
  const uniqueLowest =
    lowest &&
    (!highest || `${lowest.ticker}-${lowest.fundname}` !== `${highest.ticker}-${highest.fundname}`)
      ? lowest
      : null;
  const bounds = {
    xMin: Math.min(...points.map((point) => point.x)),
    xMax: Math.max(...points.map((point) => point.x)),
    yMin: Math.min(...points.map((point) => point.y)),
    yMax: Math.max(...points.map((point) => point.y)),
  };
  const reservedRects = [];
  const highestPlacement = chooseScatterPlacement(highest, points, bounds, reservedRects);

  if (highestPlacement?.rect) reservedRects.push(highestPlacement.rect);
  const lowestPlacementChoices = SCATTER_LABEL_PLACEMENTS.filter((placement) =>
    [
      'outerLowerLeft',
      'outerLowerRight',
      'farLowerLeft',
      'farLowerRight',
      'lowerLeft',
      'lowerRight',
    ].includes(placement.name),
  );
  const lowestPlacement = uniqueLowest
    ? chooseScatterPlacement(uniqueLowest, points, bounds, reservedRects, lowestPlacementChoices)
    : null;

  return {
    highest: buildPinnedScatterFund(highest, highestPlacement?.placement),
    lowest: uniqueLowest
      ? {
          ...buildPinnedScatterFund(uniqueLowest, lowestPlacement?.placement),
          forceBelowBubble: true,
        }
      : null,
  };
};

const buildScatterData = (funds) => {
  const basePoints = funds
    .filter((fund) => fund.fees?.mer != null && fund.performance?.return1yr != null)
    .map((fund) => {
      const aum = fund.assets?.fundnetassets != null ? Number(fund.assets.fundnetassets) : 0;
      const mer = Number(fund.fees.mer);
      const return1yr = Number(fund.performance.return1yr);
      const ratio = mer > 0 ? return1yr / mer : null;

      return {
        pointId: `${fund.ticker || '--'}-${fund.fundname || 'Unknown fund'}`,
        x: mer,
        y: return1yr,
        aum,
        mer,
        return1yr,
        ratio,
        fundname: fund.fundname || 'Unknown fund',
        ticker: fund.ticker || '--',
        rating: fund.ratings?.ratingoverall != null ? Number(fund.ratings.ratingoverall) : null,
      };
    });

  const ratioValues = basePoints.map((point) => point.ratio).filter((value) => value != null);
  const ratioMin = ratioValues.length ? Math.min(...ratioValues) : null;
  const ratioMax = ratioValues.length ? Math.max(...ratioValues) : null;

  return basePoints.map((point) => {
    const ratioScore = normalizeRange(point.ratio, ratioMin, ratioMax, 0.5);
    return {
      ...point,
      bubbleSize: point.aum,
      ratioScore,
      color: ratioToColor(ratioScore),
    };
  });
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
  const { data: categories = [] } = useCategories();
  const categoryOptions = useMemo(() => {
    const next = new Set(categories.filter(Boolean));
    if (category) next.add(category);
    return [...next].sort((left, right) => left.localeCompare(right));
  }, [categories, category]);

  const handleOpenScreener = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (asofDate) params.set('asofDate', asofDate);
    const query = params.toString();
    navigate(query ? `/screener?${query}` : '/screener');
  };

  const handleCategorySwitch = (nextCategory) => {
    if (!nextCategory || nextCategory === category) return;
    navigate(`/categories/${encodeURIComponent(nextCategory)}`);
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
    const flow1mValues = numericValues(funds, getFlow1m);

    const totalAum = sumDistinct(aumValues);
    const positiveReturnCount = return1yrValues.filter((value) => value > 0).length;
    const highlyRatedCount = ratingValues.filter((value) => value >= 4).length;
    const inflowCount = flow1mValues.filter((value) => value > 0).length;
    const netFlow1m = sumDistinct(flow1mValues);

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

    const flowFunds = funds.filter((fund) => {
      const flow = Number(getFlow1m(fund));
      return Number.isFinite(flow);
    });

    const largestInflows = flowFunds
      .filter((fund) => Number(getFlow1m(fund)) > 0)
      .sort((left, right) => Number(getFlow1m(right)) - Number(getFlow1m(left)))
      .slice(0, 6);

    const largestOutflows = flowFunds
      .filter((fund) => Number(getFlow1m(fund)) < 0)
      .sort((left, right) => Number(getFlow1m(left)) - Number(getFlow1m(right)))
      .slice(0, 6);

    const top10AumShare = share(
      sumDistinct(
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

    const scatterData = buildScatterData(funds);

    const dominantMerBand = [...feeDistribution.buckets].sort(
      (left, right) => right.count - left.count,
    )[0];
    const dominantReturnBand = [...returnDistribution.buckets].sort(
      (left, right) => right.count - left.count,
    )[0];
    const medianMer = median(merValues);
    const medianReturn1yr = median(return1yrValues);
    const standoutScatterFunds = pickScatterStandouts(scatterData);

    return {
      avgMer: average(merValues),
      medianMer,
      avgReturn1yr: average(return1yrValues),
      medianReturn1yr,
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
      largestInflows,
      largestOutflows,
      scatterData,
      standoutScatterFunds,
      dominantMerBand,
      dominantReturnBand,
      returnSample: return1yrValues.length,
      merSample: merValues.length,
      ratingSample: ratingValues.length,
      aumSample: aumValues.length,
      flowSample: flow1mValues.length,
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
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 296px' },
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
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                mb: '18px',
              }}
            >
              <CategoryPicker
                currentCategory={category}
                categories={categoryOptions}
                onSelectCategory={handleCategorySwitch}
              />
              <Separator />
              <ExplorerLink category={category} onClick={handleOpenScreener} />
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
              width: '100%',
              maxWidth: { xs: 'min(100%, 560px)', lg: 'none' },
              justifySelf: { xs: 'start', lg: 'stretch' },
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

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: '1fr' },
                gap: '12px',
              }}
            >
              <SnapshotStat
                label="MER band"
                value={analytics.dominantMerBand?.label || '--'}
                detail={formatBucketSample(analytics.merSample, 'MER')}
              />
              <SnapshotStat
                label="1Y band"
                value={analytics.dominantReturnBand?.label || '--'}
                detail={formatBucketSample(analytics.returnSample, 'return')}
              />
              <SnapshotStat
                label="Net flow"
                value={formatMoneyCompact(analytics.netFlow1m, { signed: true })}
                detail={
                  analytics.inflowShare != null
                    ? `${formatPercent(analytics.inflowShare, { digits: 0 })} in inflow`
                    : 'Flow data unavailable'
                }
              />
              <SnapshotStat
                label="Top-10 share"
                value={formatPercent(analytics.top10AumShare, { digits: 0 })}
                detail={
                  analytics.totalAum
                    ? `${formatMoneyCompact(analytics.totalAum)} category AUM`
                    : 'AUM disclosures unavailable'
                }
              />
            </Box>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
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
            <StatCard
              label="1M Net Flow"
              value={formatMoneyCompact(analytics.netFlow1m, { signed: true })}
              valueColor={
                analytics.netFlow1m == null
                  ? undefined
                  : analytics.netFlow1m >= 0
                    ? 'var(--emerald)'
                    : 'var(--red)'
              }
            />
            <StatCard
              label="Inflow Share"
              value={formatPercent(analytics.inflowShare, { digits: 0 })}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
              gap: '20px',
              mb: '24px',
            }}
          >
            <HorizontalBarChartPanel
              title="MER distribution"
              subtitle={formatBucketSample(analytics.merSample, 'MER')}
              data={analytics.feeDistribution.buckets}
              valueKey="share"
              labelKey="label"
              valueFormatter={(value) => formatPercent(value, { digits: 0 })}
              detailFormatter={(item) =>
                `${formatNumber(item.count)} | ${formatPercent(item.share, { digits: 0 })}`
              }
              fill="var(--accent)"
              maxValue={100}
            />
            <HorizontalBarChartPanel
              title="1Y return distribution"
              subtitle={formatBucketSample(analytics.returnSample, 'return')}
              data={analytics.returnDistribution.buckets}
              valueKey="share"
              labelKey="label"
              valueFormatter={(value) => formatPercent(value, { digits: 0 })}
              detailFormatter={(item) =>
                `${formatNumber(item.count)} | ${formatPercent(item.share, { digits: 0 })}`
              }
              fill="var(--emerald)"
              maxValue={100}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
              gap: '20px',
              mb: '24px',
            }}
          >
            <ScatterPanel
              data={analytics.scatterData}
              merMedian={analytics.medianMer}
              returnMedian={analytics.medianReturn1yr}
              standoutFunds={analytics.standoutScatterFunds}
            />
            <Box sx={{ display: 'grid', gap: '20px' }}>
              <HorizontalBarChartPanel
                title="Rating mix"
                subtitle={`${formatNumber(totalFunds)} funds in category`}
                data={analytics.ratingDistribution.buckets}
                valueKey="share"
                labelKey="label"
                valueFormatter={(value) => formatPercent(value, { digits: 0 })}
                detailFormatter={(item) =>
                  `${formatNumber(item.count)} | ${formatPercent(item.share, { digits: 0 })}`
                }
                fill="var(--amber)"
                minHeight="unset"
                chartHeight={230}
                maxValue={100}
              />
              <HorizontalBarChartPanel
                title="AUM size buckets"
                subtitle={formatBucketSample(analytics.aumSample, 'AUM')}
                data={analytics.aumDistribution.buckets}
                valueKey="share"
                labelKey="label"
                valueFormatter={(value) => formatPercent(value, { digits: 0 })}
                detailFormatter={(item) =>
                  `${formatNumber(item.count)} | ${formatPercent(item.share, { digits: 0 })}`
                }
                fill="var(--blue)"
                minHeight="unset"
                chartHeight={230}
                maxValue={100}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '20px',
            }}
          >
            <RankedFundsCard
              title="Largest inflows"
              subtitle={`${formatBucketSample(analytics.flowSample, 'flow')} | highest 1-month net flow`}
              funds={analytics.largestInflows}
              metric={(fund) => formatMoneyCompact(getFlow1m(fund), { signed: true })}
              metricColor={() => 'var(--emerald)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <RankedFundsCard
              title="Largest outflows"
              subtitle={`${formatBucketSample(analytics.flowSample, 'flow')} | lowest 1-month net flow`}
              funds={analytics.largestOutflows}
              metric={(fund) => formatMoneyCompact(getFlow1m(fund), { signed: true })}
              metricColor={() => 'var(--red)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
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

const ExplorerLink = ({ category, onClick }) => (
  <ActionPill
    tone="neutral"
    value={category || 'Category funds'}
    action="Explore funds"
    onClick={onClick}
  />
);

const CategoryPicker = ({ currentCategory, categories, onSelectCategory }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');
  const isOpen = Boolean(anchorEl);
  const options = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const categorySet = new Set((categories || []).filter(Boolean));
    if (currentCategory) categorySet.add(currentCategory);

    const sorted = [...categorySet].sort((left, right) => left.localeCompare(right));
    if (!normalizedSearch) return sorted;

    return sorted.filter((category) => category.toLowerCase().includes(normalizedSearch));
  }, [categories, currentCategory, search]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (category) => {
    handleClose();
    onSelectCategory(category);
  };

  return (
    <>
      <ActionPill
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        value={currentCategory || 'Select category'}
        action="Switch category"
        chevron="down"
      />

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: '8px',
            width: { xs: 'calc(100vw - 32px)', sm: '420px' },
            maxWidth: 'calc(100vw - 32px)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            background: 'var(--glass-nav-strong)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            boxShadow: 'var(--shadow-panel)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: '14px', borderBottom: '1px solid var(--border)' }}>
          <Box
            component="input"
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search category"
            sx={{
              width: '100%',
              minHeight: '40px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-surface)',
              color: 'var(--text-1)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              px: '12px',
              outline: 'none',
              '&:focus': {
                borderColor: 'var(--accent)',
                boxShadow: '0 0 0 2px var(--accent-soft)',
              },
              '&::placeholder': {
                color: 'var(--text-4)',
              },
            }}
          />
        </Box>

        <Box sx={{ maxHeight: '340px', overflowY: 'auto', py: '6px' }}>
          {options.length === 0 && (
            <Box sx={{ px: '14px', py: '18px', color: 'var(--text-4)', fontSize: '13px' }}>
              No categories match this search.
            </Box>
          )}

          {options.map((category) => {
            const isCurrent = category === currentCategory;

            return (
              <Box
                key={category}
                component="button"
                type="button"
                onClick={() => handleSelect(category)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  border: 'none',
                  background: isCurrent ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--text-1)',
                  textAlign: 'left',
                  px: '14px',
                  py: '11px',
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'background var(--transition)',
                  '&:hover': {
                    background: isCurrent ? 'var(--accent-soft)' : 'var(--bg-surface-hover)',
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    fontSize: '13px',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category}
                </Box>
                {isCurrent && (
                  <Box sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-strong)' }}>
                    Current
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

const SnapshotStat = ({ label, value, detail }) => (
  <Box
    sx={{
      p: '14px',
      borderRadius: '18px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      minWidth: 0,
    }}
  >
    <Box sx={{ fontSize: '11px', color: 'var(--text-4)', textTransform: 'uppercase', mb: '6px' }}>
      {label}
    </Box>
    <Box
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: { xs: '18px', lg: '20px' },
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: 'var(--text-1)',
        lineHeight: 1.05,
        mb: '6px',
        overflowWrap: 'anywhere',
      }}
    >
      {value}
    </Box>
    <Box sx={{ fontSize: '11px', color: 'var(--text-4)', lineHeight: 1.5 }}>{detail}</Box>
  </Box>
);

const ScatterPanel = ({ data, merMedian, returnMedian, standoutFunds }) => (
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
          Read left-to-right as MER and bottom-to-top as 1Y return. Larger bubbles mean larger AUM,
          while greener color means a higher 1Y-return-to-MER ratio and redder color means a lower
          ratio. The dashed lines mark the category median MER and median 1Y return.
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <MiniLegend label="Median MER" value={formatPercent(merMedian)} />
        <MiniLegend label="Median 1Y" value={formatPercent(returnMedian, { signed: true })} />
      </Box>
    </Box>

    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 36, right: 104, bottom: 54, left: 112 }}>
          <CartesianGrid {...chartGridStyle} />
          <XAxis
            type="number"
            dataKey="x"
            name="MER"
            tick={axisStyle}
            tickFormatter={(value) => formatAxisPercent(value)}
            domain={['dataMin - 0.15', 'dataMax + 0.15']}
            allowDecimals
            label={{
              value: 'MER (%)',
              position: 'insideBottom',
              offset: -8,
              fill: 'var(--text-3)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="1Y Return"
            tick={axisStyle}
            tickFormatter={(value) => formatAxisPercent(value)}
            width={72}
            domain={['dataMin - 2', 'dataMax + 2']}
            allowDecimals
            label={{
              value: '1Y Return (%)',
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--text-3)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}
          />
          {merMedian != null && (
            <ReferenceLine
              x={merMedian}
              stroke="var(--accent-strong)"
              strokeDasharray="6 6"
              strokeWidth={1.25}
              label={{
                value: `Median MER ${formatAxisPercent(merMedian)}`,
                position: 'insideTopRight',
                fill: 'var(--text-3)',
                fontSize: 11,
              }}
            />
          )}
          {returnMedian != null && (
            <ReferenceLine
              y={returnMedian}
              stroke="var(--emerald)"
              strokeDasharray="6 6"
              strokeWidth={1.25}
              label={{
                value: `Median 1Y ${formatAxisPercent(returnMedian)}`,
                position: 'insideBottomRight',
                fill: 'var(--text-3)',
                fontSize: 11,
              }}
            />
          )}
          <ZAxis type="number" dataKey="bubbleSize" range={[70, 520]} />
          <Tooltip cursor={{ stroke: 'var(--border)' }} content={<ScatterTooltip />} />
          <Scatter data={data}>
            {data.map((point) => (
              <Cell
                key={`${point.ticker}-${point.fundname}`}
                fill={point.color}
                fillOpacity={0.78}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
              />
            ))}
          </Scatter>
          {standoutFunds?.highest && (
            <Scatter data={[standoutFunds.highest]}>
              <Cell
                key={`pin-high-${standoutFunds.highest.ticker}-${standoutFunds.highest.fundname}`}
                fill="rgba(255,255,255,0.12)"
                stroke={standoutFunds.highest.color}
                strokeWidth={2.2}
              />
              <LabelList dataKey="pinLabel" content={<PinnedScatterLabel />} />
            </Scatter>
          )}
          {standoutFunds?.lowest && (
            <Scatter data={[standoutFunds.lowest]}>
              <Cell
                key={`pin-low-${standoutFunds.lowest.ticker}-${standoutFunds.lowest.fundname}`}
                fill="rgba(255,255,255,0.12)"
                stroke={standoutFunds.lowest.color}
                strokeWidth={2.2}
              />
              <LabelList dataKey="pinLabel" content={<PinnedScatterLabel />} />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    ) : (
      <EmptyCardMessage label="Not enough MER and return disclosures to draw the scatter map." />
    )}
  </Box>
);

const PinnedScatterLabel = ({ x, y, width, height, value, payload }) => {
  if (value == null) return null;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const bubbleRadius = Math.max(width, height) / 2;
  const labelDx = payload?.labelDx ?? 24;
  const labelDy = payload?.labelDy ?? -32;
  const textAnchor = payload?.textAnchor || 'start';
  const boxWidth = payload?.boxWidth ?? 156;
  const boxHeight = 24;
  const labelX = cx + labelDx;
  const boxX = textAnchor === 'start' ? labelX - 8 : labelX - boxWidth + 8;
  const elbowX = cx + labelDx * 0.42;
  const textX = textAnchor === 'start' ? boxX + 10 : boxX + boxWidth - 10;
  const forcedBelow = Boolean(payload?.forceBelowBubble);
  const defaultLabelY = cy + labelDy;
  const defaultBoxY = defaultLabelY - boxHeight / 2;
  const forcedBoxY = cy + bubbleRadius + 12;
  const boxY = forcedBelow ? Math.max(defaultBoxY, forcedBoxY) : defaultBoxY;
  const labelY = boxY + boxHeight / 2;
  const elbowY = forcedBelow ? cy + bubbleRadius + 4 : cy + labelDy * 0.42;
  const connectorEndX = textAnchor === 'start' ? boxX : boxX + boxWidth;

  return (
    <g>
      <path
        d={`M ${cx} ${cy} L ${elbowX} ${elbowY} L ${connectorEndX} ${labelY}`}
        fill="none"
        stroke={payload?.color || 'var(--text-3)'}
        strokeWidth={1.2}
        strokeDasharray="4 3"
        opacity={0.95}
      />
      <text
        x={textX}
        y={labelY + 3.5}
        textAnchor={textAnchor}
        fill="var(--text-2)"
        fontSize="11"
        fontFamily="var(--font-mono)"
      >
        {value}
      </text>
    </g>
  );
};

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
      <TooltipMetric
        label="Return / MER"
        value={
          point.ratio != null && Number.isFinite(point.ratio)
            ? point.ratio.toFixed(2)
            : 'Unavailable'
        }
      />
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
