import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  fullWidth,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    isDisabled && styles.btn_disabled,
    fullWidth && { width: '100%' as any },
  ];

  const textStyle = [
    styles.btnText,
    styles[`btnText_${variant}`],
    styles[`btnText_${size}`],
    isDisabled && styles.btnText_disabled,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'}
        />
      ) : (
        <View style={styles.btnContent}>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = COLORS.primary, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || color + '18' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon = '📭', title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity style={styles.emptyAction} onPress={action.onPress}>
          <Text style={styles.emptyActionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ vertical = false }: { vertical?: boolean }) {
  return <View style={vertical ? styles.dividerVertical : styles.dividerHorizontal} />;
}

// ─── Chip / Tab ───────────────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: string;
}

export function Chip({ label, active, onPress, icon }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {icon && <Text style={{ marginRight: 4, fontSize: 14 }}>{icon}</Text>}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
export function ScoreBadge({ band }: { band: number }) {
  const color = band >= 7 ? COLORS.success : band >= 5.5 ? COLORS.primary : COLORS.warning;
  return (
    <View style={[styles.scoreBadge, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{band.toFixed(1)}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btn_primary: { backgroundColor: COLORS.primary },
  btn_secondary: { backgroundColor: COLORS.secondary },
  btn_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  btn_ghost: { backgroundColor: 'transparent' },
  btn_danger: { backgroundColor: COLORS.error },
  btn_disabled: { opacity: 0.5 },
  btn_sm: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.md },
  btn_md: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2 },
  btn_lg: { paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md },
  btnText: { fontWeight: '600' },
  btnText_primary: { color: '#fff' },
  btnText_secondary: { color: '#fff' },
  btnText_outline: { color: COLORS.primary },
  btnText_ghost: { color: COLORS.primary },
  btnText_danger: { color: '#fff' },
  btnText_disabled: { opacity: 0.7 },
  btnText_sm: { fontSize: FONT_SIZES.sm },
  btnText_md: { fontSize: FONT_SIZES.md },
  btnText_lg: { fontSize: FONT_SIZES.lg },
  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyAction: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  emptyActionText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZES.md },
  // Divider
  dividerHorizontal: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  dividerVertical: { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },
  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    minHeight: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  // Score badge
  scoreBadge: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
});
