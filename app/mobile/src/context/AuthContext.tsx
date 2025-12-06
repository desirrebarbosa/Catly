
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
    is2FAEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isNewUser: boolean;
  login: (email: string, pass: string) => Promise<any>;
  login2FA: (tempToken: string, code: string) => Promise<any>;
  googleLogin: (idToken: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  completeSetup: () => void;
  // 2FA Helpers
  generate2FA: () => Promise<any>;
  enable2FA: (token: string, secret: string) => Promise<any>;
  disable2FA: () => Promise<any>;
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

  const saveAuth = async (t: string, u: any) => {
      setToken(t);
      setUser(u);
      await AsyncStorage.setItem('userToken', t);
      await AsyncStorage.setItem('userInfo', JSON.stringify(u));
  }

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      if (res.success && !res.requires2FA) {
        await saveAuth(res.data.token, res.data.user);
        setIsNewUser(false);
      }
      return res; // Pass back to screen to handle 2FA check
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const login2FA = async (tempToken: string, code: string) => {
      try {
        const res = await api.post('/auth/login/2fa', { tempToken, code });
        if (res.success) {
            await saveAuth(res.data.token, res.data.user);
            setIsNewUser(false);
        }
        return res;
      } catch (e: any) {
          return { success: false, error: e.message };
      }
  };

  const googleLogin = async (idToken: string) => {
      try {
          const res = await api.post('/auth/google', { idToken });
          if (res.success) {
            await saveAuth(res.data.token, res.data.user);
            // If new user, could check a flag, but for now assume regular entry
          }
          return res;
      } catch(e: any) {
          return { success: false, error: e.message };
      }
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const res = await api.post('/auth/signup', { email, password: pass, name });
      if (res.success) {
        await saveAuth(res.data.token, res.data.user);
        setIsNewUser(true); 
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

  // 2FA
  const generate2FA = async () => api.post('/auth/2fa/generate', {});
  const enable2FA = async (token: string, secret: string) => {
      const res = await api.post('/auth/2fa/enable', { token, secret });
      if(res.success && user) {
          const updatedUser = { ...user, is2FAEnabled: true };
          setUser(updatedUser);
          await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      return res;
  };
  const disable2FA = async () => {
      const res = await api.post('/auth/2fa/disable', {});
      if(res.success && user) {
          const updatedUser = { ...user, is2FAEnabled: false };
          setUser(updatedUser);
          await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      return res;
  };

  return (
    <AuthContext.Provider value={{ 
        user, token, isLoading, isNewUser, 
        login, login2FA, googleLogin, signup, updateProfile, logout, completeSetup,
        generate2FA, enable2FA, disable2FA
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
