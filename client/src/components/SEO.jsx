import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'FundLens';
const DEFAULT_DESCRIPTION = 'Powerful analytics for mutual funds and ETFs across US and Canadian markets. Screen, compare, and analyze with institutional-grade data.';

const SEO = ({ title, description, path, noIndex }) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Fund Analytics`;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = path ? `https://fundlens.app${path}` : undefined;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEO;
