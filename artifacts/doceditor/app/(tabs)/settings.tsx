import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDocuments } from '@/context/DocumentsContext';
import { ALL_DOC_TYPES, DOC_TYPE_INFO, DocType } from '@/types/document';
import { useColors } from '@/hooks/useColors';

const FONT_SIZES = [12, 14, 16, 18, 20];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { docs } = useDocuments();

  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultType, setDefaultType] = useState<DocType>('note');
  const [lineNumbers, setLineNumbers] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('@doceditor_settings');
      if (s) {
        const p = JSON.parse(s);
        setFontSize(p.fontSize ?? 14);
        setWordWrap(p.wordWrap ?? true);
        setAutoSave(p.autoSave ?? true);
        setDefaultType(p.defaultType ?? 'note');
        setLineNumbers(p.lineNumbers ?? false);
      }
    })();
  }, []);

  async function save(key: string, value: unknown) {
    const s = await AsyncStorage.getItem('@doceditor_settings');
    const current = s ? JSON.parse(s) : {};
    await AsyncStorage.setItem(
      '@doceditor_settings',
      JSON.stringify({ ...current, [key]: value })
    );
  }

  const stats = {
    total: docs.length,
    favorites: docs.filter((d) => d.isFavorite).length,
    words: docs.reduce((acc, d) => acc + d.content.trim().split(/\s+/).filter(Boolean).length, 0),
    byType: ALL_DOC_TYPES.filter((t) => docs.some((d) => d.type === t)).map((t) => ({
      type: t,
      count: docs.filter((d) => d.type === t).length,
    })),
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 8, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Настройки</Text>

      <SectionCard title="Статистика" colors={colors}>
        <StatRow label="Документов" value={String(stats.total)} colors={colors} />
        <StatRow label="Избранных" value={String(stats.favorites)} colors={colors} />
        <StatRow label="Слов всего" value={stats.words.toLocaleString('ru')} colors={colors} />
        {stats.byType.length > 0 && (
          <View style={styles.typeStats}>
            {stats.byType.slice(0, 6).map(({ type, count }) => (
              <View
                key={type}
                style={[styles.typeStat, { backgroundColor: DOC_TYPE_INFO[type].color + '22' }]}
              >
                <Text style={[styles.typeStatText, { color: DOC_TYPE_INFO[type].color }]}>
                  .{type} × {count}
                </Text>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Редактор" colors={colors}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Размер шрифта</Text>
          <View style={styles.fontSizeRow}>
            {FONT_SIZES.map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.sizeBtn,
                  {
                    backgroundColor: fontSize === size ? colors.primary : colors.secondary,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFontSize(size);
                  save('fontSize', size);
                }}
              >
                <Text style={[styles.sizeBtnText, { color: fontSize === size ? '#fff' : colors.foreground }]}>
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <ToggleRow
          label="Перенос строк"
          value={wordWrap}
          onChange={(v) => { setWordWrap(v); save('wordWrap', v); }}
          colors={colors}
        />
        <ToggleRow
          label="Авто-сохранение"
          value={autoSave}
          onChange={(v) => { setAutoSave(v); save('autoSave', v); }}
          colors={colors}
        />
        <ToggleRow
          label="Нумерация строк"
          value={lineNumbers}
          onChange={(v) => { setLineNumbers(v); save('lineNumbers', v); }}
          colors={colors}
        />
      </SectionCard>

      <SectionCard title="Тип по умолчанию" colors={colors}>
        <View style={styles.typeGrid}>
          {(['note', 'md', 'txt', 'js', 'ts', 'py', 'json'] as DocType[]).map((type) => {
            const info = DOC_TYPE_INFO[type];
            const isSelected = defaultType === type;
            return (
              <Pressable
                key={type}
                style={[
                  styles.typeChip,
                  {
                    borderColor: isSelected ? info.color : colors.border,
                    backgroundColor: isSelected ? info.color + '18' : colors.secondary,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDefaultType(type);
                  save('defaultType', type);
                }}
              >
                <Text style={[styles.typeChipText, { color: isSelected ? info.color : colors.mutedForeground }]}>
                  .{type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="О приложении" colors={colors}>
        <StatRow label="Версия" value="1.0.0" colors={colors} />
        <StatRow label="Форматов" value={`${ALL_DOC_TYPES.length}+`} colors={colors} />
        <StatRow label="Хранилище" value="AsyncStorage (на устройстве)" colors={colors} />
      </SectionCard>

      <Pressable
        style={[styles.dangerBtn, { borderColor: colors.destructive }]}
        onPress={() => {
          Alert.alert(
            'Удалить все данные',
            'Это безвозвратно удалит все документы и настройки.',
            [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Удалить всё',
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.multiRemove(['@doceditor_documents_v1', '@doceditor_settings']);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                },
              },
            ]
          );
        }}
      >
        <Feather name="trash-2" size={16} color={colors.destructive} />
        <Text style={[styles.dangerText, { color: colors.destructive }]}>Удалить все данные</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionCard({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function StatRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary + '88' }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  fontSizeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeBtn: {
    width: 34,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  typeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  typeStat: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeStatText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    marginBottom: 20,
  },
  dangerText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
