import React from 'react';
import Box from '@mui/material/Box';

const StarRating = ({ rating, size = 'small' }) => {
  const isLarge = size === 'large';

  if (rating == null || rating === '') {
    return (
      <Box
        component="span"
        sx={{
          fontFamily: 'var(--font-body)',
          fontSize: isLarge ? '16px' : '12px',
          color: 'var(--text-4)',
        }}
      >
        N/A
      </Box>
    );
  }

  const filled = Math.round(Number(rating) || 0);
  const total = 5;

  return (
    <Box
      component="span"
      sx={{
        fontFamily: 'var(--font-body)',
        fontSize: isLarge ? '28px' : '13px',
        letterSpacing: isLarge ? '4px' : '1px',
        lineHeight: 1,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{ color: i < filled ? 'var(--amber)' : 'var(--text-4)' }}>
          &#9733;
        </span>
      ))}
    </Box>
  );
};

export default StarRating;
