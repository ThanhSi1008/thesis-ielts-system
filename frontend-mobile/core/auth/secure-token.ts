import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const secureTokenStore = {
  /**
   * Lưu refresh token an toàn vào bộ nhớ mã hóa của thiết bị
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Lỗi khi lưu refresh token:', error);
      throw error;
    }
  },

  /**
   * Lấy refresh token hiện tại
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Lỗi khi đọc refresh token:', error);
      return null;
    }
  },

  /**
   * Xóa refresh token khi logout
   */
  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Lỗi khi xóa refresh token:', error);
    }
  },
};
