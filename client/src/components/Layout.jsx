import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

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
            px: '32px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <NavLink
              to="/"
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
              <NavLink to="/" end style={navLinkStyle}>
                Explorer
              </NavLink>
              <NavLink to="/screener" style={navLinkStyle}>
                Screener
              </NavLink>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
