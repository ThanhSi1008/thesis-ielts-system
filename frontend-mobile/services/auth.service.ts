import { ApiClient } from './api-client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';
import { STORAGE_KEYS, API_BASE_URL } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService extends ApiClient {
  constructor() {
    super(`${API_BASE_URL}/auth`);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/login', credentials);
    if (response.access_token) {
      await this.setSession(response.access_token, response.refresh_token);
    }
    return response;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await this.post<User>('/register', data);
    return response;
  }

  async logout(): Promise<void> {
    // Optional: Call backend logout if implemented
    await this.clearSession();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.get<User>('/me');
    return response;
  }
  
  // Session Management Helpers
  async setSession(accessToken: string, refreshToken?: string) {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  async clearSession() {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

export const authService = new AuthService();
