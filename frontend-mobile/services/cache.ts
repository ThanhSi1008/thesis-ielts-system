import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface CacheItem<T> {
  data: T;
  expiry: number; // timestamp in milliseconds
}

/**
 * Lightweight, AsyncStorage-backed client-side cache with TTL
 */
export const clientCache = {
  /**
   * Retrieves a value from the cache. Returns null if expired or not found.
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const json = await AsyncStorage.getItem(`api_cache_${key}`);
      if (!json) return null;

      const item: CacheItem<T> = JSON.parse(json);
      if (Date.now() > item.expiry) {
        // Expired cache item, clean it up asynchronously
        AsyncStorage.removeItem(`api_cache_${key}`).catch(() => {});
        return null;
      }
      return item.data;
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log(`[CacheService] Failed to read key: ${key}`, err);
      }
      return null;
    }
  },

  /**
   * Sets a value in the cache with a specified TTL.
   */
  set: async <T>(key: string, data: T, ttlMs = DEFAULT_TTL): Promise<void> => {
    try {
      const item: CacheItem<T> = {
        data,
        expiry: Date.now() + ttlMs,
      };
      await AsyncStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log(`[CacheService] Failed to write key: ${key}`, err);
      }
    }
  },

  /**
   * Deletes a specific key from the cache.
   */
  delete: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`api_cache_${key}`);
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log(`[CacheService] Failed to delete key: ${key}`, err);
      }
    }
  },

  /**
   * Clears all cache items starting with the API cache prefix.
   */
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('api_cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (err) {
      if (__DEV__) {
        if (__DEV__) console.log('[CacheService] Failed to clear cache', err);
      }
    }
  },
};
