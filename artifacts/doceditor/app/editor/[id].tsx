import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormatToolbar } from '@/components/FormatToolbar';
import { useDocuments } from '@/context/DocumentsContext';
import { DOC_TYPE_INFO, formatDate, getWordCount } from '@/types/document';
import { docTypeToExtension, insertLinePrefix, wrapSelection } from '@/utils/fileUtils';
import { useColors } from '@/hooks/useColors';

const AUTOSAVE_MS = 1500;

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { getDoc, updateDoc } = useDocuments();

  const doc = getDoc(id);

  const [title, setTitle] = useState(doc?.title ?? '');
  const [content, setContent] = useState(doc?.content ?? '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showInfo, setShowInfo] = useState(false);

  const contentRef = useRef<TextInput>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef(content);
  const lastSavedTitle = useRef(title);

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('@doceditor_settings');
      if (s) {
        const p = JSON.parse(s);
        setFontSize(p.fontSize ?? 14);
      }
    })();
  }, []);

  const saveNow = useCallback(async () => {
    if (!doc) return;
    if (title === lastSavedTitle.current && content === lastSavedContent.current) return;
    setIsSaving(true);
    await updateDoc(id, { title, content });
    lastSavedTitle.current = title;
    lastSavedContent.current = content;
    setTimeout(() => setIsSaving(false), 600);
  }, [doc, id, title, content, updateDoc]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveNow, AUTOSAVE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, saveNow]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: '' });
  }, [navigation]);

  if (!doc) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.destructive} />
        <Text style={[styles.notFound, { color: colors.foreground }]}>Документ не найден</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const typeInfo = DOC_TYPE_INFO[doc.type];
  const isCode = typeInfo.isCode;
  const wordCount = getWordCount(content);
  const lineCount = content.split('\n').length;
  const charCount = content.length;
  const ext = docTypeToExtension(doc.type);

  function applyFormat(type: string) {
    Haptics.selectionAsync();
    if (type === 'bold') {
      const { text, selection: sel } = wrapSelection(content, selection, '**', '**');
      setContent(text);
      setSelection(sel);
    } else if (type === 'italic') {
      const { text, selection: sel } = wrapSelection(content, selection, '_', '_');
      setContent(text);
      setSelection(sel);
    } else if (type === 'code') {
      const { text, selection: sel } = wrapSelection(content, selection, '`', '`');
      setContent(text);
      setSelection(sel);
    } else if (type === 'codeblock') {
      const { text, selection: sel } = wrapSelection(content, selection, '\n```\n', '\n```\n');
      setContent(text);
      setSelection(sel);
    } else if (type === 'h1') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '# ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'h2') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '## ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'h3') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '### ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'bullet') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '- ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'numbered') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '1. ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'quote') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '> ');
      setContent(text);
      setSelection(sel);
    } else if (type === 'checkbox') {
      const { text, selection: sel } = insertLinePrefix(content, selection, '- [ ] ');
      setContent(text);
      setSelection(sel);
    }
  }

  async function handleShare() {
    try {
      await saveNow();
      const fileName = `${title}.${ext}`;
      const path = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(path, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Поделиться документом' });
        }
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось поделиться файлом.');
    }
  }

  async function handleExportPDF() {
    try {
      await saveNow();
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: auto; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
  code { font-family: monospace; }
</style>
</head>
<body>
<h1>${title}</h1>
<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        }
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось экспортировать в PDF.');
    }
  }

  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const text = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      Alert.alert(
        'Импортировать файл',
        `Заменить содержимое документа содержимым "${asset.name}"?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Заменить',
            onPress: () => {
              setContent(text);
              const nameWithoutExt = asset.name.replace(/\.[^/.]+$/, '');
              setTitle(nameWithoutExt);
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось открыть файл.');
    }
  }

  const formatActions = isCode
    ? []
    : [
        { icon: 'bold' as const, onPress: () => applyFormat('bold') },
        { icon: 'italic' as const, onPress: () => applyFormat('italic') },
        { icon: 'code' as const, onPress: () => applyFormat('code') },
        { divider: true, onPress: () => {} },
        { label: 'H1', onPress: () => applyFormat('h1') },
        { label: 'H2', onPress: () => applyFormat('h2') },
        { label: 'H3', onPress: () => applyFormat('h3') },
        { divider: true, onPress: () => {} },
        { icon: 'list' as const, onPress: () => applyFormat('bullet') },
        { icon: 'hash' as const, onPress: () => applyFormat('numbered') },
        { icon: 'chevron-right' as const, onPress: () => applyFormat('quote') },
        { icon: 'check-square' as const, onPress: () => applyFormat('checkbox') },
        { divider: true, onPress: () => {} },
        { icon: 'align-left' as const, onPress: () => applyFormat('codeblock') },
      ];

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 4,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={async () => { await saveNow(); router.back(); }}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.topCenter}>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '22' }]}>
            <Text style={[styles.typeText, { color: typeInfo.color }]}>
              .{doc.type}
            </Text>
          </View>
          {isSaving && (
            <Text style={[styles.savingText, { color: colors.mutedForeground }]}>Сохранение...</Text>
          )}
        </View>

        <View style={styles.topRight}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setShowInfo((v) => !v)}
          >
            <Feather name="info" size={20} color={showInfo ? colors.primary : colors.foreground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleImport}
          >
            <Feather name="upload" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => {
              Alert.alert('Экспорт', 'Выберите формат', [
                { text: 'Текстовый файл (.txt)', onPress: handleShare },
                { text: 'PDF', onPress: handleExportPDF },
                { text: 'Отмена', style: 'cancel' },
              ]);
            }}
          >
            <Feather name="share-2" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {showInfo && (
        <View style={[styles.infoBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {wordCount} сл · {charCount} симв · {lineCount} стр · обновлён {formatDate(doc.updatedAt)}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <TextInput
              style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Название документа"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
              onSubmitEditing={() => contentRef.current?.focus()}
            />
          </View>

          <TextInput
            ref={contentRef}
            style={[
              styles.editor,
              {
                color: isCode ? colors.codeText : colors.foreground,
                backgroundColor: isCode ? colors.code : colors.background,
                fontFamily: isCode ? 'Inter_400Regular' : 'Inter_400Regular',
                fontSize,
                lineHeight: fontSize * 1.7,
              },
            ]}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder={isCode ? `// ${typeInfo.label} код` : 'Начните писать...'}
            placeholderTextColor={colors.mutedForeground}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            autoCorrect={!isCode}
            autoCapitalize={isCode ? 'none' : 'sentences'}
            keyboardType="default"
            scrollEnabled={false}
          />
          <View style={{ height: bottomInset + (formatActions.length > 0 ? 52 : 20) }} />
        </ScrollView>

        {formatActions.length > 0 && (
          <FormatToolbar actions={formatActions} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  topCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  savingText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  titleInput: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  editor: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 300,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFound: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
