import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

export type NavTabId = 'today' | 'movement' | 'focus' | 'vault' | 'stats';

interface BottomNavBarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  showSundayBadge?: boolean;
}

interface NavItem {
  id: NavTabId;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  badge?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  showSundayBadge = false,
}) => {
  const tabs: NavItem[] = [
    {
      id: 'today',
      label: 'Today',
      iconOutline: 'sunny-outline',
      iconFilled: 'sunny',
    },
    {
      id: 'movement',
      label: 'Movement',
      iconOutline: 'barbell-outline',
      iconFilled: 'barbell',
    },
    {
      id: 'focus',
      label: 'Focus',
      iconOutline: 'timer-outline',
      iconFilled: 'timer',
    },
    {
      id: 'vault',
      label: 'Vault',
      iconOutline: 'shield-checkmark-outline',
      iconFilled: 'shield-checkmark',
    },
    {
      id: 'stats',
      label: 'Stats',
      iconOutline: 'stats-chart-outline',
      iconFilled: 'stats-chart',
      badge: showSundayBadge,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconName = isActive ? tab.iconFilled : tab.iconOutline;
        const iconColor = isActive ? Colors.primary : Colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => {
              if (!isActive) {
                safeHaptics.light();
                onSelectTab(tab.id);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
              {tab.badge && !isActive && <View style={styles.dotBadge} />}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: 16,
    paddingHorizontal: Spacing.sm,
    ...Shadows.soft,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryMuted,
  },
  dotBadge: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.amber,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
