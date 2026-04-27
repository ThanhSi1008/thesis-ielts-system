import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { authService } from '@/services/auth.service';
import { STORAGE_KEYS } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = rootNavigationState?.key != null;

  useEffect(() => {
    checkAuth();
  }, []);

  // Auth Guard: Redirect based on auth state
  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // If not logged in and not in auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // If logged in and in auth group, redirect to home
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, isNavigationReady]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        // Here we could verify token validity with backend or just decode it
        // For now, let's assume if token exists, we try to fetch user profile
        // If profile fetch fails (401), we'll catch error and logout
        try {
          // You might need a specific endpoint to get profile if /login doesn't return it individually 
          // or if you want to refresh it.
          // For resilience, if we stored user data, load it first
          const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
          if (storedUser) {
             setUser(JSON.parse(storedUser));
          }
          
          // Verify with backend
          const userProfile = await authService.getCurrentUser();
          setUser(userProfile);
          
        } catch (e) {
          // Token invalid
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      // No auto-login, let the UI handle redirection
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
