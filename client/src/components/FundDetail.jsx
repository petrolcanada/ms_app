import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFundDetail } from '../hooks/useFundDetail';

/**
 * FundDetail Component
 * Displays comprehensive information for a single fund
 * Shows basic info, fees, managers, and performance in organized sections
 */
const FundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: fund, isLoading, isError, error } = useFundDetail(id);

  const handleBack = () => {
    navigate('/');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            Error loading fund details
          </Typography>
          <Typography variant="body2">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Fund List
        </Button>
      </Box>
    );
  }

  // No data state
  if (!fund) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1">Fund not found</Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Fund List
        </Button>
      </Box>
    );
  }

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Number(value).toFixed(2)}%`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Fund List
      </Button>

      {/* Fund Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {fund.fundname || fund._name || 'N/A'}
            </Typography>
            {fund.legalname && fund.legalname !== fund.fundname && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Legal Name: {fund.legalname}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={fund.ticker || 'N/A'}
                variant="outlined"
                size="small"
              />
              <Chip
                label={fund.securitytype || fund.legalstructure || 'N/A'}
                color={fund.securitytype === 'ETF' ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          </Box>
          {fund.nav && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Net Asset Value
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(fund.nav)}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Information Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {fund.categoryname || fund.globalcategoryname || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Inception Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(fund.inceptiondate)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Domicile
                  </Typography>
                  <Typography variant="body1">
                    {fund.domicile || 'N/A'}
                  </Typography>
                </Box>
                
                {fund.currency && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body1">
                      {fund.currency}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fees and Costs Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fees and Costs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Management Expense Ratio (MER)
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {fund.mer ? formatPercentage(fund.mer) : 'N/A'}
                  </Typography>
                </Box>
                
                {fund.frontLoad !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Front-End Load
                    </Typography>
                    <Typography variant="body1">
                      {formatPercentage(fund.frontLoad)}
                    </Typography>
                  </Box>
                )}
                
                {fund.backLoad !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Back-End Load
                    </Typography>
                    <Typography variant="body1">
                      {formatPercentage(fund.backLoad)}
                    </Typography>
                  </Box>
                )}
                
                {fund.transactionFee !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Transaction Fee
                    </Typography>
                    <Typography variant="body1">
                      {formatPercentage(fund.transactionFee)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Managers Section */}
        {fund.managers && fund.managers.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Portfolio Managers
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {fund.managers.map((manager, index) => (
                    <Box key={index}>
                      <Typography variant="body1" fontWeight="medium">
                        {manager.name || 'N/A'}
                      </Typography>
                      {manager.tenure !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          Tenure: {manager.tenure} years
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Performance Section */}
        {fund.performance && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {fund.performance.ytd !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Year-to-Date (YTD)
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPercentage(fund.performance.ytd)}
                      </Typography>
                    </Box>
                  )}
                  
                  {fund.performance.oneYear !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        1 Year
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPercentage(fund.performance.oneYear)}
                      </Typography>
                    </Box>
                  )}
                  
                  {fund.performance.threeYear !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        3 Year
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPercentage(fund.performance.threeYear)}
                      </Typography>
                    </Box>
                  )}
                  
                  {fund.performance.fiveYear !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        5 Year
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPercentage(fund.performance.fiveYear)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Ranking Section */}
        {(fund.rank !== undefined || fund.totalInCategory !== undefined) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Ranking
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {fund.rank !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Rank
                      </Typography>
                      <Typography variant="h5" color="primary">
                        #{fund.rank}
                      </Typography>
                    </Box>
                  )}
                  
                  {fund.totalInCategory !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total in Category
                      </Typography>
                      <Typography variant="h5">
                        {fund.totalInCategory}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FundDetail;
