import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import theme from './theme';
import FundList from './components/FundList';
import FundDetail from './components/FundDetail';

// Create a QueryClient instance with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                Fund Data Dashboard
              </Typography>
              <Routes>
                <Route path="/" element={<FundList />} />
                <Route path="/funds/:id" element={<FundDetail />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
