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
  IconButton,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const InventoryManagement = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [recentChanges, setRecentChanges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [bulkUpdateQuantity, setBulkUpdateQuantity] = useState('');
  
  useEffect(() => {
    fetchInventoryData();
  }, []);
  
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory statistics
      const statsRes = await axios.get('/api/inventory/statistics');
      setInventoryStats(statsRes.data);
      setRecentChanges(statsRes.data.recentChanges);
      
      // Fetch low stock products
      const lowStockRes = await axios.get('/api/inventory/low-stock');
      setLowStockProducts(lowStockRes.data.lowStockProducts);
      setLowStockVariants(lowStockRes.data.lowStockVariants);
      
      // Fetch all products (simplified for demo)
      const productsRes = await axios.get('/api/products/supplier');
      setProducts(productsRes.data);
      
      // Fetch all variants (simplified for demo)
      const variantsRes = await axios.get('/api/products/supplier/variants');
      setVariants(variantsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      showSnackbar(t('Failed to load inventory data'), 'error');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleViewLogs = async (type, id) => {
    try {
      setLoading(true);
      
      let logs;
      if (type === 'product') {
        setSelectedProduct(products.find(p => p._id === id));
        setSelectedVariant(null);
        logs = await axios.get(`/api/inventory/product/${id}/logs`);
      } else {
        const variant = variants.find(v => v._id === id);
        setSelectedVariant(variant);
        setSelectedProduct(products.find(p => p._id === variant.productId));
        logs = await axios.get(`/api/inventory/variant/${id}/logs`);
      }
      
      setInventoryLogs(logs.data);
      setOpenLogDialog(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory logs:', err);
      showSnackbar(t('Failed to load inventory logs'), 'error');
      setLoading(false);
    }
  };
  
  const handleOpenUpdateDialog = (type, item) => {
    if (type === 'product') {
      setSelectedProduct(item);
      setSelectedVariant(null);
      setUpdateQuantity(item.inventoryQuantity || 0);
    } else {
      setSelectedVariant(item);
      setSelectedProduct(products.find(p => p._id === item.productId));
      setUpdateQuantity(item.inventoryQuantity || 0);
    }
    
    setUpdateNotes('');
    setOpenUpdateDialog(true);
  };
  
  const handleUpdateInventory = async () => {
    try {
      setLoading(true);
      
      let res;
      if (selectedVariant) {
        // Update variant inventory
        res = await axios.put('/api/inventory/variant', {
          variantId: selectedVariant._id,
          quantity: parseInt(updateQuantity),
          notes: updateNotes
        });
        
        // Update local state
        setVariants(variants.map(v => 
          v._id === selectedVariant._id 
            ? { ...v, inventoryQuantity: parseInt(updateQuantity) } 
            : v
        ));
      } else {
        // Update product inventory
        res = await axios.put('/api/inventory/product', {
          productId: selectedProduct._id,
          quantity: parseInt(updateQuantity),
          notes: updateNotes
        });
        
        // Update local state
        setProducts(products.map(p => 
          p._id === selectedProduct._id 
            ? { ...p, inventoryQuantity: parseInt(updateQuantity) } 
            : p
        ));
      }
      
      // Add the new log to recent changes
      setRecentChanges([res.data.inventoryLog, ...recentChanges]);
      
      setOpenUpdateDialog(false);
      setLoading(false);
      showSnackbar(t('Inventory updated successfully'), 'success');
      
      // Refresh data
      fetchInventoryData();
    } catch (err) {
      console.error('Error updating inventory:', err);
      showSnackbar(t('Failed to update inventory'), 'error');
      setLoading(false);
    }
  };
  
  const handleBulkUpdate = async () => {
    try {
      if (selectedVariants.length === 0) {
        showSnackbar(t('Please select at least one variant'), 'warning');
        return;
      }
      
      if (!bulkUpdateQuantity) {
        showSnackbar(t('Please enter a quantity'), 'warning');
        return;
      }
      
      setLoading(true);
      
      const variantsToUpdate = selectedVariants.map(id => ({
        id,
        quantity: parseInt(bulkUpdateQuantity)
      }));
      
      const res = await axios.post('/api/inventory/bulk-update', {
        variants: variantsToUpdate,
        notes: 'Bulk update'
      });
      
      // Update local state
      setVariants(variants.map(v => 
        selectedVariants.includes(v._id) 
          ? { ...v, inventoryQuantity: parseInt(bulkUpdateQuantity) } 
          : v
      ));
      
      setBulkEditMode(false);
      setSelectedVariants([]);
      setBulkUpdateQuantity('');
      setLoading(false);
      showSnackbar(t('Inventory bulk updated successfully'), 'success');
      
      // Refresh data
      fetchInventoryData();
    } catch (err) {
      console.error('Error bulk updating inventory:', err);
      showSnackbar(t('Failed to bulk update inventory'), 'error');
      setLoading(false);
    }
  };
  
  const handleVariantSelect = (variantId) => {
    if (selectedVariants.includes(variantId)) {
      setSelectedVariants(selectedVariants.filter(id => id !== variantId));
    } else {
      setSelectedVariants([...selectedVariants, variantId]);
    }
  };
  
  const handleSelectAllVariants = () => {
    if (selectedVariants.length === filteredVariants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(filteredVariants.map(v => v._id));
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };
  
  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'manual':
        return 'primary';
      case 'order':
        return 'error';
      case 'return':
        return 'success';
      case 'adjustment':
        return 'warning';
      case 'sync':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'manual':
        return <EditIcon fontSize="small" />;
      case 'order':
        return <RemoveIcon fontSize="small" />;
      case 'return':
        return <AddIcon fontSize="small" />;
      case 'adjustment':
        return <RefreshIcon fontSize="small" />;
      case 'sync':
        return <RefreshIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  const getChangeAmountIcon = (amount) => {
    if (amount > 0) {
      return <ArrowUpwardIcon fontSize="small" color="success" />;
    } else if (amount < 0) {
      return <ArrowDownwardIcon fontSize="small" color="error" />;
    }
    return null;
  };
  
  // Filter products and variants based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredVariants = variants.filter(variant => {
    const product = products.find(p => p._id === variant.productId);
    if (!product) return false;
    
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.sku && variant.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.options && variant.options.some(opt => 
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  });
  
  return (
    <Container maxWidth="lg">
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InventoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('Total Products')}</Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {inventoryStats ? inventoryStats.totalProducts : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('With Variants')}: {inventoryStats ? inventoryStats.totalVariants : '-'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('Low Stock')}</Typography>
            </Box>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {inventoryStats ? inventoryStats.lowStockProducts : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('Variants')}: {inventoryStats ? inventoryStats.lowStockVariants : '-'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('Out of Stock')}</Typography>
            </Box>
            <Typography variant="h3" color="error" fontWeight="bold">
              {inventoryStats ? inventoryStats.outOfStockProducts : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('Variants')}: {inventoryStats ? inventoryStats.outOfStockVariants : '-'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">{t('Recent Changes')}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {recentChanges.length > 0 ? (
                <List dense disablePadding>
                  {recentChanges.slice(0, 3).map((log, index) => (
                    <ListItem key={log._id} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getChangeTypeIcon(log.changeType)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {log.productId?.name || 'Product'}
                              {log.variantId && ` (${log.variantId.options.map(o => o.value).join(', ')})`}
                            </Typography>
                          </Box>
                        }
                        secondary={formatDate(log.createdAt)}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getChangeAmountIcon(log.changeAmount)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                          </Typography>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('No recent changes')}
                </Typography>
              )}
            </Box>
            <Button 
              size="small" 
              color="info" 
              sx={{ mt: 1, alignSelf: 'flex-end' }}
              onClick={() => setTabValue(2)}
            >
              {t('View All')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {t('Inventory Management')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchInventoryData}
          >
            {t('Refresh')}
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('Search products by name, SKU, or variant')}
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
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label={t('Products')} />
          <Tab label={t('Variants')} />
          <Tab label={t('History')} />
          <Tab label={t('Low Stock')} />
        </Tabs>
        
        {/* Products Tab */}
        {tabValue === 0 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No products match your search') : t('No products found')}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Product')}</TableCell>
                      <TableCell>{t('SKU')}</TableCell>
                      <TableCell>{t('Stock')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                      <TableCell>{t('Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {product.images && product.images[0] ? (
                              <Box
                                component="img"
                                src={product.images[0]}
                                alt={product.name}
                                sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                              />
                            ) : (
                              <Box
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  bgcolor: 'grey.200', 
                                  borderRadius: 1, 
                                  mr: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <InventoryIcon color="action" />
                              </Box>
                            )}
                            <Typography variant="body1">
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{product.sku || '-'}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="body1" 
                            color={
                              (product.inventoryQuantity === 0 || product.inventoryQuantity === undefined) 
                                ? 'error.main' 
                                : (product.inventoryQuantity <= 5 ? 'warning.main' : 'inherit')
                            }
                            fontWeight="bold"
                          >
                            {product.inventoryQuantity !== undefined ? product.inventoryQuantity : 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {product.inventoryQuantity === 0 || product.inventoryQuantity === undefined ? (
                            <Chip size="small" label={t('Out of Stock')} color="error" />
                          ) : product.inventoryQuantity <= 5 ? (
                            <Chip size="small" label={t('Low Stock')} color="warning" />
                          ) : (
                            <Chip size="small" label={t('In Stock')} color="success" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={t('Update Stock')}>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenUpdateDialog('product', product)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('View History')}>
                            <IconButton 
                              color="info" 
                              onClick={() => handleViewLogs('product', product._id)}
                              size="small"
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {/* Variants Tab */}
        {tabValue === 1 && (
          <>
            {bulkEditMode && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {t('Bulk Edit Mode')}
                  </Typography>
                  <Box>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={handleSelectAllVariants}
                      sx={{ mr: 1 }}
                    >
                      {selectedVariants.length === filteredVariants.length 
                        ? t('Deselect All') 
                        : t('Select All')}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => {
                        setBulkEditMode(false);
                        setSelectedVariants([]);
                      }}
                    >
                      {t('Cancel')}
                    </Button>
                  </Box>
                </Box>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label={t('Set Stock Quantity')}
                      type="number"
                      value={bulkUpdateQuantity}
                      onChange={(e) => setBulkUpdateQuantity(e.target.value)}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Selected')}: {selectedVariants.length} {t('variants')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleBulkUpdate}
                      disabled={selectedVariants.length === 0 || !bulkUpdateQuantity}
                    >
                      {t('Update Selected Variants')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredVariants.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No variants match your search') : t('No variants found')}
                </Typography>
              </Box>
            ) : (
              <>
                {!bulkEditMode && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => setBulkEditMode(true)}
                    >
                      {t('Bulk Edit')}
                    </Button>
                  </Box>
                )}
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {bulkEditMode && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedVariants.length === filteredVariants.length}
                              indeterminate={selectedVariants.length > 0 && selectedVariants.length < filteredVariants.length}
                              onChange={handleSelectAllVariants}
                            />
                          </TableCell>
                        )}
                        <TableCell>{t('Product')}</TableCell>
                        <TableCell>{t('Variant')}</TableCell>
                        <TableCell>{t('SKU')}</TableCell>
                        <TableCell>{t('Stock')}</TableCell>
                        <TableCell>{t('Status')}</TableCell>
                        <TableCell>{t('Actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredVariants.map((variant) => {
                        const product = products.find(p => p._id === variant.productId);
                        if (!product) return null;
                        
                        return (
                          <TableRow 
                            key={variant._id} 
                            hover
                            selected={selectedVariants.includes(variant._id)}
                            onClick={bulkEditMode ? () => handleVariantSelect(variant._id) : undefined}
                            sx={bulkEditMode ? { cursor: 'pointer' } : undefined}
                          >
                            {bulkEditMode && (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedVariants.includes(variant._id)}
                                  onChange={() => handleVariantSelect(variant._id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {product.images && product.images[0] ? (
                                  <Box
                                    component="img"
                                    src={product.images[0]}
                                    alt={product.name}
                                    sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                                  />
                                ) : (
                                  <Box
                                    sx={{ 
                                      width: 40, 
                                      height: 40, 
                                      bgcolor: 'grey.200', 
                                      borderRadius: 1, 
                                      mr: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <InventoryIcon color="action" />
                                  </Box>
                                )}
                                <Typography variant="body2">
                                  {product.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {variant.options && variant.options.map(option => option.value).join(' / ')}
                            </TableCell>
                            <TableCell>{variant.sku || '-'}</TableCell>
                            <TableCell>
                              <Typography 
                                variant="body1" 
                                color={
                                  (variant.inventoryQuantity === 0 || variant.inventoryQuantity === undefined) 
                                    ? 'error.main' 
                                    : (variant.inventoryQuantity <= 5 ? 'warning.main' : 'inherit')
                                }
                                fontWeight="bold"
                              >
                                {variant.inventoryQuantity !== undefined ? variant.inventoryQuantity : 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {variant.inventoryQuantity === 0 || variant.inventoryQuantity === undefined ? (
                                <Chip size="small" label={t('Out of Stock')} color="error" />
                              ) : variant.inventoryQuantity <= 5 ? (
                                <Chip size="small" label={t('Low Stock')} color="warning" />
                              ) : (
                                <Chip size="small" label={t('In Stock')} color="success" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={t('Update Stock')}>
                                <IconButton 
                                  color="primary" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenUpdateDialog('variant', variant);
                                  }}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('View History')}>
                                <IconButton 
                                  color="info" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewLogs('variant', variant._id);
                                  }}
                                  size="small"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
        
        {/* History Tab */}
        {tabValue === 2 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : recentChanges.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  {t('No inventory history found')}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Date')}</TableCell>
                      <TableCell>{t('Product')}</TableCell>
                      <TableCell>{t('Change')}</TableCell>
                      <TableCell>{t('Type')}</TableCell>
                      <TableCell>{t('User')}</TableCell>
                      <TableCell>{t('Notes')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentChanges.map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.productId?.name || 'Product'}
                            {log.variantId && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {log.variantId.options.map(o => o.value).join(' / ')}
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getChangeAmountIcon(log.changeAmount)}
                            <Typography 
                              variant="body2" 
                              color={log.changeAmount > 0 ? 'success.main' : (log.changeAmount < 0 ? 'error.main' : 'inherit')}
                              sx={{ ml: 0.5 }}
                            >
                              {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {log.previousQuantity} → {log.newQuantity}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={t(log.changeType)}
                            color={getChangeTypeColor(log.changeType)}
                            icon={getChangeTypeIcon(log.changeType)}
                          />
                        </TableCell>
                        <TableCell>
                          {log.userId?.firstName} {log.userId?.lastName}
                        </TableCell>
                        <TableCell>
                          {log.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {/* Low Stock Tab */}
        {tabValue === 3 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : lowStockProducts.length === 0 && lowStockVariants.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  {t('No low stock items found')}
                </Typography>
              </Box>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>{t('Low Stock Alert')}</AlertTitle>
                  {t('The following products and variants are running low on stock (5 or fewer items). Consider updating your inventory.')}
                </Alert>
                
                {lowStockProducts.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('Low Stock Products')}
                    </Typography>
                    <TableContainer sx={{ mb: 4 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Product')}</TableCell>
                            <TableCell>{t('SKU')}</TableCell>
                            <TableCell>{t('Stock')}</TableCell>
                            <TableCell>{t('Actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lowStockProducts.map((product) => (
                            <TableRow key={product._id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {product.images && product.images[0] ? (
                                    <Box
                                      component="img"
                                      src={product.images[0]}
                                      alt={product.name}
                                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        bgcolor: 'grey.200', 
                                        borderRadius: 1, 
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <InventoryIcon color="action" />
                                    </Box>
                                  )}
                                  <Typography variant="body1">
                                    {product.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{product.sku || '-'}</TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body1" 
                                  color={
                                    (product.inventoryQuantity === 0 || product.inventoryQuantity === undefined) 
                                      ? 'error.main' 
                                      : 'warning.main'
                                  }
                                  fontWeight="bold"
                                >
                                  {product.inventoryQuantity !== undefined ? product.inventoryQuantity : 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenUpdateDialog('product', product)}
                                >
                                  {t('Update Stock')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                
                {lowStockVariants.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('Low Stock Variants')}
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Product')}</TableCell>
                            <TableCell>{t('Variant')}</TableCell>
                            <TableCell>{t('SKU')}</TableCell>
                            <TableCell>{t('Stock')}</TableCell>
                            <TableCell>{t('Actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lowStockVariants.map((variant) => (
                            <TableRow key={variant._id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {variant.productId.images && variant.productId.images[0] ? (
                                    <Box
                                      component="img"
                                      src={variant.productId.images[0]}
                                      alt={variant.productId.name}
                                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        bgcolor: 'grey.200', 
                                        borderRadius: 1, 
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <InventoryIcon color="action" />
                                    </Box>
                                  )}
                                  <Typography variant="body2">
                                    {variant.productId.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {variant.options && variant.options.map(option => option.value).join(' / ')}
                              </TableCell>
                              <TableCell>{variant.sku || '-'}</TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body1" 
                                  color={
                                    (variant.inventoryQuantity === 0 || variant.inventoryQuantity === undefined) 
                                      ? 'error.main' 
                                      : 'warning.main'
                                  }
                                  fontWeight="bold"
                                >
                                  {variant.inventoryQuantity !== undefined ? variant.inventoryQuantity : 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenUpdateDialog('variant', variant)}
                                >
                                  {t('Update Stock')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Inventory Log Dialog */}
      <Dialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} />
            {t('Inventory History')}
            {selectedProduct && (
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                - {selectedProduct.name}
                {selectedVariant && ` (${selectedVariant.options.map(o => o.value).join(', ')})`}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {inventoryLogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="textSecondary">
                {t('No inventory history found for this item')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Date')}</TableCell>
                    <TableCell>{t('Change')}</TableCell>
                    <TableCell>{t('Type')}</TableCell>
                    <TableCell>{t('User')}</TableCell>
                    <TableCell>{t('Notes')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryLogs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getChangeAmountIcon(log.changeAmount)}
                          <Typography 
                            variant="body2" 
                            color={log.changeAmount > 0 ? 'success.main' : (log.changeAmount < 0 ? 'error.main' : 'inherit')}
                            sx={{ ml: 0.5 }}
                          >
                            {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {log.previousQuantity} → {log.newQuantity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t(log.changeType)}
                          color={getChangeTypeColor(log.changeType)}
                          icon={getChangeTypeIcon(log.changeType)}
                        />
                      </TableCell>
                      <TableCell>
                        {log.userId?.firstName} {log.userId?.lastName}
                      </TableCell>
                      <TableCell>
                        {log.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Update Inventory Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            {t('Update Inventory')}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedProduct?.name}
              {selectedVariant && ` (${selectedVariant.options.map(o => o.value).join(', ')})`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Current Stock')}: {selectedProduct?.inventoryQuantity || selectedVariant?.inventoryQuantity || 0}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label={t('New Stock Quantity')}
            type="number"
            value={updateQuantity}
            onChange={(e) => setUpdateQuantity(e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label={t('Notes (Optional)')}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleUpdateInventory}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('Update')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryManagement;
