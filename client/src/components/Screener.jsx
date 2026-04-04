import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useScreener from '../hooks/useScreener';
import useCategories from '../hooks/useCategories';
import useAvailableDates from '../hooks/useAvailableDates';
import SignalBadge from './SignalBadge';
import StarRating from './StarRating';

/* ── Column definitions ── */

const SORTABLE_COLUMNS = [
  { key: 'return1yr', label: '1Y Return', domain: 'performance', field: 'return1yr', higherIsBetter: true },
  { key: 'return3yr', label: '3Y Ann.', domain: 'performance', field: 'return3yr', higherIsBetter: true },
  { key: 'return5yr', label: '5Y Ann.', domain: 'performance', field: 'return5yr', higherIsBetter: true },
  { key: 'return10yr', label: '10Y Ann.', domain: 'performance', field: 'return10yr', higherIsBetter: true },
  { key: 'mer', label: 'MER', domain: 'fees', field: 'mer', higherIsBetter: false },
  { key: 'sharpe', label: 'Sharpe', domain: 'risk', field: 'sharperatio3yr', higherIsBetter: true },
  { key: 'rating', label: 'Rating', domain: 'ratings', field: 'ratingoverall', higherIsBetter: true },
  { key: 'aum', label: 'AUM (M)', domain: 'assets', field: 'fundnetassets', higherIsBetter: true },
];

const RANK_BY_OPTIONS = [
  { value: 'return1yr', label: '1-Year Return' },
  { value: 'return3yr', label: '3-Year Annualized' },
  { value: 'return5yr', label: '5-Year Annualized' },
  { value: 'return10yr', label: '10-Year Annualized' },
  { value: 'mer', label: 'MER (Low to High)' },
  { value: 'sharpe', label: 'Sharpe Ratio' },
  { value: 'rating', label: 'Risk-Adjusted Rating' },
  { value: 'aum', label: 'AUM' },
];

const PER_PAGE = 25;

/* ── Utility functions ── */

const getFieldValue = (fund, col) => {
  const raw = fund[col.domain]?.[col.field];
  return raw != null ? Number(raw) : null;
};

const getQuintile = (value, allValues, higherIsBetter = true) => {
  const valid = allValues.filter(v => v != null && !isNaN(v));
  if (value == null || valid.length < 5) return 3;
  const sorted = [...valid].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  const pct = below / (sorted.length - 1);

  let q;
  if (pct <= 0.2) q = 1;
  else if (pct <= 0.4) q = 2;
  else if (pct <= 0.6) q = 3;
  else if (pct <= 0.8) q = 4;
  else q = 5;

  return higherIsBetter ? q : 6 - q;
};

const getSignal = (rankPct) => {
  if (rankPct == null) return null;
  if (rankPct <= 0.1) return 'strong';
  if (rankPct <= 0.3) return 'buy';
  if (rankPct <= 0.7) return 'hold';
  if (rankPct <= 0.9) return 'weak';
  return 'avoid';
};

const getRankTier = (rank, total) => {
  const pct = rank / total;
  if (pct <= 0.2) return 'top';
  if (pct <= 0.5) return 'mid';
  if (pct <= 0.8) return 'low';
  return 'bottom';
};

const getMerTier = (mer) => {
  if (mer == null) return null;
  const m = Number(mer);
  if (m <= 0.5) return 'low';
  if (m <= 2.0) return 'mid';
  if (m <= 2.5) return 'high';
  return 'extreme';
};

const formatReturn = (val) => {
  if (val == null) return '—';
  const n = Number(val);
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};

const formatPct = (val) => (val == null ? '—' : `${Number(val).toFixed(2)}%`);
const formatNum = (val) => (val == null ? '—' : Number(val).toFixed(2));

const formatAum = (val) => {
  if (val == null) return '—';
  const m = Number(val) / 1e6;
  if (m >= 1) return `$${m.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (Number(val) >= 1e3) return `$${(Number(val) / 1e3).toFixed(0)}K`;
  return `$${Number(val).toFixed(0)}`;
};

const formatDateLabel = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

/* ── Main component ── */

const Screener = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: availableDates, isLoading: datesLoading } = useAvailableDates();

  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [asofDate, setAsofDate] = useState('');
  const [sortKey, setSortKey] = useState('return1yr');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const { data, totalFunds, isLoading, isFetching, isError, error } = useScreener({
    category,
    type,
    asofDate,
  });

  const activeCol = SORTABLE_COLUMNS.find(c => c.key === sortKey);

  const sortedData = useMemo(() => {
    if (!activeCol) return data;
    const sorted = [...data];
    sorted.sort((a, b) => {
      const av = getFieldValue(a, activeCol);
      const bv = getFieldValue(b, activeCol);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDesc ? bv - av : av - bv;
    });
    return sorted;
  }, [data, activeCol, sortDesc]);

  const quintileArrays = useMemo(() => {
    const arrays = {};
    SORTABLE_COLUMNS.forEach(col => {
      arrays[col.key] = sortedData.map(f => getFieldValue(f, col)).filter(v => v != null);
    });
    return arrays;
  }, [sortedData]);

  const totalPages = Math.ceil(sortedData.length / PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedData.slice(start, start + PER_PAGE);
  }, [sortedData, page]);

  const handleSort = useCallback((key) => {
    const col = SORTABLE_COLUMNS.find(c => c.key === key);
    if (!col) return;
    if (sortKey === key) {
      setSortDesc(d => !d);
    } else {
      setSortKey(key);
      setSortDesc(col.higherIsBetter);
    }
    setPage(1);
  }, [sortKey]);

  const handleReset = useCallback(() => {
    setCategory('');
    setType('');
    setAsofDate('');
    setSortKey('return1yr');
    setSortDesc(true);
    setPage(1);
  }, []);

  const handleFundClick = useCallback((fundId) => {
    const params = asofDate ? `?asof=${asofDate}` : '';
    navigate(`/funds/${fundId}${params}`);
  }, [navigate, asofDate]);

  const sortLabel = RANK_BY_OPTIONS.find(o => o.value === sortKey)?.label
  || SORTABLE_COLUMNS.find(c => c.key === sortKey)?.label
  || '1-Year Return';

  /* ── Pagination helpers ── */

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  /* ── Render ── */

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: '28px' }}>
        <Box
          component="h1"
          sx={{
            fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 600,
            color: 'var(--text-1)', letterSpacing: '-0.03em', mb: '4px',
          }}
        >
          Fund Screener
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
          Rank and compare funds by performance, fees, and ratings within any category
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '12px', mb: '24px', flexWrap: 'wrap' }}>
        <ControlGroup label="Category">
          <StyledSelect
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
          </StyledSelect>
        </ControlGroup>

        <ControlGroup label="As-of Date">
          {datesLoading ? (
            <CircularProgress size={16} sx={{ color: 'var(--text-4)', m: '10px' }} />
          ) : (
            <StyledSelect
              value={asofDate || (availableDates?.[0] || '')}
              onChange={(e) => { setAsofDate(e.target.value); setPage(1); }}
              mono
            >
              {(availableDates || []).map(d => (
                <option key={d} value={d}>{formatDateLabel(d)}</option>
              ))}
            </StyledSelect>
          )}
        </ControlGroup>

        <ControlGroup label="Fund Type">
          <StyledSelect value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="ETF">ETF</option>
            <option value="Mutual Fund">Mutual Fund</option>
          </StyledSelect>
        </ControlGroup>

        <ControlGroup label="Rank By">
          <StyledSelect
            value={sortKey}
            onChange={(e) => {
              const key = e.target.value;
              const col = SORTABLE_COLUMNS.find(c => c.key === key);
              setSortKey(key);
              setSortDesc(col?.higherIsBetter ?? true);
              setPage(1);
            }}
          >
            {RANK_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </StyledSelect>
        </ControlGroup>

        <Box sx={{ ml: 'auto', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <ControlButton onClick={handleReset}>Reset</ControlButton>
        </Box>
      </Box>

      {/* Error */}
      {isError && (
        <Box
          sx={{
            background: 'var(--red-soft)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius)', padding: '16px 20px', mb: '20px',
            color: 'var(--red)', fontSize: '13px',
          }}
        >
          {error?.message || 'Failed to load screener data. Please try again.'}
        </Box>
      )}

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: 'var(--emerald)' }} />
        </Box>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Result summary */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px',
            }}
          >
            <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
              <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{totalFunds}</strong>
              {' funds in '}
              <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{category || 'All Categories'}</strong>
            </Box>
            <Box
              sx={{
                fontSize: '12px', color: 'var(--text-3)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              Sorted by{' '}
              <span style={{ color: 'var(--emerald)', fontWeight: 500 }}>{sortLabel}</span>
              {' '}{sortDesc ? '\u25BC' : '\u25B2'}
            </Box>
          </Box>

          {/* Table */}
          <Box
            sx={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative',
            }}
          >
            {isFetching && (
              <>
                <Box
                  sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    zIndex: 30, overflow: 'hidden',
                    '&::after': {
                      content: '""', position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent 0%, var(--emerald) 50%, transparent 100%)',
                      animation: 'shimmer 1.2s ease-in-out infinite',
                    },
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute', inset: 0, zIndex: 25,
                    background: 'rgba(4, 6, 12, 0.5)',
                    backdropFilter: 'blur(1px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 200ms ease',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '12px 24px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <CircularProgress size={18} sx={{ color: 'var(--emerald)' }} />
                    <Box sx={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>
                      Loading funds…
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  <TH sx={{ width: '50px' }}>#</TH>
                  <TH>Signal</TH>
                  <TH>Fund Name</TH>
                  {SORTABLE_COLUMNS.map(col => (
                    <TH
                      key={col.key}
                      numeric
                      sorted={sortKey === col.key}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span style={{ marginLeft: '3px', fontSize: '10px' }}>
                          {sortDesc ? '\u25BC' : '\u25B2'}
                        </span>
                      )}
                    </TH>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {paginatedData.length === 0 ? (
                  <Box component="tr">
                    <Box
                      component="td"
                      colSpan={11}
                      sx={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-3)', fontSize: '13px' }}
                    >
                      No funds found for this category
                    </Box>
                  </Box>
                ) : (
                  paginatedData.map((fund, idx) => {
                    const globalRank = (page - 1) * PER_PAGE + idx + 1;
                    const rankPct = sortedData.length > 1
                      ? (globalRank - 1) / (sortedData.length - 1)
                      : 0;
                    const signal = getSignal(rankPct);
                    const tier = getRankTier(globalRank, sortedData.length);

                    return (
                      <Box
                        component="tr"
                        key={fund._id}
                        onClick={() => handleFundClick(fund._id)}
                        sx={{
                          borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
                          transition: 'background var(--transition)',
                          cursor: 'pointer',
                          animation: 'rowFadeIn 400ms ease both',
                          animationDelay: `${Math.min(idx * 25, 300)}ms`,
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { background: 'var(--bg-surface-hover)' },
                          '&:hover .screener-fund-name': { color: 'var(--blue)' },
                        }}
                      >
                        {/* Rank */}
                        <TD>
                          <RankBadge rank={globalRank} tier={tier} />
                        </TD>

                        {/* Signal */}
                        <TD>
                          <SignalBadge signal={signal} size="small" />
                        </TD>

                        {/* Fund Name */}
                        <TD
                          className="screener-fund-name"
                          sx={{
                            color: 'var(--text-1)', fontWeight: 500,
                            maxWidth: '280px', overflow: 'hidden',
                            textOverflow: 'ellipsis', transition: 'color var(--transition)',
                          }}
                        >
                          {fund.fundname || fund._name || 'N/A'}
                        </TD>

                        {/* 1Y Return */}
                        <HeatCell
                          value={getFieldValue(fund, SORTABLE_COLUMNS[0])}
                          allValues={quintileArrays.return1yr}
                          format={formatReturn}
                          higherIsBetter
                        />

                        {/* 3Y Ann. */}
                        <HeatCell
                          value={getFieldValue(fund, SORTABLE_COLUMNS[1])}
                          allValues={quintileArrays.return3yr}
                          format={formatReturn}
                          higherIsBetter
                        />

                        {/* 5Y Ann. */}
                        <HeatCell
                          value={getFieldValue(fund, SORTABLE_COLUMNS[2])}
                          allValues={quintileArrays.return5yr}
                          format={formatReturn}
                          higherIsBetter
                        />

                        {/* 10Y Ann. */}
                        <HeatCell
                          value={getFieldValue(fund, SORTABLE_COLUMNS[3])}
                          allValues={quintileArrays.return10yr}
                          format={formatReturn}
                          higherIsBetter
                        />

                        {/* MER */}
                        <MerCell mer={fund.fees?.mer} />

                        {/* Sharpe */}
                        <HeatCell
                          value={getFieldValue(fund, SORTABLE_COLUMNS[5])}
                          allValues={quintileArrays.sharpe}
                          format={formatNum}
                          higherIsBetter
                        />

                        {/* Rating */}
                        <TD>
                          <StarRating rating={fund.ratings?.ratingoverall} />
                        </TD>

                        {/* AUM */}
                        <TD numeric>{formatAum(fund.assets?.fundnetassets)}</TD>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            {/* Pagination */}
            {sortedData.length > 0 && (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderTop: '1px solid var(--border)',
                  background: 'var(--bg-base)',
                }}
              >
                <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  Showing{' '}
                  <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                    {(page - 1) * PER_PAGE + 1}&ndash;{Math.min(page * PER_PAGE, sortedData.length)}
                  </strong>{' '}
                  of{' '}
                  <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                    {sortedData.length}
                  </strong>{' '}
                  funds
                </Box>
                <Box sx={{ display: 'flex', gap: '4px' }}>
                  <PageBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    &#8249;
                  </PageBtn>
                  {pageNumbers.map((p, i) =>
                    p === '...' ? (
                      <PageBtn key={`dot-${i}`} disabled style={{ cursor: 'default', color: 'var(--text-4)' }}>
                        ...
                      </PageBtn>
                    ) : (
                      <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>
                        {p}
                      </PageBtn>
                    ),
                  )}
                  <PageBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                    &#8250;
                  </PageBtn>
                </Box>
              </Box>
            )}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex', gap: '20px', mt: '16px',
              fontSize: '11px', color: 'var(--text-4)', flexWrap: 'wrap',
            }}
          >
            <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>Heatmap:</span>
            <LegendItem color="var(--emerald)" opacity={0.6} label="Top Quintile" />
            <LegendItem color="#34D399" opacity={0.4} label="Above Average" />
            <LegendItem color="var(--text-3)" opacity={0.3} label="Average" />
            <LegendItem color="var(--amber)" opacity={0.4} label="Below Average" />
            <LegendItem color="var(--red)" opacity={0.4} label="Bottom Quintile" />
          </Box>
        </>
      )}
    </Box>
  );
};

/* ── Sub-components ── */

const HEAT_STYLES = {
  5: { bg: 'var(--emerald)', bgOpacity: 0.14, color: 'var(--emerald)' },
  4: { bg: 'var(--emerald)', bgOpacity: 0.08, color: '#34D399' },
  3: { bg: 'transparent', bgOpacity: 0, color: 'var(--text-2)' },
  2: { bg: 'var(--amber)', bgOpacity: 0.06, color: 'var(--amber)' },
  1: { bg: 'var(--red)', bgOpacity: 0.08, color: 'var(--red)' },
};

const MER_COLORS = {
  low: 'var(--emerald)',
  mid: 'var(--text-3)',
  high: 'var(--amber)',
  extreme: 'var(--red)',
};

const RANK_COLORS = {
  top: { color: 'var(--emerald)', bg: 'var(--emerald-soft)' },
  mid: { color: 'var(--text-2)', bg: 'rgba(148, 163, 176, 0.08)' },
  low: { color: 'var(--amber)', bg: 'var(--amber-soft)' },
  bottom: { color: 'var(--red)', bg: 'var(--red-soft)' },
};

const thBase = {
  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
  color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
  padding: '14px 14px', textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-base)', zIndex: 10,
  userSelect: 'none', whiteSpace: 'nowrap',
  transition: 'color var(--transition)',
};

const TH = ({ children, numeric, sorted, onClick, sx: sxOverride }) => (
  <Box
    component="th"
    onClick={onClick}
    sx={{
      ...thBase,
      ...(numeric ? { textAlign: 'right' } : {}),
      ...(sorted ? { color: 'var(--emerald)' } : {}),
      ...(onClick ? { cursor: 'pointer', '&:hover': { color: 'var(--text-2)' } } : {}),
      ...sxOverride,
    }}
  >
    {children}
  </Box>
);

const TD = ({ children, numeric, className, sx: sxOverride }) => (
  <Box
    component="td"
    className={className}
    sx={{
      fontSize: '13px', padding: '12px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap',
      ...(numeric ? { fontFamily: 'var(--font-mono)', fontSize: '13px', textAlign: 'right' } : {}),
      ...sxOverride,
    }}
  >
    {children}
  </Box>
);

const HeatCell = ({ value, allValues, format, higherIsBetter }) => {
  const q = getQuintile(value, allValues, higherIsBetter);
  const style = HEAT_STYLES[q];

  return (
    <Box
      component="td"
      sx={{
        fontSize: '13px', padding: '12px 14px', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)', textAlign: 'right', position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute', inset: '4px 8px', borderRadius: '4px',
          background: style.bg, opacity: style.bgOpacity, zIndex: 0,
        }}
      />
      <Box component="span" sx={{ position: 'relative', zIndex: 1, color: style.color }}>
        {format(value)}
      </Box>
    </Box>
  );
};

const MerCell = ({ mer }) => {
  const tier = getMerTier(mer);
  const barWidth = mer != null ? Math.min((Number(mer) / 3) * 100, 100) : 0;
  const barColor = tier ? MER_COLORS[tier] : 'var(--text-3)';
  const isLow = tier === 'low';
  const isExtreme = tier === 'extreme';

  return (
    <Box
      component="td"
      sx={{
        fontSize: '13px', padding: '12px 14px', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)', textAlign: 'right',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <span style={{
          color: isLow ? 'var(--emerald)' : isExtreme ? 'var(--red)' : undefined,
        }}>
          {formatPct(mer)}
        </span>
        <Box
          sx={{
            width: '40px', height: '4px',
            background: 'rgba(30, 41, 59, 0.8)', borderRadius: '2px', overflow: 'hidden',
          }}
        >
          <Box sx={{ height: '100%', width: `${barWidth}%`, borderRadius: '2px', background: barColor }} />
        </Box>
      </Box>
    </Box>
  );
};

const RankBadge = ({ rank, tier }) => {
  const colors = RANK_COLORS[tier] || RANK_COLORS.mid;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '50%',
        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500,
        color: colors.color, background: colors.bg,
      }}
    >
      {rank}
    </Box>
  );
};

const LegendItem = ({ color, opacity, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <Box sx={{ width: '10px', height: '10px', borderRadius: '3px', background: color, opacity }} />
    {label}
  </Box>
);

const ControlGroup = ({ label, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <Box
      component="span"
      sx={{
        fontSize: '10px', fontWeight: 600, color: 'var(--text-4)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}
    >
      {label}
    </Box>
    {children}
  </Box>
);

const selectSvg = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`;

const StyledSelect = ({ children, mono, ...props }) => (
  <Box
    component="select"
    {...props}
    sx={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      color: 'var(--text-1)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: '13px',
      padding: '8px 32px 8px 12px',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
      backgroundImage: selectSvg,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      transition: 'border-color var(--transition)',
      '&:focus': { borderColor: 'var(--emerald)' },
      '&:hover': { borderColor: 'var(--border-hover)' },
    }}
  >
    {children}
  </Box>
);

const ControlButton = ({ children, primary, ...props }) => (
  <Box
    component="button"
    {...props}
    sx={{
      background: primary ? 'var(--emerald-soft)' : 'var(--bg-surface)',
      border: primary ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      color: primary ? 'var(--emerald)' : 'var(--text-2)',
      fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
      padding: '8px 16px', cursor: 'pointer',
      transition: 'all var(--transition)',
      '&:hover': {
        borderColor: primary ? undefined : 'var(--border-hover)',
        background: primary ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-surface-hover)',
        color: primary ? 'var(--emerald)' : 'var(--text-1)',
      },
    }}
  >
    {children}
  </Box>
);

const PageBtn = ({ children, active, disabled, onClick, style }) => (
  <Box
    component="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    sx={{
      width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--radius)',
      border: active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
      background: active ? 'var(--emerald-soft)' : 'transparent',
      color: active ? 'var(--emerald)' : 'var(--text-3)',
      fontFamily: 'var(--font-mono)', fontSize: '12px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled && !style ? 0.3 : 1,
      transition: 'all var(--transition)',
      '&:hover:not(:disabled)': {
        background: active ? 'var(--emerald-soft)' : 'var(--bg-surface-hover)',
        color: active ? 'var(--emerald)' : 'var(--text-1)',
      },
      ...style,
    }}
  >
    {children}
  </Box>
);

export default Screener;
