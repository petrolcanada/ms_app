import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import SEO from './SEO';

const Section = ({ title, children }) => (
  <Box sx={{ mb: '32px' }}>
    <Box
      component="h2"
      sx={{
        fontFamily: 'var(--font-head)',
        fontSize: '20px',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: 'var(--text-1)',
        mb: '12px',
      }}
    >
      {title}
    </Box>
    <Box sx={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.8 }}>{children}</Box>
  </Box>
);

const BrandMark = () => (
  <Box
    sx={{
      width: '20px',
      height: '20px',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
      boxShadow: '0 12px 24px rgba(111, 76, 245, 0.22)',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: '5px',
        borderRadius: '3px',
        border: '1.5px solid rgba(255,255,255,0.84)',
      },
    }}
  />
);

const Privacy = () => (
  <Box sx={{ minHeight: '100vh', color: 'var(--text-1)' }}>
    <SEO title="Privacy Policy" path="/privacy" />

    <Box
      sx={{
        height: '1px',
        background:
          'linear-gradient(90deg, transparent 0%, rgba(111, 76, 245, 0.8) 50%, transparent 100%)',
      }}
    />

    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--glass-nav)',
        backdropFilter: 'blur(22px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.25)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Box
        sx={{
          maxWidth: '840px',
          mx: 'auto',
          px: { xs: '16px', md: '32px' },
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--text-1)',
          }}
        >
          <BrandMark />
          <span
            style={{ fontFamily: 'var(--font-head)', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            FundLens
          </span>
        </Link>
        <Link to="/" style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none' }}>
          Back to home
        </Link>
      </Box>
    </Box>

    <Box
      sx={{
        maxWidth: '840px',
        mx: 'auto',
        px: { xs: '16px', md: '32px' },
        py: '48px',
      }}
    >
      <Box
        component="h1"
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: { xs: '34px', md: '44px' },
          fontWeight: 800,
          letterSpacing: '-0.05em',
          mb: '8px',
        }}
      >
        Privacy Policy
      </Box>
      <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '38px' }}>
        Last updated: April 5, 2026
      </Box>

      <Section title="1. Information We Collect">
        When you create a FundLens account, we collect your name, email address, and password in
        hashed form. We may also collect product usage data such as visited pages, selected
        features, screener settings, and watchlist activity to improve the service.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your information to provide and maintain the service, manage subscriptions, send
        important account notices, improve the product experience, and comply with legal
        obligations.
      </Section>

      <Section title="3. Data Storage">
        Your data is stored on secure servers. We use industry-standard protections including
        encrypted transport and storage. We retain data for as long as your account is active or as
        needed to operate the service.
      </Section>

      <Section title="4. Third-Party Services">
        FundLens relies on trusted providers such as Stripe for payment processing and Morningstar
        for fund data. Payment information is handled directly by Stripe and is never stored on our
        servers.
      </Section>

      <Section title="5. Cookies">
        FundLens uses essential cookies and local storage to maintain authentication and core
        product behavior. We do not use third-party advertising cookies.
      </Section>

      <Section title="6. Your Rights">
        You may request access to your data, correction of inaccurate information, deletion of your
        account, or export of certain data. Requests can be made using the contact address below.
      </Section>

      <Section title="7. Data Retention">
        We retain personal data while your account is active. If you delete your account, personal
        data is removed within 30 days unless a longer retention period is required by law.
      </Section>

      <Section title="8. Children's Privacy">
        FundLens is not intended for individuals under the age of 18, and we do not knowingly
        collect personal information from children.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this Privacy Policy from time to time. Material changes may be communicated by
        email or in-app notice. Continued use of the service after the update means you accept the
        revised policy.
      </Section>

      <Section title="10. Contact">
        If you have questions about this Privacy Policy or your data, contact us at{' '}
        <span style={{ color: 'var(--accent-strong)' }}>privacy@fundlens.app</span>.
      </Section>
    </Box>
  </Box>
);

export default Privacy;
