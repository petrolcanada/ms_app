import React from 'react';
import Box from '@mui/material/Box';

const StarRating = ({ rating = 0, size = 'small' }) => {
  const filled = Math.round(Number(rating) || 0);
  const total = 5;
  const isLarge = size === 'large';

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
        <span
          key={i}
          style={{ color: i < filled ? 'var(--amber)' : 'var(--text-4)' }}
        >
          &#9733;
        </span>
      ))}
    </Box>
  );
};

export default StarRating;
