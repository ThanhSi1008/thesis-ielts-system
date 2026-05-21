import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ROUTES, FONTS, COLORS } from '@/constants';
import { subscriptionsApi } from '@/services';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/components/ui/index';

interface AccountTabProps {
  user: any;
  displayName: string;
  subscription: any;
  stats: { streak: number; words: number; accuracy: number };
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  saving: boolean;
  handleUpdateProfile: () => void;
  styles: any;
  refreshSubscription?: () => Promise<void>;
}

export function ProfileAccountTab({
  user,
  displayName,
  subscription,
  stats,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  saving,
  handleUpdateProfile,
  styles: parentStyles,
  refreshSubscription,
}: AccountTabProps) {
  const router = useRouter();
  const { refresh: refreshGlobalSub } = useSubscription();
  const tier = subscription?.tier || 'FREE';
  const status = subscription?.status || 'ACTIVE';

  // Cancel subscription states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  const REASONS = [
    'Too expensive',
    'Not using it enough',
    'Lack of key features',
    'Found a better alternative',
    'Other',
  ];

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
      if (refreshSubscription) {
        await refreshSubscription();
      }
    } catch (err: any) {
      toast.error('Cancellation Failed', err?.message || 'Could not cancel subscription.');
    } finally {
      setCanceling(false);
    }
  };

  const renderBadge = () => {
    if (tier === 'FREE') return null;
    return (
      <View style={[parentStyles.badge, tier === 'PRO' ? parentStyles.badgePro : parentStyles.badgePremium]}>
        <Ionicons name="star" size={10} color="#FFF" />
        <Text style={parentStyles.badgeText}>{tier}</Text>
      </View>
    );
  };

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

  return (
    <View style={parentStyles.section}>
      <View style={parentStyles.avatarSection}>
        <View style={parentStyles.avatarContainer}>
          <Image
            source={{
              uri:
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`,
            }}
            style={parentStyles.avatar}
          />
          <TouchableOpacity style={parentStyles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={parentStyles.nameRow}>
          <Text style={parentStyles.name}>{displayName}</Text>
          {renderBadge()}
        </View>
        <Text style={parentStyles.email}>{user.email}</Text>

        <View style={parentStyles.streakBadge}>
          <Ionicons name="flame" size={16} color="#EF4444" />
          <Text style={parentStyles.streakBadgeText}>{stats.streak} Day Streak</Text>
        </View>
      </View>

      <View style={parentStyles.card}>
        <Text style={parentStyles.cardTitle}>Personal Information</Text>
        <View style={parentStyles.inputGroup}>
          <Text style={parentStyles.label}>First Name</Text>
          <TextInput
            style={parentStyles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
        </View>
        <View style={parentStyles.inputGroup}>
          <Text style={parentStyles.label}>Last Name</Text>
          <TextInput
            style={parentStyles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
        </View>
        <View style={parentStyles.inputGroup}>
          <Text style={parentStyles.label}>Email</Text>
          <TextInput
            style={[parentStyles.input, parentStyles.inputDisabled]}
            value={user.email}
            editable={false}
          />
        </View>
        <TouchableOpacity style={parentStyles.saveBtn} onPress={handleUpdateProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={parentStyles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Subscription Card */}
      <View style={parentStyles.card}>
        <Text style={parentStyles.cardTitle}>Subscription</Text>
        <View style={parentStyles.subscriptionBox}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={parentStyles.subTier}>{tier === 'FREE' ? 'Free Plan' : `${tier} Plan`}</Text>
              {tier !== 'FREE' && (
                <View
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 10, color: statusConfig.color }}>
                    {statusConfig.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={parentStyles.subDesc}>
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
            style={[parentStyles.upgradeBtn, tier !== 'FREE' && { backgroundColor: '#EFF6FF' }]}
            onPress={() => router.push(ROUTES.pricing)}
          >
            <Text style={[parentStyles.upgradeBtnText, tier !== 'FREE' && { color: '#3B82F6' }]}>
              {tier === 'FREE' ? 'Upgrade' : 'Manage'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancellation Button Trigger */}
        {tier !== 'FREE' && !isCanceled && (
          <TouchableOpacity
            style={localStyles.cancelLink}
            onPress={() => setShowCancelModal(true)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
            <Text style={localStyles.cancelLinkText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interactive Cancel Subscription Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalHeader}>
              <Text style={localStyles.modalTitle}>Cancel Subscription</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={localStyles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={localStyles.modalDesc}>
                We are sorry to see you go. Please let us know why you are canceling so we can improve the platform:
              </Text>

              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    localStyles.reasonItem,
                    cancelReason === reason && localStyles.reasonItemActive,
                  ]}
                  onPress={() => setCancelReason(reason)}
                >
                  <View style={localStyles.radioButton}>
                    {cancelReason === reason && <View style={localStyles.radioButtonInner} />}
                  </View>
                  <Text style={[
                    localStyles.reasonText,
                    cancelReason === reason && localStyles.reasonTextActive,
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              {cancelReason === 'Other' && (
                <TextInput
                  style={localStyles.customInput}
                  placeholder="Tell us more (optional)..."
                  placeholderTextColor="#94A3B8"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline={true}
                  numberOfLines={3}
                />
              )}

              <Text style={localStyles.warningText}>
                Note: You will maintain premium access until the end of your billing cycle on{' '}
                {endDate ? new Date(endDate).toLocaleDateString() : 'the next billing date'}.
              </Text>
            </ScrollView>

            <View style={localStyles.modalFooter}>
              <TouchableOpacity
                style={localStyles.modalCancelBtn}
                onPress={() => setShowCancelModal(false)}
                disabled={canceling}
              >
                <Text style={localStyles.modalCancelText}>Keep Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.modalConfirmBtn}
                onPress={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={localStyles.modalConfirmText}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
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
    backgroundColor: '#FEF2F2',
  },
  cancelLinkText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  modalContent: {
    padding: 20,
  },
  modalDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#475569',
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
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  reasonItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFDF0',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  reasonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#334155',
  },
  reasonTextActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 16,
  },
  warningText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
  },
  modalConfirmText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

