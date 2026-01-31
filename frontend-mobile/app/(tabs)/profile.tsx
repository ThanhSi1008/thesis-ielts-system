import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{isLoggedIn ? 'Người dùng' : 'Khách'}</Text>
        <Text style={styles.email}>{isLoggedIn ? 'user@example.com' : 'Chưa đăng nhập'}</Text>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Lịch sử học tập</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🎯</Text>
          <Text style={styles.menuText}>Mục tiêu học tập</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Thông báo</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Cài đặt chung</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        {isLoggedIn ? (
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.menuItem, styles.loginItem]}>
            <Text style={styles.menuIcon}>🔑</Text>
            <Text style={[styles.menuText, styles.loginText]}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.version}>TOEIC Master AI v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  email: { fontSize: 14, color: '#BFDBFE', marginTop: 4 },
  menuSection: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: '#1F2937' },
  menuArrow: { fontSize: 16, color: '#9CA3AF' },
  logoutItem: { backgroundColor: '#FEE2E2' },
  logoutText: { color: '#DC2626' },
  loginItem: { backgroundColor: '#DBEAFE' },
  loginText: { color: '#2563EB' },
  version: { textAlign: 'center', color: '#9CA3AF', marginTop: 'auto', marginBottom: 30 },
});
