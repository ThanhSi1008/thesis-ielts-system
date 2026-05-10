import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  isActive?: boolean;
  children?: { key: string; label: string; route: string; isActive?: boolean }[];
}

interface SharedDrawerProps {
  drawerOpen: boolean;
  drawerAnim: Animated.Value;
  backdropAnim: Animated.Value;
  insetsTop: number;
  navItems: NavItem[];
  title?: string;
  onClose: () => void;
  onNavPress: (route: string) => void;
}

export function SharedDrawer({
  drawerOpen,
  drawerAnim,
  backdropAnim,
  insetsTop,
  navItems,
  title,
  onClose,
  onNavPress
}: SharedDrawerProps) {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { paddingTop: insetsTop, transform: [{ translateX: drawerAnim }] }]}
        pointerEvents={drawerOpen ? 'auto' : 'none'}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {title ? (
            <Text style={styles.drawerTitle}>{title}</Text>
          ) : (
            <Image
              source={{ uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png' }}
              style={styles.drawerLogoImage}
              resizeMode="contain"
            />
          )}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingVertical: SPACING.sm }}>
          <Text style={styles.drawerSection}>MENU</Text>
          {navItems.map((item) => {
            const isExpanded = expandedKeys[item.key];
            
            if (item.children) {
              return (
                <View key={item.key}>
                  <TouchableOpacity
                    style={[styles.navItem, item.isActive && styles.navItemActive]}
                    onPress={() => toggleExpand(item.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.isActive ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.childrenContainer}>
                      {item.children.map(child => (
                        <TouchableOpacity
                          key={child.key}
                          style={[styles.childItem, child.isActive && styles.childItemActive]}
                          onPress={() => onNavPress(child.route)}
                        >
                          <Text style={[styles.childLabel, child.isActive && styles.childLabelActive]}>
                            {child.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.navItem, item.isActive && styles.navItemActive]}
                onPress={() => onNavPress(item.route)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.isActive ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50,
  },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: 280, backgroundColor: '#fff', zIndex: 60,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  drawerHeader: {
    height: 64, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border,
    gap: SPACING.md,
  },
  drawerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  drawerLogoImage: {
    width: 120, height: 40,
  },
  drawerSection: { 
    fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold, color: COLORS.textMuted, 
    textTransform: 'uppercase', letterSpacing: 0.8, 
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm 
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    marginHorizontal: SPACING.sm, borderRadius: RADIUS.lg, marginBottom: 2,
  },
  navItemActive: { backgroundColor: COLORS.primary + '15' },
  navLabel: { flex: 1, fontFamily: FONTS.medium, fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  navLabelActive: { fontFamily: FONTS.bold, color: COLORS.primary },
  
  childrenContainer: {
    marginLeft: 44,
    marginRight: SPACING.sm,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  childItem: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  childItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  childLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  childLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  }
});
