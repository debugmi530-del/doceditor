import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALL_DOC_TYPES, DOC_TYPE_INFO, DocType } from '@/types/document';
import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, type: DocType) => void;
}

const POPULAR_TYPES: DocType[] = ['note', 'md', 'txt', 'js', 'ts', 'py', 'json', 'html'];

export function NewDocModal({ visible, onClose, onCreate }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<DocType>('note');
  const [showAllTypes, setShowAllTypes] = useState(false);

  const displayedTypes = showAllTypes ? ALL_DOC_TYPES : POPULAR_TYPES;

  function handleCreate() {
    const finalTitle = title.trim() || 'Без названия';
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCreate(finalTitle, selectedType);
    setTitle('');
    setSelectedType('note');
    setShowAllTypes(false);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <View style={styles.topRow}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Новый документ</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Название документа..."
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Тип файла</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeGrid}>
            {displayedTypes.map((type) => {
              const info = DOC_TYPE_INFO[type];
              const isSelected = selectedType === type;
              return (
                <Pressable
                  key={type}
                  style={[
                    styles.typeChip,
                    {
                      borderColor: isSelected ? info.color : colors.border,
                      backgroundColor: isSelected ? info.color + '18' : colors.card,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedType(type);
                  }}
                >
                  <Text style={[styles.typeLabel, { color: isSelected ? info.color : colors.mutedForeground }]}>
                    .{type}
                  </Text>
                  <Text style={[styles.typeDesc, { color: isSelected ? info.color : colors.mutedForeground }]}>
                    {info.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.toggleAll}
            onPress={() => setShowAllTypes((v) => !v)}
          >
            <Text style={[styles.toggleAllText, { color: colors.primary }]}>
              {showAllTypes ? 'Показать меньше' : `Ещё ${ALL_DOC_TYPES.length - POPULAR_TYPES.length} форматов`}
            </Text>
            <Feather name={showAllTypes ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
          </Pressable>
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: pressed ? colors.primary + 'cc' : colors.primary },
          ]}
          onPress={handleCreate}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.createBtnText}>Создать</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  input: {
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  typeScroll: {
    flex: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  typeLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  typeDesc: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  toggleAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
  },
  toggleAllText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
