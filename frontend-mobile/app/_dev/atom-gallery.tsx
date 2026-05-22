import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import {
  Button,
  IconButton,
  Text,
  Avatar,
  Badge,
  Chip,
  Skeleton,
  Switch,
  Divider,
  Spacer,
  ProgressBar,
  ProgressCircle,
  ScoreBadge,
  FormField,
} from '@/components';

export default function AtomGalleryScreen() {
  const { colors, isDark, setTheme, theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Switch state demo
  const [switchVal1, setSwitchVal1] = useState(true);
  const [switchVal2, setSwitchVal2] = useState(false);

  // Input states
  const [inputVal1, setInputVal1] = useState('');
  const [inputVal2, setInputVal2] = useState('SecretPassword123');

  // Chip state
  const [activeChip, setActiveChip] = useState('Listening');

  // Progress values
  const [progressVal, setProgressVal] = useState(42);

  // Theme toggle helper
  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen
        options={{
          title: 'Atomic Sandbox Gallery',
          headerStyle: { backgroundColor: colors.bgElevated },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="title" color="primary" weight="bold">
            UI Atoms Gallery
          </Text>
          <Text variant="caption" color="textSecondary">
            Active Theme: {theme} ({isDark ? 'Dark' : 'Light'})
          </Text>
        </View>
        <Button
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          onPress={handleToggleTheme}
          size="sm"
          variant="outline"
        />
      </View>

      <Divider size={4} />

      {/* 1. BUTTONS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          1. Buttons
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          5 variants, 3 sizes, haptic light on tap, pressed scaling scale down (0.98).
        </Text>

        <Text variant="label" style={styles.subLabel}>Variants (Medium)</Text>
        <View style={styles.rowGrid}>
          <Button title="Primary" onPress={() => {}} variant="primary" />
          <Button title="Secondary" onPress={() => {}} variant="secondary" />
          <Button title="Outline" onPress={() => {}} variant="outline" />
          <Button title="Ghost" onPress={() => {}} variant="ghost" />
          <Button title="Danger" onPress={() => {}} variant="danger" />
        </View>

        <Text variant="label" style={styles.subLabel}>Sizes (Primary)</Text>
        <View style={styles.rowWrap}>
          <Button title="Small Button" onPress={() => {}} size="sm" />
          <Button title="Medium Button" onPress={() => {}} size="md" />
          <Button title="Large Button" onPress={() => {}} size="lg" />
        </View>

        <Text variant="label" style={styles.subLabel}>States</Text>
        <View style={styles.rowWrap}>
          <Button title="Disabled" onPress={() => {}} disabled />
          <Button title="Loading State" onPress={() => {}} loading />
          <Button title="Left Icon" onPress={() => {}} leftIcon="book-outline" />
          <Button title="Right Icon" onPress={() => {}} rightIcon="arrow-forward" />
        </View>
        <Spacer size={2} />
        <Button title="Full Width Button" onPress={() => {}} fullWidth />
      </View>

      {/* 2. ICON BUTTONS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          2. Icon Buttons
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Square / circle options, hitSlop expansion, and red badge dots.
        </Text>
        <View style={styles.rowWrap}>
          <IconButton icon="notifications-outline" onPress={() => {}} accessibilityLabel="Notifications" />
          <IconButton icon="chatbubble-ellipses-outline" onPress={() => {}} hasBadge accessibilityLabel="Chats" />
          <IconButton icon="settings-outline" onPress={() => {}} size="lg" accessibilityLabel="Settings" />
          <IconButton icon="search" onPress={() => {}} size="sm" variant="solid" accessibilityLabel="Search" />
          <IconButton icon="trash-outline" onPress={() => {}} variant="outline" shape="square" size="md" accessibilityLabel="Trash" />
        </View>
      </View>

      {/* 3. TYPOGRAPHY */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          3. Typography & Text
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Auto applies Farro font family weights based on selection.
        </Text>
        <View style={styles.typographyBox}>
          <Text variant="display">Display Text (36px)</Text>
          <Text variant="headline">Headline Text (30px)</Text>
          <Text variant="title">Title Text (24px)</Text>
          <Text variant="body">Body Text (16px) - regular standard reading weight for paragraphs.</Text>
          <Text variant="label" color="primary">Label Text (14px) - colored primary</Text>
          <Text variant="caption" color="textSecondary">Caption Text (12px) - secondary mute</Text>
        </View>
        <Spacer size={2} />
        <View style={styles.rowWrap}>
          <Text weight="light">Farro-Light</Text>
          <Text weight="regular">Farro-Regular</Text>
          <Text weight="medium">Farro-Medium</Text>
          <Text weight="bold">Farro-Bold</Text>
        </View>
      </View>

      {/* 4. INPUT & FORMFIELD */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          4. Inputs & Form Fields
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Includes inline outline focuses, icons, clear button, and password togglers.
        </Text>

        <FormField
          label="Full Name (Clearable Input)"
          placeholder="Enter full name"
          value={inputVal1}
          onChangeText={setInputVal1}
          leftIcon="person-outline"
          onClear={() => setInputVal1('')}
        />

        <FormField
          label="Password (Secure Input Toggle)"
          placeholder="Enter secret word"
          value={inputVal2}
          onChangeText={setInputVal2}
          leftIcon="lock-closed-outline"
          secureTextEntry
        />

        <FormField
          label="Email Address (Validation Alert)"
          placeholder="user@example.com"
          value="invalid-email"
          leftIcon="mail-outline"
          errorMessage="Please provide a valid email format"
        />

        <FormField
          label="Study Goal (Hint Text)"
          placeholder="e.g. 7.5 IELTS"
          value=""
          hintMessage="We will personalize your lessons based on this target."
        />
      </View>

      {/* 5. AVATAR */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          5. Avatars
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Pastel color hash backup scales when source image is empty.
        </Text>

        <Text variant="label" style={styles.subLabel}>Sizes with Web Source</Text>
        <View style={styles.rowWrap}>
          <Avatar size="xs" source="https://picsum.photos/100" />
          <Avatar size="sm" source="https://picsum.photos/100" />
          <Avatar size="md" source="https://picsum.photos/100" />
          <Avatar size="lg" source="https://picsum.photos/100" />
          <Avatar size="xl" source="https://picsum.photos/100" hasBadge />
        </View>

        <Text variant="label" style={styles.subLabel}>Hash Initial Fallbacks (Stable pastel coloring)</Text>
        <View style={styles.rowWrap}>
          <Avatar size="sm" name="An Nguyen" />
          <Avatar size="md" name="Thanh Si" />
          <Avatar size="lg" name="Hoang Bao" />
          <Avatar size="xl" name="Lexon AI" hasBadge badgeColor={colors.primary} />
        </View>
      </View>

      {/* 6. BADGES */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          6. Badges
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Semantic states and membership tiers.
        </Text>
        <View style={styles.rowWrap}>
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
          <Badge label="Info" variant="info" />
          <Badge label="Neutral" variant="neutral" />
        </View>
        <Spacer size={2} />
        <View style={styles.rowWrap}>
          <Badge variant="tier" value="FREE" />
          <Badge variant="tier" value="PREMIUM" />
          <Badge variant="tier" value="PRO" />
          <Badge variant="success" dotOnly />
          <Badge variant="error" size="sm" dotOnly />
        </View>
      </View>

      {/* 7. CHIPS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          7. Chips
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Pill tags with haptic triggers and active outlines.
        </Text>
        <View style={styles.rowWrap}>
          {['Listening', 'Reading', 'Writing', 'Speaking'].map((skill) => (
            <Chip
              key={skill}
              label={skill}
              active={activeChip === skill}
              leftIcon={
                skill === 'Listening'
                  ? 'headset-outline'
                  : skill === 'Reading'
                  ? 'book-outline'
                  : skill === 'Writing'
                  ? 'create-outline'
                  : 'mic-outline'
              }
              onPress={() => setActiveChip(skill)}
            />
          ))}
        </View>
        <Spacer size={2} />
        <View style={styles.rowWrap}>
          <Chip label="Clear Filter Tag" active onPress={() => {}} onClose={() => {}} />
          <Chip label="Disabled Chip" onPress={() => {}} disabled />
        </View>
      </View>

      {/* 8. SKELETON */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          8. Skeletons
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Smooth Reanimated pulsing opacity shimmers for pending loads.
        </Text>
        <View style={styles.skeletonBlock}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton variant="circle" width={48} height={48} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </View>
          </View>
          <Spacer size={3} />
          <Skeleton variant="rect" width="100%" height={80} />
          <Spacer size={3} />
          <Text variant="label">Multiple Skeleton Stack Helper (count = 3)</Text>
          <Skeleton variant="text" count={3} gap={8} height={12} />
        </View>
      </View>

      {/* 9. SWITCH */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          9. Switches
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Uniform switch styles utilizing dynamic theme schemes.
        </Text>
        <View style={styles.rowWrap}>
          <View style={styles.switchRow}>
            <Text variant="body">Receive Notifications</Text>
            <Switch value={switchVal1} onValueChange={setSwitchVal1} />
          </View>
          <View style={styles.switchRow}>
            <Text variant="body">Dark Mode Toggle</Text>
            <Switch value={switchVal2} onValueChange={(val: boolean) => {
              setSwitchVal2(val);
              setTheme(val ? 'dark' : 'light');
            }} />
          </View>
          <View style={styles.switchRow}>
            <Text variant="body">Disabled Switch</Text>
            <Switch value={false} onValueChange={() => {}} disabled />
          </View>
        </View>
      </View>

      {/* 10. DIVIDERS & LAYOUT */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          10. Dividers & Layout helpers
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Divider lines and spacing gaps that consume spacing tokens.
        </Text>
        <View style={styles.boxBorder}>
          <Text variant="body">Segment A</Text>
          <Divider size={2} />
          <Text variant="body">Segment B (Horizontal split margin spacing size = 2)</Text>
          <Divider size={6} />
          <Text variant="body">Segment C (Vertical split next)</Text>
          <View style={{ flexDirection: 'row', height: 24, alignItems: 'center', marginVertical: 8 }}>
            <Text variant="body">Col 1</Text>
            <Divider vertical size={4} />
            <Text variant="body">Col 2</Text>
            <Divider vertical size={4} />
            <Text variant="body">Col 3</Text>
          </View>
        </View>
      </View>

      {/* 11. PROGRESS INDICATORS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          11. Progress Indicators
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Smooth width transitions and SVG circular progress indicators.
        </Text>
        <View style={styles.progressBox}>
          <Text variant="label">Linear Progress: {progressVal}/100</Text>
          <ProgressBar value={progressVal} />
          <Spacer size={4} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <ProgressCircle value={progressVal} />
            <ProgressCircle value={75} color={colors.success} size={80} strokeWidth={8} />
            <ProgressCircle value={20} color={colors.error} size={50} strokeWidth={4} />
          </View>
          <Spacer size={4} />
          <Button
            title="Randomize Progress Values"
            onPress={() => setProgressVal(Math.floor(Math.random() * 100))}
            variant="outline"
            size="sm"
          />
        </View>
      </View>

      {/* 12. SCORE BADGES */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          12. Score Badges
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Strict WCAG compliant color ranges: green (≥7.0), amber (5.5-6.5), red (&lt;5.5).
        </Text>
        <View style={styles.rowWrap}>
          <View style={styles.columnCenter}>
            <Text variant="caption">Excellent (≥7.0)</Text>
            <Spacer size={1} />
            <ScoreBadge band={8.5} />
            <Spacer size={1} />
            <ScoreBadge band={7.0} variant="solid" />
          </View>
          <View style={styles.columnCenter}>
            <Text variant="caption">Good (5.5-6.5)</Text>
            <Spacer size={1} />
            <ScoreBadge band={6.0} />
            <Spacer size={1} />
            <ScoreBadge band={5.5} variant="solid" />
          </View>
          <View style={styles.columnCenter}>
            <Text variant="caption">Warning (&lt;5.5)</Text>
            <Spacer size={1} />
            <ScoreBadge band={5.0} />
            <Spacer size={1} />
            <ScoreBadge band={4.5} variant="solid" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing[4],
      paddingBottom: spacing[16],
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    section: {
      marginVertical: spacing[6],
      backgroundColor: colors.bgElevated,
      borderRadius: radius.xl,
      padding: spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 20,
      marginBottom: spacing[1],
      color: colors.text,
    },
    sectionDesc: {
      marginBottom: spacing[4],
      fontSize: 14,
    },
    subLabel: {
      marginTop: spacing[4],
      marginBottom: spacing[2],
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    rowGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    rowWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing[3],
    },
    typographyBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing[3],
      gap: spacing[2],
    },
    skeletonBlock: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing[3],
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    boxBorder: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing[3],
    },
    progressBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing[3],
    },
    columnCenter: {
      alignItems: 'center',
      gap: spacing[2],
    },
  });
}
