import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { fundService } from '../services/api';
import SearchBar from './SearchBar';
import StarRating from './StarRating';
import AsOfDateSelector from './AsOfDateSelector';
import UpgradePrompt from './UpgradePrompt';
import { useAuth } from '../context/AuthContext';
import useCompareList from '../hooks/useCompareList';

const PRO_MAX_FUNDS = 4;
const FREE_MAX_FUNDS = 2;

const ALL_DOMAINS = [
  'basicInfo',
  'performance',
  'rankings',
  'fees',
  'ratings',
  'risk',
  'flows',
  'assets',
  'categoryPerformance',
];

const Compare = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const MAX_FUNDS = user?.plan === 'pro' ? PRO_MAX_FUNDS : FREE_MAX_FUNDS;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIds = useMemo(
    () => searchParams.get('ids')?.split(',').filter(Boolean) || [],
    [searchParams],
  );

  const {
    ids: fundIds,
    add: addCompareFund,
    remove: removeCompareFund,
  } = useCompareList(MAX_FUNDS, initialIds);
  const [asofDate, setAsofDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setSearchParams(fundIds.length ? { ids: fundIds.join(',') } : {}, { replace: true });
  }, [fundIds, setSearchParams]);

  const handleSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fundService.getAllFunds({ search: term, limit: 8 });
      setSearchResults(response.data?.data || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const addFund = useCallback(
    (fund) => {
      if (addCompareFund(fund._id)) {
        setSearchResults([]);
      }
    },
    [addCompareFund],
  );

  const removeFund = useCallback((id) => removeCompareFund(id), [removeCompareFund]);

  const { data: domainsData, isLoading } = useQuery({
    queryKey: ['compare-domains', fundIds, asofDate],
    queryFn: async () => {
      if (fundIds.length === 0) return null;
      const response = await fundService.fetchMultipleDomains(
        ALL_DOMAINS,
        fundIds,
        asofDate || undefined,
      );
      return response.data;
    },
    enabled: fundIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const funds = useMemo(() => {
    if (!domainsData?.data) return [];
    return fundIds.map((id) => {
      const merged = domainsData.data.find((f) => {
        const fundId = f.basicInfo?._id || f.performance?._id || f.ratings?._id;
        return fundId === id;
      });
      return merged || {};
    });
  }, [domainsData, fundIds]);

  const fmtReturn = (v) => {
    if (v == null) return '—';
    const n = Number(v);
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  };

  const fmtPct = (v) => (v == null ? '—' : `${Number(v).toFixed(2)}%`);
  const fmtPlain = (v) => (v == null ? '—' : Number(v).toFixed(2));

  const fmtMoney = (v) => {
    if (v == null) return '—';
    const n = Number(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  };

  const valColor = (v) => {
    if (v == null) return undefined;
    const n = Number(v);
    if (n > 0) return 'var(--emerald)';
    if (n < 0) return 'var(--red)';
    return undefined;
  };

  const bestInRow = (values, higherIsBetter = true) => {
    const nums = values.map((v) => (v != null ? Number(v) : null));
    const valid = nums.filter((n) => n != null && !isNaN(n));
    if (valid.length === 0) return -1;
    const best = higherIsBetter ? Math.max(...valid) : Math.min(...valid);
    return nums.indexOf(best);
  };

  const PERF_ROWS = [
    { label: 'YTD', key: 'returnytd' },
    { label: '1 Year', key: 'return1yr' },
    { label: '3 Year', key: 'return3yr' },
    { label: '5 Year', key: 'return5yr' },
    { label: '10 Year', key: 'return10yr' },
    { label: 'Since Inception', key: 'returnsinceinception' },
  ];

  const FEE_ROWS = [
    { label: 'MER', key: 'mer', lower: true },
    { label: 'Management Fee', key: 'actualmanagementfee', lower: true },
    { label: 'Net Expense Ratio', key: 'netexpenseratio', lower: true },
    { label: 'TER', key: 'tradingexpenseratio', lower: true },
  ];

  const RISK_ROWS = [
    { label: 'Std Dev (3Y)', key: 'stddev3yr', lower: true },
    { label: 'Sharpe (3Y)', key: 'sharperatio3yr' },
    { label: 'Beta (3Y)', key: 'beta3yr', lower: true },
    { label: 'Alpha (3Y)', key: 'alpha3yr' },
    { label: 'Max Drawdown (3Y)', key: 'maxdrawdown3yr' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: '32px' }}>
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
          Fund Comparison
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
          Compare up to {MAX_FUNDS} funds side by side
        </Box>
      </Box>

      {/* Search + Date */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '20px', alignItems: 'center' }}>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <SearchBar
            onSearch={handleSearch}
            placeholder={
              fundIds.length >= MAX_FUNDS ? 'Maximum funds reached' : 'Search to add a fund...'
            }
            disabled={fundIds.length >= MAX_FUNDS}
            instant
          />
          {searchResults.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                mt: '4px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-soft)',
                maxHeight: '280px',
                overflow: 'auto',
              }}
            >
              {searchResults.map((fund) => (
                <Box
                  key={fund._id}
                  onClick={() => addFund(fund)}
                  sx={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    borderBottom: '1px solid var(--row-border)',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { background: 'var(--bg-surface-hover)' },
                    opacity: fundIds.includes(fund._id) ? 0.4 : 1,
                  }}
                >
                  <Box sx={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 500 }}>
                    {fund.fundname || fund._name}
                  </Box>
                  <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
                    {fund.ticker || '—'} · {fund.categoryname || '—'}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <AsOfDateSelector value={asofDate} onChange={setAsofDate} />
      </Box>

      {user?.plan !== 'pro' && fundIds.length >= FREE_MAX_FUNDS && (
        <Box sx={{ mb: '20px' }}>
          <UpgradePrompt feature="fund comparisons" limit={FREE_MAX_FUNDS} compact />
        </Box>
      )}

      {/* Empty State */}
      {fundIds.length === 0 && (
        <Box
          sx={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <Box sx={{ fontSize: '48px', mb: '16px', opacity: 0.3 }}>&#9670; &#9670;</Box>
          <Box sx={{ fontSize: '15px', color: 'var(--text-2)', mb: '8px', fontWeight: 500 }}>
            No funds selected
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-4)' }}>
            Search above to add funds to your comparison
          </Box>
        </Box>
      )}

      {/* Loading */}
      {fundIds.length > 0 && isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '60px' }}>
          <CircularProgress sx={{ color: 'var(--emerald)' }} />
        </Box>
      )}

      {/* Comparison Table */}
      {fundIds.length > 0 && !isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Fund Headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `200px repeat(${funds.length}, 1fr)`,
              gap: '12px',
            }}
          >
            <Box />
            {funds.map((f, i) => {
              const info = f.basicInfo || {};
              return (
                <Box
                  key={fundIds[i]}
                  sx={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    position: 'relative',
                  }}
                >
                  <Box
                    onClick={() => removeFund(fundIds[i])}
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--text-4)',
                      transition: 'all var(--transition)',
                      '&:hover': { color: 'var(--red)', background: 'var(--red-soft)' },
                    }}
                  >
                    &times;
                  </Box>
                  <Box
                    onClick={() => navigate(`/funds/${fundIds[i]}`)}
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-1)',
                      mb: '6px',
                      cursor: 'pointer',
                      transition: 'color var(--transition)',
                      pr: '24px',
                      '&:hover': { color: 'var(--blue)' },
                    }}
                  >
                    {info.fundname || info._name || fundIds[i]}
                  </Box>
                  <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>
                    {info.ticker || '—'} · {info.categoryname || '—'}
                  </Box>
                  <Box sx={{ mt: '10px' }}>
                    <StarRating rating={f.ratings?.ratingoverall} />
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Performance */}
          <CompareSection title="Performance (Trailing Returns)">
            {PERF_ROWS.map((row) => {
              const values = funds.map((f) => f.performance?.[row.key]);
              const best = bestInRow(values, true);
              return (
                <CompareRow key={row.key} label={row.label} colCount={funds.length}>
                  {values.map((v, i) => (
                    <CompareCell
                      key={i}
                      value={fmtReturn(v)}
                      color={valColor(v)}
                      isBest={i === best}
                    />
                  ))}
                </CompareRow>
              );
            })}
          </CompareSection>

          {/* Fees */}
          <CompareSection title="Fees">
            {FEE_ROWS.map((row) => {
              const values = funds.map((f) => f.fees?.[row.key]);
              const best = bestInRow(values, !row.lower);
              return (
                <CompareRow key={row.key} label={row.label} colCount={funds.length}>
                  {values.map((v, i) => (
                    <CompareCell key={i} value={fmtPct(v)} isBest={i === best} />
                  ))}
                </CompareRow>
              );
            })}
          </CompareSection>

          {/* Risk */}
          <CompareSection title="Risk Metrics">
            {RISK_ROWS.map((row) => {
              const values = funds.map((f) => f.risk?.[row.key]);
              const best = bestInRow(values, !row.lower);
              return (
                <CompareRow key={row.key} label={row.label} colCount={funds.length}>
                  {values.map((v, i) => (
                    <CompareCell
                      key={i}
                      value={row.key.includes('drawdown') ? fmtPct(v) : fmtPlain(v)}
                      color={row.key === 'alpha3yr' ? valColor(v) : undefined}
                      isBest={i === best}
                    />
                  ))}
                </CompareRow>
              );
            })}
          </CompareSection>

          {/* Assets */}
          <CompareSection title="Assets & Flows">
            <CompareRow label="Net Assets" colCount={funds.length}>
              {funds.map((f, i) => {
                const values = funds.map((ff) => ff.assets?.fundnetassets);
                return (
                  <CompareCell
                    key={i}
                    value={fmtMoney(f.assets?.fundnetassets)}
                    isBest={i === bestInRow(values, true)}
                  />
                );
              })}
            </CompareRow>
            <CompareRow label="Net Flows (1M)" colCount={funds.length}>
              {funds.map((f, i) => (
                <CompareCell
                  key={i}
                  value={fmtMoney(f.flows?.estfundlevelnetflow1momoend)}
                  color={
                    Number(f.flows?.estfundlevelnetflow1momoend) >= 0
                      ? 'var(--emerald)'
                      : 'var(--red)'
                  }
                />
              ))}
            </CompareRow>
            <CompareRow label="Net Flows (1Y)" colCount={funds.length}>
              {funds.map((f, i) => (
                <CompareCell
                  key={i}
                  value={fmtMoney(f.flows?.estfundlevelnetflow1yrmoend)}
                  color={
                    Number(f.flows?.estfundlevelnetflow1yrmoend) >= 0
                      ? 'var(--emerald)'
                      : 'var(--red)'
                  }
                />
              ))}
            </CompareRow>
          </CompareSection>
        </Box>
      )}
    </Box>
  );
};

/* Sub-components */

const CompareSection = ({ title, children }) => (
  <Box
    sx={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-head)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-2)',
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Box>
    {children}
  </Box>
);

const CompareRow = ({ label, colCount, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `200px repeat(${colCount}, 1fr)`,
      borderBottom: '1px solid var(--row-border)',
      '&:last-child': { borderBottom: 'none' },
      '&:hover': { background: 'var(--bg-surface-hover)' },
    }}
  >
    <Box
      sx={{
        padding: '12px 20px',
        fontSize: '13px',
        color: 'var(--text-3)',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {label}
    </Box>
    {children}
  </Box>
);

const CompareCell = ({ value, color, isBest }) => (
  <Box
    sx={{
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: color || 'var(--text-2)',
      textAlign: 'right',
      fontWeight: isBest ? 600 : 400,
      position: 'relative',
    }}
  >
    {isBest && (
      <Box
        sx={{
          position: 'absolute',
          inset: '4px 8px',
          borderRadius: '4px',
          background: 'var(--emerald)',
          opacity: 0.08,
        }}
      />
    )}
    <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
      {value}
    </Box>
  </Box>
);

export default Compare;
