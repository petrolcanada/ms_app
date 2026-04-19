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

const Terms = () => (
  <Box sx={{ minHeight: '100vh', color: 'var(--text-1)' }}>
    <SEO title="Terms of Service" path="/terms" />

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
        Terms of Service
      </Box>
      <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '38px' }}>
        Last updated: April 5, 2026
      </Box>

      <Section title="1. Acceptance of Terms">
        By accessing or using FundLens, you agree to be bound by these Terms of Service. If you do
        not agree to these terms, please do not use the service. We may update these terms from time
        to time, and continued use of FundLens constitutes acceptance of the revised version.
      </Section>

      <Section title="2. Description of Service">
        FundLens provides analytics, screening, comparison, and data visualization tools for mutual
        funds and ETFs across US and Canadian markets. The information is provided for informational
        purposes only and should not be interpreted as financial advice or investment
        recommendations.
      </Section>

      <Section title="3. User Accounts">
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activity that occurs under your account. You agree to provide accurate and current
        information when creating and maintaining your account.
      </Section>

      <Section title="4. Acceptable Use">
        You agree not to use the service for unlawful purposes, attempt unauthorized access, scrape
        or automate data extraction beyond approved use, resell or redistribute the data without
        permission, or interfere with normal product operation.
      </Section>

      <Section title="5. Intellectual Property">
        All product content, design, code, and data compilations within FundLens are the property of
        FundLens or its licensors. Underlying fund data is sourced from third-party providers,
        including Morningstar, and remains subject to their terms.
      </Section>

      <Section title="6. Limitation of Liability">
        FundLens is provided on an "as is" basis without warranties of any kind. We are not liable
        for indirect, incidental, special, consequential, or punitive damages arising from your use
        of the service or from investment decisions made using the information provided.
      </Section>

      <Section title="7. Subscriptions and Billing">
        Paid subscriptions are billed monthly through Stripe. You may cancel at any time, and access
        continues until the end of the current billing period. Refunds are handled on a case-by-case
        basis.
      </Section>

      <Section title="8. Termination">
        We may suspend or terminate your account if these terms are violated. You may also delete
        your account at any time from the Settings page. Once terminated, your right to use the
        service ends immediately.
      </Section>

      <Section title="9. Changes to Terms">
        We reserve the right to modify these terms at any time. Material changes may be communicated
        by email or in-app notice. Continued use after those changes means you accept the revised
        terms.
      </Section>

      <Section title="10. Contact">
        If you have questions about these Terms, contact us at{' '}
        <span style={{ color: 'var(--accent-strong)' }}>support@fundlens.app</span>.
      </Section>
    </Box>
  </Box>
);

export default Terms;
