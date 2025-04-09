import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SupplierDashboard = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [subscriptionPlan, setSubscriptionPlan] = useState('basic');

  // Mock data for dashboard
  const dashboardData = {
    totalProducts: 24,
    activeProducts: 18,
    totalOrders: 156,
    pendingOrders: 12,
    totalSales: 45600,
    thisMonthSales: 12500,
    approvalStatus: 'approved' // could be 'pending', 'approved', 'rejected'
  };

  const plans = [
    {
      name: 'basic',
      title: t('Basic Plan'),
      price: 250,
      yearlyPrice: 2500,
      features: [
        t('Up to 100 products'),
        t('Standard support'),
        t('Basic analytics'),
        t('3% commission per sale')
      ]
    },
    {
      name: 'premium',
      title: t('Premium Plan'),
      price: 500,
      yearlyPrice: 5000,
      features: [
        t('Unlimited products'),
        t('Priority support'),
        t('Advanced analytics'),
        t('Featured in marketplace'),
        t('Lower commission rates')
      ]
    }
  ];

  const handlePlanChange = (event) => {
    setSubscriptionPlan(event.target.value);
  };

  const handleUpgrade = () => {
    navigate('/supplier/subscription');
  };

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('Welcome')}, {currentUser?.firstName}!
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {t('Here\'s an overview of your supplier account')}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/supplier/products/create')}
          >
            {t('Add New Product')}
          </Button>
        </Box>
        
        {dashboardData.approvalStatus === 'pending' && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body1" color="warning.dark">
              {t('Your supplier account is pending approval. You can add products, but they won\'t be visible to dropshippers until your account is approved.')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('Total Products')}</Typography>
            <Typography variant="h3">{dashboardData.totalProducts}</Typography>
            <Typography variant="body2" color="textSecondary">
              {dashboardData.activeProducts} {t('active')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('Total Orders')}</Typography>
            <Typography variant="h3">{dashboardData.totalOrders}</Typography>
            <Typography variant="body2" color="textSecondary">
              {dashboardData.pendingOrders} {t('pending')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('Total Sales')}</Typography>
            <Typography variant="h3">₺{dashboardData.totalSales.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary">
              {t('All time')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('This Month')}</Typography>
            <Typography variant="h3">₺{dashboardData.thisMonthSales.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary">
              {t('Sales this month')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Subscription Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('Your Subscription')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} key={plan.name}>
              <Card 
                elevation={subscriptionPlan === plan.name ? 4 : 1}
                sx={{ 
                  height: '100%',
                  border: subscriptionPlan === plan.name ? '2px solid' : 'none',
                  borderColor: 'primary.main'
                }}
              >
                <CardHeader
                  title={plan.title}
                  titleTypographyProps={{ align: 'center', variant: 'h5' }}
                  sx={{
                    backgroundColor: subscriptionPlan === plan.name ? 'primary.light' : 'grey.100',
                    color: subscriptionPlan === plan.name ? 'primary.contrastText' : 'text.primary'
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                    <Typography component="h2" variant="h3" color="text.primary">
                      ₺{plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /{t('mo')}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                    {t('or')} ₺{plan.yearlyPrice}/{t('year')} (2 {t('months free')})
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    {subscriptionPlan === plan.name ? (
                      <Button variant="outlined" disabled>
                        {t('Current Plan')}
                      </Button>
                    ) : (
                      <Button variant="contained" color="primary" onClick={handleUpgrade}>
                        {t('Upgrade')}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Orders Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            {t('Recent Orders')}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/supplier/orders')}>
            {t('View All Orders')}
          </Button>
        </Box>
        
        {/* Mock order data - would be replaced with real data */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container>
                <Grid item xs={2}>
                  <Typography variant="subtitle2">{t('Order')} #12345</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">2025-04-08 14:32</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">₺450.00 (3 {t('items')})</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>{t('Paid')}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button size="small" variant="outlined">{t('Details')}</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container>
                <Grid item xs={2}>
                  <Typography variant="subtitle2">{t('Order')} #12344</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">2025-04-07 09:15</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">₺275.50 (2 {t('items')})</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ color: 'warning.main' }}>{t('Processing')}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button size="small" variant="outlined">{t('Details')}</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container>
                <Grid item xs={2}>
                  <Typography variant="subtitle2">{t('Order')} #12343</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">2025-04-06 16:48</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">₺1,250.00 (5 {t('items')})</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ color: 'info.main' }}>{t('Shipped')}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button size="small" variant="outlined">{t('Details')}</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SupplierDashboard;
