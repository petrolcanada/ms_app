import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import { usePageView } from '../hooks/useAnalytics';

const navLinkStyle = ({ isActive }) => ({
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 500,
  color: isActive ? 'var(--text-1)' : 'var(--text-3)',
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: 'var(--radius)',
  transition: 'all var(--transition)',
  background: isActive ? 'var(--bg-surface)' : 'transparent',
});

const mobileNavLinkStyle = ({ isActive }) => ({
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 500,
  color: isActive ? 'var(--text-1)' : 'var(--text-3)',
  textDecoration: 'none',
  padding: '12px 20px',
  display: 'block',
  transition: 'all 180ms ease',
  background: isActive ? 'var(--bg-surface)' : 'transparent',
});

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/explorer', label: 'Explorer' },
  { to: '/screener', label: 'Screener' },
  { to: '/compare', label: 'Compare' },
  { to: '/watchlist', label: 'Watchlist' },
];

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
        padding: mobile ? '12px 20px' : '0',
        borderTop: mobile ? '1px solid var(--border)' : 'none',
        background: 'transparent',
      }}
    >
      {mobile && (
        <Box>
          <Box sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>Appearance</Box>
          <Box sx={{ fontSize: '11px', color: 'var(--text-4)' }}>Pick the view you want</Box>
        </Box>
      )}
      <Box
        role="tablist"
        aria-label="Color mode"
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: mobile ? '112px' : '108px',
          padding: mobile ? '3px' : '2px',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: mobile
            ? 'linear-gradient(180deg, var(--bg-surface), var(--bg-base))'
            : 'rgba(255,255,255,0.02)',
          boxShadow: mobile ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : 'none',
          overflow: 'hidden',
          opacity: mobile ? 1 : 0.88,
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
            left:
              themeMode === 'light'
                ? mobile
                  ? 'calc(50% + 1px)'
                  : 'calc(50% + 0px)'
                : mobile
                  ? '3px'
                  : '2px',
            width: mobile ? 'calc(50% - 4px)' : 'calc(50% - 2px)',
            height: mobile ? 'calc(100% - 6px)' : 'calc(100% - 4px)',
            borderRadius: '999px',
            background:
              themeMode === 'light'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(59, 130, 246, 0.10))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.10))',
            border: mobile
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(255,255,255,0.03)',
            boxShadow: mobile
              ? '0 10px 24px rgba(15, 23, 42, 0.16)'
              : '0 6px 16px rgba(15, 23, 42, 0.10)',
            transition: 'left 180ms ease, background 180ms ease',
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
                height: mobile ? '32px' : '26px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--text-1)' : 'var(--text-4)',
                fontFamily: 'var(--font-body)',
                fontSize: mobile ? '12px' : '11px',
                fontWeight: isActive ? 600 : 500,
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
      {/* Accent gradient line */}
      <Box
        sx={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, var(--emerald), var(--blue), transparent)',
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
          background: 'var(--glass-nav)',
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
          {/* Left: logo + desktop links */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: '12px', md: '40px' },
              minWidth: 0,
            }}
          >
            <NavLink
              to="/dashboard"
              aria-label="FundLens home"
              style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--text-1)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}
            >
              <span style={{ color: 'var(--emerald)', fontSize: '20px' }}>&#9670;</span>
              FundLens
            </NavLink>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '4px' }}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end || undefined}
                  style={navLinkStyle}
                >
                  {link.label}
                </NavLink>
              ))}
            </Box>
          </Box>

          {/* Right: actions + hamburger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            {/* Hamburger – mobile only */}
            <Box
              component="button"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                flexShrink: 0,
                '& span': {
                  display: 'block',
                  width: '18px',
                  height: '2px',
                  background: 'var(--text-2)',
                  borderRadius: '1px',
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

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              borderTop: '1px solid var(--border)',
              background: 'var(--glass-nav-strong)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              animation: 'fadeIn 150ms ease',
            }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end || undefined}
                style={mobileNavLinkStyle}
              >
                {link.label}
              </NavLink>
            ))}
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
                  fontWeight: 500,
                  color: 'var(--text-4)',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  cursor: 'pointer',
                  padding: '12px 20px',
                  transition: 'color 180ms ease',
                  '&:hover': { color: 'var(--text-2)' },
                }}
              >
                Log out
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          maxWidth: '1400px',
          mx: 'auto',
          px: { xs: '16px', sm: '24px', md: '32px' },
          py: { xs: '24px', md: '32px' },
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
