import React from 'react';
import Box from '@mui/material/Box';
import { designTokens } from '../../design/tokens';

const { card, cssVars, typography } = designTokens;

const variants = {
  surface: card.surface,
  panel: card.panel,
  stat: card.stat,
};

const AppCard = ({
  as: component = 'section',
  variant = 'surface',
  title,
  subtitle,
  action,
  interactive = false,
  fullWidth = false,
  children,
  sx,
  headerSx,
  contentSx,
  ...props
}) => {
  const baseVariant = variants[variant] || variants.surface;

  return (
    <Box
      component={component}
      sx={{
        ...baseVariant,
        position: 'relative',
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        transition:
          'border-color var(--transition), transform var(--transition), box-shadow var(--transition)',
        ...(interactive
          ? {
              cursor: 'pointer',
              '&:hover': {
                borderColor: cssVars.color.borderHover,
                transform: 'translateY(-1px)',
                boxShadow: variant === 'surface' ? baseVariant.boxShadow : cssVars.shadow.strong,
              },
            }
          : {}),
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            mb: children ? '20px' : 0,
            ...headerSx,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Box
                sx={{
                  ...typography.cardTitle,
                  color: cssVars.color.textMuted,
                }}
              >
                {title}
              </Box>
            )}
            {subtitle && (
              <Box sx={{ mt: '4px', fontSize: '12px', color: cssVars.color.textDisabled }}>
                {subtitle}
              </Box>
            )}
          </Box>
          {action}
        </Box>
      )}
      <Box sx={contentSx}>{children}</Box>
    </Box>
  );
};

export default AppCard;
