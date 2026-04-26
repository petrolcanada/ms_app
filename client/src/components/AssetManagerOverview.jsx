import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import AsOfDateSelector from './AsOfDateSelector';
import SEO from './SEO';
import KpiCard from './KpiCard';
import { designTokens } from '../design/tokens';
import useAssetManagers from '../hooks/useAssetManagers';
import useAssetManagerOverview from '../hooks/useAssetManagerOverview';
import ActionPill, { PillSeparator as Separator } from './ui/ActionPill';
import HorizontalBarChartPanel from './charts/HorizontalBarChartPanel';

const PANEL_SX = {
  ...designTokens.card.panel,
  position: 'relative',
  overflow: 'hidden',
};
const SURFACE_CARD_SX = {
  ...designTokens.card.surface,
  position: 'relative',
  overflow: 'hidden',
};
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
const CATEGORY_FOOTPRINT_COLUMNS = [
  {
    key: 'categoryname',
    label: 'Category',
    align: 'left',
    defaultDirection: 'asc',
    getValue: (category) => category.categoryname,
  },
  {
    key: 'fundCount',
    label: 'Funds',
    defaultDirection: 'desc',
    getValue: (category) => category.fundCount,
  },
  {
    key: 'totalAum',
    label: 'AUM',
    defaultDirection: 'desc',
    getValue: (category) => category.totalAum,
  },
  {
    key: 'aumShare',
    label: 'AUM Share',
    defaultDirection: 'desc',
    getValue: (category) => category.aumShare,
  },
  {
    key: 'excessReturn1yr',
    label: '1Y vs Cat',
    defaultDirection: 'desc',
    getValue: (category) => category.excessReturn1yr,
  },
  {
    key: 'avgRank1yr',
    label: 'Avg Rank',
    defaultDirection: 'asc',
    getValue: (category) => category.avgRank1yr,
  },
  {
    key: 'topQuartileCount',
    label: 'Q1 Funds',
    defaultDirection: 'desc',
    getValue: (category) => category.topQuartileCount,
  },
  {
    key: 'flow1m',
    label: '1M Flow',
    defaultDirection: 'desc',
    getValue: (category) => category.flow1m,
  },
];
const DEFAULT_CATEGORY_FOOTPRINT_SORT = {
  key: 'totalAum',
  direction: 'desc',
};

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

const compareValues = (leftValue, rightValue) => {
  const leftNumber = toNumber(leftValue);
  const rightNumber = toNumber(rightValue);

  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber - rightNumber;
  }

  if (leftValue == null && rightValue == null) return 0;
  if (leftValue == null) return 1;
  if (rightValue == null) return -1;

  return String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: 'base' });
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
      categories.slice(0, 10).map((category) => ({
        name: category.categoryname,
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

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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

          <Box sx={{ display: 'grid', gap: '10px', width: '100%' }}>
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
            <KpiCard label="Total AUM" value={formatMoney(totals.totalAum)} />
            <KpiCard
              label="Avg 1Y Return"
              value={formatPercent(totals.avgReturn1yr, { signed: true })}
              valueColor={valueColor(totals.avgReturn1yr)}
            />
            <KpiCard
              label="1Y vs Category"
              value={formatPercent(relativeQuality.avgExcessReturn1yr, { signed: true })}
              valueColor={valueColor(relativeQuality.avgExcessReturn1yr)}
            />
            <KpiCard label="Avg Rating" value={formatRating(totals.avgRating)} />
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
              title="Category AUM footprint"
              subtitle="Largest categories by share of manager AUM"
              data={topCategoryChart}
              valueKey="aumShare"
              labelKey="name"
              valueFormatter={(value) => formatPercent(value)}
              detailFormatter={(item) =>
                `${formatMoney(item.totalAum)} | ${formatPercent(item.aumShare)}`
              }
              fill="var(--accent)"
              maxValue={100}
              labelMaxLength={null}
            />
            <HorizontalBarChartPanel
              title="1Y category relative return"
              subtitle="Fund average return minus category average"
              data={relativeChart}
              valueKey="excessReturn1yr"
              labelKey="name"
              valueFormatter={(value) => formatPercent(value, { signed: true })}
              detailFormatter={(item) => formatPercent(item.excessReturn1yr, { signed: true })}
              detailColorFormatter={(item) => valueColor(item.excessReturn1yr)}
              fill="var(--emerald)"
              negativeFill="var(--red)"
              variant="diverging"
              labelMaxLength={null}
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
            <KpiCard label="1M Flow" value={formatMoney(totals.flow1m, { signed: true })} />
            <KpiCard label="YTD Flow" value={formatMoney(totals.flowYtd, { signed: true })} />
            <KpiCard label="1Y Flow" value={formatMoney(totals.flow1yr, { signed: true })} />
            <KpiCard label="Median MER" value={formatPercent(totals.medianMer)} />
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const optionRefs = useRef([]);
  const inputRef = useRef(null);
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
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleSelect = (manager) => {
    handleClose();
    onSelectManager(manager);
  };

  useEffect(() => {
    if (!isOpen) return;

    const currentIndex = options.findIndex((manager) => manager === currentManager);
    setHighlightedIndex(options.length ? Math.max(currentIndex, 0) : -1);
  }, [isOpen, options, currentManager]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;

    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const handleInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
      return;
    }

    if (!options.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % options.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current <= 0 ? options.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      handleSelect(options[highlightedIndex]);
    }
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
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleInputKeyDown}
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

          {options.map((manager, index) => {
            const isCurrent = manager === currentManager;
            const isHighlighted = highlightedIndex === index;

            return (
              <Box
                key={manager}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                component="button"
                type="button"
                onClick={() => handleSelect(manager)}
                onMouseEnter={() => setHighlightedIndex(index)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  border: 'none',
                  background: isHighlighted || isCurrent ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--text-1)',
                  textAlign: 'left',
                  px: '14px',
                  py: '11px',
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'background var(--transition)',
                  '&:hover': {
                    background:
                      isHighlighted || isCurrent ? 'var(--accent-soft)' : 'var(--bg-surface-hover)',
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

const CategoryFootprintTable = ({ categories }) => {
  const [sortConfig, setSortConfig] = useState(DEFAULT_CATEGORY_FOOTPRINT_SORT);

  const sortedCategories = useMemo(() => {
    const activeColumn =
      CATEGORY_FOOTPRINT_COLUMNS.find((column) => column.key === sortConfig.key) ||
      CATEGORY_FOOTPRINT_COLUMNS[0];

    return [...categories].sort((left, right) => {
      const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;
      const result =
        compareValues(activeColumn.getValue(left), activeColumn.getValue(right)) *
        directionMultiplier;

      if (result !== 0) return result;
      return compareValues(left.categoryname, right.categoryname);
    });
  }, [categories, sortConfig]);

  const handleSort = (key, defaultDirection) => {
    setSortConfig((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: defaultDirection },
    );
  };

  return (
    <Box sx={{ ...SURFACE_CARD_SX, p: { xs: '18px', md: '22px' }, mb: '24px' }}>
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
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}
        >
          <Box component="thead">
            <Box component="tr">
              {CATEGORY_FOOTPRINT_COLUMNS.map((column) => {
                const isActive = sortConfig.key === column.key;
                const sortIndicator = isActive
                  ? sortConfig.direction === 'asc'
                    ? ' ↑'
                    : ' ↓'
                  : '';

                return (
                  <Box
                    key={column.key}
                    component="th"
                    aria-sort={
                      isActive
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    sx={{
                      textAlign: column.align === 'left' ? 'left' : 'right',
                      color: 'var(--text-4)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      py: '10px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleSort(column.key, column.defaultDirection)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: column.align === 'left' ? 'flex-start' : 'flex-end',
                        gap: '4px',
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        font: 'inherit',
                        letterSpacing: 'inherit',
                        textTransform: 'inherit',
                        cursor: 'pointer',
                        p: 0,
                      }}
                    >
                      <Box component="span">{column.label}</Box>
                      <Box
                        component="span"
                        aria-hidden="true"
                        sx={{
                          minWidth: '12px',
                          color: isActive ? 'var(--text-2)' : 'var(--text-4)',
                        }}
                      >
                        {sortIndicator || ' '}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box component="tbody">
            {sortedCategories.map((category) => (
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
};

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
  <Box sx={{ ...SURFACE_CARD_SX, p: '20px' }}>
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
          type="button"
          onClick={() => onFundClick(fund._id)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '28px minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            p: '12px',
            cursor: 'pointer',
            '& + &': {
              borderTop: '1px solid var(--border)',
            },
            '&:hover': {
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
  <Box sx={{ ...SURFACE_CARD_SX, p: '20px' }}>
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
            p: '12px',
            '& + &': {
              borderTop: '1px solid var(--border)',
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
