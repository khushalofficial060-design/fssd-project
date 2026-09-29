import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  const loadUserProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('eventhub_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile();
      if (res.success && res.data.user) {
        setUser(res.data.user);
      } else {
        // Invalid session
        localStorage.removeItem('eventhub_token');
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err.message);
      localStorage.removeItem('eventhub_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data.token) {
      localStorage.setItem('eventhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.data.token) {
      localStorage.setItem('eventhub_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('eventhub_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile: loadUserProfile,
        isAdmin,
        isStudent,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
