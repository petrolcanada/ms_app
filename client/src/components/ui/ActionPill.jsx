import React from 'react';
import Box from '@mui/material/Box';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const TONES = {
  accent: {
    border: 'rgba(111, 76, 245, 0.28)',
    borderHover: 'rgba(111, 76, 245, 0.48)',
    bg: 'rgba(111, 76, 245, 0.08)',
    bgHover: 'rgba(111, 76, 245, 0.14)',
    color: 'var(--accent-strong)',
    colorHover: 'var(--accent-strong)',
  },
  emerald: {
    border: 'rgba(23, 201, 120, 0.26)',
    borderHover: 'rgba(23, 201, 120, 0.46)',
    bg: 'rgba(23, 201, 120, 0.08)',
    bgHover: 'rgba(23, 201, 120, 0.14)',
    color: 'var(--emerald)',
    colorHover: 'var(--emerald)',
  },
  neutral: {
    border: 'rgba(100, 116, 139, 0.28)',
    borderHover: 'rgba(100, 116, 139, 0.48)',
    bg: 'rgba(100, 116, 139, 0.08)',
    bgHover: 'rgba(100, 116, 139, 0.14)',
    color: 'var(--text-2)',
    colorHover: 'var(--text-1)',
  },
};

const valueSx = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const actionSx = {
  color: 'var(--text-3)',
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

export const PillSeparator = () => <span style={{ color: 'var(--text-4)' }}>&middot;</span>;

const ActionPill = ({
  value,
  action,
  tone = 'accent',
  chevron = 'right',
  component = 'button',
  sx,
  children,
  ...props
}) => {
  const colors = TONES[tone] || TONES.accent;
  const buttonProps = component === 'button' ? { type: props.type || 'button' } : {};

  return (
    <Box
      component={component}
      {...buttonProps}
      {...props}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        maxWidth: '100%',
        px: '8px',
        py: '3px',
        border: `1px solid ${colors.border}`,
        borderRadius: '999px',
        background: colors.bg,
        color: colors.color,
        textDecoration: 'none',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1.2,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition:
          'color var(--transition), border-color var(--transition), background var(--transition), opacity var(--transition)',
        '&:hover': props.disabled
          ? {}
          : {
              background: colors.bgHover,
              borderColor: colors.borderHover,
              color: colors.colorHover,
            },
        '&:focus-visible': {
          outline: '2px solid var(--accent-ring)',
          outlineOffset: '2px',
        },
        ...sx,
      }}
    >
      {children || (
        <>
          <Box component="span" sx={valueSx}>
            {value}
          </Box>
          <Box component="span" sx={actionSx}>
            {action}
          </Box>
          <ChevronRightIcon
            sx={{
              fontSize: 15,
              flexShrink: 0,
              transform: chevron === 'down' ? 'rotate(90deg)' : undefined,
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ActionPill;
