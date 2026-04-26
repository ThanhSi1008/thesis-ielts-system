import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts, Farro_300Light, Farro_400Regular, Farro_500Medium, Farro_700Bold } from '@expo-google-fonts/farro';
import Constants from 'expo-constants';
import { useAuthStore } from '../core/auth/store';
import { secureTokenStore } from '../core/auth/secure-token';
import '../global.css'; // Import Tailwind CSS (NativeWind)

// Ngăn splash screen tự động ẩn
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    'Farro-Light': Farro_300Light,
    'Farro-Regular': Farro_400Regular,
    'Farro-Medium': Farro_500Medium,
    'Farro-Bold': Farro_700Bold,
  });

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const refreshToken = await secureTokenStore.getRefreshToken();
        
        if (refreshToken) {
          // Gọi API để lấy access token mới (không dùng apiClient để tránh vòng lặp interceptor)
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:3000/api/v1`;
          const { default: axios } = await import('axios');
          const response = await axios.post<{ access_token: string }>(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const { access_token } = response.data;
          useAuthStore.setState({ 
            accessToken: access_token, 
            isAuthenticated: true 
          });
        }
      } catch (e) {
        // Refresh token hết hạn hoặc không hợp lệ → xóa và yêu cầu đăng nhập lại
        console.warn('Auth bootstrap failed, clearing tokens:', e);
        await secureTokenStore.clearRefreshToken();
        useAuthStore.setState({ accessToken: null, isAuthenticated: false });
      } finally {
        setIsReady(true);
      }
    }

    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Chờ đến khi Root Navigation sẵn sàng VÀ font đã load xong mới được phép chuyển trang
    if (!isReady || !rootNavigationState?.key || (!fontsLoaded && !fontError)) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    // Ẩn splash screen
    SplashScreen.hideAsync();
  }, [isAuthenticated, isReady, segments, rootNavigationState?.key, fontsLoaded, fontError]);

  if (!isReady) {
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
