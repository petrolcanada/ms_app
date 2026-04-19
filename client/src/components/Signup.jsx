import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';

const inputSx = {
  width: '100%',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  color: 'var(--text-1)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '14px 16px',
  outline: 'none',
  transition: 'border-color var(--transition), box-shadow var(--transition)',
  '&::placeholder': { color: 'var(--text-4)' },
  '&:focus': {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 4px var(--accent-soft)',
  },
};

const BrandMark = ({ size = 24 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: `${Math.round(size * 0.3)}px`,
      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
      boxShadow: '0 14px 34px rgba(111, 76, 245, 0.24)',
      position: 'relative',
      flexShrink: 0,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: `${Math.max(5, Math.round(size * 0.26))}px`,
        borderRadius: `${Math.round(size * 0.18)}px`,
        border: '1.5px solid rgba(255,255,255,0.84)',
      },
    }}
  />
);

const Signup = () => {
  const { signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, name, password);
      navigate('/dashboard', { replace: true });
    } catch (signupError) {
      setError(signupError.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '16px',
        py: '40px',
      }}
    >
      <SEO title="Sign Up" path="/signup" noIndex />

      <Box
        sx={{
          width: '100%',
          maxWidth: '1040px',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '420px minmax(0, 1fr)' },
          borderRadius: '30px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.03)',
          boxShadow: 'var(--shadow-panel)',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            p: '30px',
            background: 'linear-gradient(180deg, #110d1d 0%, #090711 100%)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '26px' }}>
              <BrandMark />
              <Box>
                <Box
                  sx={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.03em' }}
                >
                  FundLens
                </Box>
                <Box
                  sx={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.08em',
                  }}
                >
                  PROFESSIONAL RESEARCH
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: '40px',
                fontWeight: 800,
                letterSpacing: '-0.06em',
                lineHeight: 0.95,
                color: '#fff',
                mb: '14px',
              }}
            >
              Build your research desk.
            </Box>

            <Box sx={{ color: 'rgba(255,255,255,0.66)', lineHeight: 1.8, mb: '24px' }}>
              Start with the redesigned workflow: sharper hierarchy, cooler surfaces, and less noise
              around the data that matters.
            </Box>

            <Box sx={{ display: 'grid', gap: '10px' }}>
              {[
                'Screen funds with cleaner ranking views',
                'Track favorites with a quieter watchlist layout',
                'Compare more funds without visual fatigue',
              ].map((item, index) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <Box sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '13px' }}>{item}</Box>
                  <Box
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === 0 ? 'var(--accent-strong)' : 'var(--emerald)',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              p: '16px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Box sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', mb: '8px' }}>
              What changes visually
            </Box>
            <Box sx={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(255,255,255,0.72)' }}>
              Light mode now uses cooler near-white surfaces, while the product keeps darker desk
              panels and violet calls-to-action inspired by Kraken&apos;s restraint.
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: { xs: '24px', sm: '34px', md: '40px' } }}>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: '10px',
              mb: '26px',
            }}
          >
            <BrandMark />
            <Box sx={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              FundLens
            </Box>
          </Box>

          <Box sx={{ maxWidth: '440px' }}>
            <Box
              sx={{
                fontSize: '12px',
                color: 'var(--text-4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: '10px',
              }}
            >
              New account
            </Box>
            <Box
              component="h1"
              sx={{
                fontFamily: 'var(--font-head)',
                fontSize: { xs: '32px', sm: '38px' },
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 0.98,
                mb: '10px',
              }}
            >
              Create your account
            </Box>
            <Box sx={{ color: 'var(--text-3)', lineHeight: 1.7, mb: '26px' }}>
              Start free, save your watchlists, and move through the new interface with a more
              deliberate visual hierarchy.
            </Box>

            {error && (
              <Box
                sx={{
                  background: 'var(--red-soft)',
                  border: '1px solid rgba(224, 72, 99, 0.24)',
                  borderRadius: '18px',
                  px: '16px',
                  py: '12px',
                  fontSize: '13px',
                  color: 'var(--red)',
                  mb: '18px',
                }}
              >
                {error}
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: '16px' }}>
              <Box>
                <Box
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-2)',
                    mb: '8px',
                  }}
                >
                  Name
                </Box>
                <Box
                  component="input"
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Box
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-2)',
                    mb: '8px',
                  }}
                >
                  Email
                </Box>
                <Box
                  component="input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Box
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-2)',
                    mb: '8px',
                  }}
                >
                  Password
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    sx={{ ...inputSx, pr: '46px' }}
                  />
                  <Box
                    component="button"
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((value) => !value)}
                    sx={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: 'var(--text-4)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </Box>
                </Box>
                <Box sx={{ fontSize: '11px', color: 'var(--text-4)', mt: '8px' }}>
                  Minimum 8 characters
                </Box>
              </Box>

              <Box
                component="button"
                type="submit"
                disabled={loading}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  px: '18px',
                  py: '14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 18px 34px rgba(111, 76, 245, 0.24)',
                }}
              >
                {loading && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                Create account
              </Box>
            </Box>

            <Box sx={{ mt: '20px', fontSize: '13px', color: 'var(--text-3)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: 'var(--accent-strong)', textDecoration: 'none', fontWeight: 700 }}
              >
                Log in
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
