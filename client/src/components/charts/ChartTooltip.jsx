import React from 'react';
import Box from '@mui/material/Box';
import { designTokens } from '../../design/tokens';

const { cssVars } = designTokens;

const ChartTooltip = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        background: cssVars.color.elevated,
        border: `1px solid ${cssVars.color.border}`,
        borderRadius: cssVars.radius.sm,
        padding: '10px 14px',
        boxShadow: cssVars.shadow.soft,
        fontSize: '12px',
      }}
    >
      <Box sx={{ color: cssVars.color.textSubtle, mb: '6px', fontFamily: cssVars.font.mono }}>
        {labelFormatter ? labelFormatter(label) : label}
      </Box>
      {payload.map((entry) => (
        <Box
          key={entry.dataKey}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '2px' }}
        >
          <Box sx={{ width: '8px', height: '8px', borderRadius: '2px', background: entry.color }} />
          <Box sx={{ color: cssVars.color.textMuted, flex: 1 }}>{entry.name}</Box>
          <Box sx={{ color: entry.color, fontFamily: cssVars.font.mono, fontWeight: 500 }}>
            {valueFormatter ? valueFormatter(entry.value, entry) : entry.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ChartTooltip;
