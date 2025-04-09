import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SupplierRegister from './pages/supplier/SupplierRegister';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProfile from './pages/supplier/SupplierProfile';
import SupplierDocuments from './pages/supplier/SupplierDocuments';
import ProductList from './pages/supplier/ProductList';
import ProductCreate from './pages/supplier/ProductCreate';
import ProductEdit from './pages/supplier/ProductEdit';
import ProductVariants from './pages/supplier/ProductVariants';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Header />
        <Container component="main" sx={{ mt: 4, mb: 4, minHeight: 'calc(100vh - 160px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/supplier/register" element={<SupplierRegister />} />
            
            {/* Supplier Routes */}
            <Route 
              path="/supplier/dashboard" 
              element={
                <PrivateRoute userType="supplier">
                  <SupplierDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/profile" 
              element={
                <PrivateRoute userType="supplier">
                  <SupplierProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/documents" 
              element={
                <PrivateRoute userType="supplier">
                  <SupplierDocuments />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/products" 
              element={
                <PrivateRoute userType="supplier">
                  <ProductList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/products/create" 
              element={
                <PrivateRoute userType="supplier">
                  <ProductCreate />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/products/:id/edit" 
              element={
                <PrivateRoute userType="supplier">
                  <ProductEdit />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/supplier/products/:id/variants" 
              element={
                <PrivateRoute userType="supplier">
                  <ProductVariants />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute userType="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/suppliers" 
              element={
                <PrivateRoute userType="admin">
                  <AdminSuppliers />
                </PrivateRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <Footer />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
