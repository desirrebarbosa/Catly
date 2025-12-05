
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    about?: string;
    photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isNewUser: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  completeSetup: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const t = await AsyncStorage.getItem('userToken');
      const u = await AsyncStorage.getItem('userInfo');
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      if (res.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsNewUser(false); // Returning users don't need setup flow
        await AsyncStorage.setItem('userToken', res.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const res = await api.post('/auth/signup', { email, password: pass, name });
      if (res.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsNewUser(true); // Flag to trigger setup flow
        await AsyncStorage.setItem('userToken', res.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.success) {
        setUser(res.data.user);
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
      }
      return res;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout', {}); } catch {}
    setToken(null);
    setUser(null);
    setIsNewUser(false);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  };

  const completeSetup = () => {
      setIsNewUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isNewUser, login, signup, updateProfile, logout, completeSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
