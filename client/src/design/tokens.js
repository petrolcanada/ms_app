const fontStack = {
  heading: "'Manrope', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const semanticPalettes = {
  dark: {
    primary: { main: '#6F4CF5', light: '#9174FF', dark: '#5639D3' },
    secondary: { main: '#8C7BFF', light: '#A89DFF', dark: '#6658D6' },
    error: { main: '#FF627A' },
    warning: { main: '#F4B860' },
    info: { main: '#8C7BFF' },
    success: { main: '#17C978' },
    background: { default: '#090711', paper: '#14111F' },
    text: { primary: '#F7F6FF', secondary: '#BBB5D6', disabled: '#726B92' },
    divider: '#26203A',
    scrollbar: '#2A2441 #090711',
    metaThemeColor: '#090711',
  },
  light: {
    primary: { main: '#6A44FF', light: '#8568FF', dark: '#4D31D8' },
    secondary: { main: '#5448D8', light: '#7A71E7', dark: '#4238B7' },
    error: { main: '#E04863' },
    warning: { main: '#C98A32' },
    info: { main: '#5448D8' },
    success: { main: '#149E62' },
    background: { default: '#F4F6FB', paper: '#FFFFFF' },
    text: { primary: '#101223', secondary: '#4D5473', disabled: '#9096B1' },
    divider: '#DDE3F0',
    scrollbar: '#C8D0E4 #F4F6FB',
    metaThemeColor: '#F4F6FB',
  },
};

const cssVars = {
  color: {
    bgVoid: 'var(--bg-void)',
    bgBase: 'var(--bg-base)',
    surface: 'var(--bg-surface)',
    surfaceHover: 'var(--bg-surface-hover)',
    elevated: 'var(--bg-elevated)',
    border: 'var(--border)',
    borderHover: 'var(--border-hover)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSubtle: 'var(--text-3)',
    textDisabled: 'var(--text-4)',
    accent: 'var(--accent)',
    accentStrong: 'var(--accent-strong)',
    accentSoft: 'var(--accent-soft)',
    accentRing: 'var(--accent-ring)',
    positive: 'var(--emerald)',
    positiveSoft: 'var(--emerald-soft)',
    negative: 'var(--red)',
    negativeSoft: 'var(--red-soft)',
    info: 'var(--blue)',
    infoSoft: 'var(--blue-soft)',
    warning: 'var(--amber)',
    warningSoft: 'var(--amber-soft)',
    rowBorder: 'var(--row-border)',
    barTrack: 'var(--bar-track)',
  },
  font: {
    heading: 'var(--font-head)',
    body: 'var(--font-body)',
    mono: 'var(--font-mono)',
  },
  radius: {
    sm: 'var(--radius)',
    md: 'var(--radius-lg)',
    lg: 'var(--radius-xl)',
    pill: 'var(--radius-pill)',
  },
  shadow: {
    soft: 'var(--shadow-soft)',
    strong: 'var(--shadow-strong)',
    panel: 'var(--shadow-panel)',
  },
  transition: {
    base: 'var(--transition)',
  },
};

const card = {
  surface: {
    background: cssVars.color.surface,
    border: `1px solid ${cssVars.color.border}`,
    borderRadius: cssVars.radius.md,
    boxShadow: 'none',
  },
  panel: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: `1px solid ${cssVars.color.border}`,
    borderRadius: cssVars.radius.lg,
    boxShadow: cssVars.shadow.panel,
  },
  stat: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: `1px solid ${cssVars.color.border}`,
    borderRadius: '24px',
    boxShadow: cssVars.shadow.panel,
  },
};

const chart = {
  height: 320,
  margin: { top: 10, right: 20, bottom: 10, left: 10 },
  colors: {
    primary: cssVars.color.accentStrong,
    comparison: cssVars.color.warning,
    positive: cssVars.color.positive,
    negative: cssVars.color.negative,
    assets: cssVars.color.info,
    neutral: cssVars.color.textMuted,
  },
  grid: {
    stroke: cssVars.color.border,
    strokeDasharray: '3 3',
    opacity: 0.5,
  },
  axis: {
    fontSize: 11,
    fill: cssVars.color.textDisabled,
    fontFamily: cssVars.font.mono,
  },
  legend: {
    fontSize: '11px',
    color: cssVars.color.textSubtle,
  },
};

const typography = {
  labelCaps: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: cssVars.font.heading,
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: 0,
  },
  metricValue: {
    fontFamily: cssVars.font.mono,
    fontSize: '24px',
    fontWeight: 500,
    letterSpacing: 0,
  },
};

export const designTokens = {
  fontStack,
  semanticPalettes,
  cssVars,
  card,
  chart,
  typography,
};

export const getSemanticPalette = (mode = 'dark') =>
  semanticPalettes[mode] || semanticPalettes.dark;

export default designTokens;
