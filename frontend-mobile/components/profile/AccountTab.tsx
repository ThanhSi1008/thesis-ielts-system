import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ROUTES, FONTS } from '@/constants';

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
  styles,
}: AccountTabProps) {
  const router = useRouter();
  const tier = subscription?.tier || 'FREE';

  const renderBadge = () => {
    if (tier === 'FREE') return null;
    return (
      <View style={[styles.badge, tier === 'PRO' ? styles.badgePro : styles.badgePremium]}>
        <Ionicons name="star" size={10} color="#FFF" />
        <Text style={styles.badgeText}>{tier}</Text>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`,
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{displayName}</Text>
          {renderBadge()}
        </View>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#EF4444" />
          <Text style={styles.streakBadgeText}>{stats.streak} Day Streak</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.email}
            editable={false}
          />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscription</Text>
        <View style={styles.subscriptionBox}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={styles.subTier}>{tier === 'FREE' ? 'Free Plan' : `${tier} Plan`}</Text>
              {tier !== 'FREE' && (
                <View
                  style={{
                    backgroundColor: tier === 'PRO' ? '#3B82F6' : '#8B5CF6',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 10, color: '#fff' }}>
                    ACTIVE
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.subDesc}>
              {tier === 'FREE'
                ? 'Upgrade to unlock all premium features'
                : subscription?.currentPeriodEnd
                  ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : 'Premium features unlocked'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.upgradeBtn, tier !== 'FREE' && { backgroundColor: '#EFF6FF' }]}
            onPress={() => router.push(ROUTES.pricing)}
          >
            <Text style={[styles.upgradeBtnText, tier !== 'FREE' && { color: '#3B82F6' }]}>
              {tier === 'FREE' ? 'Upgrade' : 'Manage'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
