import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AsOfDateSelector from './AsOfDateSelector';
import SEO from './SEO';
import StatCard from './StatCard';
import { axisStyle, chartGridStyle } from './charts/rechartsTheme';
import { designTokens } from '../design/tokens';
import useAssetManagers from '../hooks/useAssetManagers';
import useAssetManagerOverview from '../hooks/useAssetManagerOverview';
import ActionPill, { PillSeparator as Separator } from './ui/ActionPill';

const PANEL_SX = {
  ...designTokens.card.panel,
  position: 'relative',
  overflow: 'hidden',
};
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatNumber = (value) => {
  const numeric = toNumber(value);
  if (numeric === null) return '--';
  return numeric.toLocaleString();
};

const formatPercent = (value, { signed = false, digits = 1 } = {}) => {
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

const valueColor = (value) => {
  const numeric = toNumber(value);
  if (numeric === null) return 'var(--text-1)';
  return numeric >= 0 ? 'var(--emerald)' : 'var(--red)';
};

const AssetManagerOverview = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const assetManager = decodeURIComponent(name || '');
  const [asofDate, setAsofDate] = useState('');
  const { data: managers = [], isLoading: isManagersLoading } = useAssetManagers();
  const { data, isLoading, isError, error } = useAssetManagerOverview(assetManager, asofDate);

  const managerOptions = useMemo(() => {
    const next = new Set((managers || []).filter(Boolean));
    if (assetManager) next.add(assetManager);
    return [...next].sort((left, right) => left.localeCompare(right));
  }, [managers, assetManager]);

  const totals = data?.totals || EMPTY_OBJECT;
  const relativeQuality = data?.relativeQuality || EMPTY_OBJECT;
  const categories = data?.categories || EMPTY_ARRAY;
  const leaders = data?.leaders || EMPTY_OBJECT;
  const resolvedDate = asofDate || data?.asofDate || '';

  const topCategoryChart = useMemo(
    () =>
      categories.slice(0, 8).map((category) => ({
        name: category.categoryname,
        shortName:
          category.categoryname.length > 18
            ? `${category.categoryname.slice(0, 18)}...`
            : category.categoryname,
        aumShare: category.aumShare,
        totalAum: category.totalAum,
      })),
    [categories],
  );

  const relativeChart = useMemo(
    () =>
      [...categories]
        .filter((category) => category.excessReturn1yr !== null)
        .sort((left, right) => Math.abs(right.excessReturn1yr) - Math.abs(left.excessReturn1yr))
        .slice(0, 10)
        .map((category) => ({
          name: category.categoryname,
          shortName:
            category.categoryname.length > 18
              ? `${category.categoryname.slice(0, 18)}...`
              : category.categoryname,
          excessReturn1yr: category.excessReturn1yr,
        })),
    [categories],
  );

  useEffect(() => {
    if (!assetManager && managerOptions.length) {
      navigate(`/asset-managers/${encodeURIComponent(managerOptions[0])}`, { replace: true });
    }
  }, [assetManager, managerOptions, navigate]);

  const handleManagerSwitch = (nextManager) => {
    if (!nextManager || nextManager === assetManager) return;
    navigate(`/asset-managers/${encodeURIComponent(nextManager)}`);
  };

  const handleOpenScreener = () => {
    const params = new URLSearchParams();
    if (assetManager) params.set('assetManager', assetManager);
    if (asofDate) params.set('asofDate', asofDate);
    const query = params.toString();
    navigate(query ? `/screener?${query}` : '/screener');
  };

  if (!assetManager) {
    return (
      <Box>
        <SEO title="Asset Managers" path="/asset-managers" noIndex />
        <Box
          sx={{
            ...PANEL_SX,
            minHeight: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: '24px',
            py: '48px',
            textAlign: 'center',
          }}
        >
          {isManagersLoading || managerOptions.length ? (
            <CircularProgress sx={{ color: 'var(--accent)' }} />
          ) : (
            <Box sx={{ color: 'var(--text-3)', fontSize: '13px' }}>
              No asset manager data is available.
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <SEO
        title={`${assetManager} Asset Manager Overview`}
        path={`/asset-managers/${encodeURIComponent(assetManager)}`}
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
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 318px' },
            gap: '22px',
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
              Asset manager overall
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
              {assetManager}
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
              <ManagerPicker
                currentManager={assetManager}
                managers={managerOptions}
                onSelectManager={handleManagerSwitch}
              />
              <Separator />
              <ExplorerLink assetManager={assetManager} onClick={handleOpenScreener} />
            </Box>

            <Box sx={{ color: 'var(--text-3)', lineHeight: 1.75, maxWidth: '780px', mb: '20px' }}>
              Manager-level readout built from fund-level products: category footprint, category
              relative returns, rank quality, assets, and flows.
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '20px' }}>
              <InsightPill label="Funds" value={formatNumber(totals.fundCount)} />
              <InsightPill label="Categories" value={formatNumber(totals.categoryCount)} />
              <InsightPill
                label="1Y vs category"
                value={formatPercent(relativeQuality.avgExcessReturn1yr, { signed: true })}
              />
              <InsightPill
                label="Top quartile"
                value={formatPercent(relativeQuality.topQuartileShare, { digits: 0 })}
              />
            </Box>
          </Box>

          <Box sx={{ ...PANEL_SX, p: '18px', display: 'grid', gap: '14px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
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
              <AsOfDateSelector value={asofDate} onChange={setAsofDate} compact />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <SnapshotStat label="Total AUM" value={formatMoney(totals.totalAum)} />
              <SnapshotStat label="1M flow" value={formatMoney(totals.flow1m, { signed: true })} />
              <SnapshotStat label="Avg rank" value={formatPercent(relativeQuality.avgRank1yr)} />
              <SnapshotStat
                label="Top funds"
                value={`${formatNumber(relativeQuality.topQuartileCount)} Q1`}
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
          {error?.message || 'Failed to load asset manager data.'}
        </Box>
      )}

      {!isLoading && !isError && !totals.fundCount && (
        <Box
          sx={{ ...PANEL_SX, px: '24px', py: '40px', textAlign: 'center', color: 'var(--text-3)' }}
        >
          No asset manager data is available for this date.
        </Box>
      )}

      {!isLoading && !isError && Boolean(totals.fundCount) && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px',
              mb: '24px',
            }}
          >
            <StatCard label="Total AUM" value={formatMoney(totals.totalAum)} />
            <StatCard
              label="Avg 1Y Return"
              value={formatPercent(totals.avgReturn1yr, { signed: true })}
              valueColor={valueColor(totals.avgReturn1yr)}
            />
            <StatCard
              label="1Y vs Category"
              value={formatPercent(relativeQuality.avgExcessReturn1yr, { signed: true })}
              valueColor={valueColor(relativeQuality.avgExcessReturn1yr)}
            />
            <StatCard label="Avg Rating" value={formatRating(totals.avgRating)} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
              gap: '20px',
              mb: '24px',
            }}
          >
            <ChartPanel
              title="Category AUM footprint"
              subtitle="Largest categories by share of manager AUM"
              data={topCategoryChart}
              dataKey="aumShare"
              formatter={(value) => formatPercent(value)}
              fill="var(--accent)"
            />
            <ChartPanel
              title="1Y category relative return"
              subtitle="Fund average return minus category average"
              data={relativeChart}
              dataKey="excessReturn1yr"
              formatter={(value) => formatPercent(value, { signed: true })}
              fill="var(--emerald)"
              withZeroLine
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px',
              mb: '24px',
            }}
          >
            <StatCard label="1M Flow" value={formatMoney(totals.flow1m, { signed: true })} />
            <StatCard label="YTD Flow" value={formatMoney(totals.flowYtd, { signed: true })} />
            <StatCard label="1Y Flow" value={formatMoney(totals.flow1yr, { signed: true })} />
            <StatCard label="Median MER" value={formatPercent(totals.medianMer)} />
          </Box>

          <CategoryFootprintTable categories={categories} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '20px',
            }}
          >
            <LeaderCard
              title="Best category outperformance"
              subtitle="1Y fund return minus category average"
              funds={leaders.bestOutperformers}
              metric={(fund) => formatPercent(fund.excessReturn1yr, { signed: true })}
              metricColor={(fund) => valueColor(fund.excessReturn1yr)}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <LeaderCard
              title="Best category ranks"
              subtitle="Lowest 1Y category percentile ranks"
              funds={leaders.bestRanked}
              metric={(fund) => formatPercent(fund.rank1yr)}
              metricColor={() => 'var(--accent-strong)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <LeaderCard
              title="Largest funds"
              subtitle="Highest disclosed fund net assets"
              funds={leaders.largestFunds}
              metric={(fund) => formatMoney(fund.fundnetassets)}
              metricColor={() => 'var(--text-1)'}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <LeaderCard
              title="Largest inflows"
              subtitle="Highest 1-month fund-level flow"
              funds={leaders.largestInflows}
              metric={(fund) => formatMoney(fund.flow1m, { signed: true })}
              metricColor={(fund) => valueColor(fund.flow1m)}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <LeaderCard
              title="Largest outflows"
              subtitle="Lowest 1-month fund-level flow"
              funds={leaders.largestOutflows}
              metric={(fund) => formatMoney(fund.flow1m, { signed: true })}
              metricColor={(fund) => valueColor(fund.flow1m)}
              onFundClick={(id) => navigate(`/funds/${id}`)}
            />
            <CategoryLeaderCard categories={leaders.strongestCategories} />
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

const ExplorerLink = ({ assetManager, onClick }) => (
  <ActionPill
    tone="neutral"
    value={assetManager || 'Manager funds'}
    action="Explore funds"
    onClick={onClick}
  />
);

const ManagerPicker = ({ currentManager, managers, onSelectManager }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');
  const isOpen = Boolean(anchorEl);
  const options = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const managerSet = new Set((managers || []).filter(Boolean));
    if (currentManager) managerSet.add(currentManager);

    const sorted = [...managerSet].sort((left, right) => left.localeCompare(right));
    if (!normalizedSearch) return sorted;

    return sorted.filter((manager) => manager.toLowerCase().includes(normalizedSearch));
  }, [managers, currentManager, search]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (manager) => {
    handleClose();
    onSelectManager(manager);
  };

  return (
    <>
      <ActionPill
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        value={currentManager || 'Select manager'}
        action="Switch manager"
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
            placeholder="Search manager"
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
              No managers match this search.
            </Box>
          )}

          {options.map((manager) => {
            const isCurrent = manager === currentManager;

            return (
              <Box
                key={manager}
                component="button"
                type="button"
                onClick={() => handleSelect(manager)}
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
                  {manager}
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

const SnapshotStat = ({ label, value }) => (
  <Box
    sx={{
      p: '14px',
      borderRadius: '18px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
    }}
  >
    <Box sx={{ fontSize: '11px', color: 'var(--text-4)', textTransform: 'uppercase', mb: '6px' }}>
      {label}
    </Box>
    <Box
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: '20px',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: 'var(--text-1)',
        lineHeight: 1.05,
        overflowWrap: 'anywhere',
      }}
    >
      {value}
    </Box>
  </Box>
);

const ChartPanel = ({ title, subtitle, data, dataKey, formatter, fill, withZeroLine = false }) => (
  <Box sx={{ ...PANEL_SX, p: '22px', minHeight: '380px' }}>
    <Box sx={{ mb: '16px' }}>
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
    <Box sx={{ height: '290px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 18, left: 8, bottom: 6 }}>
          <CartesianGrid {...chartGridStyle} horizontal={false} />
          <XAxis type="number" tickFormatter={formatter} {...axisStyle} />
          <YAxis
            type="category"
            dataKey="shortName"
            width={126}
            tick={{ ...axisStyle.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatter(value)}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-1)',
            }}
          />
          {withZeroLine && (
            <ReferenceLine x={0} stroke="var(--border-hover)" strokeDasharray="4 4" />
          )}
          <Bar dataKey={dataKey} fill={fill} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Box>
);

const CategoryFootprintTable = ({ categories }) => (
  <Box sx={{ ...PANEL_SX, p: { xs: '18px', md: '22px' }, mb: '24px' }}>
    <Box sx={{ mb: '16px' }}>
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
        Category footprint
      </Box>
      <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
        Where this manager competes, and how those products compare with category averages.
      </Box>
    </Box>
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
        <Box component="thead">
          <Box component="tr">
            {[
              'Category',
              'Funds',
              'AUM',
              'AUM Share',
              '1Y vs Cat',
              'Avg Rank',
              'Q1 Funds',
              '1M Flow',
            ].map((header) => (
              <Box
                key={header}
                component="th"
                sx={{
                  textAlign: header === 'Category' ? 'left' : 'right',
                  color: 'var(--text-4)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  py: '10px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {header}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {categories.map((category) => (
            <Box component="tr" key={category.categorycode || category.categoryname}>
              <TableCell align="left">{category.categoryname}</TableCell>
              <TableCell>{formatNumber(category.fundCount)}</TableCell>
              <TableCell>{formatMoney(category.totalAum)}</TableCell>
              <TableCell>{formatPercent(category.aumShare)}</TableCell>
              <TableCell color={valueColor(category.excessReturn1yr)}>
                {formatPercent(category.excessReturn1yr, { signed: true })}
              </TableCell>
              <TableCell>{formatPercent(category.avgRank1yr)}</TableCell>
              <TableCell>{formatNumber(category.topQuartileCount)}</TableCell>
              <TableCell color={valueColor(category.flow1m)}>
                {formatMoney(category.flow1m, { signed: true })}
              </TableCell>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

const TableCell = ({ children, align = 'right', color = 'var(--text-2)' }) => (
  <Box
    component="td"
    sx={{
      textAlign: align,
      py: '12px',
      px: align === 'left' ? '0' : '10px',
      borderBottom: '1px solid var(--border)',
      color,
      fontSize: '13px',
      fontFamily: align === 'left' ? 'var(--font-body)' : 'var(--font-mono)',
      fontWeight: align === 'left' ? 650 : 600,
      whiteSpace: align === 'left' ? 'normal' : 'nowrap',
    }}
  >
    {children}
  </Box>
);

const LeaderCard = ({ title, subtitle, funds = [], metric, metricColor, onFundClick }) => (
  <Box sx={{ ...PANEL_SX, p: '20px' }}>
    <Box sx={{ mb: '16px' }}>
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
    <Box sx={{ display: 'grid', gap: '10px' }}>
      {funds.length === 0 && (
        <Box sx={{ color: 'var(--text-4)', fontSize: '13px' }}>No data available.</Box>
      )}
      {funds.map((fund, index) => (
        <Box
          key={`${fund._id}-${index}`}
          component="button"
          onClick={() => onFundClick(fund._id)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            textAlign: 'left',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            borderRadius: '14px',
            p: '12px',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'var(--border-hover)',
              background: 'var(--bg-surface-hover)',
            },
          }}
        >
          <Box sx={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            {index + 1}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 650,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fund.fundname || fund._id}
            </Box>
            <Box sx={{ color: 'var(--text-4)', fontSize: '11px', mt: '3px' }}>
              {fund.ticker || fund.securitytype || 'Fund'} - {fund.categoryname || 'Uncategorized'}
            </Box>
          </Box>
          <Box
            sx={{
              color: metricColor(fund),
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {metric(fund)}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

const CategoryLeaderCard = ({ categories = [] }) => (
  <Box sx={{ ...PANEL_SX, p: '20px' }}>
    <Box sx={{ mb: '16px' }}>
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
        Strongest categories
      </Box>
      <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>
        Best category-relative 1Y return by category.
      </Box>
    </Box>
    <Box sx={{ display: 'grid', gap: '10px' }}>
      {categories.length === 0 && (
        <Box sx={{ color: 'var(--text-4)', fontSize: '13px' }}>No data available.</Box>
      )}
      {categories.map((category, index) => (
        <Box
          key={category.categorycode || category.categoryname}
          sx={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) auto',
            gap: '10px',
            alignItems: 'center',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            borderRadius: '14px',
            p: '12px',
          }}
        >
          <Box sx={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            {index + 1}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 650,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {category.categoryname}
            </Box>
            <Box sx={{ color: 'var(--text-4)', fontSize: '11px', mt: '3px' }}>
              {formatNumber(category.fundCount)} funds - {formatMoney(category.totalAum)}
            </Box>
          </Box>
          <Box
            sx={{
              color: valueColor(category.excessReturn1yr),
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            {formatPercent(category.excessReturn1yr, { signed: true })}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export default AssetManagerOverview;
