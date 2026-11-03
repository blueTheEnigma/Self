import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

export type LifeDomain = 'spirit_intellect' | 'physical_sovereignty' | 'craft_sanctuary';

export interface ChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  domain: LifeDomain;
  category: 'spiritual' | 'movement' | 'nutrition' | 'focus' | 'creative' | 'mind' | 'outreach';
  isCompleted: boolean;
  onToggle: () => void;
}

interface TodayChecklistProps {
  items: ChecklistItem[];
}

interface DomainConfig {
  id: LifeDomain;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const DOMAINS: DomainConfig[] = [
  {
    id: 'spirit_intellect',
    title: 'Spirit & Intellect',
    icon: 'flame',
    color: Colors.lavenderDark,
    bgColor: Colors.lavender,
  },
  {
    id: 'physical_sovereignty',
    title: 'Physical Sovereignty',
    icon: 'barbell',
    color: Colors.mintDark,
    bgColor: Colors.mint,
  },
  {
    id: 'craft_sanctuary',
    title: 'Craft & Sanctuary',
    icon: 'shield-checkmark',
    color: Colors.honeyDark,
    bgColor: Colors.honey,
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  spiritual: { bg: Colors.lavender, text: Colors.lavenderDark, icon: 'sunny' },
  movement: { bg: Colors.mint, text: Colors.mintDark, icon: 'barbell' },
  nutrition: { bg: Colors.peach, text: Colors.peachDark, icon: 'restaurant' },
  focus: { bg: Colors.honey, text: Colors.honeyDark, icon: 'code-slash' },
  creative: { bg: Colors.lavender, text: Colors.lavenderDark, icon: 'musical-notes' },
  mind: { bg: Colors.primaryMuted, text: Colors.primary, icon: 'headset' },
  outreach: { bg: Colors.primaryMuted, text: Colors.primaryDark, icon: 'mail' },
};

export const TodayChecklist: React.FC<TodayChecklistProps> = ({ items }) => {
  const completedCount = items.filter(i => i.isCompleted).length;
  const totalCount = items.length;
  const isAllSealed = totalCount > 0 && completedCount === totalCount;

  return (
    <View style={styles.container}>
      {/* Global Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Daily Covenant Checklist</Text>
          <Text style={styles.sectionSubtitle}>3 Sovereignty Domains • 10 Disciplines</Text>
        </View>
        <View style={[styles.counterBadge, isAllSealed && styles.counterBadgeAllDone]}>
          <Text style={[styles.counterBadgeText, isAllSealed && styles.counterBadgeTextAllDone]}>
            {completedCount}/{totalCount} Sealed
          </Text>
        </View>
      </View>

      {/* 100% Consecrated Sensory Climax Banner */}
      {isAllSealed && (
        <View style={styles.consecrationBanner}>
          <View style={styles.consecrationIconBox}>
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.consecrationTitle}>👑 Sovereign Covenant Consecrated</Text>
            <Text style={styles.consecrationSub}>
              All 10 daily disciplines sealed. Zero compromise. Unbroken momentum.
            </Text>
          </View>
        </View>
      )}

      {/* Domain Groups */}
      {DOMAINS.map(domain => {
        const domainItems = items.filter(i => i.domain === domain.id);
        if (domainItems.length === 0) return null;

        const domainCompleted = domainItems.filter(i => i.isCompleted).length;
        const isDomainDone = domainCompleted === domainItems.length;

        return (
          <View key={domain.id} style={styles.domainSection}>
            {/* Domain Section Header */}
            <View style={styles.domainHeader}>
              <View style={styles.domainHeaderLeft}>
                <View style={[styles.domainIconBadge, { backgroundColor: domain.bgColor }]}>
                  <Ionicons name={domain.icon} size={13} color={domain.color} />
                </View>
                <Text style={styles.domainTitle}>{domain.title}</Text>
              </View>

              <View style={[styles.domainProgressPill, isDomainDone && styles.domainProgressPillDone]}>
                {isDomainDone && <Ionicons name="checkmark-circle" size={12} color={Colors.emerald} style={{ marginRight: 3 }} />}
                <Text style={[styles.domainProgressText, isDomainDone && styles.domainProgressTextDone]}>
                  {domainCompleted}/{domainItems.length} Sealed
                </Text>
              </View>
            </View>

            {/* Domain Checklist Cards */}
            <View style={styles.itemsList}>
              {domainItems.map(item => {
                const config = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.spiritual;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemCard,
                      item.isCompleted && styles.itemCardCompleted,
                    ]}
                    onPress={() => {
                      safeHaptics.light();
                      item.onToggle();
                    }}
                    activeOpacity={0.75}
                  >
                    {/* Category Icon Chip */}
                    <View style={[styles.iconChip, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon} size={15} color={config.text} />
                    </View>

                    {/* Title & Subtitle */}
                    <View style={styles.contentCol}>
                      <Text style={[styles.itemTitle, item.isCompleted && styles.itemTitleCompleted]}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>

                    {/* Checkbox Pill */}
                    <View style={[
                      styles.checkbox,
                      item.isCompleted && styles.checkboxDone,
                    ]}>
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={13} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  counterBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterBadgeAllDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  counterBadgeTextAllDone: {
    color: '#065F46',
  },
  consecrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  consecrationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  consecrationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  consecrationSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  domainSection: {
    marginBottom: Spacing.md,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  domainHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  domainIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  domainTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  domainProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  domainProgressPillDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  domainProgressText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  domainProgressTextDone: {
    color: Colors.emerald,
  },
  itemsList: {
    gap: 7,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  itemCardCompleted: {
    backgroundColor: Colors.surfaceHighlight,
    borderColor: Colors.borderLight,
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemTitleCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  itemSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
