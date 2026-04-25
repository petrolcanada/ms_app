import React from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useDashboard from '../hooks/useDashboard';
import SEO from './SEO';

const pickHighestReturn = (items = []) => {
  const ranked = items.filter(
    (item) => item?._id && item.return1yr != null && Number.isFinite(Number(item.return1yr)),
  );

  if (!ranked.length) {
    return items.find((item) => item?._id) || null;
  }

  return ranked.reduce((best, item) =>
    Number(item.return1yr) > Number(best.return1yr) ? item : best,
  );
};

const FundOverall = () => {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '420px' }}
      >
        <SEO title="Fund" path="/funds" noIndex />
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </Box>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load default fund." />;
  }

  const fund = pickHighestReturn(data.topPerformers || []);

  if (!fund?._id) {
    return <ErrorState message="No fund data is available." />;
  }

  return <Navigate to={`/funds/${fund._id}`} replace />;
};

const ErrorState = ({ message }) => (
  <Box>
    <SEO title="Fund" path="/funds" noIndex />
    <Box
      sx={{
        background: 'var(--red-soft)',
        border: '1px solid rgba(224, 72, 99, 0.24)',
        borderRadius: '20px',
        px: '20px',
        py: '18px',
        color: 'var(--red)',
        fontSize: '13px',
      }}
    >
      {message}
    </Box>
  </Box>
);

export default FundOverall;
