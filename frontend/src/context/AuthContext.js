import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    const result = await authAPI.signUp(email, password, name);
    
    if (result.success) {
      await AsyncStorage.setItem('token', result.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
      setToken(result.data.token);
      setUser(result.data.user);
    }
    
    return result;
  };

  const logIn = async (email, password) => {
    const result = await authAPI.logIn(email, password);
    
    if (result.success) {
      await AsyncStorage.setItem('token', result.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
      setToken(result.data.token);
      setUser(result.data.user);
    }
    
    return result;
  };

  const logOut = async () => {
    await authAPI.logOut(token);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const result = await authAPI.updateProfile(token, data);
    
    if (result.success) {
      const updated = { ...user, ...result.data.user };
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    }
    
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      signUp,
      logIn,
      logOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);