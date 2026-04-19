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

const Privacy = () => (
  <Box sx={{ background: 'var(--bg-void)', minHeight: '100vh', color: 'var(--text-1)' }}>
    <SEO title="Privacy Policy" path="/privacy" />
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
        Privacy Policy
      </Box>
      <Box sx={{ fontSize: '13px', color: 'var(--text-4)', mb: '40px' }}>
        Last updated: April 5, 2026
      </Box>

      <Section title="1. Information We Collect">
        When you create a FundLens account, we collect your name, email address, and password
        (stored in hashed form). During use of the Service, we may collect usage data such as pages
        visited, features used, screener configurations, and watchlist selections to improve the
        product experience.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your information to: (a) provide and maintain the Service; (b) process transactions
        and manage subscriptions; (c) send important notifications about your account or the
        Service; (d) improve and personalize the user experience; and (e) comply with legal
        obligations.
      </Section>

      <Section title="3. Data Storage">
        Your data is stored on secure servers. We implement industry-standard security measures
        including encryption in transit (TLS) and at rest. We retain your data for as long as your
        account is active or as needed to provide the Service.
      </Section>

      <Section title="4. Third-Party Services">
        FundLens uses the following third-party services:
        <Box component="ul" sx={{ mt: '8px', pl: '20px', '& li': { mb: '6px' } }}>
          <li>
            <strong style={{ color: 'var(--text-1)' }}>Stripe</strong> — for payment processing.
            Your payment information is handled directly by Stripe and is never stored on our
            servers. See Stripe's privacy policy at stripe.com/privacy.
          </li>
          <li>
            <strong style={{ color: 'var(--text-1)' }}>Morningstar</strong> — as a data source for
            fund information. We do not share your personal data with Morningstar.
          </li>
        </Box>
      </Section>

      <Section title="5. Cookies">
        FundLens uses essential cookies and local storage to maintain your authentication session.
        We do not use third-party tracking cookies or advertising cookies.
      </Section>

      <Section title="6. Your Rights">
        You have the right to: (a) access the personal data we hold about you; (b) request
        correction of inaccurate data; (c) request deletion of your account and data through the
        Settings page; and (d) export your data upon request. To exercise these rights, contact us
        at the email below.
      </Section>

      <Section title="7. Data Retention">
        We retain your personal data for as long as your account is active. If you delete your
        account, we will remove your personal data within 30 days. Anonymized, aggregated usage data
        may be retained for analytics purposes.
      </Section>

      <Section title="8. Children's Privacy">
        FundLens is not intended for use by individuals under the age of 18. We do not knowingly
        collect personal information from children.
      </Section>

      <Section title="9. Changes to This Policy">
        We may update this Privacy Policy from time to time. Material changes will be communicated
        via email or in-app notice. Continued use of the Service after changes constitutes
        acceptance of the revised policy.
      </Section>

      <Section title="10. Contact">
        If you have questions about this Privacy Policy or your data, please contact us at{' '}
        <span style={{ color: 'var(--emerald)' }}>privacy@fundlens.app</span>.
      </Section>
    </Box>
  </Box>
);

export default Privacy;
