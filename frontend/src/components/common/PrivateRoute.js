import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, userType }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userType && currentUser.userType !== userType) {
    // Redirect to appropriate dashboard based on user type
    if (currentUser.userType === 'supplier') {
      return <Navigate to="/supplier/dashboard" />;
    } else if (currentUser.userType === 'dropshipper') {
      return <Navigate to="/dropshipper/dashboard" />;
    } else if (currentUser.userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
