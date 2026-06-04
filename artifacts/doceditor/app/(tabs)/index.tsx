import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentCard } from '@/components/DocumentCard';
import { NewDocModal } from '@/components/NewDocModal';
import { useDocuments } from '@/context/DocumentsContext';
import { DOC_TYPE_INFO, DocType } from '@/types/document';
import { useColors } from '@/hooks/useColors';

const FILTER_OPTIONS: Array<{ label: string; value: DocType | 'all' | 'favorites' }> = [
  { label: 'Все', value: 'all' },
  { label: 'Избранное', value: 'favorites' },
  { label: '.note', value: 'note' },
  { label: '.md', value: 'md' },
  { label: '.txt', value: 'txt' },
  { label: '.js', value: 'js' },
  { label: '.ts', value: 'ts' },
  { label: '.py', value: 'py' },
  { label: '.json', value: 'json' },
  { label: '.html', value: 'html' },
];

export default function DocumentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    filteredDocs,
    loading,
    deleteDoc,
    toggleFavorite,
    createDoc,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,
  } = useDocuments();

  const [showNew, setShowNew] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  async function handleDelete(id: string, title: string) {
    Alert.alert(
      'Удалить документ',
      `Удалить "${title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteDoc(id);
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Документы</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: pressed ? colors.muted : 'transparent' },
            ]}
            onPress={() => setShowSort((v) => !v)}
          >
            <Feather name="sliders" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.fabSmall,
              { backgroundColor: pressed ? colors.primary + 'cc' : colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNew(true);
            }}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {showSort && (
        <View style={[styles.sortRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          {(['updated', 'created', 'name'] as const).map((s) => (
            <Pressable
              key={s}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortBy === s ? colors.primary : colors.secondary,
                },
              ]}
              onPress={() => {
                setSortBy(s);
                setShowSort(false);
              }}
            >
              <Text style={[styles.sortText, { color: sortBy === s ? '#fff' : colors.foreground }]}>
                {s === 'updated' ? 'По изменению' : s === 'created' ? 'По созданию' : 'По имени'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Поиск..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.value;
            const typeColor = item.value !== 'all' && item.value !== 'favorites'
              ? DOC_TYPE_INFO[item.value as DocType]?.color
              : undefined;
            return (
              <Pressable
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? (typeColor ? typeColor + '22' : colors.primary + '22')
                      : colors.secondary,
                    borderColor: isActive
                      ? (typeColor ?? colors.primary)
                      : 'transparent',
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveFilter(item.value);
                }}
              >
                {item.value === 'favorites' && (
                  <Feather name="star" size={11} color={isActive ? '#F7B731' : colors.mutedForeground} />
                )}
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive
                        ? (typeColor ?? colors.primary)
                        : colors.mutedForeground,
                      fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : filteredDocs.length === 0 ? (
        <View style={styles.center}>
          <Feather name="file" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {searchQuery ? 'Ничего не найдено' : 'Нет документов'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {searchQuery
              ? 'Попробуйте другой запрос'
              : 'Нажмите + чтобы создать первый документ'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DocumentCard
              doc={item}
              onPress={() => router.push(`/editor/${item.id}`)}
              onDelete={() => handleDelete(item.id, item.title)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <NewDocModal
        visible={showNew}
        onClose={() => setShowNew(false)}
        onCreate={async (title, type) => {
          const doc = await createDoc(title, type);
          router.push(`/editor/${doc.id}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSmall: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  filterRow: {
    marginVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
