import { create } from 'zustand';
import { secureTokenStore } from './secure-token';

type User = {
  id: string;
  email: string;
  // TODO: Add more fields based on the mapped type
};

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuthData: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  updateAccessToken: (token: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuthData: async (accessToken, refreshToken, user) => {
    // Lưu refresh token vào SecureStore
    await secureTokenStore.setRefreshToken(refreshToken);
    
    // Lưu state in-memory
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  updateAccessToken: (token) => {
    set({ accessToken: token });
  },

  logout: async () => {
    // Xóa từ SecureStore
    await secureTokenStore.clearRefreshToken();
    
    // Reset state
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
