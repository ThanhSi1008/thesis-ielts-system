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
