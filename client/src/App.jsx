import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from './theme';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import FundList from './components/FundList';
import FundDetail from './components/FundDetail';
import Screener from './components/Screener';
import Compare from './components/Compare';
import CategoryOverview from './components/CategoryOverview';
import Watchlist from './components/Watchlist';
import Settings from './components/Settings';
import Pricing from './components/Pricing';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import NotFound from './components/NotFound';

const THEME_STORAGE_KEY = 'fundlens_theme_mode';
const THEME_COLORS = {
  dark: '#090711',
  light: '#F4F6FB',
};

const resolveInitialThemeMode = () => {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    /* ignore storage failures */
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [themeMode, setThemeMode] = useState(resolveInitialThemeMode);
  const theme = createAppTheme(themeMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.documentElement.style.colorScheme = themeMode;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      /* ignore storage failures */
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', THEME_COLORS[themeMode]);
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <AuthProvider>
              <Router>
                <Routes>
                  {/* Public pages (no Layout wrapper) */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Authenticated app pages (Layout wrapper + auth guard) */}
                  <Route element={<ProtectedRoute />}>
                    <Route
                      element={<Layout themeMode={themeMode} onToggleTheme={toggleThemeMode} />}
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/explorer" element={<FundList />} />
                      <Route path="/funds/:id" element={<FundDetail />} />
                      <Route path="/screener" element={<Screener />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/categories/:name" element={<CategoryOverview />} />
                      <Route path="/watchlist" element={<Watchlist />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
