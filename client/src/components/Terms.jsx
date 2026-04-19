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
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-1)',
        mb: '12px',
      }}
    >
      {title}
    </Box>
    <Box sx={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.75 }}>{children}</Box>
  </Box>
);

const Terms = () => (
  <Box sx={{ background: 'var(--bg-void)', minHeight: '100vh', color: 'var(--text-1)' }}>
    <SEO title="Terms of Service" path="/terms" />
    {/* Accent line */}
    <Box
      sx={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--emerald), var(--blue), transparent)',
        opacity: 0.5,
      }}
    />

    {/* Navbar */}
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
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: '16px', md: '32px' },
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text-1)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: 'var(--emerald)', fontSize: '20px' }}>&#9670;</span>
          FundLens
        </Link>
        <Link
          to="/"
          style={{
            fontSize: '13px',
            color: 'var(--text-3)',
            textDecoration: 'none',
          }}
        >
          ← Back to Home
        </Link>
      </Box>
    </Box>

    {/* Content */}
    <Box
      sx={{
        maxWidth: '800px',
        mx: 'auto',
        px: { xs: '16px', md: '32px' },
        py: '48px',
      }}
    >
      <Box
        component="h1"
        sx={{
          fontFamily: 'var(--font-head)',
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-1)',
          mb: '8px',
        }}
      >
        Terms of Service
      </Box>
      <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '40px' }}>
        Last updated: April 5, 2026
      </Box>

      <Section title="1. Acceptance of Terms">
        By accessing or using FundLens ("the Service"), you agree to be bound by these Terms of
        Service. If you do not agree to these terms, please do not use the Service. We reserve the
        right to update these terms at any time, and continued use of the Service constitutes
        acceptance of any changes.
      </Section>

      <Section title="2. Description of Service">
        FundLens provides analytics, screening, comparison, and data visualization tools for mutual
        funds and ETFs across US and Canadian markets. The data is provided for informational
        purposes only and should not be construed as financial advice. FundLens does not provide
        investment recommendations.
      </Section>

      <Section title="3. User Accounts">
        You are responsible for maintaining the confidentiality of your account credentials. You
        agree to provide accurate and complete information when creating an account and to update
        such information as needed. You are responsible for all activity that occurs under your
        account.
      </Section>

      <Section title="4. Acceptable Use">
        You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain
        unauthorized access to any part of the Service; (c) scrape, crawl, or use automated means to
        extract data from the Service beyond normal API usage; (d) resell, redistribute, or
        commercially exploit the data without prior written consent; or (e) interfere with the
        proper functioning of the Service.
      </Section>

      <Section title="5. Intellectual Property">
        All content, design, code, and data compilations within FundLens are the intellectual
        property of FundLens or its licensors. Underlying fund data is sourced from third-party
        providers, including Morningstar, and is subject to their respective terms.
      </Section>

      <Section title="6. Limitation of Liability">
        The Service is provided "as is" without warranties of any kind. FundLens shall not be liable
        for any indirect, incidental, special, consequential, or punitive damages arising from your
        use of the Service, including any investment decisions made based on information provided by
        the Service.
      </Section>

      <Section title="7. Subscriptions & Billing">
        Paid subscriptions are billed on a monthly basis through Stripe. You may cancel at any time,
        and your access will continue through the end of the current billing period. Refunds are
        handled on a case-by-case basis.
      </Section>

      <Section title="8. Termination">
        We may suspend or terminate your account at our discretion if you violate these terms. Upon
        termination, your right to use the Service ceases immediately. You may delete your account
        at any time through the Settings page.
      </Section>

      <Section title="9. Changes to Terms">
        We reserve the right to modify these terms at any time. Material changes will be
        communicated via email or in-app notice. Continued use of the Service after changes
        constitutes acceptance of the revised terms.
      </Section>

      <Section title="10. Contact">
        If you have questions about these Terms, please contact us at{' '}
        <span style={{ color: 'var(--emerald)' }}>support@fundlens.app</span>.
      </Section>
    </Box>
  </Box>
);

export default Terms;
