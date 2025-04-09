import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElLang, setAnchorElLang] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleOpenLangMenu = (event) => {
    setAnchorElLang(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };
  
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleCloseLangMenu();
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };

  // Navigation items based on user type
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { label: t('Home'), path: '/' },
        { label: t('About'), path: '/about' },
        { label: t('Contact'), path: '/contact' }
      ];
    }
    
    if (currentUser.userType === 'supplier') {
      return [
        { label: t('Dashboard'), path: '/supplier/dashboard' },
        { label: t('Products'), path: '/supplier/products' },
        { label: t('Orders'), path: '/supplier/orders' }
      ];
    }
    
    if (currentUser.userType === 'dropshipper') {
      return [
        { label: t('Dashboard'), path: '/dropshipper/dashboard' },
        { label: t('Suppliers'), path: '/dropshipper/suppliers' },
        { label: t('Products'), path: '/dropshipper/products' },
        { label: t('Orders'), path: '/dropshipper/orders' }
      ];
    }
    
    if (currentUser.userType === 'admin') {
      return [
        { label: t('Dashboard'), path: '/admin/dashboard' },
        { label: t('Suppliers'), path: '/admin/suppliers' },
        { label: t('Dropshippers'), path: '/admin/dropshippers' }
      ];
    }
    
    return [];
  };

  // User menu items based on user type
  const getUserMenuItems = () => {
    const items = [
      { label: t('Profile'), path: `/${currentUser?.userType}/profile` }
    ];
    
    if (currentUser?.userType === 'supplier') {
      items.push({ label: t('Documents'), path: '/supplier/documents' });
    }
    
    items.push({ label: t('Logout'), action: handleLogout });
    
    return items;
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DROPSHIP PRO
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {getNavItems().map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={item.path}
                >
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DROPSHIP PRO
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {getNavItems().map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Language selector */}
          <Box sx={{ mr: 2 }}>
            <IconButton onClick={handleOpenLangMenu} color="inherit">
              <LanguageIcon />
            </IconButton>
            <Menu
              id="menu-language"
              anchorEl={anchorElLang}
              open={Boolean(anchorElLang)}
              onClose={handleCloseLangMenu}
            >
              <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
              <MenuItem onClick={() => handleLanguageChange('tr')}>Türkçe</MenuItem>
            </Menu>
          </Box>

          {/* User menu */}
          {currentUser ? (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={`${currentUser.firstName} ${currentUser.lastName}`} src="/static/images/avatar/2.jpg" />
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {getUserMenuItems().map((item) => (
                  <MenuItem 
                    key={item.label} 
                    onClick={item.action || handleCloseUserMenu}
                    component={item.path ? RouterLink : undefined}
                    to={item.path}
                  >
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button 
                component={RouterLink} 
                to="/login" 
                color="inherit"
                sx={{ mr: 1 }}
              >
                {t('Login')}
              </Button>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                color="secondary"
              >
                {t('Register')}
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
