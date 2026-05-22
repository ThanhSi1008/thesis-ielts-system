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
  Card,
  PressableCard,
  ListItem,
  SearchBar,
  ErrorState,
  BottomSheet,
  ConfirmDialog,
  Header,
} from '@/components';
import EmptyState from '@/components/molecules/EmptyState';

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

  // Molecules & Organisms states
  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<
    'destructive' | 'warning' | 'confirm' | 'info'
  >('confirm');
  const [activeErrorVariant, setActiveErrorVariant] = useState<
    'network' | 'server' | 'unknown' | 'empty-permission'
  >('network');
  const [pressCount, setPressCount] = useState(0);

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

        <Text variant="label" style={styles.subLabel}>
          Variants (Medium)
        </Text>
        <View style={styles.rowGrid}>
          <Button title="Primary" onPress={() => {}} variant="primary" />
          <Button title="Secondary" onPress={() => {}} variant="secondary" />
          <Button title="Outline" onPress={() => {}} variant="outline" />
          <Button title="Ghost" onPress={() => {}} variant="ghost" />
          <Button title="Danger" onPress={() => {}} variant="danger" />
        </View>

        <Text variant="label" style={styles.subLabel}>
          Sizes (Primary)
        </Text>
        <View style={styles.rowWrap}>
          <Button title="Small Button" onPress={() => {}} size="sm" />
          <Button title="Medium Button" onPress={() => {}} size="md" />
          <Button title="Large Button" onPress={() => {}} size="lg" />
        </View>

        <Text variant="label" style={styles.subLabel}>
          States
        </Text>
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
          <IconButton
            icon="notifications-outline"
            onPress={() => {}}
            accessibilityLabel="Notifications"
          />
          <IconButton
            icon="chatbubble-ellipses-outline"
            onPress={() => {}}
            hasBadge
            accessibilityLabel="Chats"
          />
          <IconButton
            icon="settings-outline"
            onPress={() => {}}
            size="lg"
            accessibilityLabel="Settings"
          />
          <IconButton
            icon="search"
            onPress={() => {}}
            size="sm"
            variant="solid"
            accessibilityLabel="Search"
          />
          <IconButton
            icon="trash-outline"
            onPress={() => {}}
            variant="outline"
            shape="square"
            size="md"
            accessibilityLabel="Trash"
          />
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
          <Text variant="body">
            Body Text (16px) - regular standard reading weight for paragraphs.
          </Text>
          <Text variant="label" color="primary">
            Label Text (14px) - colored primary
          </Text>
          <Text variant="caption" color="textSecondary">
            Caption Text (12px) - secondary mute
          </Text>
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

        <Text variant="label" style={styles.subLabel}>
          Sizes with Web Source
        </Text>
        <View style={styles.rowWrap}>
          <Avatar size="xs" source="https://picsum.photos/100" />
          <Avatar size="sm" source="https://picsum.photos/100" />
          <Avatar size="md" source="https://picsum.photos/100" />
          <Avatar size="lg" source="https://picsum.photos/100" />
          <Avatar size="xl" source="https://picsum.photos/100" hasBadge />
        </View>

        <Text variant="label" style={styles.subLabel}>
          Hash Initial Fallbacks (Stable pastel coloring)
        </Text>
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
            <Switch
              value={switchVal2}
              onValueChange={(val: boolean) => {
                setSwitchVal2(val);
                setTheme(val ? 'dark' : 'light');
              }}
            />
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
          <View
            style={{ flexDirection: 'row', height: 24, alignItems: 'center', marginVertical: 8 }}
          >
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
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}
          >
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

      <Divider size={4} />

      {/* ================================================================= */}
      {/* MOLECULES SECTION */}
      {/* ================================================================= */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="title" color="primary" weight="bold">
            UI Molecules Gallery
          </Text>
          <Text variant="caption" color="textSecondary">
            Intermediate-level responsive components
          </Text>
        </View>
      </View>

      <Divider size={2} />

      {/* 13. CARDS & PRESSABLE CARDS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          13. Cards & Pressable Cards
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Flexible Card molecule supports four styling variants and custom slots. PressableCard
          includes active scale-down spring feedback (0.98) and light haptic feedback.
        </Text>

        <Text variant="label" style={styles.subLabel}>
          Elevated Variant (Default)
        </Text>
        <Card
          variant="elevated"
          header={
            <Text variant="body" weight="bold">
              Elevated Card Header
            </Text>
          }
          body={
            <Text variant="caption" color="textSecondary">
              Elevated cards feature a premium soft shadow system with responsive dark/light depth
              settings.
            </Text>
          }
          footer={<Badge label="Active Card Slot" variant="info" />}
        />

        <Text variant="label" style={styles.subLabel}>
          Outlined & Tonal Variants
        </Text>
        <View style={{ gap: spacing[3] }}>
          <Card
            variant="outlined"
            body={
              <Text variant="caption" color="textSecondary">
                Outlined Card is ideal for subtle non-intrusive container divisions with border
                color mappings.
              </Text>
            }
          />
          <Card
            variant="tonal"
            body={
              <Text variant="caption" color="textSecondary">
                Tonal Card uses subtle surface fills mapping to theme color tokens.
              </Text>
            }
          />
        </View>

        <Text variant="label" style={styles.subLabel}>
          Gradient & Accessory Slots
        </Text>
        <Card
          variant="gradient"
          leftAccessory={
            <IconButton
              icon="trophy-outline"
              onPress={() => {}}
              variant="solid"
              accessibilityLabel="Trophy"
            />
          }
          rightAccessory={
            <IconButton icon="arrow-forward" onPress={() => {}} accessibilityLabel="Next" />
          }
          body={
            <View>
              <Text variant="body" weight="bold" color="primary">
                Gradient Trophies Card
              </Text>
              <Text variant="caption" color="textSecondary">
                Supports custom left/right accessory slots directly.
              </Text>
            </View>
          }
        />

        <Text variant="label" style={styles.subLabel}>
          PressableCard Haptic Showcase
        </Text>
        <PressableCard
          variant="elevated"
          onPress={() => setPressCount((c) => c + 1)}
          body={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">
                  Interactive Press Area
                </Text>
                <Text variant="caption" color="textSecondary">
                  Tap to trigger animated scaling + light haptic.
                </Text>
              </View>
              <Badge label={`Taps: ${pressCount}`} variant="success" />
            </View>
          }
        />
      </View>

      {/* 14. LIST ITEMS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          14. List Items
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Optimized for setting drawers, notifications, and menu links. Fully customizable titles,
          subtitles, leading icons/avatars, trailing controls, chevron decorators, and interactive
          selections.
        </Text>

        <Text variant="label" style={styles.subLabel}>
          Variants
        </Text>
        <ListItem
          variant="default"
          title="Default List Item"
          subtitle="Simple text title and subtitle mapping"
          onPress={() => {}}
        />
        <ListItem
          variant="with-icon"
          title="Icon Accessory List Item"
          subtitle="Themed background container wrapper"
          leftIcon="settings-outline"
          onPress={() => {}}
        />
        <ListItem
          variant="with-avatar"
          title="Avatar Visual List Item"
          subtitle="Hash initial placeholder fallback avatar"
          avatarName="Thanh Si"
          onPress={() => {}}
        />

        <Text variant="label" style={styles.subLabel}>
          Trailing Control & Selected State
        </Text>
        <ListItem
          variant="with-icon"
          title="Selected Option Style"
          subtitle="Highlights primary borders and subtle background tinting"
          leftIcon="checkmark-circle"
          selected
          onPress={() => {}}
        />
        <ListItem
          variant="with-icon"
          title="Toggle Notifications"
          subtitle="Integrates trailing control elements nicely"
          leftIcon="notifications-outline"
          rightElement={<Switch value={switchVal1} onValueChange={setSwitchVal1} />}
        />
      </View>

      {/* 15. SEARCH BAR */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          15. Search Bar
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Clean search bar input with internal 300ms debouncing logic. Showcases a voice input mic
          accessory and reset clearing widget triggers.
        </Text>

        <SearchBar
          value={searchVal}
          onChangeText={setSearchVal}
          onSearch={(query) => setSearchQuery(query)}
          showVoice
          onVoicePress={() => {
            alert('Voice microphone activated! Start speaking to search.');
          }}
        />
        <Spacer size={2} />
        <View style={styles.boxBorder}>
          <Text variant="caption" color="textSecondary">
            Realtime typing value:{' '}
            <Text variant="caption" weight="bold" color="primary">
              {searchVal || 'Empty'}
            </Text>
          </Text>
          <Spacer size={1} />
          <Text variant="caption" color="textSecondary">
            Debounced search result:{' '}
            <Text variant="caption" weight="bold" color="success">
              {searchQuery || 'Pending...'}
            </Text>
          </Text>
        </View>
      </View>

      {/* 16. EMPTY & ERROR STATES */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          16. Empty & Error States
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Consistent layouts mapping semantic failures. Used across lists when data states fail to
          load.
        </Text>

        <Text variant="label" style={styles.subLabel}>
          EmptyState (Inline Mock Preview)
        </Text>
        <View style={[styles.boxBorder, { paddingVertical: spacing[4] }]}>
          <EmptyState
            illustration="search-outline"
            title="No Results Found"
            description="We searched all exams but found no matches for your search term. Please try another query."
            primaryAction={{
              title: 'Clear Search',
              onPress: () => {
                setSearchVal('');
                setSearchQuery('');
              },
            }}
          />
        </View>

        <Text variant="label" style={styles.subLabel}>
          ErrorState Variants Selector
        </Text>
        <View style={styles.rowWrap}>
          {(['network', 'server', 'empty-permission', 'unknown'] as const).map((v) => (
            <Chip
              key={v}
              label={v}
              active={activeErrorVariant === v}
              onPress={() => setActiveErrorVariant(v)}
            />
          ))}
        </View>
        <Spacer size={3} />
        <View style={[styles.boxBorder, { paddingVertical: spacing[4] }]}>
          <ErrorState
            variant={activeErrorVariant}
            onRetry={() => {
              alert(`Retrying load for: ${activeErrorVariant} state!`);
            }}
          />
        </View>
      </View>

      <Divider size={4} />

      {/* ================================================================= */}
      {/* ORGANISMS SECTION */}
      {/* ================================================================= */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="title" color="primary" weight="bold">
            UI Organisms Gallery
          </Text>
          <Text variant="caption" color="textSecondary">
            Actionable composite high-level layouts
          </Text>
        </View>
      </View>

      <Divider size={2} />

      {/* 17. HEADERS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          17. Navigation Headers
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          Safe-area computed action headers with support for transparent, large, centered, and
          standard layouts.
        </Text>

        <Text variant="label" style={styles.subLabel}>
          Standard Layout (Default)
        </Text>
        <Header
          title="IELTS Prep Core"
          subtitle="Listening Practice #42"
          leftAction={{ icon: 'arrow-back', onPress: () => {} }}
          rightActions={[
            { icon: 'notifications-outline', accessibilityLabel: 'Alerts', onPress: () => {} },
            { icon: 'settings-outline', accessibilityLabel: 'Settings', onPress: () => {} },
          ]}
          style={{ borderBottomWidth: 1.5 }} // Overwrite safe inset height for inline showcase
        />

        <Text variant="label" style={styles.subLabel}>
          Centered Variant Layout
        </Text>
        <Header
          variant="centered"
          title="Account Verification"
          leftAction={{ label: 'Cancel', onPress: () => {} }}
          style={{ borderBottomWidth: 1.5 }}
        />

        <Text variant="label" style={styles.subLabel}>
          Large Variant Layout
        </Text>
        <Header
          variant="large"
          title="Explore Library"
          subtitle="Select from 1,200 intensive IELTS practice modules"
          leftAction={{ icon: 'menu-outline', onPress: () => {} }}
          style={{ borderBottomWidth: 1.5 }}
        />
      </View>

      {/* 18. BOTTOM SHEET & DIALOGS */}
      <View style={styles.section}>
        <Text variant="headline" weight="bold" style={styles.sectionTitle}>
          18. Bottom Sheets & Dialogs
        </Text>
        <Text variant="body" color="textSecondary" style={styles.sectionDesc}>
          BottomSheet implements pure RN swipe-to-dismiss gesture spring offset modals.
          ConfirmDialog completely replaces generic Alert blocks with premium custom themed
          warning/error actions.
        </Text>

        <Text variant="label" style={styles.subLabel}>
          Interactive Prompts
        </Text>
        <View style={{ gap: spacing[3] }}>
          <Button
            title="Open Gesture BottomSheet"
            onPress={() => setSheetVisible(true)}
            leftIcon="arrow-up-circle-outline"
          />

          <Spacer size={4} />

          <Text variant="caption" color="textSecondary">
            Confirm Dialog Variants (Triggers Modal Overlay):
          </Text>
          <View style={styles.rowWrap}>
            {(['destructive', 'warning', 'info', 'confirm'] as const).map((variant) => (
              <Button
                key={variant}
                title={variant.toUpperCase()}
                onPress={() => {
                  setDialogVariant(variant);
                  setDialogVisible(true);
                }}
                variant={
                  variant === 'destructive'
                    ? 'danger'
                    : variant === 'info'
                      ? 'outline'
                      : 'secondary'
                }
                size="sm"
              />
            ))}
          </View>
        </View>

        {/* Modal Sheet organism */}
        <BottomSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          title="Vocabulary Details"
          snapPointHeight={0.6}
        >
          <ScrollView contentContainerStyle={{ paddingVertical: spacing[3], gap: spacing[3] }}>
            <Card
              variant="tonal"
              body={
                <View>
                  <Text variant="body" weight="bold" color="primary">
                    Antigravity (noun)
                  </Text>
                  <Spacer size={1} />
                  <Text variant="caption" color="textSecondary">
                    Definition: A hypothetical force or state in which the pull of gravity is
                    canceled or opposed.
                  </Text>
                </View>
              }
            />
            <ListItem
              variant="with-icon"
              title="Add to wordlist"
              leftIcon="add-circle-outline"
              onPress={() => {
                alert('Word added!');
                setSheetVisible(false);
              }}
            />
            <ListItem
              variant="with-icon"
              title="Speak Pronunciation"
              leftIcon="volume-high-outline"
              onPress={() => {}}
            />
            <Button
              title="Dismiss Sheet Details"
              onPress={() => setSheetVisible(false)}
              variant="primary"
            />
          </ScrollView>
        </BottomSheet>

        {/* Custom dialog organism */}
        <ConfirmDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          variant={dialogVariant}
          title={
            dialogVariant === 'destructive'
              ? 'Discard Changes?'
              : dialogVariant === 'warning'
                ? 'Confirm Account Deletion'
                : dialogVariant === 'info'
                  ? 'About Vocabulary Lab'
                  : 'Synchronized Successfully!'
          }
          message={
            dialogVariant === 'destructive'
              ? 'You have unsaved edits in your speaking attempt. Leaving now will erase your current recording draft.'
              : dialogVariant === 'warning'
                ? 'This action is irreversible. All of your historical test statistics, bands, and premium purchases will be cleared.'
                : dialogVariant === 'info'
                  ? 'Vocabulary Lab is an AI-powered dictionary helping you master band 7.0+ advanced idioms with responsive daily flashcards.'
                  : 'All your intensive preparation exam results have been saved to our server. You can check them in your profile history tab.'
          }
          primaryAction={{
            title:
              dialogVariant === 'destructive'
                ? 'Discard Draft'
                : dialogVariant === 'warning'
                  ? 'Delete Forever'
                  : 'Got It',
            onPress: () => {
              alert(`Executed: ${dialogVariant} action`);
            },
          }}
          secondaryAction={
            dialogVariant !== 'confirm'
              ? {
                  title: 'Keep Editing',
                  onPress: () => {},
                }
              : undefined
          }
        />
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
