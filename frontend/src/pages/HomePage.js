import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Storefront as StorefrontIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Language as LanguageIcon,
  Payments as PaymentsIcon,
  AutoGraph as AutoGraphIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                {t('Türkiye\'nin Dropshipping Platformu')}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.5
                }}
              >
                {t('Tedarikçiler, Dropshipper\'lar ve Sourcing Agent\'lar için tam otomasyonlu e-ticaret çözümü')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary"
                  onClick={() => navigate('/supplier/register')}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {t('Tedarikçi Olarak Kaydol')}
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/dropshipper/register')}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'white',
                    }
                  }}
                >
                  {t('Dropshipper Olarak Kaydol')}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/images/hero-illustration.png"
                alt="Dropshipping Platform"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  filter: 'drop-shadow(0px 10px 20px rgba(0, 0, 0, 0.2))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      </Box>
      
      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">100+</Typography>
              <Typography variant="body1" color="text.secondary">{t('Tedarikçi')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">5000+</Typography>
              <Typography variant="body1" color="text.secondary">{t('Ürün')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">1000+</Typography>
              <Typography variant="body1" color="text.secondary">{t('Dropshipper')}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">50K+</Typography>
              <Typography variant="body1" color="text.secondary">{t('Sipariş')}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              {t('Platform Özellikleri')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              {t('Türkiye\'den dünyaya ürün satışını kolaylaştıran tam otomasyonlu dropshipping çözümü')}
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                      <AutoGraphIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" component="h3" fontWeight="bold">
                      {t('Tam Otomasyon')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {t('Shopify entegrasyonu ile siparişler otomatik olarak tedarikçilere iletilir ve stok takibi gerçek zamanlı olarak güncellenir.')}
                  </Typography>
                  <List>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Otomatik sipariş işleme')} />
                    </ListItem>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Gerçek zamanlı stok takibi')} />
                    </ListItem>
                    <ListItem sx={{ p: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Otomatik bildirimler')} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mr: 2 }}>
                      <LocalShippingIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" component="h3" fontWeight="bold">
                      {t('Uluslararası Kargo')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {t('Türkiye\'den dünya geneline kargo ücretleri ve teslimat süreleri hesaplayıcısı ile kolay gönderim.')}
                  </Typography>
                  <List>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Kargo ücreti hesaplayıcı')} />
                    </ListItem>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Teslimat süresi tahmini')} />
                    </ListItem>
                    <ListItem sx={{ p: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Kargo takip entegrasyonu')} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56, mr: 2 }}>
                      <PeopleIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" component="h3" fontWeight="bold">
                      {t('Çoklu Kullanıcı Tipleri')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {t('Tedarikçiler, Dropshipper\'lar ve Sourcing Agent\'lar için özel roller ve çalışan yönetim sistemi.')}
                  </Typography>
                  <List>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Rol tabanlı erişim kontrolü')} />
                    </ListItem>
                    <ListItem sx={{ p: 0, pb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Çalışan yönetimi')} />
                    </ListItem>
                    <ListItem sx={{ p: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={t('Görev atama ve takip')} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* For Suppliers Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/supplier-dashboard.png"
                alt="Supplier Dashboard"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
                {t('Tedarikçiler İçin')}
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {t('Ürünlerinizi global pazara açın ve satışlarınızı artırın')}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <StorefrontIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Ürün Yönetimi')} 
                    secondary={t('Ürünlerinizi, varyantlarını ve stok durumlarını kolayca yönetin')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingCartIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Sipariş Takibi')} 
                    secondary={t('Gelen siparişleri görüntüleyin, durumlarını güncelleyin ve kargo bilgilerini ekleyin')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PaymentsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Kazanç Yönetimi')} 
                    secondary={t('Satışlarınızı ve kazançlarınızı takip edin, ödemelerinizi yönetin')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Çalışan Yönetimi')} 
                    secondary={t('Çalışanlarınızı ekleyin, görevler atayın ve performanslarını takip edin')} 
                  />
                </ListItem>
              </List>
              
              <Button 
                variant="contained" 
                size="large" 
                color="primary"
                onClick={() => navigate('/supplier/register')}
                sx={{ mt: 2, py: 1.5, px: 4 }}
              >
                {t('Tedarikçi Olarak Kaydol')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* For Dropshippers Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
                {t('Dropshipper\'lar İçin')}
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {t('Türk ürünlerini Shopify mağazanızda satın ve işinizi büyütün')}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SearchIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Ürün Keşfi')} 
                    secondary={t('Binlerce Türk ürünü arasından seçim yapın ve mağazanıza ekleyin')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InventoryIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Shopify Entegrasyonu')} 
                    secondary={t('Ürünleri tek tıkla Shopify mağazanıza aktarın ve otomatik stok takibi yapın')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AutoGraphIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Tam Otomasyon')} 
                    secondary={t('Siparişler otomatik olarak tedarikçilere iletilir, stok takibi gerçek zamanlı güncellenir')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('Kargo Takibi')} 
                    secondary={t('Siparişlerin durumunu ve kargo bilgilerini kolayca takip edin')} 
                  />
                </ListItem>
              </List>
              
              <Button 
                variant="contained" 
                size="large" 
                color="secondary"
                onClick={() => navigate('/dropshipper/register')}
                sx={{ mt: 2, py: 1.5, px: 4 }}
              >
                {t('Dropshipper Olarak Kaydol')}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/dropshipper-dashboard.png"
                alt="Dropshipper Dashboard"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Sourcing Agents Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              {t('Sourcing Agent\'lar İçin')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              {t('Özel ürünleri keşfedin, platforma ekleyin ve her satıştan komisyon kazanın')}
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/sourcing-product.jpg"
                  alt="Product Sourcing"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    {t('Ürün Keşfi')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('Türkiye\'nin dört bir yanından özel ve ilginç ürünleri keşfedin ve platforma ekleyin.')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" color="primary">
                    {t('Daha Fazla Bilgi')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/commission.jpg"
                  alt="Commission"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    {t('Komisyon Kazancı')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('Eklediğiniz ürünler satıldıkça otomatik olarak komisyon kazanın, kayıt ücreti yok.')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" color="primary">
                    {t('Daha Fazla Bilgi')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/global-reach.jpg"
                  alt="Global Reach"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    {t('Global Erişim')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('Keşfettiğiniz ürünleri global pazara sunun ve dünyanın her yerinden satış yapın.')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" color="primary">
                    {t('Daha Fazla Bilgi')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large" 
              color="primary"
              onClick={() => navigate('/sourcing-agent/register')}
              sx={{ py: 1.5, px: 4 }}
            >
              {t('Sourcing Agent Olarak Kaydol')}
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              {t('Kullanıcılarımız Ne Diyor?')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              {t('Platformumuzun başarı hikayeleri')}
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "{t('Bu platform sayesinde ürünlerimizi global pazara açtık ve satışlarımız %300 arttı. Tam otomasyon sayesinde operasyonel yükümüz azaldı ve müşteri memnuniyetimiz yükseldi.')}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>MA</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Mehmet Aydın</Typography>
                    <Typography variant="body2" color="text.secondary">Tekstil Tedarikçisi</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "{t('Shopify mağazamı Türk ürünleriyle doldurmak için mükemmel bir platform. Otomatik entegrasyon sayesinde siparişler anında tedarikçilere iletiliyor ve stok sorunları yaşamıyorum.')}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>JD</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">John Davis</Typography>
                    <Typography variant="body2" color="text.secondary">Dropshipper, ABD</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "{t('Sourcing Agent olarak kayıt ücreti ödemeden çalışabilmek harika. Keşfettiğim özel ürünleri platforma ekliyor ve her satıştan komisyon kazanıyorum. Pasif gelir için mükemmel bir fırsat.')}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>AY</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Ayşe Yılmaz</Typography>
                    <Typography variant="body2" color="text.secondary">Sourcing Agent</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center', background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            {t('Hemen Başlayın')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t('Türkiye\'nin dropshipping platformuna katılın ve e-ticaret işinizi büyütün')}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button 
                variant="contained" 
                size="large" 
                color="secondary"
                onClick={() => navigate('/supplier/register')}
                sx={{ py: 1.5, px: 4 }}
              >
                {t('Tedarikçi Olarak Kaydol')}
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/dropshipper/register')}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white',
                  }
                }}
              >
                {t('Dropshipper Olarak Kaydol')}
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/sourcing-agent/register')}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white',
                  }
                }}
              >
                {t('Sourcing Agent Olarak Kaydol')}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default HomePage;
