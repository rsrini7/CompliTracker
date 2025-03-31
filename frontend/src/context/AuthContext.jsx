import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ssoService from '../services/ssoService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedProviders, setConnectedProviders] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists and is valid
    const verifyToken = async () => {
      if (token) {
        try {
          // Check token expiration
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Token valid, get user info
            const userResponse = await authService.getCurrentUser(token);
            setCurrentUser(userResponse.data);
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      navigate('/dashboard');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      navigate('/login');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  // Initiate SSO authentication
  const initiateSSO = async (provider, redirectUri = '/dashboard') => {
    try {
      setLoading(true);
      setError(null);
      
      // Create state with redirect URI
      const state = btoa(JSON.stringify({
        provider,
        redirectUri
      }));
      
      // Get authorization URL
      const response = await ssoService.initiateSSO(provider);
      
      // Redirect to provider's authorization page
      window.location.href = response.data.authorizationUrl;
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to initiate ${provider} login`);
      setLoading(false);
      return false;
    }
  };

  // Handle SSO callback
  const handleSSOCallback = async (provider, code, state) => {
    try {
      setLoading(true);
      setError(null);
      
      // Complete SSO authentication
      const response = await ssoService.completeSSO(provider, code, state);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      // Get connected providers
      fetchConnectedProviders(token);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'SSO authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch connected SSO providers
  const fetchConnectedProviders = async (authToken) => {
    try {
      const response = await ssoService.getLinkedProviders(authToken || token);
      setConnectedProviders(response.data);
    } catch (err) {
      console.error('Error fetching connected providers:', err);
    }
  };

  // Link SSO provider to existing account
  const linkSSOProvider = async (provider, code) => {
    try {
      setLoading(true);
      setError(null);
      
      await ssoService.linkProvider(token, provider, code);
      
      // Refresh connected providers
      await fetchConnectedProviders();
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to link ${provider} account`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unlink SSO provider from account
  const unlinkSSOProvider = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      
      await ssoService.unlinkProvider(token, provider);
      
      // Refresh connected providers
      await fetchConnectedProviders();
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to unlink ${provider} account`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch connected providers on mount if user is logged in
  useEffect(() => {
    if (token && currentUser) {
      fetchConnectedProviders();
    }
  }, [currentUser]);

  const value = {
    currentUser,
    token,
    loading,
    error,
    connectedProviders,
    login,
    register,
    logout,
    initiateSSO,
    handleSSOCallback,
    linkSSOProvider,
    unlinkSSOProvider
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};