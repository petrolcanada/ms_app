import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAvailableDates } from '../hooks/useAvailableDates';

const selectStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  padding: '10px 16px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 180ms ease',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23475569' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
  whiteSpace: 'nowrap',
};

const formatDateLabel = (isoDate) => {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AsOfDateSelector = ({ value, onChange, compact = false }) => {
  const { data: dates, isLoading } = useAvailableDates();

  if (isLoading) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {!compact && <Label />}
        <CircularProgress size={16} sx={{ color: 'var(--text-4)' }} />
      </Box>
    );
  }

  if (!dates || dates.length === 0) return null;

  const selected = value || dates[0] || '';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {!compact && <Label />}
      <Box
        component="select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          ...selectStyle,
          '&:hover': {
            borderColor: 'var(--border-hover)',
            background: 'var(--bg-surface-hover)',
            color: 'var(--text-1)',
          },
          '&:focus': {
            borderColor: 'var(--emerald)',
            boxShadow: '0 0 0 2px var(--emerald-soft)',
          },
        }}
      >
        {dates.map((d) => (
          <option key={d} value={d}>
            {formatDateLabel(d)}
          </option>
        ))}
      </Box>
    </Box>
  );
};

const Label = () => (
  <Box
    component="span"
    sx={{
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--text-3)',
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
    }}
  >
    As of
  </Box>
);

export default AsOfDateSelector;
