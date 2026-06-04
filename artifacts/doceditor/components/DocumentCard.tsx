import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Doc, DOC_TYPE_INFO, formatDate, getWordCount } from '@/types/document';
import { useColors } from '@/hooks/useColors';

interface Props {
  doc: Doc;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function DocumentCard({ doc, onPress, onDelete, onToggleFavorite }: Props) {
  const colors = useColors();
  const typeInfo = DOC_TYPE_INFO[doc.type];
  const wordCount = getWordCount(doc.content);
  const preview = doc.content.replace(/#+\s/g, '').replace(/\*+/g, '').replace(/\n+/g, ' ').trim().slice(0, 80);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '22' }]}>
          <Text style={[styles.typeText, { color: typeInfo.color }]}>
            .{doc.type}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              onToggleFavorite();
            }}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <Feather
              name="star"
              size={16}
              color={doc.isFavorite ? '#F7B731' : colors.mutedForeground}
              style={doc.isFavorite ? { fill: '#F7B731' } as any : undefined}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDelete();
            }}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {doc.title}
      </Text>

      {preview ? (
        <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
          {preview}
        </Text>
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Пустой документ
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatDate(doc.updatedAt)}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {wordCount} {wordCount === 1 ? 'слово' : wordCount < 5 ? 'слова' : 'слов'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 20,
    marginTop: 2,
  },
  preview: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  empty: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});
