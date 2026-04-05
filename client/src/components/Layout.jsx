import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import { usePageView } from '../hooks/useAnalytics';

const navLinkStyle = ({ isActive }) => ({
  fontFamily: "var(--font-body)",
  fontSize: '13px',
  fontWeight: 500,
  color: isActive ? 'var(--text-1)' : 'var(--text-3)',
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: 'var(--radius)',
  transition: 'all var(--transition)',
  background: isActive ? 'var(--bg-surface)' : 'transparent',
});

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  usePageView();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Accent gradient line */}
      <Box
        sx={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--emerald), var(--blue), transparent)',
          opacity: 0.5,
        }}
      />

      {/* Glass navbar */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(4, 6, 12, 0.82)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '16px', md: '40px' } }}>
            <NavLink
              to="/dashboard"
              aria-label="FundLens home"
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--text-1)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              <span style={{ color: 'var(--emerald)', fontSize: '20px' }}>&#9670;</span>
              FundLens
            </NavLink>

            <Box sx={{ display: 'flex', gap: '4px' }}>
              <NavLink to="/dashboard" end style={navLinkStyle}>
                Dashboard
              </NavLink>
              <NavLink to="/explorer" style={navLinkStyle}>
                Explorer
              </NavLink>
              <NavLink to="/screener" style={navLinkStyle}>
                Screener
              </NavLink>
              <NavLink to="/compare" style={navLinkStyle}>
                Compare
              </NavLink>
              <NavLink to="/watchlist" style={navLinkStyle}>
                Watchlist
              </NavLink>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '8px', mr: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>Press</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: '11px',
                  color: 'var(--text-4)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                /
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-4)' }}>to search</span>
            </Box>

            {user && (
              <>
                {user.plan === 'free' && (
                  <NavLink
                    to="/pricing"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--emerald)',
                      textDecoration: 'none',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      background: 'var(--emerald-soft)',
                      transition: 'all var(--transition)',
                    }}
                  >
                    Upgrade
                  </NavLink>
                )}
                <NavLink to="/settings" style={navLinkStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box
                      sx={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--emerald-soft)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--emerald)',
                      }}
                    >
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'block' }, fontSize: '12px' }}>
                      {user.name || user.email.split('@')[0]}
                    </Box>
                  </Box>
                </NavLink>
                <Box
                  component="button"
                  onClick={handleLogout}
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius)',
                    transition: 'color var(--transition)',
                    '&:hover': { color: 'var(--text-2)' },
                  }}
                >
                  Log out
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          maxWidth: '1400px',
          mx: 'auto',
          px: '32px',
          py: '32px',
          pb: '64px',
          animation: 'fadeIn 500ms ease',
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
