import { createTheme } from '@mui/material/styles';

const palettes = {
  dark: {
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
    scrollbar: '#1E293B #04060C',
  },
  light: {
    primary: {
      main: '#0F9D74',
      light: '#34D399',
      dark: '#0A7A5A',
    },
    secondary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#D97706',
    },
    info: {
      main: '#2563EB',
    },
    success: {
      main: '#0F9D74',
    },
    background: {
      default: '#F5F1E8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#162033',
      secondary: '#4A5B73',
      disabled: '#8A96A8',
    },
    divider: '#D7DEEA',
    scrollbar: '#C7D2E3 #F5F1E8',
  },
};

const createAppTheme = (mode = 'dark') => {
  const palette = palettes[mode] || palettes.dark;

  return createTheme({
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      error: palette.error,
      warning: palette.warning,
      info: palette.info,
      success: palette.success,
      background: palette.background,
      text: palette.text,
      divider: palette.divider,
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
      caption: { fontSize: '0.6875rem', color: palette.text.disabled },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: palette.scrollbar,
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
            border: `1px solid ${palette.divider}`,
          },
        },
      },
    },
  });
};

export default createAppTheme;
