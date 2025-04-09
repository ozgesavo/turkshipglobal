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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SupplierProducts = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialog, setImportDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [importedProducts, setImportedProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, [supplierId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get supplier details
      const supplierRes = await axios.get(`/api/dropshippers/suppliers/${supplierId}`);
      setSupplier(supplierRes.data);
      
      // Get supplier products
      const productsRes = await axios.get(`/api/dropshippers/suppliers/${supplierId}/products`);
      setProducts(productsRes.data);
      
      // Mock imported products data (in a real app, this would come from the API)
      setImportedProducts([
        {
          id: '1',
          name: 'Sample Imported Product 1',
          shopifyId: '7654321',
          importDate: '2025-04-05',
          status: 'active'
        },
        {
          id: '2',
          name: 'Sample Imported Product 2',
          shopifyId: '7654322',
          importDate: '2025-04-06',
          status: 'active'
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar(t('Failed to load products'), 'error');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImportClick = (product) => {
    setSelectedProduct(product);
    setImportDialog(true);
  };

  const handleImportDialogClose = () => {
    setImportDialog(false);
    setSelectedProduct(null);
  };

  const handleImportConfirm = async () => {
    if (!selectedProduct) return;
    
    try {
      setImportLoading(true);
      
      // Import product to Shopify
      await axios.post('/api/dropshippers/import-product', { productId: selectedProduct._id });
      
      showSnackbar(t('Product imported to Shopify successfully'), 'success');
      
      // In a real app, we would refresh the imported products list here
      
      setImportLoading(false);
      handleImportDialogClose();
    } catch (err) {
      console.error('Error importing product:', err);
      showSnackbar(t('Failed to import product to Shopify'), 'error');
      setImportLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isProductImported = (productId) => {
    // In a real app, this would check if the product is already imported to Shopify
    return importedProducts.some(p => p.id === productId);
  };

  return (
    <Container maxWidth="lg">
      {/* Supplier Info Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {supplier?.companyName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" paragraph>
                {supplier?.companyDescription}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {t('Rating')}:
                </Typography>
                <Typography variant="body1" color="primary" fontWeight="bold">
                  {supplier?.rating?.toFixed(1) || '0.0'}/5.0
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/dropshipper/dashboard')}
            >
              {t('Back to Dashboard')}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Products Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="products tabs">
            <Tab label={t('Available Products')} />
            <Tab label={t('Imported Products')} />
          </Tabs>
        </Box>

        {/* Available Products Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('Search products by name or SKU')}
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
            ) : filteredProducts.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No products match your search') : t('No products found')}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.imageUrl || "https://via.placeholder.com/300x140?text=No+Image"}
                        alt={product.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {product.name}
                          </Typography>
                          {isProductImported(product._id) ? (
                            <Chip 
                              icon={<CheckIcon />}
                              label={t('Imported')} 
                              size="small" 
                              color="success" 
                            />
                          ) : null}
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          SKU: {product.sku}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {product.shortDescription || t('No description available')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Typography variant="h6" color="primary">
                            ₺{product.price.toFixed(2)}
                          </Typography>
                          <Tooltip title={t('Supplier cost price')}>
                            <Typography variant="body2" color="text.secondary">
                              {t('Cost')}: ₺{product.costPrice.toFixed(2)}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<InfoIcon />}
                          component={RouterLink}
                          to={`/dropshipper/products/${product._id}`}
                        >
                          {t('Details')}
                        </Button>
                        {isProductImported(product._id) ? (
                          <Button 
                            size="small" 
                            color="success"
                            startIcon={<CheckIcon />}
                            disabled
                          >
                            {t('Imported')}
                          </Button>
                        ) : (
                          <Button 
                            size="small" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={() => handleImportClick(product)}
                          >
                            {t('Import to Shopify')}
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

        {/* Imported Products Tab */}
        {tabValue === 1 && (
          <Box>
            {importedProducts.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {t('No imported products')}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  {t('Import products to your Shopify store to see them here')}
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Product Name')}</TableCell>
                      <TableCell>{t('Shopify ID')}</TableCell>
                      <TableCell>{t('Import Date')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                      <TableCell align="right">{t('Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.shopifyId}</TableCell>
                        <TableCell>{product.importDate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={t(product.status)} 
                            size="small" 
                            color={product.status === 'active' ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined">
                            {t('View in Shopify')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Import Dialog */}
      <Dialog
        open={importDialog}
        onClose={handleImportDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('Import Product to Shopify')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {t('Are you sure you want to import the following product to your Shopify store?')}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6">{selectedProduct?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {selectedProduct?.sku}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Price')}: ₺{selectedProduct?.price.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('This will create a new product in your Shopify store with the details from this supplier.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose} disabled={importLoading}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleImportConfirm} 
            variant="contained" 
            color="primary"
            disabled={importLoading}
            startIcon={importLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {importLoading ? t('Importing...') : t('Import')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupplierProducts;
