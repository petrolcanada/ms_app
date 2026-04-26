import React from 'react';
import Box from '@mui/material/Box';

const buildBarGradient = (color) => {
  const tintedEdge = `color-mix(in srgb, ${color} 52%, white)`;
  return `linear-gradient(90deg, ${tintedEdge}, ${color})`;
};

const PerfBar = ({ label, value, percentage, labelWidth = '60px' }) => {
  const isPositive = percentage >= 0;
  const barWidth = Math.min(Math.abs(percentage), 100);
  const barColor = isPositive ? 'var(--emerald)' : 'var(--red)';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '12px' }}>
      <Box
        sx={{
          fontSize: '12px',
          color: 'var(--text-3)',
          width: labelWidth,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {label}
      </Box>
      <Box sx={{ flex: 1, py: '2px' }}>
        <Box
          sx={{
            height: '10px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${barWidth}%`,
              minWidth: barWidth > 0 ? '10px' : 0,
              borderRadius: '999px',
              background: buildBarGradient(barColor),
              boxShadow: isPositive
                ? 'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(16, 185, 129, 0.32)'
                : 'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(239, 68, 68, 0.28)',
              transition: 'width 800ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
          width: '65px',
          textAlign: 'right',
          flexShrink: 0,
          color: isPositive ? 'var(--emerald)' : 'var(--red)',
        }}
      >
        {value}
      </Box>
    </Box>
  );
};

export default PerfBar;
