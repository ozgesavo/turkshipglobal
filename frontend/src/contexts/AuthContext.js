import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setCurrentUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      logout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      throw err.response?.data?.msg || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      throw err.response?.data?.msg || 'Registration failed';
    }
  };

  const registerSupplier = async (supplierData) => {
    try {
      const res = await axios.post('/api/suppliers/register', supplierData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return true;
    } catch (err) {
      console.error('Supplier registration error:', err);
      throw err.response?.data?.msg || 'Supplier registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    registerSupplier,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
