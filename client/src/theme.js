import { createTheme } from '@mui/material/styles';
import { designTokens, getSemanticPalette } from './design/tokens';

const createAppTheme = (mode = 'dark') => {
  const palette = getSemanticPalette(mode);
  const { cssVars, fontStack } = designTokens;

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
      fontFamily: fontStack.body,
      h1: { fontFamily: fontStack.heading, fontWeight: 800, letterSpacing: 0 },
      h2: { fontFamily: fontStack.heading, fontWeight: 800, letterSpacing: 0 },
      h3: { fontFamily: fontStack.heading, fontWeight: 700, letterSpacing: 0 },
      h4: { fontFamily: fontStack.heading, fontWeight: 700, letterSpacing: 0 },
      h5: { fontFamily: fontStack.heading, fontWeight: 700, letterSpacing: 0 },
      h6: { fontFamily: fontStack.heading, fontWeight: 700, letterSpacing: 0 },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem', color: palette.text.disabled },
      button: {
        fontFamily: fontStack.body,
        fontWeight: 700,
        letterSpacing: 0,
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
            borderRadius: cssVars.radius.sm,
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
    app: designTokens,
  });
};

export default createAppTheme;
