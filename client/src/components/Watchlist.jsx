import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import useWatchlist from '../hooks/useWatchlist';
import { useAuth } from '../context/AuthContext';
import UpgradePrompt from './UpgradePrompt';

const Watchlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, remove, clear } = useWatchlist(user);

  const sortedItems = [...items].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  const FREE_LIMIT = 5;
  const atLimit = user?.plan !== 'pro' && items.length >= FREE_LIMIT;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '32px' }}>
        <Box>
          <Box component="h1" sx={{
            fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 600,
            color: 'var(--text-1)', letterSpacing: '-0.03em', mb: '4px',
          }}>
            Watchlist
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-3)' }}>
            Your saved funds
            {items.length > 0 && (
              <span style={{ color: 'var(--text-2)' }}> · {items.length} fund{items.length !== 1 ? 's' : ''}</span>
            )}
          </Box>
        </Box>
        {items.length > 0 && (
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <ActionButton
              onClick={() => {
                const ids = items.map((i) => i._id).join(',');
                navigate(`/compare?ids=${ids}`);
              }}
              disabled={items.length < 2 || items.length > 4}
            >
              Compare ({items.length})
            </ActionButton>
            <ActionButton onClick={clear} danger>Clear All</ActionButton>
          </Box>
        )}
      </Box>

      {/* Empty State */}
      {items.length === 0 && (
        <Box sx={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center',
        }}>
          <Box sx={{ fontSize: '48px', mb: '16px', opacity: 0.3 }}>&#9734;</Box>
          <Box sx={{ fontSize: '15px', color: 'var(--text-2)', mb: '8px', fontWeight: 500 }}>
            Your watchlist is empty
          </Box>
          <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '24px' }}>
            Bookmark funds from the Explorer or Fund Detail page to track them here
          </Box>
          <ActionButton onClick={() => navigate('/explorer')} primary>
            Go to Explorer
          </ActionButton>
        </Box>
      )}

      {/* Fund List */}
      {items.length > 0 && (
        <Box sx={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr">
                {['Fund Name', 'Ticker', 'Type', 'Category', 'Added', ''].map((col) => (
                  <Box
                    component="th"
                    key={col || 'actions'}
                    sx={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                      color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '14px 16px', textAlign: 'left',
                      borderBottom: '1px solid var(--border)', background: 'var(--bg-base)',
                    }}
                  >{col}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {sortedItems.map((fund, i) => (
                <Box
                  component="tr"
                  key={fund._id}
                  sx={{
                    borderBottom: '1px solid rgba(30,41,59,0.5)',
                    transition: 'background var(--transition)',
                    cursor: 'pointer',
                    animation: 'rowFadeIn 400ms ease both',
                    animationDelay: `${Math.min(i * 30, 300)}ms`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { background: 'var(--bg-surface-hover)' },
                    '&:hover .fund-name-cell': { color: 'var(--blue)' },
                  }}
                  onClick={() => navigate(`/funds/${fund._id}`)}
                >
                  <Box component="td" className="fund-name-cell" sx={{
                    fontSize: '13px', padding: '14px 16px', color: 'var(--text-1)',
                    fontWeight: 500, transition: 'color var(--transition)',
                    maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {fund.fundname || 'N/A'}
                  </Box>
                  <Box component="td" sx={{
                    fontSize: '13px', padding: '14px 16px', color: 'var(--text-2)',
                    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  }}>
                    {fund.ticker || '—'}
                  </Box>
                  <Box component="td" sx={{
                    fontSize: '13px', padding: '14px 16px', color: 'var(--text-2)', whiteSpace: 'nowrap',
                  }}>
                    {fund.securitytype || '—'}
                  </Box>
                  <Box component="td" sx={{
                    fontSize: '13px', padding: '14px 16px', color: 'var(--text-2)',
                    maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {fund.categoryname || '—'}
                  </Box>
                  <Box component="td" sx={{
                    fontSize: '12px', padding: '14px 16px', color: 'var(--text-4)',
                    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  }}>
                    {fund.addedAt ? new Date(fund.addedAt).toLocaleDateString('en-CA') : '—'}
                  </Box>
                  <Box component="td" sx={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Box
                      component="button"
                      onClick={(e) => { e.stopPropagation(); remove(fund._id); }}
                      sx={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-4)', fontSize: '16px', padding: '4px 8px',
                        borderRadius: '4px', transition: 'all var(--transition)',
                        '&:hover': { color: 'var(--red)', background: 'var(--red-soft)' },
                      }}
                    >&times;</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {atLimit && (
        <Box sx={{ mt: '20px' }}>
          <UpgradePrompt feature="watchlist slots" limit={FREE_LIMIT} compact />
        </Box>
      )}
    </Box>
  );
};

const ActionButton = ({ children, onClick, primary, danger, disabled }) => (
  <Box
    component="button"
    onClick={disabled ? undefined : onClick}
    sx={{
      background: primary ? 'var(--emerald-soft)' : danger ? 'transparent' : 'var(--bg-surface)',
      border: primary
        ? '1px solid rgba(16,185,129,0.2)'
        : danger
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      color: primary ? 'var(--emerald)' : danger ? 'var(--red)' : 'var(--text-2)',
      fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
      padding: '8px 16px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'all var(--transition)',
      '&:hover': disabled ? {} : {
        background: primary ? 'rgba(16,185,129,0.18)' : danger ? 'var(--red-soft)' : 'var(--bg-surface-hover)',
      },
    }}
  >{children}</Box>
);

export default Watchlist;
