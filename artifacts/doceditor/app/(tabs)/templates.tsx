import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDocuments } from '@/context/DocumentsContext';
import { DOC_TYPE_INFO } from '@/types/document';
import { TEMPLATES_DATA } from '@/utils/fileUtils';
import { useColors } from '@/hooks/useColors';

const CATEGORIES = [
  { key: 'text', label: 'Текстовые', icon: 'file-text' as const },
  { key: 'code', label: 'Код', icon: 'code' as const },
  { key: 'data', label: 'Данные', icon: 'database' as const },
  { key: 'web', label: 'Веб', icon: 'globe' as const },
];

export default function TemplatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createDoc } = useDocuments();
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = TEMPLATES_DATA.filter(
    (t) => !activeCat || t.category === activeCat
  );

  const sections = CATEGORIES.filter(
    (c) => !activeCat || c.key === activeCat
  ).map((cat) => ({
    title: cat.label,
    icon: cat.icon,
    data: filtered.filter((t) => t.category === cat.key),
  })).filter((s) => s.data.length > 0);

  async function handleUse(templateId: string) {
    const tpl = TEMPLATES_DATA.find((t) => t.id === templateId);
    if (!tpl) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const doc = await createDoc(tpl.title, tpl.type, tpl.content);
    router.push(`/editor/${doc.id}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Шаблоны</Text>
      </View>

      <View style={styles.catRow}>
        {[{ key: null, label: 'Все' }, ...CATEGORIES.map((c) => ({ key: c.key, label: c.label }))].map((cat) => (
          <Pressable
            key={String(cat.key)}
            style={[
              styles.catChip,
              {
                backgroundColor: activeCat === cat.key ? colors.primary : colors.secondary,
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveCat(cat.key);
            }}
          >
            <Text style={[styles.catText, { color: activeCat === cat.key ? '#fff' : colors.mutedForeground }]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
        ]}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Feather name={section.icon} size={14} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const typeInfo = DOC_TYPE_INFO[item.type];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: pressed ? colors.card + 'cc' : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleUse(item.id)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.badge, { backgroundColor: typeInfo.color + '22' }]}>
                  <Text style={[styles.badgeText, { color: typeInfo.color }]}>
                    .{item.type}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  catRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  catText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  list: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
