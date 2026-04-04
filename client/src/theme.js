import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    secondary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#04060C',
      paper: '#0E1521',
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: '#1E293B',
  },
  typography: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    h1: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: '-0.03em' },
    h2: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: '-0.03em' },
    h3: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.6875rem', color: '#64748B' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#1E293B #04060C',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E293B',
        },
      },
    },
  },
});

export default theme;
