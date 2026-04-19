import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useFunds } from '../hooks/useFunds';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import StatCard from './StatCard';
import AsOfDateSelector from './AsOfDateSelector';

const FundList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [asofDate, setAsofDate] = useState('');

  const handleDateChange = useCallback((newDate) => {
    setAsofDate(newDate);
    setPage(1);
  }, []);

  const { data, isLoading, isFetching, isError, error } = useFunds({
    page,
    limit,
    search: searchTerm,
    type: filters.type,
    category: filters.category,
    asofDate,
  });

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleFundClick = useCallback(
    (fundId) => {
      const params = asofDate ? `?asof=${asofDate}` : '';
      navigate(`/funds/${fundId}${params}`);
    },
    [navigate, asofDate],
  );

  const funds = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0, page: 1 };

  const renderPagination = () => {
    const { total, totalPages } = pagination;
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
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
            {start}&ndash;{end}
          </strong>{' '}
          of{' '}
          <strong style={{ color: 'var(--text-2)', fontWeight: 500 }}>
            {total.toLocaleString()}
          </strong>{' '}
          funds
        </Box>
        <Box sx={{ display: 'flex', gap: '4px' }}>
          <PageBtn onClick={() => setPage(page - 1)} disabled={page === 1}>
            &#8249;
          </PageBtn>
          {pages.map((p, i) =>
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
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            &#8250;
          </PageBtn>
        </Box>
      </Box>
    );
  };

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
          Fund Explorer
        </Box>
        <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
          Canadian open-end fund universe
          {pagination.total > 0 && (
            <span style={{ color: 'var(--text-2)' }}>
              {' '}
              &middot; {pagination.total.toLocaleString()} funds
            </span>
          )}
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: '16px',
          mb: '28px',
        }}
      >
        <StatCard
          label="Total Funds"
          value={pagination.total ? pagination.total.toLocaleString() : '—'}
        />
        <StatCard label="Avg 1-Year Return" value="—" />
        <StatCard label="Avg MER" value="—" />
        <StatCard label="Avg Morningstar Rating" value="—" />
      </Box>

      {/* Toolbar */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '20px', flexWrap: 'wrap' }}
      >
        <SearchBar onSearch={handleSearch} placeholder="Search by fund name, ticker, or ISIN..." />
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        <Box sx={{ ml: { xs: 0, sm: 'auto' } }}>
          <AsOfDateSelector value={asofDate} onChange={handleDateChange} />
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
          {error?.message || 'Failed to load funds. Please try again.'}
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

      {/* Table */}
      {!isLoading && (
        <Box
          sx={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Background fetch indicator */}
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
              sx={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}
            >
              <Box component="thead">
                <Box component="tr">
                  {['Fund Name', 'Ticker', 'Type', 'Category', 'Inception'].map((col) => (
                    <Box
                      component="th"
                      key={col}
                      sx={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '14px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-base)',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {funds.length === 0 ? (
                  <Box component="tr">
                    <Box
                      component="td"
                      colSpan={5}
                      sx={{
                        textAlign: 'center',
                        padding: '48px 16px',
                        color: 'var(--text-3)',
                        fontSize: '13px',
                      }}
                    >
                      No funds found
                    </Box>
                  </Box>
                ) : (
                  funds.map((fund, index) => (
                    <Box
                      component="tr"
                      key={fund._id}
                      onClick={() => handleFundClick(fund._id)}
                      sx={{
                        borderBottom: '1px solid var(--row-border)',
                        transition: 'background var(--transition)',
                        cursor: 'pointer',
                        animation: 'rowFadeIn 400ms ease both',
                        animationDelay: `${Math.min(index * 30, 300)}ms`,
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { background: 'var(--bg-surface-hover)' },
                        '&:hover .fund-name-cell': { color: 'var(--blue)' },
                      }}
                    >
                      <Box
                        component="td"
                        className="fund-name-cell"
                        sx={{
                          fontSize: '13px',
                          padding: '14px 16px',
                          color: 'var(--text-1)',
                          fontWeight: 500,
                          maxWidth: '320px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          transition: 'color var(--transition)',
                        }}
                      >
                        {fund.fundname || fund._name || 'N/A'}
                        <TypeBadge type={fund.securitytype || fund.legalstructure} />
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          fontSize: '13px',
                          padding: '14px 16px',
                          color: 'var(--text-2)',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fund.ticker || '—'}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          fontSize: '13px',
                          padding: '14px 16px',
                          color: 'var(--text-2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fund.securitytype || fund.legalstructure || '—'}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          fontSize: '13px',
                          padding: '14px 16px',
                          color: 'var(--text-2)',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fund.categoryname || fund.globalcategoryname || '—'}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          fontSize: '13px',
                          padding: '14px 16px',
                          color: 'var(--text-2)',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fund.inceptiondate
                          ? new Date(fund.inceptiondate).toLocaleDateString('en-CA')
                          : '—'}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
          {pagination.total > 0 && renderPagination()}
        </Box>
      )}
    </Box>
  );
};

/* Inline sub-components */

const TypeBadge = ({ type }) => {
  if (!type) return null;
  const isETF = type.toUpperCase().includes('ETF');
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '2px 6px',
        borderRadius: '4px',
        ml: '8px',
        color: isETF ? 'var(--blue)' : 'var(--text-3)',
        background: isETF ? 'var(--blue-soft)' : 'rgba(100, 116, 139, 0.12)',
      }}
    >
      {isETF ? 'ETF' : 'MF'}
    </Box>
  );
};

const PageBtn = ({ children, active, disabled, onClick, style, 'aria-label': ariaLabel }) => (
  <Box
    component="button"
    aria-label={ariaLabel}
    aria-current={active ? 'page' : undefined}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    sx={{
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)',
      border: active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
      background: active ? 'var(--emerald-soft)' : 'transparent',
      color: active ? 'var(--emerald)' : 'var(--text-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
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

export default FundList;
