import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  ColorLens as ColorLensIcon,
  Straighten as StraightenIcon,
  Style as StyleIcon,
  ViewModule as ViewModuleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ProductVariationManager = ({ productId, categoryId, onVariantsGenerated }) => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [categoryTemplate, setCategoryTemplate] = useState(null);
  const [predefinedOptions, setPredefinedOptions] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [generatedVariants, setGeneratedVariants] = useState([]);
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    price: '',
    cost: '',
    inventoryQuantity: ''
  });
  
  useEffect(() => {
    if (categoryId) {
      fetchCategoryTemplate();
      fetchPredefinedOptions();
    }
  }, [categoryId]);
  
  const fetchCategoryTemplate = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/variations/categories/${categoryId}`);
      setCategoryTemplate(res.data);
      
      // Initialize selected variations based on template
      const initialSelections = {};
      res.data.variationTypes.forEach(type => {
        initialSelections[type.name] = [];
      });
      
      setSelectedVariations(initialSelections);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category template:', err);
      // If no template exists, we'll use predefined options
      setLoading(false);
    }
  };
  
  const fetchPredefinedOptions = async () => {
    try {
      const res = await axios.get('/api/variations/predefined-options');
      setPredefinedOptions(res.data);
    } catch (err) {
      console.error('Error fetching predefined options:', err);
      showSnackbar(t('Failed to load predefined options'), 'error');
    }
  };
  
  const getCategoryType = () => {
    // Determine category type based on categoryId or name
    // This is a simplified example - in a real app, you'd have a more robust way to determine category type
    if (!categoryId) return null;
    
    // For demo purposes, we'll just return 'textile' as default
    // In a real app, you'd fetch this from the category data
    return 'textile';
  };
  
  const getVariationOptions = (variationType) => {
    // First check if we have a category template
    if (categoryTemplate && categoryTemplate.variationTypes) {
      const typeFromTemplate = categoryTemplate.variationTypes.find(type => type.name === variationType);
      if (typeFromTemplate && typeFromTemplate.options.length > 0) {
        return typeFromTemplate.options.map(option => option.value);
      }
    }
    
    // If no template or no options in template, use predefined options
    const categoryType = getCategoryType();
    if (predefinedOptions && categoryType && predefinedOptions[categoryType] && predefinedOptions[categoryType][variationType]) {
      return predefinedOptions[categoryType][variationType];
    }
    
    // Default empty array if nothing found
    return [];
  };
  
  const getAvailableVariationTypes = () => {
    // First check if we have a category template
    if (categoryTemplate && categoryTemplate.variationTypes) {
      return categoryTemplate.variationTypes.map(type => ({
        name: type.name,
        displayName: type.displayName
      }));
    }
    
    // If no template, use predefined options based on category type
    const categoryType = getCategoryType();
    if (predefinedOptions && categoryType) {
      return Object.keys(predefinedOptions[categoryType]).map(key => ({
        name: key,
        displayName: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
      }));
    }
    
    // Default empty array if nothing found
    return [];
  };
  
  const handleVariationSelect = (type, value) => {
    // Check if the value is already selected
    const isSelected = selectedVariations[type]?.includes(value);
    
    if (isSelected) {
      // Remove the value
      setSelectedVariations({
        ...selectedVariations,
        [type]: selectedVariations[type].filter(v => v !== value)
      });
    } else {
      // Add the value
      setSelectedVariations({
        ...selectedVariations,
        [type]: [...(selectedVariations[type] || []), value]
      });
    }
  };
  
  const handleSelectAll = (type) => {
    const options = getVariationOptions(type);
    setSelectedVariations({
      ...selectedVariations,
      [type]: [...options]
    });
  };
  
  const handleClearAll = (type) => {
    setSelectedVariations({
      ...selectedVariations,
      [type]: []
    });
  };
  
  const handleGenerateVariants = async () => {
    try {
      // Validate that at least one option is selected for each variation type
      const variationTypes = getAvailableVariationTypes();
      const hasEmptyVariation = variationTypes.some(type => 
        !selectedVariations[type.name] || selectedVariations[type.name].length === 0
      );
      
      if (hasEmptyVariation) {
        showSnackbar(t('Please select at least one option for each variation type'), 'warning');
        return;
      }
      
      setLoading(true);
      
      const res = await axios.post('/api/variations/generate', {
        productId,
        selectedVariations
      });
      
      setGeneratedVariants(res.data);
      setOpenVariantDialog(true);
      setLoading(false);
      
      // Notify parent component
      if (onVariantsGenerated) {
        onVariantsGenerated(res.data);
      }
      
      showSnackbar(t('Variants generated successfully'), 'success');
    } catch (err) {
      console.error('Error generating variants:', err);
      showSnackbar(t('Failed to generate variants'), 'error');
      setLoading(false);
    }
  };
  
  const handleBulkEdit = async () => {
    try {
      // Validate bulk edit data
      if (!bulkEditData.price && !bulkEditData.cost && !bulkEditData.inventoryQuantity) {
        showSnackbar(t('Please enter at least one value to update'), 'warning');
        return;
      }
      
      setLoading(true);
      
      // Prepare data for bulk update
      const variants = generatedVariants.map(variant => {
        const updateData = { id: variant._id };
        
        if (bulkEditData.price) updateData.price = parseFloat(bulkEditData.price);
        if (bulkEditData.cost) updateData.cost = parseFloat(bulkEditData.cost);
        if (bulkEditData.inventoryQuantity) updateData.inventoryQuantity = parseInt(bulkEditData.inventoryQuantity);
        
        return updateData;
      });
      
      const res = await axios.post('/api/variations/bulk-update', { variants });
      
      setGeneratedVariants(res.data);
      setBulkEditMode(false);
      setBulkEditData({
        price: '',
        cost: '',
        inventoryQuantity: ''
      });
      
      setLoading(false);
      showSnackbar(t('Variants updated successfully'), 'success');
    } catch (err) {
      console.error('Error updating variants:', err);
      showSnackbar(t('Failed to update variants'), 'error');
      setLoading(false);
    }
  };
  
  const handleVariantUpdate = async (variantId, updateData) => {
    try {
      setLoading(true);
      
      const res = await axios.put(`/api/variations/${variantId}`, updateData);
      
      // Update the variant in the local state
      setGeneratedVariants(generatedVariants.map(variant => 
        variant._id === variantId ? res.data : variant
      ));
      
      setLoading(false);
      showSnackbar(t('Variant updated successfully'), 'success');
    } catch (err) {
      console.error('Error updating variant:', err);
      showSnackbar(t('Failed to update variant'), 'error');
      setLoading(false);
    }
  };
  
  const handleVariantDelete = async (variantId) => {
    try {
      setLoading(true);
      
      await axios.delete(`/api/variations/${variantId}`);
      
      // Remove the variant from the local state
      setGeneratedVariants(generatedVariants.filter(variant => variant._id !== variantId));
      
      setLoading(false);
      showSnackbar(t('Variant deleted successfully'), 'success');
    } catch (err) {
      console.error('Error deleting variant:', err);
      showSnackbar(t('Failed to delete variant'), 'error');
      setLoading(false);
    }
  };
  
  const handleCloseVariantDialog = () => {
    setOpenVariantDialog(false);
  };
  
  const handleBulkEditChange = (e) => {
    const { name, value } = e.target;
    setBulkEditData({
      ...bulkEditData,
      [name]: value
    });
  };
  
  const getVariationTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'size':
        return <StraightenIcon />;
      case 'color':
        return <ColorLensIcon />;
      case 'fabric':
      case 'material':
        return <StyleIcon />;
      default:
        return <ViewModuleIcon />;
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ViewModuleIcon color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5">
            {t('Product Variations')}
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>{t('Easy Variation Management')}</AlertTitle>
          {t('Select the variations you want to offer for this product. The system will automatically generate all possible combinations.')}
        </Alert>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {getAvailableVariationTypes().map((type) => (
              <Box key={type.name} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getVariationTypeIcon(type.name)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {t(type.displayName)}
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <Button 
                      size="small" 
                      onClick={() => handleSelectAll(type.name)}
                      startIcon={<CheckIcon />}
                    >
                      {t('Select All')}
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleClearAll(type.name)}
                      startIcon={<CloseIcon />}
                      sx={{ ml: 1 }}
                    >
                      {t('Clear')}
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {getVariationOptions(type.name).map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      onClick={() => handleVariationSelect(type.name, option)}
                      color={selectedVariations[type.name]?.includes(option) ? 'primary' : 'default'}
                      variant={selectedVariations[type.name]?.includes(option) ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Divider />
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleGenerateVariants}
                disabled={loading}
              >
                {t('Generate Variants')}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Variant Dialog */}
      <Dialog
        open={openVariantDialog}
        onClose={handleCloseVariantDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('Generated Variants')}
            <Box>
              {bulkEditMode ? (
                <>
                  <Button 
                    color="primary" 
                    onClick={handleBulkEdit}
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {t('Save Bulk Edit')}
                  </Button>
                  <Button 
                    color="secondary" 
                    onClick={() => setBulkEditMode(false)}
                    sx={{ ml: 1 }}
                  >
                    {t('Cancel')}
                  </Button>
                </>
              ) : (
                <Button 
                  color="primary" 
                  onClick={() => setBulkEditMode(true)}
                  startIcon={<EditIcon />}
                >
                  {t('Bulk Edit')}
                </Button>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {bulkEditMode && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t('Bulk Edit Variants')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('Enter values to update all variants at once. Leave fields empty to keep current values.')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('Price')}
                    name="price"
                    type="number"
                    value={bulkEditData.price}
                    onChange={handleBulkEditChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('Cost')}
                    name="cost"
                    type="number"
                    value={bulkEditData.cost}
                    onChange={handleBulkEditChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('Stock Quantity')}
                    name="inventoryQuantity"
                    type="number"
                    value={bulkEditData.inventoryQuantity}
                    onChange={handleBulkEditChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Variant')}</TableCell>
                  <TableCell>{t('Price')}</TableCell>
                  <TableCell>{t('Cost')}</TableCell>
                  <TableCell>{t('Stock')}</TableCell>
                  <TableCell>{t('SKU')}</TableCell>
                  <TableCell>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generatedVariants.map((variant) => (
                  <TableRow key={variant._id} hover>
                    <TableCell>
                      {variant.options.map(option => option.value).join(' / ')}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantUpdate(variant._id, { price: parseFloat(e.target.value) })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.cost || ''}
                        onChange={(e) => handleVariantUpdate(variant._id, { cost: parseFloat(e.target.value) })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.inventoryQuantity}
                        onChange={(e) => handleVariantUpdate(variant._id, { inventoryQuantity: parseInt(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="error" 
                        onClick={() => handleVariantDelete(variant._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariantDialog}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductVariationManager;
