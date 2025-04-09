import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SourcingAgentDashboard = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplierName: '',
    supplierContact: '',
    supplierLocation: '',
    estimatedPrice: '',
    estimatedShippingCost: '',
    notes: '',
    images: []
  });
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await axios.get('/api/sourcing-agent/products');
      setProducts(productsRes.data);
      
      // Fetch commissions
      const commissionsRes = await axios.get('/api/sourcing-agent/commissions');
      setCommissions(commissionsRes.data);
      
      // Calculate stats
      const activeProducts = productsRes.data.filter(product => product.status === 'active').length;
      const totalCommissionAmount = commissionsRes.data.reduce((total, commission) => total + commission.amount, 0);
      const pendingCommissionAmount = commissionsRes.data
        .filter(commission => commission.status === 'pending')
        .reduce((total, commission) => total + commission.amount, 0);
      const paidCommissionAmount = commissionsRes.data
        .filter(commission => commission.status === 'paid')
        .reduce((total, commission) => total + commission.amount, 0);
      
      setStats({
        totalProducts: productsRes.data.length,
        activeProducts,
        totalCommissions: totalCommissionAmount,
        pendingCommissions: pendingCommissionAmount,
        paidCommissions: paidCommissionAmount
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar(t('Failed to load data'), 'error');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      supplierName: '',
      supplierContact: '',
      supplierLocation: '',
      estimatedPrice: '',
      estimatedShippingCost: '',
      notes: '',
      images: []
    });
    setOpenAddDialog(true);
  };
  
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenProductDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenProductDialog(false);
    setSelectedProduct(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Preview images
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(imagePromises)
      .then(images => {
        setFormData({
          ...formData,
          images: [...formData.images, ...images]
        });
      })
      .catch(error => {
        console.error('Error processing images:', error);
        showSnackbar(t('Error processing images'), 'error');
      });
  };
  
  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };
  
  const handleSubmitProduct = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.category || !formData.supplierName) {
        showSnackbar(t('Please fill in all required fields'), 'error');
        return;
      }
      
      if (formData.images.length === 0) {
        showSnackbar(t('Please upload at least one image'), 'error');
        return;
      }
      
      // Create form data for file upload
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('category', formData.category);
      productData.append('supplierName', formData.supplierName);
      productData.append('supplierContact', formData.supplierContact);
      productData.append('supplierLocation', formData.supplierLocation);
      productData.append('estimatedPrice', formData.estimatedPrice);
      productData.append('estimatedShippingCost', formData.estimatedShippingCost);
      productData.append('notes', formData.notes);
      
      // Convert base64 images to files and append to form data
      for (let i = 0; i < formData.images.length; i++) {
        const imageFile = await fetch(formData.images[i]).then(r => r.blob());
        productData.append('images', imageFile, `image-${i}.jpg`);
      }
      
      const res = await axios.post('/api/sourcing-agent/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new product to the state
      setProducts([...products, res.data]);
      
      // Update stats
      setStats({
        ...stats,
        totalProducts: stats.totalProducts + 1
      });
      
      showSnackbar(t('Product submitted successfully'), 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting product:', err);
      showSnackbar(t('Failed to submit product'), 'error');
    }
  };
  
  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  return (
    <Container maxWidth="lg">
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant="h6">{t('Products')}</Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {stats.totalProducts}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('Active')}: {stats.activeProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Pending')}: {stats.totalProducts - stats.activeProducts}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <AttachMoneyIcon />
              </Avatar>
              <Typography variant="h6">{t('Total Commissions')}</Typography>
            </Box>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {formatCurrency(stats.totalCommissions)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('Pending')}: {formatCurrency(stats.pendingCommissions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Paid')}: {formatCurrency(stats.paidCommissions)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <AddIcon />
              </Avatar>
              <Typography variant="h6">{t('Add New Product')}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('Discover unique products and earn commission on every sale')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ mt: 'auto' }}
            >
              {t('Add Product')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {t('Sourcing Agent Dashboard')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            {t('Add Product')}
          </Button>
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label={t('Products')} />
          <Tab label={t('Commissions')} />
        </Tabs>
        
        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('Search products by name, category or supplier')}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No products match your search') : t('No products found')}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddClick}
                  sx={{ mt: 2 }}
                >
                  {t('Add Your First Product')}
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.images[0]}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {product.name}
                          </Typography>
                          <Chip 
                            label={t(product.status)} 
                            size="small" 
                            color={getStatusColor(product.status)} 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('Category')}: {product.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('Supplier')}: {product.supplierName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('Est. Price')}: {formatCurrency(product.estimatedPrice)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {product.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handleProductClick(product)}
                        >
                          {t('View Details')}
                        </Button>
                        {product.status === 'active' && (
                          <Chip 
                            label={`${product.commissionRate}% ${t('Commission')}`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ ml: 'auto' }}
                          />
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {tabValue === 1 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : commissions.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {t('No commissions found')}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                  {t('When your products are sold, your commissions will appear here')}
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Product')}</TableCell>
                      <TableCell>{t('Order')}</TableCell>
                      <TableCell>{t('Date')}</TableCell>
                      <TableCell>{t('Commission')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {commission.product.images && commission.product.images[0] ? (
                              <Avatar 
                                src={commission.product.images[0]} 
                                variant="rounded" 
                                sx={{ mr: 2, width: 40, height: 40 }} 
                              />
                            ) : (
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                <ShoppingCartIcon />
                              </Avatar>
                            )}
                            <Typography variant="body2">
                              {commission.product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            #{commission.order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatCurrency(commission.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {commission.commissionRate}% {t('of')} {formatCurrency(commission.orderItemTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(commission.status)} 
                            size="small" 
                            color={commission.status === 'paid' ? 'success' : 'warning'} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>
      
      {/* Add Product Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('Add New Product')}</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>{t('Sourcing Agent Information')}</AlertTitle>
            {t('As a Sourcing Agent, you can submit products you discover. Once approved, these products will be available to dropshippers, and you will earn commission on every sale.')}
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Product Name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Category')}
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('Supplier Information')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Supplier Name')}
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Supplier Contact')}
                name="supplierContact"
                value={formData.supplierContact}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Supplier Location')}
                name="supplierLocation"
                value={formData.supplierLocation}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('Pricing Information')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Estimated Price (TRY)')}
                name="estimatedPrice"
                type="number"
                value={formData.estimatedPrice}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Estimated Shipping Cost (TRY)')}
                name="estimatedShippingCost"
                type="number"
                value={formData.estimatedShippingCost}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('Additional Notes')}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('Product Images')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    {t('Upload Images')}
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {t('Upload at least one image of the product')}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {formData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 120,
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Delete color="error" fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleSubmitProduct} 
            variant="contained" 
            color="primary"
            disabled={formData.images.length === 0}
          >
            {t('Submit Product')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Product Details Dialog */}
      <Dialog
        open={openProductDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedProduct.name}
                <Chip 
                  label={t(selectedProduct.status)} 
                  size="small" 
                  color={getStatusColor(selectedProduct.status)} 
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      mb: 2
                    }}
                  />
                  <Grid container spacing={1}>
                    {selectedProduct.images.slice(1).map((image, index) => (
                      <Grid item xs={4} key={index}>
                        <Box
                          component="img"
                          src={image}
                          alt={`${selectedProduct.name} ${index + 2}`}
                          sx={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {t('Product Information')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Category')}:
                    </Typography>
                    <Typography variant="body1">
                      {selectedProduct.category}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Description')}:
                    </Typography>
                    <Typography variant="body1">
                      {selectedProduct.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Estimated Price')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(selectedProduct.estimatedPrice)}
                    </Typography>
                  </Box>
                  
                  {selectedProduct.estimatedShippingCost > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Estimated Shipping Cost')}:
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedProduct.estimatedShippingCost)}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedProduct.status === 'active' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Commission Rate')}:
                      </Typography>
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        {selectedProduct.commissionRate}%
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    {t('Supplier Information')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Supplier Name')}:
                    </Typography>
                    <Typography variant="body1">
                      {selectedProduct.supplierName}
                    </Typography>
                  </Box>
                  
                  {selectedProduct.supplierContact && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Supplier Contact')}:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.supplierContact}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedProduct.supplierLocation && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Supplier Location')}:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.supplierLocation}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedProduct.notes && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        {t('Additional Notes')}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        {selectedProduct.notes}
                      </Typography>
                    </>
                  )}
                </Grid>
                
                {selectedProduct.status === 'rejected' && selectedProduct.rejectionReason && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <AlertTitle>{t('Rejection Reason')}</AlertTitle>
                      {selectedProduct.rejectionReason}
                    </Alert>
                  </Grid>
                )}
                
                {selectedProduct.status === 'pending' && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>{t('Product Under Review')}</AlertTitle>
                      {t('Your product is currently being reviewed by our team. This process usually takes 1-2 business days.')}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                {t('Close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default SourcingAgentDashboard;
