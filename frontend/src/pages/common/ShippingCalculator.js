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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon,
  Public as PublicIcon,
  Schedule as ScheduleIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ShippingCalculator = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);
  
  const [formData, setFormData] = useState({
    country: '',
    weight: 0.5,
    length: 20,
    width: 15,
    height: 5,
    shippingMethod: ''
  });
  
  const [calculationResult, setCalculationResult] = useState(null);
  
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch countries
      const countriesRes = await axios.get('/api/shipping/countries');
      setCountries(countriesRes.data);
      
      // Fetch shipping methods
      const methodsRes = await axios.get('/api/shipping/methods');
      setShippingMethods(methodsRes.data);
      
      // Fetch shipping rates
      const ratesRes = await axios.get('/api/shipping/rates');
      setShippingRates(ratesRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching shipping data:', err);
      showSnackbar(t('Failed to load shipping data'), 'error');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCalculate = async () => {
    try {
      // Validate form data
      if (!formData.country || !formData.shippingMethod) {
        showSnackbar(t('Please select a country and shipping method'), 'error');
        return;
      }
      
      if (formData.weight <= 0) {
        showSnackbar(t('Weight must be greater than 0'), 'error');
        return;
      }
      
      setLoading(true);
      
      // Calculate shipping cost
      const res = await axios.post('/api/shipping/calculate', formData);
      
      setCalculationResult(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error calculating shipping cost:', err);
      showSnackbar(t('Failed to calculate shipping cost'), 'error');
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  // Get available shipping methods for selected country
  const getAvailableShippingMethods = () => {
    if (!formData.country) return [];
    
    const countryRates = shippingRates.filter(rate => rate.country === formData.country);
    const methodIds = [...new Set(countryRates.map(rate => rate.shippingMethodId))];
    
    return shippingMethods.filter(method => methodIds.includes(method._id));
  };
  
  // Reset shipping method if country changes
  useEffect(() => {
    setFormData({
      ...formData,
      shippingMethod: ''
    });
    setCalculationResult(null);
  }, [formData.country]);
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalShippingIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4">
            {t('International Shipping Calculator')}
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>{t('Shipping from Turkey')}</AlertTitle>
          {t('Calculate shipping costs and delivery times from Turkey to international destinations. This tool helps suppliers provide accurate shipping information and helps dropshippers estimate delivery times for their customers.')}
        </Alert>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t('Package Information')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="country-label">{t('Destination Country')}</InputLabel>
                  <Select
                    labelId="country-label"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    label={t('Destination Country')}
                    required
                  >
                    <MenuItem value="">{t('Select a country')}</MenuItem>
                    {countries.map(country => (
                      <MenuItem key={country._id} value={country._id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Weight (kg)')}
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0.1, step: 0.1 }}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('Package Dimensions (cm)')}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={t('Length')}
                  name="length"
                  type="number"
                  value={formData.length}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, step: 1 }}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={t('Width')}
                  name="width"
                  type="number"
                  value={formData.width}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, step: 1 }}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={t('Height')}
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, step: 1 }}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="shipping-method-label">{t('Shipping Method')}</InputLabel>
                  <Select
                    labelId="shipping-method-label"
                    name="shippingMethod"
                    value={formData.shippingMethod}
                    onChange={handleInputChange}
                    label={t('Shipping Method')}
                    required
                    disabled={!formData.country}
                  >
                    <MenuItem value="">{t('Select a shipping method')}</MenuItem>
                    {getAvailableShippingMethods().map(method => (
                      <MenuItem key={method._id} value={method._id}>
                        {method.name} - {method.carrier}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CalculateIcon />}
                  onClick={handleCalculate}
                  disabled={loading || !formData.country || !formData.shippingMethod}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : t('Calculate Shipping')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t('Calculation Results')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {calculationResult ? (
              <Box>
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            {formatCurrency(calculationResult.totalCost)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {calculationResult.estimatedDeliveryDays.min}-{calculationResult.estimatedDeliveryDays.max} {t('days')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Shipping Method')}:
                        </Typography>
                        <Typography variant="body1">
                          {calculationResult.shippingMethod.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Carrier')}:
                        </Typography>
                        <Typography variant="body1">
                          {calculationResult.shippingMethod.carrier}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Base Cost')}:
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(calculationResult.baseCost)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Weight Cost')}:
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(calculationResult.weightCost)}
                        </Typography>
                      </Grid>
                      
                      {calculationResult.dimensionalCost > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Dimensional Cost')}:
                          </Typography>
                          <Typography variant="body1">
                            {formatCurrency(calculationResult.dimensionalCost)}
                          </Typography>
                        </Grid>
                      )}
                      
                      {calculationResult.additionalFees > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Additional Fees')}:
                          </Typography>
                          <Typography variant="body1">
                            {formatCurrency(calculationResult.additionalFees)}
                          </Typography>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Tracking Available')}:
                        </Typography>
                        <Typography variant="body1">
                          {calculationResult.shippingMethod.trackingAvailable ? t('Yes') : t('No')}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {t('Insurance Available')}:
                        </Typography>
                        <Typography variant="body1">
                          {calculationResult.shippingMethod.insuranceAvailable ? t('Yes') : t('No')}
                        </Typography>
                      </Grid>
                      
                      {calculationResult.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Notes')}:
                          </Typography>
                          <Typography variant="body1">
                            {calculationResult.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
                
                <Alert severity="warning">
                  <AlertTitle>{t('Important Information')}</AlertTitle>
                  {t('These rates are estimates and may vary based on actual package characteristics, customs duties, and other factors. Final shipping costs will be calculated at the time of shipment.')}
                </Alert>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <PublicIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('No Calculation Results Yet')}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('Fill in the package information and click "Calculate Shipping" to see shipping costs and delivery times.')}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('Shipping Rates by Country')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="country-filter-label">{t('Filter by Country')}</InputLabel>
            <Select
              labelId="country-filter-label"
              value={formData.country || ''}
              onChange={handleInputChange}
              name="country"
              label={t('Filter by Country')}
            >
              <MenuItem value="">{t('All Countries')}</MenuItem>
              {countries.map(country => (
                <MenuItem key={country._id} value={country._id}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Country')}</TableCell>
                  <TableCell>{t('Shipping Method')}</TableCell>
                  <TableCell>{t('Carrier')}</TableCell>
                  <TableCell>{t('Base Cost')}</TableCell>
                  <TableCell>{t('Cost per kg')}</TableCell>
                  <TableCell>{t('Delivery Time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shippingRates
                  .filter(rate => !formData.country || rate.country === formData.country)
                  .map((rate) => {
                    const country = countries.find(c => c._id === rate.country);
                    const method = shippingMethods.find(m => m._id === rate.shippingMethodId);
                    
                    return (
                      <TableRow key={rate._id} hover>
                        <TableCell>{country ? country.name : ''}</TableCell>
                        <TableCell>{method ? method.name : ''}</TableCell>
                        <TableCell>{method ? method.carrier : ''}</TableCell>
                        <TableCell>{formatCurrency(rate.baseCost)}</TableCell>
                        <TableCell>{formatCurrency(rate.costPerKg)}</TableCell>
                        <TableCell>
                          {rate.minDeliveryDays}-{rate.maxDeliveryDays} {t('days')}
                          <Tooltip title={method && method.description ? method.description : ''}>
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('Shipping FAQ')}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('How are shipping costs calculated?')}
              </Typography>
              <Typography variant="body1">
                {t('Shipping costs are calculated based on the destination country, package weight, dimensions, and selected shipping method. The formula typically includes a base cost plus additional costs based on weight and/or dimensional weight.')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('What is dimensional weight?')}
              </Typography>
              <Typography variant="body1">
                {t('Dimensional weight is calculated based on the package dimensions (length × width × height in cm) divided by a dimensional factor (usually 5000 for international shipments). Carriers charge based on the greater of actual weight or dimensional weight.')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('Are customs duties included in the shipping cost?')}
              </Typography>
              <Typography variant="body1">
                {t('No, customs duties and taxes are not included in the shipping cost. These are charged separately by the destination country\'s customs authority and are the responsibility of the recipient.')}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('How accurate are the delivery time estimates?')}
              </Typography>
              <Typography variant="body1">
                {t('Delivery time estimates are based on carrier data and historical performance. Actual delivery times may vary due to customs processing, weather conditions, and other factors beyond our control.')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('Is tracking available for all shipping methods?')}
              </Typography>
              <Typography variant="body1">
                {t('Tracking availability depends on the shipping method. Premium shipping methods typically include tracking, while economy options may have limited or no tracking. The tracking availability is indicated in the shipping method details.')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('What happens if a package is lost or damaged?')}
              </Typography>
              <Typography variant="body1">
                {t('For shipping methods with insurance, you can file a claim for lost or damaged packages. The claim process and coverage amount vary by carrier. For uninsured shipments, compensation options are limited and subject to carrier policies.')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ShippingCalculator;
