import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Stepper, 
  Step, 
  StepLabel,
  Divider,
  FormControlLabel,
  Checkbox,
  Link
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useTranslation } from 'react-i18next';

const DropshipperRegister = () => {
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    t('Account Information'),
    t('Store Information'),
    t('Terms & Conditions')
  ];

  const validationSchema = [
    // Step 1 validation
    Yup.object({
      firstName: Yup.string().required(t('First name is required')),
      lastName: Yup.string().required(t('Last name is required')),
      email: Yup.string().email(t('Invalid email address')).required(t('Email is required')),
      password: Yup.string()
        .min(6, t('Password must be at least 6 characters'))
        .required(t('Password is required')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], t('Passwords must match'))
        .required(t('Confirm password is required')),
      phone: Yup.string().required(t('Phone number is required'))
    }),
    // Step 2 validation
    Yup.object({
      storeName: Yup.string().required(t('Store name is required')),
      storeUrl: Yup.string().url(t('Invalid URL'))
    }),
    // Step 3 validation
    Yup.object({
      termsAccepted: Yup.boolean()
        .oneOf([true], t('You must accept the terms and conditions'))
        .required(t('You must accept the terms and conditions'))
    })
  ];

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      storeName: '',
      storeUrl: '',
      termsAccepted: false,
      preferredLanguage: 'en'
    },
    validationSchema: validationSchema[activeStep],
    onSubmit: async (values) => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        try {
          // Remove confirmPassword and termsAccepted from the data sent to the API
          const { confirmPassword, termsAccepted, ...dropshipperData } = values;
          await register(dropshipperData);
          showSnackbar(t('Registration successful!'), 'success');
          navigate('/dropshipper/dashboard');
        } catch (error) {
          showSnackbar(error.toString(), 'error');
        }
      }
    }
  });

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('Personal Information')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label={t('First Name')}
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label={t('Last Name')}
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label={t('Email Address')}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label={t('Phone Number')}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label={t('Password')}
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label={t('Confirm Password')}
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('Store Information')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="storeName"
                  name="storeName"
                  label={t('Store Name')}
                  value={formik.values.storeName}
                  onChange={formik.handleChange}
                  error={formik.touched.storeName && Boolean(formik.errors.storeName)}
                  helperText={formik.touched.storeName && formik.errors.storeName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="storeUrl"
                  name="storeUrl"
                  label={t('Store URL (optional)')}
                  value={formik.values.storeUrl}
                  onChange={formik.handleChange}
                  error={formik.touched.storeUrl && Boolean(formik.errors.storeUrl)}
                  helperText={formik.touched.storeUrl && formik.errors.storeUrl}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {t('You can connect your Shopify store later in your dashboard.')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('Terms and Conditions')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2">
                {t('terms_and_conditions_text')}
              </Typography>
            </Paper>
            <FormControlLabel
              control={
                <Checkbox
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formik.values.termsAccepted}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={t('I accept the terms and conditions')}
            />
            {formik.touched.termsAccepted && formik.errors.termsAccepted && (
              <Typography color="error" variant="caption">
                {formik.errors.termsAccepted}
              </Typography>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('Dropshipper Registration')}
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          {t('Join our platform as a dropshipper and connect with Turkish suppliers')}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              {t('Back')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              {activeStep === steps.length - 1 ? t('Submit') : t('Next')}
            </Button>
          </Box>
        </form>
        
        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            {t('Already have an account?')} <Link component={RouterLink} to="/login">{t('Login here')}</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DropshipperRegister;
