import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const SubscriptionManagement = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [commissionStats, setCommissionStats] = useState(null);
  
  const [openSubscribeDialog, setOpenSubscribeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  useEffect(() => {
    fetchSubscriptionData();
  }, []);
  
  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription plans
      const plansRes = await axios.get('/api/payments/subscription-plans');
      setSubscriptionPlans(plansRes.data);
      
      try {
        // Fetch current subscription (may not exist)
        const currentSubRes = await axios.get('/api/payments/current-subscription');
        setCurrentSubscription(currentSubRes.data);
      } catch (err) {
        // No subscription found, that's okay
        setCurrentSubscription(null);
      }
      
      // Fetch subscription history
      const historyRes = await axios.get('/api/payments/subscription-history');
      setSubscriptionHistory(historyRes.data);
      
      // Fetch payment history
      const paymentsRes = await axios.get('/api/payments/payment-history');
      setPaymentHistory(paymentsRes.data);
      
      // Fetch commission statistics
      const statsRes = await axios.get('/api/payments/commission-statistics');
      setCommissionStats(statsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      showSnackbar(t('Failed to load subscription data'), 'error');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenSubscribeDialog = (plan) => {
    setSelectedPlan(plan);
    setOpenSubscribeDialog(true);
  };
  
  const handleCloseSubscribeDialog = () => {
    setOpenSubscribeDialog(false);
    setSelectedPlan(null);
    setPaymentMethod('credit_card');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvc('');
  };
  
  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };
  
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
  };
  
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  const handleSubscribe = async () => {
    try {
      if (paymentMethod === 'credit_card' && (!cardNumber || !cardName || !cardExpiry || !cardCvc)) {
        showSnackbar(t('Please fill in all card details'), 'warning');
        return;
      }
      
      setLoading(true);
      
      // Prepare payment details based on method
      let paymentDetails = {};
      
      if (paymentMethod === 'credit_card') {
        paymentDetails = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          cardExpiry,
          cardCvc
        };
      } else if (paymentMethod === 'bank_transfer') {
        paymentDetails = {
          bankTransferReference: 'BT' + Date.now()
        };
      }
      
      const res = await axios.post('/api/payments/subscribe', {
        planId: selectedPlan._id,
        paymentMethod,
        paymentDetails
      });
      
      setCurrentSubscription(res.data.subscription);
      
      // Add the new subscription to history
      setSubscriptionHistory([res.data.subscription, ...subscriptionHistory]);
      
      // Add the payment to history
      setPaymentHistory([res.data.payment, ...paymentHistory]);
      
      handleCloseSubscribeDialog();
      setLoading(false);
      showSnackbar(t('Successfully subscribed to plan'), 'success');
      
      // Refresh data
      fetchSubscriptionData();
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      showSnackbar(t('Failed to subscribe to plan'), 'error');
      setLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      
      const res = await axios.post('/api/payments/cancel-subscription', {
        reason: cancelReason
      });
      
      // Update current subscription
      setCurrentSubscription(res.data.subscription);
      
      // Update subscription in history
      setSubscriptionHistory(subscriptionHistory.map(sub => 
        sub._id === res.data.subscription._id ? res.data.subscription : sub
      ));
      
      handleCloseCancelDialog();
      setLoading(false);
      showSnackbar(t('Subscription canceled successfully'), 'success');
      
      // Refresh data
      fetchSubscriptionData();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      showSnackbar(t('Failed to cancel subscription'), 'error');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const formatCurrency = (amount, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };
  
  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'canceled':
        return 'error';
      case 'expired':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'subscription':
        return <ReceiptIcon />;
      case 'commission':
        return <AttachMoneyIcon />;
      case 'refund':
        return <MoneyOffIcon />;
      default:
        return <PaymentIcon />;
    }
  };
  
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon />;
      case 'bank_transfer':
        return <AccountBalanceIcon />;
      case 'paypal':
        return <PaymentIcon />;
      default:
        return <PaymentIcon />;
    }
  };
  
  // Prepare chart data for commission statistics
  const prepareChartData = () => {
    if (!commissionStats || !commissionStats.chartData) {
      return {
        labels: [],
        datasets: [
          {
            label: t('Commission Amount'),
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }
        ]
      };
    }
    
    return {
      labels: commissionStats.chartData.map(item => item.date),
      datasets: [
        {
          label: t('Commission Amount'),
          data: commissionStats.chartData.map(item => item.amount),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('Commission Earnings Over Time')
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('Subscription & Payments')}
        </Typography>
        
        {/* Current Subscription Status */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ReceiptIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h5">
              {t('Subscription Status')}
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : currentSubscription && currentSubscription.status === 'active' ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>{t('Active Subscription')}</AlertTitle>
                {t('You have an active subscription to the')} <strong>{currentSubscription.planId.name}</strong> {t('plan')}.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Plan')}
                    </Typography>
                    <Typography variant="h6">
                      {currentSubscription.planId.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Price')}
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(currentSubscription.price, currentSubscription.currency)}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        / {currentSubscription.interval === 'monthly' ? t('month') : t('year')}
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Start Date')}
                    </Typography>
                    <Typography variant="h6">
                      {formatDate(currentSubscription.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('Next Billing')}
                    </Typography>
                    <Typography variant="h6">
                      {formatDate(currentSubscription.nextBillingDate)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleOpenCancelDialog}
                  startIcon={<CancelIcon />}
                >
                  {t('Cancel Subscription')}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>{t('No Active Subscription')}</AlertTitle>
                {t('You currently don\'t have an active subscription. Choose a plan below to subscribe.')}
              </Alert>
              
              <Grid container spacing={3}>
                {subscriptionPlans.map((plan) => (
                  <Grid item xs={12} sm={6} md={4} key={plan._id}>
                    <Card 
                      elevation={4} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 8
                        }
                      }}
                    >
                      <CardHeader
                        title={plan.name}
                        titleTypographyProps={{ align: 'center', variant: 'h5' }}
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Typography variant="h4" color="primary" component="div">
                            {formatCurrency(plan.price, plan.currency)}
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              / {plan.interval === 'monthly' ? t('month') : t('year')}
                            </Typography>
                          </Typography>
                          {plan.interval === 'yearly' && (
                            <Typography variant="subtitle2" color="success.main">
                              {t('Save')} {formatCurrency(plan.price * 0.2)} {t('compared to monthly')}
                            </Typography>
                          )}
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {plan.description}
                        </Typography>
                        
                        <List dense>
                          {plan.features.map((feature, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2">
                                  {t('Commission Rate')}: <strong>{plan.commissionRate}%</strong>
                                </Typography>
                              } 
                            />
                          </ListItem>
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2">
                                  {t('Product Limit')}: <strong>{plan.productLimit === -1 ? t('Unlimited') : plan.productLimit}</strong>
                                </Typography>
                              } 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="large"
                          onClick={() => handleOpenSubscribeDialog(plan)}
                        >
                          {t('Subscribe Now')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
        
        {/* Tabs for Payment History, Subscription History, and Commission */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab label={t('Payment History')} />
            <Tab label={t('Subscription History')} />
            <Tab label={t('Commission')} />
          </Tabs>
          
          {/* Payment History Tab */}
          {tabValue === 0 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : paymentHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 5 }}>
                  <Typography variant="h6" color="textSecondary">
                    {t('No payment history found')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Date')}</TableCell>
                        <TableCell>{t('Type')}</TableCell>
                        <TableCell>{t('Amount')}</TableCell>
                        <TableCell>{t('Method')}</TableCell>
                        <TableCell>{t('Status')}</TableCell>
                        <TableCell>{t('Details')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment._id} hover>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getPaymentTypeIcon(payment.type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {t(payment.type)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              color={payment.type === 'refund' ? 'error.main' : 'inherit'}
                              fontWeight="bold"
                            >
                              {payment.type === 'refund' ? '-' : ''}{formatCurrency(payment.amount, payment.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {t(payment.paymentMethod)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={t(payment.status)}
                              color={getPaymentStatusColor(payment.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {payment.details && payment.details.planName && (
                              <Typography variant="body2">
                                {payment.details.planName} ({t(payment.details.interval)})
                              </Typography>
                            )}
                            {payment.details && payment.details.orderNumber && (
                              <Typography variant="body2">
                                {t('Order')}: #{payment.details.orderNumber}
                              </Typography>
                            )}
                            {payment.transactionId && (
                              <Typography variant="caption" color="text.secondary">
                                ID: {payment.transactionId}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
          
          {/* Subscription History Tab */}
          {tabValue === 1 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : subscriptionHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 5 }}>
                  <Typography variant="h6" color="textSecondary">
                    {t('No subscription history found')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Plan')}</TableCell>
                        <TableCell>{t('Status')}</TableCell>
                        <TableCell>{t('Price')}</TableCell>
                        <TableCell>{t('Start Date')}</TableCell>
                        <TableCell>{t('End Date')}</TableCell>
                        <TableCell>{t('Payment Method')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subscriptionHistory.map((subscription) => (
                        <TableRow key={subscription._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {subscription.planId.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t(subscription.interval)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={t(subscription.status)}
                              color={getSubscriptionStatusColor(subscription.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(subscription.price, subscription.currency)}
                          </TableCell>
                          <TableCell>{formatDate(subscription.startDate)}</TableCell>
                          <TableCell>{formatDate(subscription.endDate)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getPaymentMethodIcon(subscription.paymentMethod)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {t(subscription.paymentMethod)}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
          
          {/* Commission Tab */}
          {tabValue === 2 && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : !commissionStats ? (
                <Box sx={{ textAlign: 'center', p: 5 }}>
                  <Typography variant="h6" color="textSecondary">
                    {t('No commission data found')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">{t('Total Commission')}</Typography>
                        </Box>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {formatCurrency(commissionStats.totalCommission)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t('Last 30 days')}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TimelineIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">{t('Commission Rate')}</Typography>
                        </Box>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {currentSubscription?.planId?.commissionRate || 3}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t('Based on your subscription plan')}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <HistoryIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">{t('Commission Count')}</Typography>
                        </Box>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {commissionStats.commissionCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t('Number of orders with commission')}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('Commission Trend')}
                    </Typography>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ height: 300 }}>
                        <Line data={prepareChartData()} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {t('Recent Commissions')}
                  </Typography>
                  {commissionStats.recentCommissions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="body1" color="textSecondary">
                        {t('No recent commissions found')}
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Date')}</TableCell>
                            <TableCell>{t('Order')}</TableCell>
                            <TableCell>{t('Commission Rate')}</TableCell>
                            <TableCell>{t('Order Total')}</TableCell>
                            <TableCell>{t('Commission Amount')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {commissionStats.recentCommissions.map((commission) => (
                            <TableRow key={commission._id} hover>
                              <TableCell>{formatDate(commission.createdAt)}</TableCell>
                              <TableCell>
                                {commission.details?.orderNumber ? (
                                  <Typography variant="body2">
                                    #{commission.details.orderNumber}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    {t('N/A')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {commission.details?.commissionRate ? (
                                  <Typography variant="body2">
                                    {commission.details.commissionRate}%
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    {t('N/A')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {commission.details?.orderTotal ? (
                                  <Typography variant="body2">
                                    {formatCurrency(commission.details.orderTotal)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    {t('N/A')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {formatCurrency(commission.amount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
      
      {/* Subscribe Dialog */}
      <Dialog
        open={openSubscribeDialog}
        onClose={handleCloseSubscribeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('Subscribe to')} {selectedPlan?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPlan && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('Plan Details')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Plan')}
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Price')}
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        / {selectedPlan.interval === 'monthly' ? t('month') : t('year')}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Billing Cycle')}
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.interval === 'monthly' ? t('Monthly') : t('Yearly')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Commission Rate')}
                    </Typography>
                    <Typography variant="body1">
                      {selectedPlan.commissionRate}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                {t('Payment Method')}
              </Typography>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel 
                    value="credit_card" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon sx={{ mr: 1 }} />
                        {t('Credit Card')}
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="bank_transfer" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceIcon sx={{ mr: 1 }} />
                        {t('Bank Transfer')}
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
              
              {paymentMethod === 'credit_card' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('Card Number')}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('Cardholder Name')}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('Expiry Date')}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('CVC')}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                </Grid>
              )}
              
              {paymentMethod === 'bank_transfer' && (
                <Alert severity="info">
                  <AlertTitle>{t('Bank Transfer Instructions')}</AlertTitle>
                  <Typography variant="body2">
                    {t('Please transfer the exact amount to the following bank account:')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('Bank')}:</strong> TurkShipGlobal Bank
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Account Name')}:</strong> TurkShipGlobal Ltd.
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('IBAN')}:</strong> TR00 0000 0000 0000 0000 0000 00
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('Reference')}:</strong> TSG-{currentUser?.id?.substring(0, 8)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {t('Your subscription will be activated once we confirm your payment.')}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubscribeDialog}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('Subscribe')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Subscription Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('Cancel Subscription')}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>{t('Warning')}</AlertTitle>
            {t('Canceling your subscription will disable access to premium features at the end of your current billing period.')}
          </Alert>
          
          <Typography variant="body1" paragraph>
            {t('Your subscription will remain active until')} <strong>{currentSubscription && formatDate(currentSubscription.endDate)}</strong>.
          </Typography>
          
          <TextField
            fullWidth
            label={t('Reason for Cancellation (Optional)')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            placeholder={t('Please let us know why you\'re canceling...')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>
            {t('Keep Subscription')}
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCancelSubscription}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('Confirm Cancellation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionManagement;
