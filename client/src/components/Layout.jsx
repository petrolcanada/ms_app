import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import { usePageView } from '../hooks/useAnalytics';

const NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    isActive: ({ pathname }) => pathname === '/dashboard',
  },
  {
    to: '/categories',
    label: 'Categories',
    isActive: ({ pathname }) => pathname.startsWith('/categories'),
  },
  {
    to: '/funds',
    label: 'Funds',
    isActive: ({ pathname }) => pathname.startsWith('/funds'),
  },
  {
    to: '/asset-managers',
    label: 'Managers',
    isActive: ({ pathname }) => pathname.startsWith('/asset-managers'),
  },
  { to: '/screener', label: 'Screener', isActive: ({ pathname }) => pathname === '/screener' },
  { to: '/compare', label: 'Compare', isActive: ({ pathname }) => pathname === '/compare' },
  { to: '/watchlist', label: 'Watchlist', isActive: ({ pathname }) => pathname === '/watchlist' },
];

const navLinkStyle = ({ isActive }) => ({
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? 'var(--text-1)' : 'var(--text-3)',
  textDecoration: 'none',
  padding: '9px 14px',
  borderRadius: 'var(--radius-pill)',
  border: isActive ? '1px solid var(--accent-ring)' : '1px solid transparent',
  background: isActive ? 'var(--accent-soft)' : 'transparent',
  boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
  transition: 'all var(--transition)',
});

const mobileNavLinkStyle = ({ isActive }) => ({
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: isActive ? 700 : 500,
  color: isActive ? 'var(--text-1)' : 'var(--text-3)',
  textDecoration: 'none',
  padding: '12px 18px',
  display: 'block',
  borderRadius: 'var(--radius)',
  border: isActive ? '1px solid var(--accent-ring)' : '1px solid transparent',
  background: isActive ? 'var(--accent-soft)' : 'transparent',
  transition: 'all var(--transition)',
});

const BrandMark = () => (
  <Box
    sx={{
      width: '22px',
      height: '22px',
      borderRadius: '7px',
      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
      boxShadow: '0 10px 22px rgba(111, 76, 245, 0.28)',
      position: 'relative',
      flexShrink: 0,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: '6px',
        borderRadius: '4px',
        border: '1.5px solid rgba(255,255,255,0.82)',
      },
    }}
  />
);

const ThemeToggleControl = ({ themeMode, onToggleTheme, mobile = false }) => {
  const handleModeSelect = (targetMode) => {
    if (targetMode !== themeMode) {
      onToggleTheme();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: mobile ? 'center' : 'stretch',
        justifyContent: 'space-between',
        gap: mobile ? '12px' : '0',
        padding: mobile ? '12px 18px' : '0',
        borderTop: mobile ? '1px solid var(--border)' : 'none',
      }}
    >
      {mobile && (
        <Box>
          <Box sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>Appearance</Box>
          <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>Switch the desk tone</Box>
        </Box>
      )}
      <Box
        role="tablist"
        aria-label="Color mode"
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: mobile ? '118px' : '112px',
          padding: mobile ? '3px' : '2px',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: mobile ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.03)',
          overflow: 'hidden',
          opacity: mobile ? 1 : 0.9,
          transition: 'opacity var(--transition), border-color var(--transition)',
          '&:hover': {
            opacity: 1,
            borderColor: 'var(--border-hover)',
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: mobile ? '3px' : '2px',
            left: themeMode === 'light' ? 'calc(50% + 1px)' : mobile ? '3px' : '2px',
            width: mobile ? 'calc(50% - 4px)' : 'calc(50% - 2px)',
            height: mobile ? 'calc(100% - 6px)' : 'calc(100% - 4px)',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 12px 28px rgba(111, 76, 245, 0.25)',
            transition: 'left 180ms ease',
          }}
        />
        {[
          { key: 'dark', label: 'Dark' },
          { key: 'light', label: 'Light' },
        ].map((option) => {
          const isActive = option.key === themeMode;
          return (
            <Box
              key={option.key}
              component="button"
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleModeSelect(option.key)}
              sx={{
                position: 'relative',
                zIndex: 1,
                height: mobile ? '32px' : '28px',
                border: 'none',
                background: 'transparent',
                color: isActive ? '#fff' : 'var(--text-4)',
                fontFamily: 'var(--font-body)',
                fontSize: mobile ? '12px' : '11px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'color var(--transition)',
              }}
            >
              {option.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const Layout = ({ themeMode, onToggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  usePageView();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Box
        sx={{
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(111, 76, 245, 0.75) 50%, transparent 100%)',
          opacity: 0.9,
        }}
      />

      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--glass-nav)',
          backdropFilter: 'blur(22px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box
          sx={{
            maxWidth: '1480px',
            mx: 'auto',
            px: { xs: '16px', sm: '24px', md: '32px' },
            minHeight: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: '12px', md: '36px' },
              minWidth: 0,
            }}
          >
            <NavLink
              to="/dashboard"
              aria-label="FundLens home"
              style={{
                color: 'var(--text-1)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              <BrandMark />
              <Box>
                <Box
                  sx={{
                    fontFamily: 'var(--font-head)',
                    fontWeight: 800,
                    fontSize: '18px',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  FundLens
                </Box>
                <Box sx={{ fontSize: '10px', color: 'var(--text-4)', letterSpacing: '0.08em' }}>
                  RESEARCH DESK
                </Box>
              </Box>
            </NavLink>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '4px' }}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  style={() => navLinkStyle({ isActive: link.isActive(location) })}
                >
                  {link.label}
                </NavLink>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <>
                {user.plan === 'free' && (
                  <NavLink
                    to="/pricing"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                      boxShadow: '0 14px 28px rgba(111, 76, 245, 0.24)',
                    }}
                  >
                    Upgrade
                  </NavLink>
                )}
                <NavLink to="/settings" style={navLinkStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box
                      sx={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        border: '1px solid var(--accent-ring)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--accent-strong)',
                      }}
                    >
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'block' }, fontSize: '12px' }}>
                      {user.name || user.email.split('@')[0]}
                    </Box>
                  </Box>
                </NavLink>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <ThemeToggleControl themeMode={themeMode} onToggleTheme={onToggleTheme} />
                </Box>
                <Box
                  component="button"
                  onClick={handleLogout}
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius)',
                    transition: 'color var(--transition)',
                    '&:hover': { color: 'var(--text-2)' },
                  }}
                >
                  Log out
                </Box>
              </>
            )}

            <Box
              component="button"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((value) => !value)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                '& span': {
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  background: 'var(--text-2)',
                  borderRadius: '999px',
                  transition: 'all 200ms ease',
                },
              }}
            >
              <span
                style={mobileMenuOpen ? { transform: 'rotate(45deg) translate(3px, 3px)' } : {}}
              />
              <span style={mobileMenuOpen ? { opacity: 0 } : {}} />
              <span
                style={mobileMenuOpen ? { transform: 'rotate(-45deg) translate(3px, -3px)' } : {}}
              />
            </Box>
          </Box>
        </Box>

        {mobileMenuOpen && (
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              borderTop: '1px solid var(--border)',
              background: 'var(--glass-nav-strong)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              animation: 'fadeIn 150ms ease',
              px: '12px',
              py: '10px',
            }}
          >
            <Box sx={{ display: 'grid', gap: '6px' }}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  style={() => mobileNavLinkStyle({ isActive: link.isActive(location) })}
                >
                  {link.label}
                </NavLink>
              ))}
            </Box>
            <ThemeToggleControl themeMode={themeMode} onToggleTheme={onToggleTheme} mobile />
            {user && (
              <Box
                component="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                sx={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-4)',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  cursor: 'pointer',
                  padding: '14px 18px 6px',
                  transition: 'color var(--transition)',
                  '&:hover': { color: 'var(--text-2)' },
                }}
              >
                Log out
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          maxWidth: '1480px',
          mx: 'auto',
          px: { xs: '16px', sm: '24px', md: '32px' },
          py: { xs: '24px', md: '32px' },
          pb: '72px',
          animation: 'fadeIn 500ms ease',
        }}
      >
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
