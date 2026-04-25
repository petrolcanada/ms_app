import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import { useFundDetail } from '../hooks/useFundDetail';
import { useDomains } from '../hooks/useDomains';
import useFunds from '../hooks/useFunds';
import ActionPill, { PillSeparator as Separator } from './ui/ActionPill';
import {
  usePerformanceHistory,
  useFlowHistory,
  useAssetsHistory,
  useCategoryPerformanceHistory,
} from '../hooks/useHistory';
import useWatchlist from '../hooks/useWatchlist';
import { useAuth } from '../context/AuthContext';
import KpiCard from './KpiCard';
import MetricRow from './MetricRow';
import PerfBar from './PerfBar';
import StarRating from './StarRating';
import SignalBadge from './SignalBadge';
import { DomainCard, DomainGrid } from './DomainTab';
import AsOfDateSelector from './AsOfDateSelector';
import { PerformanceHistoryChart, FlowHistoryChart, AssetsHistoryChart } from './HistoryChart';

const TABS = [
  { key: 'performance', label: 'Performance' },
  { key: 'fees', label: 'Fees' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'risk', label: 'Risk' },
  { key: 'flows', label: 'Flows' },
  { key: 'assets', label: 'Assets' },
  { key: 'basic', label: 'Basic Info' },
];

const FUND_PICKER_LIMIT = 100;

const FundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('performance');

  const goBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/screener');
    }
  };
  const [asofDate, setAsofDate] = useState(searchParams.get('asof') || '');

  const handleDateChange = (newDate) => {
    setAsofDate(newDate);
    setSearchParams(newDate ? { asof: newDate } : {}, { replace: true });
  };

  const {
    data: fundResp,
    isLoading: fundLoading,
    isError: fundError,
    error: fundErr,
  } = useFundDetail(id);
  const {
    data: domainData,
    isLoading: domainLoading,
    isError: domainError,
  } = useDomains(id, {
    asofDate: asofDate || undefined,
  });
  const { data: perfHistory, isLoading: perfHistoryLoading } = usePerformanceHistory(id);
  const { data: categoryPerfHistory, isLoading: categoryPerfHistoryLoading } =
    useCategoryPerformanceHistory(id);
  const { data: flowHistory, isLoading: flowHistoryLoading } = useFlowHistory(id);
  const { data: assetsHistory, isLoading: assetsHistoryLoading } = useAssetsHistory(id);
  const { user } = useAuth();
  const { isWatched, toggle: toggleWatchlist } = useWatchlist(user);

  const fund = fundResp?.data || fundResp;

  const buildFundPath = (fundId) => {
    const params = asofDate ? `?asof=${encodeURIComponent(asofDate)}` : '';
    return `/funds/${fundId}${params}`;
  };

  const handleFundChange = (nextFundId) => {
    if (!nextFundId || nextFundId === id) return;
    navigate(buildFundPath(nextFundId));
  };

  const handleOpenExplorer = () => {
    const params = asofDate ? `?asofDate=${encodeURIComponent(asofDate)}` : '';
    navigate(`/screener${params}`);
  };

  if (fundLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <CircularProgress sx={{ color: 'var(--emerald)' }} />
      </Box>
    );
  }

  if (fundError) {
    return (
      <Box>
        <BackLink onClick={goBack} />
        <Box
          sx={{
            background: 'var(--red-soft)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            color: 'var(--red)',
            fontSize: '13px',
          }}
        >
          {fundErr?.message || 'Failed to load fund details.'}
        </Box>
      </Box>
    );
  }

  if (!fund) {
    return (
      <Box>
        <BackLink onClick={goBack} />
        <Box sx={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
          Fund not found
        </Box>
      </Box>
    );
  }

  const perf = domainData?.performance || {};
  const rankings = domainData?.rankings || {};
  const fees = domainData?.fees || {};
  const ratings = domainData?.ratings || {};
  const risk = domainData?.risk || {};
  const flows = domainData?.flows || {};
  const assets = domainData?.assets || {};
  const basicInfo = domainData?.basicInfo || {};
  const catPerf = domainData?.categoryPerformance || {};
  const categoryName = fund.categoryname || fund.globalcategoryname;
  const assetManagerName = fund.brandingname || basicInfo.brandingname;

  const fmt = (v, suffix = '') => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}${suffix}`;
  };

  const fmtPct = (v) => fmt(v, '%');
  const fmtPlain = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return n.toFixed(2);
  };

  const valColor = (v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    if (isNaN(n)) return undefined;
    if (n > 0) return 'var(--emerald)';
    if (n < 0) return 'var(--red)';
    return undefined;
  };

  const renderTabContent = () => {
    if (domainLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '60px' }}>
          <CircularProgress size={28} sx={{ color: 'var(--emerald)' }} />
        </Box>
      );
    }

    if (domainError) {
      return (
        <Box
          sx={{
            background: 'var(--red-soft)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            color: 'var(--red)',
            fontSize: '13px',
          }}
        >
          Failed to load domain data. The data may not be available for the current date.
        </Box>
      );
    }

    switch (activeTab) {
      case 'performance':
        return (
          <>
            <PerformanceTab
              perf={perf}
              catPerf={catPerf}
              rankings={rankings}
              fmtPct={fmtPct}
              valColor={valColor}
            />
            <Box sx={{ mt: '20px' }}>
              <PerformanceHistoryChart
                data={perfHistory}
                comparisonData={categoryPerfHistory}
                comparisonLabel={
                  catPerf?.categoryname
                    ? `Category Avg (${catPerf.categoryname})`
                    : 'Category Average'
                }
                isLoading={perfHistoryLoading || categoryPerfHistoryLoading}
              />
            </Box>
          </>
        );
      case 'fees':
        return <FeesTab fees={fees} fmtPct={fmtPct} />;
      case 'ratings':
        return <RatingsTab ratings={ratings} />;
      case 'risk':
        return <RiskTab risk={risk} fmtPct={fmtPct} fmtPlain={fmtPlain} valColor={valColor} />;
      case 'flows':
        return (
          <>
            <FlowsTab flows={flows} />
            <Box sx={{ mt: '20px' }}>
              <FlowHistoryChart data={flowHistory} isLoading={flowHistoryLoading} />
            </Box>
          </>
        );
      case 'assets':
        return (
          <>
            <AssetsTab assets={assets} />
            <Box sx={{ mt: '20px' }}>
              <AssetsHistoryChart data={assetsHistory} isLoading={assetsHistoryLoading} />
            </Box>
          </>
        );
      case 'basic':
        return <BasicInfoTab fund={fund} basicInfo={basicInfo} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <BackLink onClick={goBack} />

      {/* Fund Header */}
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
        <Box>
          <Box
            component="h1"
            sx={{
              fontFamily: 'var(--font-head)',
              fontSize: { xs: '22px', md: '28px' },
              fontWeight: 600,
              color: 'var(--text-1)',
              letterSpacing: '-0.03em',
              mb: '8px',
            }}
          >
            {fund.fundname || fund._name || 'Unknown Fund'}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: 'var(--text-3)',
              flexWrap: 'wrap',
            }}
          >
            <FundBadge type={fund.securitytype || fund.legalstructure} />
            <Separator />
            <CategoryLink category={categoryName} />
            {assetManagerName && (
              <>
                <Separator />
                <AssetManagerLink assetManager={assetManagerName} />
              </>
            )}
            <Separator />
            <FundPicker currentFund={fund} asofDate={asofDate} onSelectFund={handleFundChange} />
            <Separator />
            <ExplorerLink onClick={handleOpenExplorer} />
            <Separator />
            <span>
              Inception:{' '}
              {fund.inceptiondate ? new Date(fund.inceptiondate).toLocaleDateString('en-CA') : '—'}
            </span>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            gap: '12px',
            flexWrap: 'wrap',
            maxWidth: { xs: '100%', lg: '560px' },
          }}
        >
          <Box
            component="button"
            aria-label={isWatched(id) ? 'Remove from watchlist' : 'Add to watchlist'}
            aria-pressed={isWatched(id)}
            onClick={() =>
              toggleWatchlist({
                _id: id,
                fundname: fund.fundname || fund._name,
                ticker: fund.ticker,
                categoryname: fund.categoryname || fund.globalcategoryname,
                securitytype: fund.securitytype,
              })
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isWatched(id) ? 'var(--amber-soft)' : 'var(--bg-surface)',
              border: isWatched(id) ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '8px 14px',
              color: isWatched(id) ? 'var(--amber)' : 'var(--text-3)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition)',
              '&:hover': {
                borderColor: isWatched(id) ? 'var(--amber)' : 'var(--border-hover)',
                color: isWatched(id) ? 'var(--amber)' : 'var(--text-2)',
              },
            }}
          >
            <span style={{ fontSize: '16px' }}>{isWatched(id) ? '\u2605' : '\u2606'}</span>
            {isWatched(id) ? 'Watching' : 'Watch'}
          </Box>
          <AsOfDateSelector value={asofDate} onChange={handleDateChange} />
          <SignalBadge signal="hold" size="large" />
        </Box>
      </Box>

      {/* KPI Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          mb: '32px',
        }}
      >
        <KpiCard
          label="1-Year Return"
          value={fmtPct(perf.return1yr)}
          valueColor={valColor(perf.return1yr)}
          delay={80}
        />
        <KpiCard
          label="3-Year Annualized"
          value={fmtPct(perf.return3yr)}
          valueColor={valColor(perf.return3yr)}
          delay={140}
        />
        <KpiCard
          label="MER"
          value={fees.mer != null ? `${Number(fees.mer).toFixed(2)}%` : '—'}
          delay={200}
        />
        <KpiCard
          label="Morningstar Rating"
          value={<StarRating rating={ratings.ratingoverall} size="small" />}
          delay={260}
        />
        <KpiCard
          label="Net Assets"
          value={
            assets.fundnetassets != null
              ? `$${(Number(assets.fundnetassets) / 1e6).toFixed(0)}M`
              : '—'
          }
          delay={320}
        />
      </Box>

      {/* Domain Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: '4px',
          mb: '24px',
          borderBottom: '1px solid var(--border)',
          pb: 0,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <Box
            key={tab.key}
            component="button"
            onClick={() => setActiveTab(tab.key)}
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: activeTab === tab.key ? 'var(--accent-strong)' : 'var(--text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 18px',
              borderBottom:
                activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              mb: '-1px',
              transition: 'all var(--transition)',
              '&:hover': {
                color: activeTab === tab.key ? 'var(--accent-strong)' : 'var(--text-2)',
              },
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      {/* Tab Content */}
      <Box sx={{ animation: 'fadeIn 300ms ease' }} key={activeTab}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

/* ── Sub-components ─────────────────────── */

const BackLink = ({ onClick }) => (
  <Box
    component="button"
    aria-label="Go back"
    onClick={onClick}
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
      '&:hover': { color: 'var(--emerald)' },
    }}
  >
    &#8592; Back
  </Box>
);

const getFundLabel = (fund) => {
  const name = fund.fundname || fund._name || fund.legalname || 'Unnamed fund';
  return fund.ticker ? `${name} (${fund.ticker})` : name;
};

const ExplorerLink = ({ onClick }) => (
  <ActionPill tone="neutral" value="All funds" action="Explorer" onClick={onClick} />
);

const FundPicker = ({ currentFund, asofDate, onSelectFund }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isOpen = Boolean(anchorEl);
  const { data, isLoading, isError } = useFunds({
    page: 1,
    limit: FUND_PICKER_LIMIT,
    search: debouncedSearch.trim(),
    asofDate,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [search]);

  const options = useMemo(() => {
    const funds = data?.data || [];
    if (!currentFund?._id) return funds;

    const containsCurrentFund = funds.some((fund) => fund._id === currentFund._id);
    return containsCurrentFund ? funds : [currentFund, ...funds];
  }, [currentFund, data?.data]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (fundId) => {
    handleClose();
    onSelectFund(fundId);
  };

  return (
    <>
      <ActionPill
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        value={currentFund ? getFundLabel(currentFund) : 'Select fund'}
        action="Switch fund"
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
            width: { xs: 'calc(100vw - 32px)', sm: '460px' },
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
            placeholder="Search fund name, ticker, or ID"
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
          <Box sx={{ mt: '8px', fontSize: '11px', color: 'var(--text-4)' }}>
            Search runs across the fund universe. Showing up to {FUND_PICKER_LIMIT} matches.
          </Box>
        </Box>

        <Box sx={{ maxHeight: '360px', overflowY: 'auto', py: '6px' }}>
          {isLoading && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '14px', py: '18px' }}
            >
              <CircularProgress size={18} sx={{ color: 'var(--accent)' }} />
              <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>Loading funds...</Box>
            </Box>
          )}

          {!isLoading && isError && (
            <Box sx={{ px: '14px', py: '18px', color: 'var(--red)', fontSize: '13px' }}>
              Failed to load fund list.
            </Box>
          )}

          {!isLoading && !isError && options.length === 0 && (
            <Box sx={{ px: '14px', py: '18px', color: 'var(--text-4)', fontSize: '13px' }}>
              No funds match this search.
            </Box>
          )}

          {!isLoading &&
            !isError &&
            options.map((fund) => {
              const isCurrent = fund._id === currentFund?._id;

              return (
                <Box
                  key={fund._id}
                  component="button"
                  type="button"
                  onClick={() => handleSelect(fund._id)}
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
                    py: '10px',
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'background var(--transition)',
                    '&:hover': {
                      background: isCurrent ? 'var(--accent-soft)' : 'var(--bg-surface-hover)',
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fund.fundname || fund._name || fund.legalname || 'Unnamed fund'}
                    </Box>
                    <Box
                      sx={{
                        mt: '3px',
                        fontSize: '11px',
                        color: 'var(--text-4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fund.ticker || '--'}
                      {fund.categoryname ? ` | ${fund.categoryname}` : ''}
                    </Box>
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

const FundBadge = ({ type }) => {
  if (!type) return null;
  return (
    <Box
      component="span"
      sx={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '3px 8px',
        borderRadius: '4px',
        color: 'var(--text-3)',
        background: 'rgba(100, 116, 139, 0.12)',
      }}
    >
      {type}
    </Box>
  );
};

const CategoryLink = ({ category }) => {
  if (!category) return <span>—</span>;

  return (
    <ActionPill
      component={Link}
      to={`/categories/${encodeURIComponent(category)}`}
      aria-label={`View ${category} category overview`}
      value={category}
      action="View category"
    />
  );
};

const AssetManagerLink = ({ assetManager }) => {
  if (!assetManager) return <span>—</span>;

  return (
    <ActionPill
      component={Link}
      to={`/asset-managers/${encodeURIComponent(assetManager)}`}
      aria-label={`View ${assetManager} asset manager overview`}
      tone="emerald"
      value={assetManager}
      action="View manager"
    />
  );
};

/* ── Tab panels ─────────────────────────── */

const PerformanceTab = ({ perf, catPerf, rankings, fmtPct, valColor }) => {
  const horizons = [
    { label: 'YTD', key: 'returnytd', catKey: 'cat_returnytd' },
    { label: '1 Year', key: 'return1yr', catKey: 'cat_return1yr' },
    { label: '3 Year', key: 'return3yr', catKey: 'cat_return3yr' },
    { label: '5 Year', key: 'return5yr', catKey: 'cat_return5yr' },
    { label: '10 Year', key: 'return10yr', catKey: 'cat_return10yr' },
    { label: 'Inception', key: 'returnsinceinception' },
  ];

  const maxAbs = horizons.reduce((max, h) => {
    const v = Math.abs(Number(perf[h.key]) || 0);
    return v > max ? v : max;
  }, 1);

  const hasCatData = catPerf && catPerf.categoryname;

  const comparisonHorizons = [
    { label: 'YTD', fundKey: 'returnytd', catKey: 'cat_returnytd' },
    { label: '1 Month', fundKey: 'return1mth', catKey: 'cat_return1mth' },
    { label: '3 Month', fundKey: 'return3mth', catKey: 'cat_return3mth' },
    { label: '6 Month', fundKey: 'return6mth', catKey: 'cat_return6mth' },
    { label: '1 Year', fundKey: 'return1yr', catKey: 'cat_return1yr' },
    { label: '3 Year', fundKey: 'return3yr', catKey: 'cat_return3yr' },
    { label: '5 Year', fundKey: 'return5yr', catKey: 'cat_return5yr' },
    { label: '10 Year', fundKey: 'return10yr', catKey: 'cat_return10yr' },
  ];

  return (
    <DomainGrid>
      <DomainCard title="Return by Time Horizon" fullWidth>
        <Box>
          {horizons.map((h) => {
            const val = Number(perf[h.key]) || 0;
            return (
              <PerfBar
                key={h.key}
                label={h.label}
                value={fmtPct(perf[h.key])}
                percentage={(Math.abs(val) / maxAbs) * 80}
              />
            );
          })}
        </Box>
      </DomainCard>
      {hasCatData && (
        <DomainCard title={`Fund vs Category Average (${catPerf.categoryname})`} fullWidth>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 0,
              fontSize: '12px',
            }}
          >
            <Box
              sx={{
                padding: '8px 0',
                fontWeight: 600,
                color: 'var(--text-3)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Horizon
            </Box>
            <Box
              sx={{
                padding: '8px 0',
                fontWeight: 600,
                color: 'var(--text-3)',
                textAlign: 'right',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Fund
            </Box>
            <Box
              sx={{
                padding: '8px 0',
                fontWeight: 600,
                color: 'var(--text-3)',
                textAlign: 'right',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Cat. Avg
            </Box>
            <Box
              sx={{
                padding: '8px 0',
                fontWeight: 600,
                color: 'var(--text-3)',
                textAlign: 'right',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Diff
            </Box>
            {comparisonHorizons.map((h) => {
              const fundVal = perf[h.fundKey] != null ? Number(perf[h.fundKey]) : null;
              const catVal = catPerf[h.catKey] != null ? Number(catPerf[h.catKey]) : null;
              const diff = fundVal != null && catVal != null ? fundVal - catVal : null;
              return (
                <React.Fragment key={h.label}>
                  <Box
                    sx={{
                      padding: '10px 0',
                      color: 'var(--text-3)',
                      borderBottom: '1px solid rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    {h.label}
                  </Box>
                  <Box
                    sx={{
                      padding: '10px 0',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      color: valColor(fundVal),
                      borderBottom: '1px solid rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    {fmtPct(fundVal)}
                  </Box>
                  <Box
                    sx={{
                      padding: '10px 0',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      color: 'var(--text-2)',
                      borderBottom: '1px solid rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    {fmtPct(catVal)}
                  </Box>
                  <Box
                    sx={{
                      padding: '10px 0',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      color: valColor(diff),
                      borderBottom: '1px solid rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    {fmtPct(diff)}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        </DomainCard>
      )}
      <DomainCard title="Category Rank (Percentile)">
        <MetricRow label="1 Year" value={rankings.rank1yr != null ? rankings.rank1yr : '—'} />
        <MetricRow label="3 Year" value={rankings.rank3yr != null ? rankings.rank3yr : '—'} />
        <MetricRow label="5 Year" value={rankings.rank5yr != null ? rankings.rank5yr : '—'} />
      </DomainCard>
      <DomainCard title="Cumulative Returns">
        <MetricRow
          label="2 Year"
          value={fmtPct(perf.cumulativereturn2yr)}
          valueColor={valColor(perf.cumulativereturn2yr)}
        />
        <MetricRow
          label="3 Year"
          value={fmtPct(perf.cumulativereturn3yr)}
          valueColor={valColor(perf.cumulativereturn3yr)}
        />
        <MetricRow
          label="5 Year"
          value={fmtPct(perf.cumulativereturn5yr)}
          valueColor={valColor(perf.cumulativereturn5yr)}
        />
        <MetricRow
          label="10 Year"
          value={fmtPct(perf.cumulativereturn10yr)}
          valueColor={valColor(perf.cumulativereturn10yr)}
        />
        <MetricRow
          label="Since Inception"
          value={fmtPct(perf.cumulativereturnsinceinception)}
          valueColor={valColor(perf.cumulativereturnsinceinception)}
        />
      </DomainCard>
    </DomainGrid>
  );
};

const FeesTab = ({ fees, fmtPct }) => (
  <DomainGrid>
    <DomainCard title="Fee Breakdown">
      <MetricRow label="Management Expense Ratio (MER)" value={fmtPct(fees.mer)} />
      <MetricRow label="Net Expense Ratio" value={fmtPct(fees.netexpenseratio)} />
      <MetricRow label="Gross Expense Ratio" value={fmtPct(fees.grossexpenseratio)} />
      <MetricRow label="Management Fee" value={fmtPct(fees.actualmanagementfee)} />
      <MetricRow label="Trading Expense Ratio (TER)" value={fmtPct(fees.tradingexpenseratio)} />
      <MetricRow
        label="Performance Fee"
        value={fees.performancefee != null ? fmtPct(fees.performancefee) : '—'}
      />
    </DomainCard>
    <DomainCard title="Other Fees">
      <MetricRow label="Administration Fee" value={fmtPct(fees.administrationfee)} />
      <MetricRow label="Trustee Fee" value={fmtPct(fees.trusteefee)} />
      <MetricRow label="Transaction Fee" value={fmtPct(fees.transactionfee)} />
      <MetricRow label="Switching Fee" value={fmtPct(fees.switchingfee)} />
      <MetricRow label="Fee Level" value={fees.feelevel || '—'} />
    </DomainCard>
  </DomainGrid>
);

const RatingsTab = ({ ratings }) => (
  <DomainGrid>
    <DomainCard title="Morningstar Star Ratings">
      <Box sx={{ mb: '12px' }}>
        <StarRating rating={ratings.ratingoverall} size="large" />
      </Box>
      <MetricRow
        label="Overall Rating"
        value={ratings.ratingoverall ? `${ratings.ratingoverall} Stars` : '—'}
        valueColor="var(--amber)"
      />
      <MetricRow
        label="3-Year Rating"
        value={ratings.rating3year ? `${ratings.rating3year} Stars` : '—'}
        valueColor="var(--amber)"
      />
      <MetricRow
        label="5-Year Rating"
        value={ratings.rating5year ? `${ratings.rating5year} Stars` : '—'}
        valueColor="var(--amber)"
      />
      <MetricRow
        label="10-Year Rating"
        value={ratings.rating10year ? `${ratings.rating10year} Stars` : '—'}
        valueColor="var(--amber)"
      />
    </DomainCard>
    <DomainCard title="Risk-Adjusted Performance">
      <MetricRow
        label="Return (Overall)"
        value={ratings.returnoverall != null ? Number(ratings.returnoverall).toFixed(2) : '—'}
      />
      <MetricRow
        label="Risk (Overall)"
        value={ratings.riskoverall != null ? Number(ratings.riskoverall).toFixed(2) : '—'}
      />
      <MetricRow
        label="Performance Score (3Y)"
        value={
          ratings.performancescore3yr != null ? Number(ratings.performancescore3yr).toFixed(2) : '—'
        }
      />
      <MetricRow
        label="Risk Score (3Y)"
        value={ratings.riskscore3yr != null ? Number(ratings.riskscore3yr).toFixed(2) : '—'}
      />
    </DomainCard>
  </DomainGrid>
);

const RiskTab = ({ risk, fmtPct, fmtPlain, valColor }) => (
  <DomainGrid>
    <DomainCard title="Risk Metrics (3-Year)">
      <MetricRow label="Standard Deviation" value={fmtPct(risk.stddev3yr)} />
      <MetricRow
        label="Sharpe Ratio"
        value={fmtPlain(risk.sharperatio3yr)}
        valueColor={valColor(risk.sharperatio3yr)}
      />
      <MetricRow label="Beta" value={fmtPlain(risk.beta3yr)} />
      <MetricRow
        label="Alpha"
        value={fmtPlain(risk.alpha3yr)}
        valueColor={valColor(risk.alpha3yr)}
      />
      <MetricRow label="R-Squared" value={fmtPlain(risk.rsquared3yr)} />
      <MetricRow
        label="Information Ratio"
        value={fmtPlain(risk.informationratio3yr)}
        valueColor={valColor(risk.informationratio3yr)}
      />
    </DomainCard>
    <DomainCard title="Drawdown & Capture">
      <MetricRow
        label="Max Drawdown (3Y)"
        value={fmtPct(risk.maxdrawdown3yr)}
        valueColor={valColor(risk.maxdrawdown3yr)}
      />
      <MetricRow
        label="Upside Capture"
        value={fmtPct(risk.captureratioupside3yr)}
        valueColor="var(--emerald)"
      />
      <MetricRow label="Downside Capture" value={fmtPct(risk.captureratiodownside3yr)} />
    </DomainCard>
  </DomainGrid>
);

const FlowsTab = ({ flows }) => {
  const fmtMoney = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    const abs = Math.abs(n);
    const sign = n >= 0 ? '+' : '-';
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
    return `${sign}$${abs.toLocaleString()}`;
  };

  return (
    <DomainGrid>
      <DomainCard title="Fund-Level Net Flows">
        <MetricRow
          label="Net Flows (1M)"
          value={fmtMoney(flows.estfundlevelnetflow1momoend)}
          valueColor={Number(flows.estfundlevelnetflow1momoend) > 0 ? 'var(--emerald)' : undefined}
        />
        <MetricRow
          label="Net Flows (3M)"
          value={fmtMoney(flows.estfundlevelnetflow3momoend)}
          valueColor={Number(flows.estfundlevelnetflow3momoend) > 0 ? 'var(--emerald)' : undefined}
        />
        <MetricRow
          label="Net Flows (1Y)"
          value={fmtMoney(flows.estfundlevelnetflow1yrmoend)}
          valueColor={Number(flows.estfundlevelnetflow1yrmoend) > 0 ? 'var(--emerald)' : undefined}
        />
        <MetricRow
          label="Net Flows (YTD)"
          value={fmtMoney(flows.estfundlevelnetflowytdmoend)}
          valueColor={Number(flows.estfundlevelnetflowytdmoend) > 0 ? 'var(--emerald)' : undefined}
        />
      </DomainCard>
      <DomainCard title="Share Class Net Flows">
        <MetricRow
          label="Net Flows (1M)"
          value={fmtMoney(flows.estshareclassnetflow1momoend)}
          valueColor={Number(flows.estshareclassnetflow1momoend) > 0 ? 'var(--emerald)' : undefined}
        />
        <MetricRow
          label="Net Flows (3M)"
          value={fmtMoney(flows.estshareclassnetflow3momoend)}
          valueColor={Number(flows.estshareclassnetflow3momoend) > 0 ? 'var(--emerald)' : undefined}
        />
        <MetricRow
          label="Net Flows (1Y)"
          value={fmtMoney(flows.estshareclassnetflow1yrmoend)}
          valueColor={Number(flows.estshareclassnetflow1yrmoend) > 0 ? 'var(--emerald)' : undefined}
        />
      </DomainCard>
    </DomainGrid>
  );
};

const AssetsTab = ({ assets }) => {
  const fmtAssets = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <DomainGrid>
      <DomainCard title="Asset Data">
        <MetricRow label="Fund Net Assets" value={fmtAssets(assets.fundnetassets)} />
        <MetricRow
          label="Normalized Net Assets"
          value={fmtAssets(assets.normalizedfundnetassets)}
        />
        <MetricRow label="Surveyed Net Assets" value={fmtAssets(assets.surveyedfundnetassets)} />
        <MetricRow label="As-Of Date" value={assets.netassetsdate || '—'} />
      </DomainCard>
    </DomainGrid>
  );
};

const BasicInfoTab = ({ fund, basicInfo }) => {
  const info = { ...fund, ...basicInfo };
  return (
    <DomainGrid>
      <DomainCard title="Fund Identification">
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '0 32px' }}
        >
          <MetricRow
            label="Legal Name"
            value={info.legalname || info.fundname || '—'}
            useBodyFont
          />
          <MetricRow label="Fund Family" value={info.providercompanyname || '—'} useBodyFont />
          <MetricRow
            label="Asset Manager"
            value={<AssetManagerLink assetManager={info.brandingname} />}
            useBodyFont
          />
          <MetricRow
            label="Morningstar Category"
            value={<CategoryLink category={info.categoryname || info.globalcategoryname} />}
            useBodyFont
          />
          <MetricRow
            label="Fund Type"
            value={info.securitytype || info.legalstructure || '—'}
            useBodyFont
          />
          <MetricRow
            label="Inception Date"
            value={
              info.inceptiondate ? new Date(info.inceptiondate).toLocaleDateString('en-CA') : '—'
            }
          />
          <MetricRow label="Currency" value={info.currency || '—'} />
          <MetricRow label="Domicile" value={info.domicile || '—'} useBodyFont />
          <MetricRow label="Broad Asset Class" value={info.broadassetclass || '—'} useBodyFont />
        </Box>
      </DomainCard>
    </DomainGrid>
  );
};

export default FundDetail;
