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
  CardMedia,
  Divider,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Link as LinkIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const DropshipperDashboard = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [connectedSuppliers, setConnectedSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [shopifyDialog, setShopifyDialog] = useState(false);
  const [shopifyCredentials, setShopifyCredentials] = useState({
    shopifyStoreId: '',
    shopifyApiKey: '',
    shopifyAccessToken: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get dropshipper profile
      const profileRes = await axios.get('/api/dropshippers/profile');
      
      // Check if Shopify is connected
      if (profileRes.data.shopifyStoreId && profileRes.data.shopifyApiKey && profileRes.data.shopifyAccessToken) {
        setShopifyConnected(true);
        setShopifyCredentials({
          shopifyStoreId: profileRes.data.shopifyStoreId,
          shopifyApiKey: profileRes.data.shopifyApiKey,
          shopifyAccessToken: profileRes.data.shopifyAccessToken
        });
      }
      
      // Get all suppliers
      const suppliersRes = await axios.get('/api/dropshippers/suppliers');
      setSuppliers(suppliersRes.data);
      
      // Get connected suppliers
      const connectedRes = await axios.get('/api/dropshippers/connected-suppliers');
      setConnectedSuppliers(connectedRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar(t('Failed to load dashboard data'), 'error');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleConnectSupplier = async (supplierId) => {
    try {
      await axios.post('/api/dropshippers/connect', { supplierId });
      showSnackbar(t('Connected to supplier successfully'), 'success');
      
      // Refresh connected suppliers
      const connectedRes = await axios.get('/api/dropshippers/connected-suppliers');
      setConnectedSuppliers(connectedRes.data);
    } catch (err) {
      console.error('Error connecting to supplier:', err);
      showSnackbar(t('Failed to connect to supplier'), 'error');
    }
  };

  const handleDisconnectSupplier = async (supplierId) => {
    try {
      await axios.delete(`/api/dropshippers/disconnect/${supplierId}`);
      showSnackbar(t('Disconnected from supplier successfully'), 'success');
      
      // Refresh connected suppliers
      const connectedRes = await axios.get('/api/dropshippers/connected-suppliers');
      setConnectedSuppliers(connectedRes.data);
    } catch (err) {
      console.error('Error disconnecting from supplier:', err);
      showSnackbar(t('Failed to disconnect from supplier'), 'error');
    }
  };

  const handleShopifyDialogOpen = () => {
    setShopifyDialog(true);
  };

  const handleShopifyDialogClose = () => {
    setShopifyDialog(false);
  };

  const handleShopifyCredentialsChange = (e) => {
    setShopifyCredentials({
      ...shopifyCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleShopifyConnect = async () => {
    try {
      await axios.put('/api/dropshippers/profile', shopifyCredentials);
      setShopifyConnected(true);
      showSnackbar(t('Shopify store connected successfully'), 'success');
      handleShopifyDialogClose();
    } catch (err) {
      console.error('Error connecting Shopify store:', err);
      showSnackbar(t('Failed to connect Shopify store'), 'error');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSupplierConnected = (supplierId) => {
    return connectedSuppliers.some(s => s._id === supplierId);
  };

  // Mock data for dashboard
  const dashboardData = {
    totalProducts: 45,
    importedProducts: 12,
    totalOrders: 28,
    pendingOrders: 5,
    totalRevenue: 12500
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
              {t('Here\'s an overview of your dropshipper account')}
            </Typography>
          </Box>
          <Box>
            {shopifyConnected ? (
              <Button 
                variant="contained" 
                color="success"
                startIcon={<StoreIcon />}
                sx={{ mr: 2 }}
              >
                {t('Shopify Connected')}
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<LinkIcon />}
                onClick={handleShopifyDialogOpen}
                sx={{ mr: 2 }}
              >
                {t('Connect Shopify')}
              </Button>
            )}
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/dropshipper/suppliers"
            >
              {t('Find Suppliers')}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('Total Products')}</Typography>
            <Typography variant="h3">{dashboardData.totalProducts}</Typography>
            <Typography variant="body2" color="textSecondary">
              {dashboardData.importedProducts} {t('imported to Shopify')}
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
            <Typography variant="h6" gutterBottom>{t('Connected Suppliers')}</Typography>
            <Typography variant="h3">{connectedSuppliers.length}</Typography>
            <Typography variant="body2" color="textSecondary">
              {suppliers.length} {t('available')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('Total Revenue')}</Typography>
            <Typography variant="h3">₺{dashboardData.totalRevenue.toLocaleString()}</Typography>
            <Typography variant="body2" color="textSecondary">
              {t('All time')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label={t('Connected Suppliers')} />
            <Tab label={t('Find Suppliers')} />
            <Tab label={t('Recent Orders')} />
          </Tabs>
        </Box>

        {/* Connected Suppliers Tab */}
        {tabValue === 0 && (
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : connectedSuppliers.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {t('No connected suppliers')}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  {t('Connect with suppliers to start dropshipping their products')}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => setTabValue(1)}
                >
                  {t('Find Suppliers')}
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {connectedSuppliers.map((supplier) => (
                  <Grid item xs={12} sm={6} md={4} key={supplier._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={supplier.logoUrl || "https://via.placeholder.com/300x140?text=No+Logo"}
                        alt={supplier.companyName}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {supplier.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {supplier.companyDescription?.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {t('Rating')}:
                          </Typography>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {supplier.rating?.toFixed(1) || '0.0'}/5.0
                          </Typography>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          component={RouterLink}
                          to={`/dropshipper/suppliers/${supplier._id}/products`}
                        >
                          {t('View Products')}
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleDisconnectSupplier(supplier._id)}
                        >
                          {t('Disconnect')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Find Suppliers Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('Search suppliers by name')}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <FilterListIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredSuppliers.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No suppliers match your search') : t('No suppliers found')}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredSuppliers.map((supplier) => (
                  <Grid item xs={12} sm={6} md={4} key={supplier._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={supplier.logoUrl || "https://via.placeholder.com/300x140?text=No+Logo"}
                        alt={supplier.companyName}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {supplier.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {supplier.companyDescription?.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {t('Rating')}:
                          </Typography>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {supplier.rating?.toFixed(1) || '0.0'}/5.0
                          </Typography>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          component={RouterLink}
                          to={`/dropshipper/suppliers/${supplier._id}`}
                        >
                          {t('View Details')}
                        </Button>
                        {isSupplierConnected(supplier._id) ? (
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => handleDisconnectSupplier(supplier._id)}
                          >
                            {t('Disconnect')}
                          </Button>
                        ) : (
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleConnectSupplier(supplier._id)}
                          >
                            {t('Connect')}
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Recent Orders Tab */}
        {tabValue === 2 && (
          <Box>
            <List>
              <ListItem divider>
                <ListItemAvatar>
                  <Avatar>
                    <ShoppingCartIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${t('Order')} #12345`}
                  secondary={`2025-04-08 • ₺450.00 • ${t('Status')}: ${t('Processing')}`}
                />
                <Button variant="outlined" size="small">
                  {t('Details')}
                </Button>
              </ListItem>
              <ListItem divider>
                <ListItemAvatar>
                  <Avatar>
                    <ShoppingCartIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${t('Order')} #12344`}
                  secondary={`2025-04-07 • ₺275.50 • ${t('Status')}: ${t('Shipped')}`}
                />
                <Button variant="outlined" size="small">
                  {t('Details')}
                </Button>
              </ListItem>
              <ListItem divider>
                <ListItemAvatar>
                  <Avatar>
                    <ShoppingCartIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${t('Order')} #12343`}
                  secondary={`2025-04-06 • ₺1,250.00 • ${t('Status')}: ${t('Delivered')}`}
                />
                <Button variant="outlined" size="small">
                  {t('Details')}
                </Button>
              </ListItem>
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button 
                variant="contained" 
                component={RouterLink}
                to="/dropshipper/orders"
              >
                {t('View All Orders')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Shopify Connection Dialog */}
      <Dialog open={shopifyDialog} onClose={handleShopifyDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Connect Your Shopify Store')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph sx={{ mb: 3 }}>
            {t('Enter your Shopify store credentials to enable automatic product import and order synchronization.')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="shopifyStoreId"
                label={t('Shopify Store ID')}
                value={shopifyCredentials.shopifyStoreId}
                onChange={handleShopifyCredentialsChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="shopifyApiKey"
                label={t('Shopify API Key')}
                value={shopifyCredentials.shopifyApiKey}
                onChange={handleShopifyCredentialsChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="shopifyAccessToken"
                label={t('Shopify Access Token')}
                value={shopifyCredentials.shopifyAccessToken}
                onChange={handleShopifyCredentialsChange}
                margin="normal"
              />
            </Grid>
          </Grid>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {t('You can find these credentials in your Shopify admin panel under Apps > Develop apps > Create an app.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShopifyDialogClose}>{t('Cancel')}</Button>
          <Button 
            onClick={handleShopifyConnect} 
            variant="contained" 
            color="primary"
            disabled={!shopifyCredentials.shopifyStoreId || !shopifyCredentials.shopifyApiKey || !shopifyCredentials.shopifyAccessToken}
          >
            {t('Connect')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DropshipperDashboard;
