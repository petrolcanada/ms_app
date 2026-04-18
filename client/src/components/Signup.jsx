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
  borderRadius: 'var(--radius)',
  color: 'var(--text-1)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '12px 16px',
  outline: 'none',
  transition: 'border-color var(--transition)',
  '&::placeholder': { color: 'var(--text-4)' },
  '&:focus': { borderColor: 'var(--emerald)' },
};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, name, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--bg-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '16px',
      }}
    >
      <SEO title="Sign Up" path="/signup" noIndex />
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          p: { xs: '28px', sm: '36px' },
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--text-1)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <span style={{ color: 'var(--emerald)', fontSize: '22px' }}>&#9670;</span>
          FundLens
        </Link>

        <Box
          component="h1"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-1)',
            textAlign: 'center',
            mb: '24px',
          }}
        >
          Create your account
        </Box>

        {error && (
          <Box
            sx={{
              background: 'var(--red-soft)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'var(--red)',
              mb: '20px',
            }}
          >
            {error}
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Name
            </Box>
            <Box
              component="input"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputSx}
            />
          </Box>

          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Email
            </Box>
            <Box
              component="input"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputSx}
            />
          </Box>

          <Box>
            <Box component="label" sx={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', mb: '6px' }}>
              Password
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ ...inputSx, pr: '44px' }}
              />
              <Box
                component="button"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
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
                  transition: 'color var(--transition)',
                  '&:hover': { color: 'var(--text-2)' },
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </Box>
            </Box>
            <Box sx={{ fontSize: '11px', color: 'var(--text-4)', mt: '6px' }}>
              Minimum 8 characters
            </Box>
          </Box>

          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--emerald)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '12px 0',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              mt: '4px',
              '&:hover:not(:disabled)': { opacity: 0.88 },
            }}
          >
            {loading && <CircularProgress size={16} sx={{ color: '#fff' }} />}
            Create account
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--emerald)', textDecoration: 'none', fontWeight: 500 }}>
            Log in
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
