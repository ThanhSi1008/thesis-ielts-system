# Mobile Style Patterns Guide

This document outlines standard styling patterns for the IELTS Mobile App. Adhering to these patterns ensures that all new screens and features support both light and dark mode automatically, avoid circular design-token dependencies, and run efficiently.

---

## 1. Dynamic Styling via `useThemedStyles`

To support theme dynamic shifts seamlessly and prevent recalculating stylesheets on every render cycle, we use the `useThemedStyles` hook. It takes a factory function that consumes active `ThemeTokens` and returns a standard React Native `StyleSheet`.

### Standard Implementation

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemedStyles } from '@/hooks';
import type { ThemeTokens } from '@/constants';

export default function MyComponent() {
  // 1. Consume the themed styles
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dynamic Theme Text</Text>
    </View>
  );
}

// 2. Define the themed styles factory outside the component
const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontFamily: 'Farro-Bold',
      fontSize: 20,
      color: colors.text,
    },
  });
```

### Benefits
- **Performance**: The stylesheet is only recreated when the theme changes (`colors` dependency in `useMemo`).
- **Cleanliness**: Separation of component presentation logic from the style definitions.
- **Type Safety**: TypeScript auto-completion works seamlessly on the `colors` parameter (e.g. `colors.primary`, `colors.bgElevated`).

---

## 2. Best Practices

### Avoid Hardcoded Hex Codes
❌ **Incorrect**:
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Broke in Dark Mode!
  },
});
```

Let the design tokens resolve them:
```typescript
const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background, // Works perfectly!
    },
  });
```

### Avoid Static `COLORS` Import
❌ **Incorrect**:
```typescript
import { COLORS } from '@/constants'; // Static, does not support theme toggle!
```

Let the hook manage context values:
```typescript
import { useTheme } from '@/contexts/ThemeContext';
const { colors } = useTheme(); // Correct context consumption
```

---

## 3. UI Tokens Cheat Sheet

When creating themed styles, map visual boundaries to these new semantic tokens:

- **Elevated Surfaces** (Cards, Dialogs, Modals): Use `colors.bgElevated`
- **Subtle Backgrounds** (Disabled buttons, section headers, inputs): Use `colors.bgSubtle`
- **Inverted Surfaces** (Callout sheets, tooltips): Use `colors.bgInverse`
- **High-contrast Borders**: Use `colors.borderStrong`
- **Interactive States** (Focus borders, text selectors): Use `colors.borderInteractive`
- **Modal backdrops**: Use `colors.overlay`

---

## 4. Atomic Components Usage

With Phase MI-02 complete, the application has a robust set of 12+ atomic components located in `@/components/atoms`. Avoid building custom components for basic primitives; instead, import them from `@/components` or `@/components/atoms`.

### Supported Atoms:
- **Button / IconButton**: Handles loading, disabled states, and dynamic scaling transitions.
- **Text**: Standardized text variants (`display | headline | title | body | label | caption`) and automatic `Farro` font-family integration.
- **Input**: Secure text toggle, clear buttons, and focus border animations.
- **Avatar**: Circular representation of user images with an automated name-hash-based initial fallback mechanism.
- **Badge / Chip**: Dynamic categories, tiers, interactive filters, and close handlers.
- **Skeleton**: Reanimated-powered shimmer placeholders (`text | circle | rect | card`) for seamless loading states.
- **Switch**: Unified cross-platform wrap for React Native Switch.
- **Divider / Spacer**: Spacing utilities matching the project's layout grid.
- **ProgressBar / ProgressCircle**: SVG and linear progress tracking with interactive reanimated transitions.
- **ScoreBadge**: Standardized IELTS band badge.

---

## 5. Tactile & Haptic Guidelines

Interactive atomic components like `Button`, `IconButton`, `Chip`, and `Switch` must trigger haptic feedback on interactive presses using Expo Haptics (`expo-haptics`).

### Standard Haptic Presets:
- **Selection/Toggle Change** (e.g., Switch toggling, Tab changes): Use `Haptics.selectionAsync()`
- **Standard Button/Icon press** (Light taps, interactive clicks): Use `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
- **Success Events** (e.g., Exam submission successful): Use `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`
- **Warning/Error Events** (e.g., Input verification fail): Use `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`

---

## 6. Accessibility & WCAG Compliance

All atomic components must comply with WCAG 2.1 AA guidelines for screen readers, keyboard focus, and size standards.

### Touch Targets
All interactive elements (buttons, inputs, sliders, switches) must maintain a minimum touch target size of **44x44 dp** to accommodate comfortable touch interactions. For small `IconButton` components, the element bounds should use `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` or larger to satisfy this requirement.

### Dynamic Accessibility Text
Always provide proper properties on interactive atoms:
- `accessibilityLabel`: Explains what the element is or its value.
- `accessibilityRole`: Identifies the type of element (e.g., `'button'`, `'switch'`, `'image'`).
- `accessibilityHint`: Explains the action that occurs when double-tapping the element.

### IELTS Score contrast compliance:
`ScoreBadge` color rules are dynamically computed based on the IELTS band scores to guarantee WCAG-compliant color contrast:
- **Success Green** (Score $\ge 7.0$): High-contrast green background with safe text color.
- **Primary / Amber Yellow** (Score $5.5 - 6.5$): Contrasting warm gold background.
- **Warning Red** (Score $< 5.5$): Error red background with a highly legible overlay.

