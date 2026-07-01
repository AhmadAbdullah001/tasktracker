import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tasktracker_token');
    if (storedToken) {
      setUser({ token: storedToken });
    }
    setLoading(false);
  }, []);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    const token = response.data.token;
    localStorage.setItem('tasktracker_token', token);
    setUser({ token });
    toast.success('Signed in successfully');
  };

  const signup = async (payload) => {
    const response = await authApi.signup(payload);
    const token = response.data.token;
    localStorage.setItem('tasktracker_token', token);
    setUser({ token });
    toast.success('Account created successfully');
  };

  const generateOtp = async (payload) => {
    const response = await authApi.generateOtp(payload);
    return response.data;
  };

  const verifyOtp = async (payload) => {
    const response = await authApi.verifyOtp(payload);
    return response.data;
  };

  const resendOtp = async (payload) => {
    const response = await authApi.resendOtp(payload);
    return response.data;
  };

  const forgotPassword = async (payload) => {
    const response = await authApi.forgotPassword(payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('tasktracker_token');
    setUser(null);
    toast.info('Signed out');
  };

  const value = useMemo(() => ({ user, loading, login, signup, generateOtp, verifyOtp, resendOtp, forgotPassword, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
