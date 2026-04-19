import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ color: 'var(--text-1)', fontFamily: 'var(--font-head)' }}>
            Something went wrong
          </Typography>
          <Typography sx={{ color: 'var(--text-3)', maxWidth: 480 }}>
            An unexpected error occurred. You can try reloading the page or navigating back.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              Reload Page
            </Button>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                bgcolor: 'var(--accent)',
                '&:hover': { bgcolor: 'var(--accent)', opacity: 0.9 },
              }}
            >
              Try Again
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
