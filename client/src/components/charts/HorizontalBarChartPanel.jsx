import React from 'react';
import Box from '@mui/material/Box';
import { designTokens } from '../../design/tokens';

const PANEL_SX = {
  ...designTokens.card.panel,
  position: 'relative',
  overflow: 'hidden',
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const truncateLabel = (value, maxLength) => {
  if (typeof value !== 'string') return value;
  if (!maxLength || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

const resolveHeight = (value) => {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const buildGlow = (color, { subtle = false } = {}) =>
  subtle
    ? `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.12)`
    : `inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px ${
        color === 'var(--red)' ? 'rgba(255, 98, 122, 0.32)' : color
      }`;

const buildBarGradient = (color, { diverging = false, negative = false } = {}) => {
  const tintedEdge = `color-mix(in srgb, ${color} 52%, white)`;

  if (!diverging) {
    return `linear-gradient(90deg, ${tintedEdge}, ${color})`;
  }

  return negative
    ? `linear-gradient(90deg, ${color}, ${tintedEdge})`
    : `linear-gradient(90deg, ${tintedEdge}, ${color})`;
};

const HorizontalBarChartPanel = ({
  title,
  subtitle,
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  valueFormatter = (value) => value,
  detailFormatter,
  fill = 'var(--accent)',
  negativeFill = 'var(--red)',
  variant = 'progress',
  emptyLabel = 'No data available.',
  labelMaxLength = 18,
  minHeight = '380px',
  chartHeight,
  maxValue,
  detailColorFormatter,
  sx,
}) => {
  const maxAbsValue =
    maxValue ??
    data.reduce((largest, item) => {
      const numeric = Math.abs(toNumber(item?.[valueKey]) ?? 0);
      return Math.max(largest, numeric);
    }, 0);
  const progressDomain = maxValue ?? 100;
  const contentMinHeight = resolveHeight(chartHeight);

  return (
    <Box sx={{ ...PANEL_SX, p: '22px', minHeight, ...sx }}>
      <Box sx={{ mb: '18px' }}>
        <Box
          sx={{
            fontFamily: 'var(--font-head)',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-1)',
            mb: '4px',
          }}
        >
          {title}
        </Box>
        <Box sx={{ fontSize: '12px', color: 'var(--text-4)' }}>{subtitle}</Box>
      </Box>

      {data.length ? (
        <Box sx={{ display: 'grid', gap: '12px', minHeight: contentMinHeight }}>
          {data.map((item, index) => {
            const value = toNumber(item?.[valueKey]);
            const label = item?.[labelKey] ?? '--';
            const detail = detailFormatter
              ? detailFormatter(item, value, index)
              : valueFormatter(value, item, index);
            const detailColor = detailColorFormatter
              ? detailColorFormatter(item, value, index)
              : variant === 'diverging' && value != null
                ? value >= 0
                  ? 'var(--emerald)'
                  : 'var(--red)'
                : 'var(--text-4)';
            const barColor =
              variant === 'diverging' && value != null && value < 0 ? negativeFill : fill;
            const barGlow = buildGlow(barColor, { subtle: variant === 'diverging' });
            const barBackground = buildBarGradient(barColor, {
              diverging: variant === 'diverging',
              negative: variant === 'diverging' && value != null && value < 0,
            });
            const normalized =
              variant === 'diverging'
                ? clamp((Math.abs(value ?? 0) / Math.max(maxAbsValue, 1)) * 50, 0, 50)
                : clamp(((value ?? 0) / Math.max(progressDomain, 1)) * 100, 0, 100);
            const hasValue = value != null && Math.abs(value) > 0;
            const minBarWidth = hasValue ? '10px' : 0;

            return (
              <Box key={`${String(label)}-${index}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    mb: '6px',
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '13px',
                      color: 'var(--text-2)',
                      fontWeight: 600,
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                      pr: '8px',
                    }}
                    title={typeof label === 'string' ? label : undefined}
                  >
                    {truncateLabel(label, labelMaxLength == null ? null : labelMaxLength + 8)}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '12px',
                      color: detailColor,
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {detail}
                  </Box>
                </Box>

                <Box sx={{ py: '2px' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '10px',
                      borderRadius: '999px',
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                      border: '1px solid rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    {variant === 'diverging' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: '50%',
                          width: '1px',
                          background: 'rgba(255,255,255,0.22)',
                          transform: 'translateX(-0.5px)',
                        }}
                      />
                    )}

                    {variant === 'diverging' ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          width: hasValue ? `max(${normalized}%, ${minBarWidth})` : 0,
                          ...(value != null && value < 0
                            ? {
                                right: '50%',
                                borderRadius: '999px 0 0 999px',
                                background: barBackground,
                              }
                            : {
                                left: '50%',
                                borderRadius: '0 999px 999px 0',
                                background: barBackground,
                              }),
                          boxShadow: barGlow,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          width: hasValue ? `max(${normalized}%, ${minBarWidth})` : 0,
                          borderRadius: '999px',
                          background: barBackground,
                          boxShadow: barGlow,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: contentMinHeight || '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-4)',
            fontSize: '13px',
            textAlign: 'center',
          }}
        >
          {emptyLabel}
        </Box>
      )}
    </Box>
  );
};

export default HorizontalBarChartPanel;
