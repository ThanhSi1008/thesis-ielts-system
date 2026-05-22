/**
 * API Client - Base HTTP client for API communication
 * Single Responsibility: Only handles HTTP requests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message[0]
            : errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Ignore JSON parse error
      }
      throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }
    return response.json() as Promise<T>;
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) return false;

        // Use native fetch to avoid recursion with ApiClient instance
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
          if (data.refresh_token) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('Refresh token failed:', error);
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, { headers: newHeaders });
      }
    }

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: newHeaders,
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: newHeaders,
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PATCH',
          headers: newHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      }
    }

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: newHeaders,
        });
      }
    }

    return this.handleResponse<T>(response);
  }

  async deleteWithBody<T>(endpoint: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders();
    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newHeaders = await this.getHeaders();
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: newHeaders,
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse<T>(response);
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const getFormHeaders = (t: string | null) => {
      const h: Record<string, string> = {};
      if (t) h['Authorization'] = `Bearer ${t}`;
      return h;
    };

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getFormHeaders(token),
      body: formData,
    });

    if (response.status === 401) {
      const success = await this.refreshToken();
      if (success) {
        const newToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: getFormHeaders(newToken),
          body: formData,
        });
      }
    }

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
