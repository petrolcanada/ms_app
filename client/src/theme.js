import { createTheme } from '@mui/material/styles';

const palettes = {
  dark: {
    primary: {
      main: '#6F4CF5',
      light: '#9174FF',
      dark: '#5639D3',
    },
    secondary: {
      main: '#8C7BFF',
      light: '#A89DFF',
      dark: '#6658D6',
    },
    error: {
      main: '#FF627A',
    },
    warning: {
      main: '#F4B860',
    },
    info: {
      main: '#8C7BFF',
    },
    success: {
      main: '#17C978',
    },
    background: {
      default: '#090711',
      paper: '#14111F',
    },
    text: {
      primary: '#F7F6FF',
      secondary: '#BBB5D6',
      disabled: '#726B92',
    },
    divider: '#26203A',
    scrollbar: '#2A2441 #090711',
  },
  light: {
    primary: {
      main: '#6A44FF',
      light: '#8568FF',
      dark: '#4D31D8',
    },
    secondary: {
      main: '#5448D8',
      light: '#7A71E7',
      dark: '#4238B7',
    },
    error: {
      main: '#E04863',
    },
    warning: {
      main: '#C98A32',
    },
    info: {
      main: '#5448D8',
    },
    success: {
      main: '#149E62',
    },
    background: {
      default: '#F4F6FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101223',
      secondary: '#4D5473',
      disabled: '#9096B1',
    },
    divider: '#DDE3F0',
    scrollbar: '#C8D0E4 #F4F6FB',
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
      fontFamily: "'IBM Plex Sans', sans-serif",
      h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, letterSpacing: '-0.05em' },
      h2: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, letterSpacing: '-0.05em' },
      h3: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: '-0.04em' },
      h4: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: '-0.03em' },
      h5: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem', color: palette.text.disabled },
      button: {
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 14,
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
            fontWeight: 700,
            borderRadius: 12,
            paddingInline: 16,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${palette.divider}`,
            boxShadow:
              mode === 'dark'
                ? '0 18px 48px rgba(4, 3, 10, 0.48)'
                : '0 18px 48px rgba(28, 33, 56, 0.08)',
          },
        },
      },
    },
  });
};

export default createAppTheme;
