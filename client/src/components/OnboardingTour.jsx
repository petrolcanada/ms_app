import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

const ONBOARDING_KEY = 'fundlens_onboarding_done';

const steps = [
  {
    title: 'Welcome to FundLens',
    description: 'Your new fund analytics platform. Let us show you around.',
    icon: '◆',
  },
  {
    title: 'Dashboard',
    description:
      'Get a snapshot of the market — top performers, highest rated, and the biggest fund flows.',
    icon: '📊',
    link: '/dashboard',
  },
  {
    title: 'Fund Explorer',
    description:
      'Browse thousands of mutual funds and ETFs with full-text search and category filters.',
    icon: '🔍',
    link: '/explorer',
  },
  {
    title: 'Smart Screener',
    description: 'Rank funds by returns, fees, Sharpe ratio, and more with a color-coded heatmap.',
    icon: '📈',
    link: '/screener',
  },
  {
    title: 'Compare & Watchlist',
    description: 'Compare funds side by side and save your favorites to your personal watchlist.',
    icon: '⭐',
    link: '/compare',
  },
  {
    title: "You're all set!",
    description:
      'Explore at your own pace. You can always access settings from the top-right menu.',
    icon: '🚀',
  },
];

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      const timer = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShow(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  const goToStep = () => {
    const current = steps[step];
    if (current.link) {
      navigate(current.link);
    }
    next();
  };

  if (!show) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--overlay-scrim)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 300ms ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          p: { xs: '28px', sm: '36px' },
          textAlign: 'center',
          animation: 'slideUp 400ms ease',
        }}
      >
        <Box sx={{ fontSize: '40px', mb: '16px' }}>{current.icon}</Box>

        <Box
          component="h2"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-1)',
            mb: '10px',
          }}
        >
          {current.title}
        </Box>

        <Box
          sx={{
            fontSize: '14px',
            color: 'var(--text-3)',
            lineHeight: 1.65,
            mb: '28px',
            maxWidth: '360px',
            mx: 'auto',
          }}
        >
          {current.description}
        </Box>

        {/* Progress dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px', mb: '24px' }}>
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === step ? 'var(--emerald)' : 'var(--border)',
                transition: 'all 300ms ease',
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Box
            component="button"
            onClick={dismiss}
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-3)',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '9px 20px',
              cursor: 'pointer',
              transition: 'all var(--transition)',
              '&:hover': { borderColor: 'var(--border-hover)', color: 'var(--text-1)' },
            }}
          >
            Skip
          </Box>
          <Box
            component="button"
            onClick={current.link ? goToStep : next}
            sx={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--emerald)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '9px 24px',
              cursor: 'pointer',
              transition: 'opacity var(--transition)',
              '&:hover': { opacity: 0.88 },
            }}
          >
            {isLast ? 'Get Started' : current.link ? 'Show Me' : 'Next'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingTour;
