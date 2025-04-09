import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              DROPSHIP PRO
            </Typography>
            <Typography variant="body2">
              {t('Connect suppliers and dropshippers worldwide')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              {t('Quick Links')}
            </Typography>
            <Link href="/" color="inherit" display="block">
              {t('Home')}
            </Link>
            <Link href="/about" color="inherit" display="block">
              {t('About Us')}
            </Link>
            <Link href="/contact" color="inherit" display="block">
              {t('Contact')}
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              {t('Legal')}
            </Typography>
            <Link href="/terms" color="inherit" display="block">
              {t('Terms of Service')}
            </Link>
            <Link href="/privacy" color="inherit" display="block">
              {t('Privacy Policy')}
            </Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" align="center">
            {'© '}
            {currentYear}
            {' DROPSHIP PRO. '}
            {t('All rights reserved.')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
