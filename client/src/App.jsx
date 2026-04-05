import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import './styles/global.css';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FundList from './components/FundList';
import FundDetail from './components/FundDetail';
import Screener from './components/Screener';
import Compare from './components/Compare';
import CategoryOverview from './components/CategoryOverview';
import Watchlist from './components/Watchlist';

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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explorer" element={<FundList />} />
              <Route path="/funds/:id" element={<FundDetail />} />
              <Route path="/screener" element={<Screener />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/categories/:name" element={<CategoryOverview />} />
              <Route path="/watchlist" element={<Watchlist />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
