import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ROUTES, FONTS, COLORS } from '@/constants';
import { subscriptionsApi, vocabLabApi } from '@/services';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/components/ui/index';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api-client';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Badge, Avatar, Text } from '../atoms';
import { Card } from '../molecules';
import { BottomSheet } from '../organisms';
import ConfirmDialog from '../organisms/ConfirmDialog';

export function ProfileAccountTab() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { theme, resolvedTheme, colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDarkMode = resolvedTheme === 'dark';

  // State management
  const [stats, setStats] = useState({ streak: 0, words: 0, accuracy: 0 });
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  // Cancel subscription states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);

  // Avatar bottom sheet options state
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);

  const REASONS = [
    'Too expensive',
    'Not using it enough',
    'Lack of key features',
    'Found a better alternative',
    'Other',
  ];

  // Fetch stats and subscription
  const fetchData = async () => {
    try {
      const [statsData, subData] = await Promise.all([
        vocabLabApi.getStats().catch(() => null),
        subscriptionsApi.getMySubscription().catch(() => null),
      ]);

      if (statsData) {
        const d = statsData as any;
        setStats({
          streak: d.streak || 0,
          words: d.totalWords || d.words || d.totalCards || 0,
          accuracy: d.accuracy || 0,
        });
      }
      if (subData) {
        setSubscription(subData);
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to fetch account tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      fetchData();
    }
  }, [user]);

  const handleEditAvatar = () => {
    setShowAvatarSheet(true);
  };

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        toast.error(
          'Permission Required',
          'Please allow camera access in settings to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (err: any) {
      toast.error('Camera Error', err?.message || 'Failed to open camera');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        toast.error(
          'Permission Required',
          'Please allow photo library access in settings to choose a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (err: any) {
      toast.error('Gallery Error', err?.message || 'Failed to open gallery');
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      const filename = `avatar_${Date.now()}.jpg`;
      formData.append('file', {
        uri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      await apiClient.postForm('/users/me/avatar', formData);
      await refreshUser();
      toast.success('Success', 'Profile picture updated successfully.');
    } catch (err: any) {
      toast.error('Upload Failed', err?.message || 'Could not upload avatar picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(true);
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim()) {
      toast.error('First Name Required', 'First name is required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/users/me', { firstName, lastName });
      await refreshUser();
      toast.success('Success', 'Profile updated successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const { refresh: refreshGlobalSub } = useSubscription();

  const handleCancelSubscription = async () => {
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    if (!finalReason) {
      toast.error('Reason Required', 'Please select or enter a cancellation reason.');
      return;
    }

    setCanceling(true);
    try {
      await subscriptionsApi.cancel(finalReason);
      const formattedDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
        : 'the end of period';
      toast.success('Subscription Canceled', `Your plan will expire on ${formattedDate}.`);
      setShowCancelModal(false);
      setCancelReason('');
      setCustomReason('');

      // Refresh contexts
      await refreshGlobalSub();
      await fetchData();
    } catch (err: any) {
      toast.error('Cancellation Failed', err?.message || 'Could not cancel subscription.');
    } finally {
      setCanceling(false);
    }
  };

  if (!user) return null;

  const tier = subscription?.tier || 'FREE';
  const status = subscription?.status || 'ACTIVE';
  const isCanceled = status === 'CANCELED';
  const isTrial = status === 'TRIALING';
  const endDate = isTrial ? subscription?.trialEndsAt : subscription?.currentPeriodEnd;

  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'ACTIVE', color: '#22C55E', bgColor: '#DCFCE7' };
      case 'TRIALING':
        return { label: 'TRIAL', color: '#3B82F6', bgColor: '#DBEAFE' };
      case 'CANCELED':
        return { label: 'CANCELED', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'PAST_DUE':
        return { label: 'PAST DUE', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'EXPIRED':
        return { label: 'EXPIRED', color: '#6B7280', bgColor: '#F3F4F6' };
      default:
        return { label: status, color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const statusConfig = getStatusConfig();
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  return (
    <View style={styles.section}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Avatar size="xl" source={user.avatar} name={user.firstName || 'User'} />
          {uploadingAvatar && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handleEditAvatar}
            disabled={uploadingAvatar}
          >
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nameRow}>
          <Text variant="title" weight="bold" color="text" style={styles.name}>
            {displayName}
          </Text>
          {tier !== 'FREE' && <Badge variant="tier" value={tier} />}
        </View>
        <Text variant="body" color="textSecondary" style={styles.email}>
          {user.email}
        </Text>

        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#EF4444" />
          <Text variant="body" weight="bold" style={styles.streakBadgeText}>
            {stats.streak} Day Streak
          </Text>
        </View>
      </View>

      <Card variant="outlined" style={styles.card}>
        <Text variant="title" weight="bold" color="text" style={styles.cardTitle}>
          Personal Information
        </Text>
        <View style={styles.inputGroup}>
          <Text variant="caption" color="textSecondary" style={styles.label}>
            First Name
          </Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text variant="caption" color="textSecondary" style={styles.label}>
            Last Name
          </Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text variant="caption" color="textSecondary" style={styles.label}>
            Email
          </Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.email}
            editable={false}
          />
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdateProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text variant="body" weight="bold" style={styles.saveBtnText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </Card>

      {/* Subscription Card */}
      <Card variant="outlined" style={styles.card}>
        <Text variant="title" weight="bold" color="text" style={styles.cardTitle}>
          Subscription
        </Text>
        <View style={styles.subscriptionBox}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Badge variant="tier" value={tier} />
              {tier !== 'FREE' && (
                <View
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{ fontSize: 10, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              )}
            </View>
            <Text variant="caption" color="textSecondary" style={styles.subDesc}>
              {tier === 'FREE'
                ? 'Upgrade to unlock all premium features'
                : isCanceled
                  ? endDate
                    ? `Access until ${new Date(endDate).toLocaleDateString()}`
                    : 'Subscription canceled'
                  : isTrial
                    ? endDate
                      ? `Trial ends ${new Date(endDate).toLocaleDateString()}`
                      : 'Trial active'
                    : endDate
                      ? `Renews ${new Date(endDate).toLocaleDateString()}`
                      : 'Premium active'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.upgradeBtn, tier !== 'FREE' && { backgroundColor: '#EFF6FF' }]}
            onPress={() => router.push(ROUTES.pricing)}
          >
            <Text
              variant="caption"
              weight="bold"
              style={[styles.upgradeBtnText, tier !== 'FREE' && { color: '#3B82F6' }]}
            >
              {tier === 'FREE' ? 'Upgrade' : 'Manage'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancellation Button Trigger */}
        {tier !== 'FREE' && !isCanceled && (
          <TouchableOpacity style={styles.cancelLink} onPress={() => setShowCancelModal(true)}>
            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
            <Text variant="body" weight="bold" style={styles.cancelLinkText}>
              Cancel Subscription
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Profile Photo BottomSheet */}
      <BottomSheet
        visible={showAvatarSheet}
        onClose={() => setShowAvatarSheet(false)}
        snapPointHeight={0.32}
        title="Profile Photo"
      >
        <View style={styles.avatarSheetContent}>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              setShowAvatarSheet(false);
              handleTakePhoto();
            }}
          >
            <Ionicons name="camera-outline" size={22} color={colors.text} />
            <Text variant="body" weight="medium" color="text" style={styles.sheetOptionText}>
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => {
              setShowAvatarSheet(false);
              handleChooseFromGallery();
            }}
          >
            <Ionicons name="images-outline" size={22} color={colors.text} />
            <Text variant="body" weight="medium" color="text" style={styles.sheetOptionText}>
              Choose from Gallery
            </Text>
          </TouchableOpacity>

          {user.avatar && (
            <TouchableOpacity
              style={[styles.sheetOption, styles.sheetOptionDestructive]}
              onPress={() => {
                setShowAvatarSheet(false);
                handleRemoveAvatar();
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text variant="body" weight="bold" style={styles.sheetOptionTextDestructive}>
                Remove Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

      {/* Cancellation Modal */}
      <BottomSheet
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        snapPointHeight={0.7}
        title="Cancel Subscription"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text variant="body" color="textSecondary" style={styles.modalDesc}>
            We are sorry to see you go. Please let us know why you are canceling so we can improve
            the platform:
          </Text>

          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonItem,
                cancelReason === reason && styles.reasonItemActive,
              ]}
              onPress={() => setCancelReason(reason)}
            >
              <View style={styles.radioButton}>
                {cancelReason === reason && <View style={styles.radioButtonInner} />}
              </View>
              <Text
                variant="body"
                weight={cancelReason === reason ? 'bold' : 'medium'}
                color={cancelReason === reason ? 'text' : 'textSecondary'}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          {cancelReason === 'Other' && (
            <TextInput
              style={styles.customInput}
              placeholder="Tell us more (optional)..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={customReason}
              onChangeText={setCustomReason}
              multiline={true}
              numberOfLines={3}
            />
          )}

          <Text variant="caption" color="textSecondary" style={styles.warningText}>
            Note: You will maintain premium access until the end of your billing cycle on{' '}
            {endDate ? new Date(endDate).toLocaleDateString() : 'the next billing date'}.
          </Text>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowCancelModal(false)}
              disabled={canceling}
            >
              <Text variant="body" weight="bold" color="textSecondary">
                Keep Plan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleCancelSubscription}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text variant="body" weight="bold" style={{ color: '#FFFFFF' }}>
                  Confirm Cancel
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>

      <ConfirmDialog
        visible={showRemoveAvatarConfirm}
        onClose={() => setShowRemoveAvatarConfirm(false)}
        variant="destructive"
        title="Remove Photo"
        message="Are you sure you want to remove your profile photo?"
        primaryAction={{
          title: 'Remove',
          onPress: async () => {
            setShowRemoveAvatarConfirm(false);
            setUploadingAvatar(true);
            try {
              await apiClient.delete('/users/me/avatar');
              await refreshUser();
              toast.success('Success', 'Profile picture removed successfully.');
            } catch (err: any) {
              toast.error('Removal Failed', err?.message || 'Could not remove avatar.');
            } finally {
              setUploadingAvatar(false);
            }
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setShowRemoveAvatarConfirm(false),
        }}
      />
    </View>
  );
}

const createStyles = (colors: any) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    section: {
      padding: 16,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 12,
    },
    avatarLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.card,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    name: {
      fontSize: 22,
    },
    email: {
      fontSize: 14,
      marginTop: 2,
      marginBottom: 12,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBg || 'rgba(239, 68, 68, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    streakBadgeText: {
      fontSize: 13,
      color: colors.error,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
    },
    inputDisabled: {
      backgroundColor: colors.bgSubtle,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    saveBtnText: {
      fontSize: 15,
      color: colors.primary === '#FFC600' ? '#212529' : '#FFF',
    },
    subscriptionBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgSubtle,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subDesc: {
      fontSize: 12,
      marginTop: 2,
    },
    upgradeBtn: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    upgradeBtnText: {
      fontSize: 13,
      color: '#D97706',
    },
    cancelLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
    },
    cancelLinkText: {
      fontSize: 14,
      color: '#EF4444',
    },
    avatarSheetContent: {
      paddingVertical: 8,
      gap: 4,
    },
    sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 12,
    },
    sheetOptionText: {
      fontSize: 16,
    },
    sheetOptionDestructive: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 8,
    },
    sheetOptionTextDestructive: {
      fontSize: 16,
      color: '#EF4444',
    },
    modalContent: {
      paddingVertical: 8,
    },
    modalDesc: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    reasonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      backgroundColor: colors.bgSubtle,
      gap: 12,
    },
    reasonItemActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(251, 191, 36, 0.05)' : '#FFFDF0',
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    customInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.bgSubtle,
      textAlignVertical: 'top',
      height: 80,
      marginBottom: 16,
    },
    warningText: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 10,
      marginBottom: 24,
    },
    modalFooter: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    modalConfirmBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EF4444',
    },
  });
};
