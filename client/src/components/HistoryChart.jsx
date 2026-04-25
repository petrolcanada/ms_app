import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartCard, ChartEmpty, ChartLoading } from './charts/ChartCard';
import ChartTooltip from './charts/ChartTooltip';
import {
  axisStyle,
  chartGridStyle,
  chartTheme,
  defaultChartMargin,
  performanceSeriesStyles,
} from './charts/rechartsTheme';

const formatDateTick = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-CA', { month: 'short', year: '2-digit' });
};

const formatPct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : '—');

const formatMoney = (v) => {
  if (v == null) return '—';
  const n = Number(v);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

const getTooltipFormatter = (format) => (format === 'money' ? formatMoney : formatPct);

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildCumulativeSeries = (rows, { dateKey, returnKey = 'return1mth' }) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const sorted = [...rows]
    .filter((row) => row?.[dateKey])
    .sort((a, b) => String(a[dateKey]).localeCompare(String(b[dateKey])));

  let cumulativeMultiplier = 1;

  return sorted.map((row) => {
    const periodicReturn = toNumberOrNull(row[returnKey]);
    if (periodicReturn != null) {
      cumulativeMultiplier *= 1 + periodicReturn / 100;
    }

    return {
      date: row[dateKey],
      value: periodicReturn != null ? (cumulativeMultiplier - 1) * 100 : null,
    };
  });
};

const normalizeSeries = (series) => {
  if (!Array.isArray(series) || series.length === 0) return [];

  const basePoint = series.find((point) => point.value != null);
  if (!basePoint) return series;

  const baseMultiplier = 1 + basePoint.value / 100;
  if (!Number.isFinite(baseMultiplier) || baseMultiplier <= 0) return series;

  return series.map((point) => {
    if (point.value == null) return point;
    return {
      ...point,
      value: ((1 + point.value / 100) / baseMultiplier - 1) * 100,
    };
  });
};

const FlowBarShape = ({ x, y, width, height, value, fill, index }) => {
  if (x == null || y == null || width == null || height == null || value == null) return null;

  const gradientId = `flow-bar-grad-${index}-${value >= 0 ? 'pos' : 'neg'}`;
  const isPositive = Number(value) >= 0;

  return (
    <g>
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1={isPositive ? '1' : '0'}
          x2="0"
          y2={isPositive ? '0' : '1'}
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor={fill} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx="3" ry="3" fill={`url(#${gradientId})`} />
    </g>
  );
};

export const PerformanceHistoryChart = ({
  data,
  comparisonData,
  comparisonLabel = 'Category Average',
  isLoading,
}) => {
  if (isLoading) return <ChartLoading />;
  if (!data || data.length === 0) return <ChartEmpty label="No performance history available" />;

  const fundSeries = buildCumulativeSeries(data, { dateKey: 'monthenddate' });
  const categorySeries = buildCumulativeSeries(comparisonData, { dateKey: 'dayenddate' });
  const hasComparisonSeries = categorySeries.length > 0;
  const commonStartDate = hasComparisonSeries
    ? [fundSeries[0]?.date, categorySeries[0]?.date].filter(Boolean).sort().slice(-1)[0]
    : null;
  const alignedFundSeries = commonStartDate
    ? fundSeries.filter((point) => point.date >= commonStartDate)
    : fundSeries;
  const alignedCategorySeries = commonStartDate
    ? categorySeries.filter((point) => point.date >= commonStartDate)
    : categorySeries;
  const normalizedFundSeries = normalizeSeries(alignedFundSeries);
  const normalizedCategorySeries = normalizeSeries(alignedCategorySeries);

  const pointsByDate = new Map();
  normalizedFundSeries.forEach((point) => {
    pointsByDate.set(point.date, {
      date: point.date,
      Fund: point.value,
    });
  });
  normalizedCategorySeries.forEach((point) => {
    const existing = pointsByDate.get(point.date) || { date: point.date, Fund: null };
    pointsByDate.set(point.date, {
      ...existing,
      [comparisonLabel]: point.value,
    });
  });

  const chartData = Array.from(pointsByDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ChartCard title="Cumulative Return History (Normalized)">
      <ResponsiveContainer width="100%" height={chartTheme.height}>
        <LineChart data={chartData} margin={defaultChartMargin}>
          <CartesianGrid {...chartGridStyle} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={axisStyle}
            interval="preserveStartEnd"
          />
          <YAxis tick={axisStyle} tickFormatter={(v) => `${v}%`} width={55} />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={formatDateTick}
                valueFormatter={getTooltipFormatter('pct')}
              />
            }
          />
          <Legend wrapperStyle={chartTheme.legend} />
          <Line
            type="monotone"
            dataKey="Fund"
            stroke={performanceSeriesStyles.fund.stroke}
            strokeWidth={performanceSeriesStyles.fund.strokeWidth}
            strokeLinecap="round"
            dot={false}
          />
          {hasComparisonSeries && (
            <Line
              type="monotone"
              dataKey={comparisonLabel}
              stroke={performanceSeriesStyles.category.stroke}
              strokeWidth={performanceSeriesStyles.category.strokeWidth}
              strokeLinecap="round"
              opacity={performanceSeriesStyles.category.opacity}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const FlowHistoryChart = ({ data, isLoading }) => {
  if (isLoading) return <ChartLoading />;
  if (!data || data.length === 0) return <ChartEmpty label="No flow history available" />;

  const chartData = data.map((d) => ({
    date: d.flowdate ?? d.monthenddate ?? d.estfundlevelnetflowdatemoend,
    'Net Flow (1M)':
      d.estfundlevelnetflow1momoend != null ? Number(d.estfundlevelnetflow1momoend) : null,
  }));

  return (
    <ChartCard title="Fund-Level Net Flows (Monthly)">
      <ResponsiveContainer width="100%" height={chartTheme.height}>
        <BarChart data={chartData} margin={defaultChartMargin}>
          <CartesianGrid {...chartGridStyle} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={axisStyle}
            interval="preserveStartEnd"
          />
          <YAxis tick={axisStyle} tickFormatter={formatMoney} width={65} />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={formatDateTick}
                valueFormatter={getTooltipFormatter('money')}
              />
            }
          />
          <Bar dataKey="Net Flow (1M)" maxBarSize={24} shape={<FlowBarShape />}>
            {chartData.map((entry, index) => (
              <Cell
                key={`flow-cell-${entry.date}-${index}`}
                fill={
                  entry['Net Flow (1M)'] >= 0
                    ? chartTheme.colors.positive
                    : chartTheme.colors.negative
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const AssetsHistoryChart = ({ data, isLoading }) => {
  if (isLoading) return <ChartLoading />;
  if (!data || data.length === 0) return <ChartEmpty label="No asset history available" />;

  const chartData = data.map((d) => ({
    date: d.netassetsdate || d.monthenddate,
    'Net Assets': d.fundnetassets != null ? Number(d.fundnetassets) : null,
  }));

  return (
    <ChartCard title="Fund Net Assets Over Time">
      <ResponsiveContainer width="100%" height={chartTheme.height}>
        <AreaChart data={chartData} margin={defaultChartMargin}>
          <defs>
            <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.colors.assets} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartTheme.colors.assets} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...chartGridStyle} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={axisStyle}
            interval="preserveStartEnd"
          />
          <YAxis tick={axisStyle} tickFormatter={formatMoney} width={65} />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={formatDateTick}
                valueFormatter={getTooltipFormatter('money')}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="Net Assets"
            stroke={chartTheme.colors.assets}
            strokeWidth={2}
            fill="url(#assetsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
