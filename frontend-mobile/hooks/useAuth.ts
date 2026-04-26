/**
 * useAuth - Custom hook for authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import type { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseAuthResult extends AuthState {
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        setState({
          user: JSON.parse(userData) as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (tokens: AuthTokens, user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { ...state, login, logout, checkAuth };
}

export default useAuth;
