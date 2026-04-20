import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';
import useScreener from '../hooks/useScreener';
import useCategories from '../hooks/useCategories';
import useAvailableDates from '../hooks/useAvailableDates';
import SignalBadge from './SignalBadge';
import StarRating from './StarRating';
import UpgradePrompt from './UpgradePrompt';
import {
  METRIC_COLUMNS,
  METRIC_COLUMN_ORDER,
  METRIC_BY_KEY,
  DEFAULT_METRIC_KEYS,
  normalizeStoredMetricKeys,
} from '../config/screenerMetrics';

const getByPath = (obj, path) => {
  if (!obj || !path) return null;
  return path.split('.').reduce((curr, seg) => (curr == null ? null : curr[seg]), obj);
};

const SCREENER_METRICS_STORAGE_KEY = 'ms_screener_metric_keys';

const loadStoredMetricKeys = () => {
  try {
    const raw = localStorage.getItem(SCREENER_METRICS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_METRIC_KEYS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_METRIC_KEYS];
    const valid = normalizeStoredMetricKeys(parsed);
    const ordered = METRIC_COLUMN_ORDER.filter((k) => valid.includes(k));
    return ordered.length ? ordered : [...DEFAULT_METRIC_KEYS];
  } catch {
    return [...DEFAULT_METRIC_KEYS];
  }
};

const PER_PAGE = 25;

/* ── Utility functions ── */
const getFieldValue = (fund, col) => {
  const raw = col.valuePath
    ? getByPath(fund, col.valuePath)
    : col.apiField
      ? getByPath(fund, `metrics.${col.apiField}`)
      : null;
  return raw != null ? Number(raw) : null;
};

const getQuintile = (value, allValues, higherIsBetter = true) => {
  const valid = allValues.filter((v) => v != null && !isNaN(v));
  if (value == null || valid.length < 5) return 3;
  const sorted = [...valid].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
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
/** Peer percentile 0–100 from rankings domain; lower = better within category. */
const formatRankPct = (val) => (val == null ? '—' : Number(val).toFixed(1));

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const { data: availableDates, isLoading: datesLoading } = useAvailableDates();

  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const asofDate = searchParams.get('asofDate') || '';
  const [sortKey, setSortKey] = useState('return1yr');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedMetricKeys, setSelectedMetricKeys] = useState(loadStoredMetricKeys);
  const [columnsAnchor, setColumnsAnchor] = useState(null);
  const [metricSearch, setMetricSearch] = useState('');

  const updateFilters = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const activeColumns = useMemo(
    () =>
      METRIC_COLUMN_ORDER.map((k) => METRIC_BY_KEY[k]).filter((col) =>
        selectedMetricKeys.includes(col.key),
      ),
    [selectedMetricKeys],
  );

  const catalogSortable = useMemo(() => METRIC_COLUMNS.filter((col) => col.apiField), []);

  const sortableActiveColumns = useMemo(
    () => activeColumns.filter((col) => col.apiField),
    [activeColumns],
  );

  const sortKeyToApi = useMemo(
    () => Object.fromEntries(catalogSortable.map((col) => [col.key, col.apiField])),
    [catalogSortable],
  );

  const rankByOptions = useMemo(
    () => catalogSortable.map((col) => ({ value: col.key, label: col.rankLabel || col.label })),
    [catalogSortable],
  );

  const metricsByGroup = useMemo(() => {
    const q = metricSearch.trim().toLowerCase();
    const filtered = METRIC_COLUMNS.filter((col) => {
      if (!q) return true;
      return (
        col.label.toLowerCase().includes(q) ||
        col.group.toLowerCase().includes(q) ||
        col.key.toLowerCase().includes(q)
      );
    });
    const groups = {};
    filtered.forEach((col) => {
      if (!groups[col.group]) groups[col.group] = [];
      groups[col.group].push(col);
    });
    return groups;
  }, [metricSearch]);

  const persistMetricKeys = useCallback((keys) => {
    setSelectedMetricKeys(keys);
    try {
      localStorage.setItem(SCREENER_METRICS_STORAGE_KEY, JSON.stringify(keys));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const toggleMetricKey = useCallback((key) => {
    setSelectedMetricKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      if (next.length === 0) return prev;
      const ordered = METRIC_COLUMN_ORDER.filter((k) => next.includes(k));
      try {
        localStorage.setItem(SCREENER_METRICS_STORAGE_KEY, JSON.stringify(ordered));
      } catch {
        /* ignore */
      }
      return ordered;
    });
  }, []);

  const selectAllVisibleMetrics = useCallback(() => {
    const keys = METRIC_COLUMNS.filter((col) => {
      const q = metricSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        col.label.toLowerCase().includes(q) ||
        col.group.toLowerCase().includes(q) ||
        col.key.toLowerCase().includes(q)
      );
    }).map((col) => col.key);
    const merged = [...new Set([...selectedMetricKeys, ...keys])];
    const ordered = METRIC_COLUMN_ORDER.filter((k) => merged.includes(k));
    persistMetricKeys(ordered);
  }, [metricSearch, selectedMetricKeys, persistMetricKeys]);

  const resetMetricKeysToDefault = useCallback(() => {
    persistMetricKeys([...DEFAULT_METRIC_KEYS]);
  }, [persistMetricKeys]);

  useEffect(() => {
    if (sortKeyToApi[sortKey]) return;
    const fallback = catalogSortable[0]?.key || 'return1yr';
    setSortKey(fallback);
    setSortDesc(METRIC_BY_KEY[fallback]?.higherIsBetter ?? true);
  }, [sortKey, sortKeyToApi, catalogSortable]);

  useEffect(() => {
    setPage(1);
  }, [category, type, asofDate]);

  const {
    data,
    totalFunds,
    totalPages,
    limited,
    planLimit,
    isLoading,
    isFetching,
    isError,
    error,
  } = useScreener({
    category,
    type,
    asofDate,
    sortBy: sortKeyToApi[sortKey] || 'return1yr',
    sortDir: sortDesc ? 'desc' : 'asc',
    page,
    limit: PER_PAGE,
  });

  const quintileArrays = useMemo(() => {
    const arrays = {};
    activeColumns.forEach((col) => {
      arrays[col.key] = data.map((f) => getFieldValue(f, col)).filter((v) => v != null);
    });
    return arrays;
  }, [data, activeColumns]);

  const handleSort = useCallback(
    (key) => {
      const col = sortableActiveColumns.find((c) => c.key === key);
      if (!col) return;
      if (sortKey === key) {
        setSortDesc((d) => !d);
      } else {
        setSortKey(key);
        setSortDesc(col.higherIsBetter);
      }
      setPage(1);
    },
    [sortKey, sortableActiveColumns],
  );

  const handleReset = useCallback(() => {
    updateFilters({
      category: '',
      type: '',
      asofDate: '',
    });
    setSortKey('return1yr');
    setSortDesc(true);
    setPage(1);
  }, [updateFilters]);

  const handleFundClick = useCallback(
    (fundId) => {
      const params = asofDate ? `?asof=${asofDate}` : '';
      navigate(`/funds/${fundId}${params}`);
    },
    [navigate, asofDate],
  );

  const sortLabel =
    rankByOptions.find((o) => o.value === sortKey)?.label ||
    METRIC_BY_KEY[sortKey]?.rankLabel ||
    METRIC_BY_KEY[sortKey]?.label ||
    '1-Year Return';

  const columnsPickerOpen = Boolean(columnsAnchor);

  /* ── Pagination helpers ── */

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
        pages.push(i);
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
            fontFamily: 'var(--font-head)',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-1)',
            letterSpacing: '-0.03em',
            mb: '4px',
          }}
        >
          Fund Screener
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
          Rank and compare funds by performance, fees, and ratings within any category
        </Box>
      </Box>

      {/* Controls */}
      <Box
        sx={{ display: 'flex', alignItems: 'flex-end', gap: '12px', mb: '24px', flexWrap: 'wrap' }}
      >
        <ControlGroup label="Category">
          <StyledSelect
            value={category}
            onChange={(e) => {
              updateFilters({ category: e.target.value });
            }}
          >
            <option value="">All Categories</option>
            {(categories || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </StyledSelect>
        </ControlGroup>

        <ControlGroup label="As-of Date">
          {datesLoading ? (
            <CircularProgress size={16} sx={{ color: 'var(--text-4)', m: '10px' }} />
          ) : (
            <StyledSelect
              value={asofDate || availableDates?.[0] || ''}
              onChange={(e) => {
                updateFilters({ asofDate: e.target.value });
              }}
              mono
            >
              {(availableDates || []).map((d) => (
                <option key={d} value={d}>
                  {formatDateLabel(d)}
                </option>
              ))}
            </StyledSelect>
          )}
        </ControlGroup>

        <ControlGroup label="Fund Type">
          <StyledSelect
            value={type}
            onChange={(e) => {
              updateFilters({ type: e.target.value });
            }}
          >
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
              const col = METRIC_BY_KEY[key];
              setSortKey(key);
              setSortDesc(col?.higherIsBetter ?? true);
              setPage(1);
            }}
          >
            {rankByOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </StyledSelect>
        </ControlGroup>

        <ControlGroup label="Table">
          <ControlButton
            type="button"
            aria-expanded={columnsPickerOpen}
            aria-haspopup="dialog"
            onClick={(e) => setColumnsAnchor(columnsAnchor ? null : e.currentTarget)}
          >
            Columns ({selectedMetricKeys.length})
          </ControlButton>
          <Popover
            open={columnsPickerOpen}
            anchorEl={columnsAnchor}
            onClose={() => {
              setColumnsAnchor(null);
              setMetricSearch('');
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                width: { xs: 'min(100vw - 24px, 380px)', sm: 380 },
                maxHeight: 'min(70vh, 520px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-strong)',
                overflow: 'hidden',
              },
            }}
          >
            <Box sx={{ p: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <Box
                component="div"
                sx={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  letterSpacing: '-0.02em',
                  mb: '10px',
                }}
              >
                Screener columns
              </Box>
              <Box
                component="input"
                type="search"
                placeholder="Search metrics…"
                value={metricSearch}
                onChange={(e) => setMetricSearch(e.target.value)}
                sx={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  padding: '8px 12px',
                  outline: 'none',
                  '&::placeholder': { color: 'var(--text-4)' },
                  '&:focus': { borderColor: 'var(--emerald)' },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  mt: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
                  {selectedMetricKeys.length} of {METRIC_COLUMNS.length} shown
                </Box>
                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={selectAllVisibleMetrics}
                    sx={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--emerald)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    Add all matching
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={resetMetricKeysToDefault}
                    sx={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-3)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    Reset to default
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ overflowY: 'auto', flex: 1, px: '8px', py: '8px' }}>
              {Object.keys(metricsByGroup).length === 0 ? (
                <Box
                  sx={{
                    px: '8px',
                    py: '20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--text-4)',
                  }}
                >
                  No metrics match your search
                </Box>
              ) : (
                Object.entries(metricsByGroup).map(([groupName, cols]) => (
                  <Box key={groupName} sx={{ mb: '12px' }}>
                    <Box
                      sx={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: 'var(--text-4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        px: '8px',
                        py: '6px',
                        position: 'sticky',
                        top: 0,
                        background: 'var(--bg-elevated)',
                        zIndex: 1,
                      }}
                    >
                      {groupName}
                    </Box>
                    {cols.map((col) => {
                      const checked = selectedMetricKeys.includes(col.key);
                      return (
                        <MetricPickerRow
                          key={col.key}
                          col={col}
                          checked={checked}
                          onToggle={() => toggleMetricKey(col.key)}
                        />
                      );
                    })}
                  </Box>
                ))
              )}
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                px: '16px',
                py: '12px',
                borderTop: '1px solid var(--border)',
                fontSize: '11px',
                color: 'var(--text-4)',
                lineHeight: 1.45,
              }}
            >
              Metrics without server support show “—” until the API exposes the field. Rank by lists
              every sort the server supports. Category rank % is a 0–100 peer percentile (lower is
              better).
            </Box>
          </Popover>
        </ControlGroup>

        <Box sx={{ ml: 'auto', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <ControlButton onClick={handleReset}>Reset</ControlButton>
        </Box>
      </Box>

      {/* Error */}
      {isError && (
        <Box
          sx={{
            background: 'var(--red-soft)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            mb: '20px',
            color: 'var(--red)',
            fontSize: '13px',
          }}
        >
          {error?.message || 'Failed to load screener data. Please try again.'}
        </Box>
      )}

      {/* Loading */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress sx={{ color: 'var(--emerald)' }} />
        </Box>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Result summary */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '16px',
            }}
          >
            <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
              <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{totalFunds}</strong>
              {' funds in '}
              <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                {category || 'All Categories'}
              </strong>
            </Box>
            <Box
              sx={{
                fontSize: '12px',
                color: 'var(--text-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Sorted by{' '}
              <span style={{ color: 'var(--emerald)', fontWeight: 500 }}>{sortLabel}</span>{' '}
              {sortDesc ? '\u25BC' : '\u25B2'}
            </Box>
          </Box>

          {/* Table */}
          <Box
            sx={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {isFetching && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    zIndex: 30,
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, transparent 0%, var(--emerald) 50%, transparent 100%)',
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
                    position: 'absolute',
                    inset: 0,
                    zIndex: 25,
                    background: 'var(--overlay-soft)',
                    backdropFilter: 'blur(1px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 200ms ease',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '12px 24px',
                      boxShadow: 'var(--shadow-soft)',
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

            <Box sx={{ overflowX: 'auto' }}>
              <Box
                component="table"
                sx={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}
              >
                <Box component="thead">
                  <Box component="tr">
                    <TH sx={{ width: '50px' }}>#</TH>
                    <TH>Signal</TH>
                    <TH>Fund Name</TH>
                    {activeColumns.map((col) => (
                      <TH
                        key={col.key}
                        numeric
                        sorted={sortKey === col.key}
                        onClick={col.apiField ? () => handleSort(col.key) : undefined}
                      >
                        {col.label}
                        {col.apiField && sortKey === col.key && (
                          <span style={{ marginLeft: '3px', fontSize: '10px' }}>
                            {sortDesc ? '\u25BC' : '\u25B2'}
                          </span>
                        )}
                      </TH>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {data.length === 0 ? (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan={activeColumns.length + 3}
                        sx={{
                          textAlign: 'center',
                          padding: '48px 16px',
                          color: 'var(--text-3)',
                          fontSize: '13px',
                        }}
                      >
                        No funds found for this category
                      </Box>
                    </Box>
                  ) : (
                    data.map((fund, idx) => {
                      const globalRank = (page - 1) * PER_PAGE + idx + 1;
                      const rankPct = totalFunds > 1 ? (globalRank - 1) / (totalFunds - 1) : 0;
                      const signal = getSignal(rankPct);
                      const tier = getRankTier(globalRank, totalFunds);

                      return (
                        <Box
                          component="tr"
                          key={fund._id}
                          onClick={() => handleFundClick(fund._id)}
                          sx={{
                            borderBottom: '1px solid var(--row-border)',
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
                              color: 'var(--text-1)',
                              fontWeight: 500,
                              maxWidth: '280px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              transition: 'color var(--transition)',
                            }}
                          >
                            {fund.fundname || fund._name || 'N/A'}
                          </TD>

                          {activeColumns.map((col) => {
                            const value = getFieldValue(fund, col);
                            if (col.type === 'heat') {
                              const formatter =
                                col.format === 'return'
                                  ? formatReturn
                                  : col.format === 'pct'
                                    ? formatPct
                                    : col.format === 'rankpct'
                                      ? formatRankPct
                                      : formatNum;
                              return (
                                <HeatCell
                                  key={col.key}
                                  value={value}
                                  allValues={quintileArrays[col.key] || []}
                                  format={formatter}
                                  higherIsBetter={col.higherIsBetter}
                                />
                              );
                            }
                            if (col.type === 'mer') {
                              return <MerCell key={col.key} mer={value} />;
                            }
                            if (col.type === 'stars') {
                              return (
                                <TD key={col.key}>
                                  <StarRating rating={value} />
                                </TD>
                              );
                            }
                            if (col.type === 'numeric') {
                              return (
                                <TD key={col.key} numeric>
                                  {col.format === 'aum' ? formatAum(value) : formatNum(value)}
                                </TD>
                              );
                            }
                            return (
                              <TD key={col.key} numeric>
                                {formatNum(value)}
                              </TD>
                            );
                          })}
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>
            {/* Pagination */}
            {totalFunds > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-base)',
                }}
              >
                <Box sx={{ fontSize: '12px', color: 'var(--text-3)' }}>
                  Showing{' '}
                  <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
                    {(page - 1) * PER_PAGE + 1}&ndash;{Math.min(page * PER_PAGE, totalFunds)}
                  </strong>{' '}
                  of{' '}
                  <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>{totalFunds}</strong>{' '}
                  funds
                </Box>
                <Box sx={{ display: 'flex', gap: '4px' }}>
                  <PageBtn
                    aria-label="Previous page"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    &#8249;
                  </PageBtn>
                  {pageNumbers.map((p, i) =>
                    p === '...' ? (
                      <PageBtn
                        key={`dot-${i}`}
                        disabled
                        style={{ cursor: 'default', color: 'var(--text-4)' }}
                      >
                        ...
                      </PageBtn>
                    ) : (
                      <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>
                        {p}
                      </PageBtn>
                    ),
                  )}
                  <PageBtn
                    aria-label="Next page"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                  >
                    &#8250;
                  </PageBtn>
                </Box>
              </Box>
            )}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              gap: '20px',
              mt: '16px',
              fontSize: '11px',
              color: 'var(--text-4)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>Heatmap:</span>
            <LegendItem color="var(--emerald)" opacity={0.6} label="Top Quintile" />
            <LegendItem color="#34D399" opacity={0.4} label="Above Average" />
            <LegendItem color="var(--text-3)" opacity={0.3} label="Average" />
            <LegendItem color="var(--amber)" opacity={0.4} label="Below Average" />
            <LegendItem color="var(--red)" opacity={0.4} label="Bottom Quintile" />
          </Box>

          {limited && (
            <Box sx={{ mt: '20px' }}>
              <UpgradePrompt feature="screener results" limit={planLimit} compact />
            </Box>
          )}
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

const MetricPickerRow = ({ col, checked, onToggle }) => (
  <Box
    component="label"
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      px: '8px',
      py: '8px',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      transition: 'background var(--transition)',
      '&:hover': { background: 'var(--bg-surface-hover)' },
    }}
  >
    <Box
      component="input"
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      sx={{
        mt: '2px',
        accentColor: 'var(--emerald)',
        width: '16px',
        height: '16px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.35 }}>
        {col.label}
      </Box>
      {!col.apiField && (
        <Box sx={{ fontSize: '10px', color: 'var(--text-4)', mt: '3px', lineHeight: 1.35 }}>
          Awaiting API / sort support
        </Box>
      )}
    </Box>
  </Box>
);

const thBase = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '14px 14px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-base)',
  zIndex: 10,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  transition: 'color var(--transition)',
};

const TH = ({ children, numeric, sorted, onClick, sx: sxOverride }) => (
  <Box
    component="th"
    role={onClick ? 'columnheader' : undefined}
    aria-sort={sorted ? 'descending' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
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
      fontSize: '13px',
      padding: '12px 14px',
      color: 'var(--text-2)',
      whiteSpace: 'nowrap',
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
        fontSize: '13px',
        padding: '12px 14px',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)',
        textAlign: 'right',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '4px 8px',
          borderRadius: '4px',
          background: style.bg,
          opacity: style.bgOpacity,
          zIndex: 0,
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
        fontSize: '13px',
        padding: '12px 14px',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)',
        textAlign: 'right',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <span
          style={{
            color: isLow ? 'var(--emerald)' : isExtreme ? 'var(--red)' : undefined,
          }}
        >
          {formatPct(mer)}
        </span>
        <Box
          sx={{
            width: '40px',
            height: '4px',
            background: 'var(--bar-track)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${barWidth}%`,
              borderRadius: '2px',
              background: barColor,
            }}
          />
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
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: 500,
        color: colors.color,
        background: colors.bg,
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
        fontSize: '10px',
        fontWeight: 600,
        color: 'var(--text-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
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
      '&:focus': { borderColor: 'var(--accent)' },
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
      background: primary ? 'var(--accent-soft)' : 'var(--bg-surface)',
      border: primary ? '1px solid var(--accent-ring)' : '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      color: primary ? 'var(--accent-strong)' : 'var(--text-2)',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      fontWeight: 500,
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all var(--transition)',
      '&:hover': {
        borderColor: primary ? undefined : 'var(--border-hover)',
        background: primary ? 'var(--accent-soft)' : 'var(--bg-surface-hover)',
        color: primary ? 'var(--accent-strong)' : 'var(--text-1)',
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
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)',
      border: active ? '1px solid var(--accent-ring)' : '1px solid transparent',
      background: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--accent-strong)' : 'var(--text-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled && !style ? 0.3 : 1,
      transition: 'all var(--transition)',
      '&:hover:not(:disabled)': {
        background: active ? 'var(--accent-soft)' : 'var(--bg-surface-hover)',
        color: active ? 'var(--accent-strong)' : 'var(--text-1)',
      },
      ...style,
    }}
  >
    {children}
  </Box>
);

export default Screener;
