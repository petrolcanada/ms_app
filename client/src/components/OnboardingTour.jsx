import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';

const ONBOARDING_KEY = 'fundlens_onboarding_done';

const steps = [
  {
    title: 'Welcome to FundLens',
    description: 'Your redesigned fund analytics platform. Let us show you around.',
    badge: '01',
  },
  {
    title: 'Dashboard',
    description: 'Read top performers, ratings, and fund flows from a cleaner market overview.',
    badge: '02',
    link: '/dashboard',
  },
  {
    title: 'Fund Explorer',
    description:
      'Browse thousands of mutual funds and ETFs with clearer search and category views.',
    badge: '03',
    link: '/explorer',
  },
  {
    title: 'Smart Screener',
    description: 'Rank funds by returns, fees, Sharpe ratio, and more with stronger hierarchy.',
    badge: '04',
    link: '/screener',
  },
  {
    title: 'Compare and Watchlist',
    description: 'Compare funds side by side and save the names you want to monitor.',
    badge: '05',
    link: '/compare',
  },
  {
    title: "You're all set",
    description: 'Explore at your own pace. You can always reach settings from the top-right menu.',
    badge: '06',
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
    return undefined;
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
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 300ms ease',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          borderRadius: '26px',
          p: { xs: '28px', sm: '36px' },
          textAlign: 'center',
          boxShadow: 'var(--shadow-panel)',
          animation: 'slideUp 400ms ease',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'var(--accent-soft)',
            color: 'var(--accent-strong)',
            fontSize: '18px',
            fontWeight: 800,
            mb: '16px',
          }}
        >
          {current.badge}
        </Box>

        <Box
          component="h2"
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
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
            lineHeight: 1.7,
            mb: '28px',
            maxWidth: '360px',
            mx: 'auto',
          }}
        >
          {current.description}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px', mb: '24px' }}>
          {steps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: index === step ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: index === step ? 'var(--accent)' : 'var(--border)',
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
              fontWeight: 600,
              color: 'var(--text-3)',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '9px 20px',
              cursor: 'pointer',
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
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '9px 24px',
              cursor: 'pointer',
              boxShadow: '0 18px 34px rgba(111, 76, 245, 0.22)',
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
