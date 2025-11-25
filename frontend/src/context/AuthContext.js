import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const logIn = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setUserInfo(user);
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.log(`Login Error: ${error}`);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', { name: username, email, password });
      const { token, user } = response.data;
      setUserInfo(user);
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.log(`Signup Error: ${error}`);
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data?.user || response.data;
      const newUserInfo = { ...userInfo, ...updatedUser };
      setUserInfo(newUserInfo);
      await AsyncStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      return { success: true };
    } catch (error) {
      console.log(`Update Profile Error: ${error}`);
      return { success: false, error: error.message || 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      console.error("Logout API call failed:", e);
    } finally {
      setUserToken(null);
      setUserInfo(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setIsLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (storedToken) {
        setUserToken(storedToken);
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ logIn, signUp, logout, updateProfile, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);