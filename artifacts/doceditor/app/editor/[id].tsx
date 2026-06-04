import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  const [wordWrap, setWordWrap] = useState(true);

  const [showInfo, setShowInfo] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);

  const contentRef = useRef<TextInput>(null);
  const findRef = useRef<TextInput>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef(content);
  const lastSavedTitle = useRef(title);

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('@doceditor_settings');
      if (s) {
        const p = JSON.parse(s);
        setFontSize(p.fontSize ?? 14);
        setWordWrap(p.wordWrap ?? true);
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
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, content, saveNow]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: '' });
  }, [navigation]);

  // ── Find matches ──────────────────────────────────────────────────────────
  const matches = useMemo<Array<{ start: number; end: number }>>(() => {
    if (!findQuery.trim()) return [];
    const results: Array<{ start: number; end: number }> = [];
    const lower = content.toLowerCase();
    const q = findQuery.toLowerCase();
    let from = 0;
    while (true) {
      const idx = lower.indexOf(q, from);
      if (idx === -1) break;
      results.push({ start: idx, end: idx + q.length });
      from = idx + 1;
    }
    return results;
  }, [content, findQuery]);

  useEffect(() => { setMatchIndex(0); }, [findQuery]);

  function goToMatch(index: number) {
    if (matches.length === 0) return;
    const i = ((index % matches.length) + matches.length) % matches.length;
    setMatchIndex(i);
    setSelection(matches[i]);
    contentRef.current?.focus();
  }

  function doReplace() {
    if (matches.length === 0) return;
    const m = matches[matchIndex] ?? matches[0];
    const next =
      content.slice(0, m.start) + replaceQuery + content.slice(m.end);
    setContent(next);
    Haptics.selectionAsync();
  }

  function doReplaceAll() {
    if (!findQuery.trim()) return;
    const next = content.replaceAll(findQuery, replaceQuery);
    setContent(next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

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
  const commentPrefix = typeInfo.commentPrefix ?? '# ';
  const commentSuffix = typeInfo.commentSuffix;

  // ── Format actions ────────────────────────────────────────────────────────
  function applyFormat(type: string) {
    Haptics.selectionAsync();

    const apply = (before: string, after = '') => {
      const { text, selection: sel } = wrapSelection(content, selection, before, after);
      setContent(text); setSelection(sel);
    };
    const applyLine = (prefix: string) => {
      const { text, selection: sel } = insertLinePrefix(content, selection, prefix);
      setContent(text); setSelection(sel);
    };

    switch (type) {
      case 'bold':       return apply('**', '**');
      case 'italic':     return apply('_', '_');
      case 'strike':     return apply('~~', '~~');
      case 'code':       return apply('`', '`');
      case 'codeblock':  return apply('\n```\n', '\n```\n');
      case 'h1':         return applyLine('# ');
      case 'h2':         return applyLine('## ');
      case 'h3':         return applyLine('### ');
      case 'bullet':     return applyLine('- ');
      case 'numbered':   return applyLine('1. ');
      case 'quote':      return applyLine('> ');
      case 'checkbox':   return applyLine('- [ ] ');
      case 'hr': {
        const ins = '\n\n---\n\n';
        const pos = selection.end;
        setContent(content.slice(0, pos) + ins + content.slice(pos));
        setSelection({ start: pos + ins.length, end: pos + ins.length });
        return;
      }
      case 'link': {
        const sel = content.slice(selection.start, selection.end);
        const ins = `[${sel || 'текст'}](url)`;
        const next = content.slice(0, selection.start) + ins + content.slice(selection.end);
        setContent(next);
        return;
      }
      case 'table': {
        const tbl = '\n| Заголовок 1 | Заголовок 2 | Заголовок 3 |\n| --- | --- | --- |\n| Ячейка | Ячейка | Ячейка |\n';
        const pos = selection.end;
        setContent(content.slice(0, pos) + tbl + content.slice(pos));
        return;
      }
      case 'comment': {
        // toggle comment on current line
        const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1;
        const lineEnd   = content.indexOf('\n', selection.start);
        const end = lineEnd === -1 ? content.length : lineEnd;
        const line = content.slice(lineStart, end);

        if (commentSuffix) {
          const alreadyCommented = line.startsWith(commentPrefix.trim()) && line.endsWith(commentSuffix.trim());
          if (alreadyCommented) {
            const uncommented = line
              .replace(new RegExp(`^${commentPrefix.trim()}\\s?`), '')
              .replace(new RegExp(`\\s?${commentSuffix.trim()}$`), '');
            setContent(content.slice(0, lineStart) + uncommented + content.slice(end));
          } else {
            setContent(content.slice(0, lineStart) + commentPrefix + line + commentSuffix + content.slice(end));
          }
        } else {
          if (line.startsWith(commentPrefix)) {
            setContent(content.slice(0, lineStart) + line.slice(commentPrefix.length) + content.slice(end));
          } else {
            setContent(content.slice(0, lineStart) + commentPrefix + line + content.slice(end));
          }
        }
        return;
      }
      case 'indent': {
        const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1;
        const next = content.slice(0, lineStart) + '  ' + content.slice(lineStart);
        setContent(next);
        setSelection({ start: selection.start + 2, end: selection.end + 2 });
        return;
      }
      case 'dedent': {
        const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1;
        const line = content.slice(lineStart);
        if (line.startsWith('  ')) {
          setContent(content.slice(0, lineStart) + content.slice(lineStart + 2));
          setSelection({ start: Math.max(lineStart, selection.start - 2), end: Math.max(lineStart, selection.end - 2) });
        } else if (line.startsWith('\t')) {
          setContent(content.slice(0, lineStart) + content.slice(lineStart + 1));
          setSelection({ start: Math.max(lineStart, selection.start - 1), end: Math.max(lineStart, selection.end - 1) });
        }
        return;
      }
      case 'duplicate': {
        const lineStart = content.lastIndexOf('\n', selection.start - 1) + 1;
        const lineEnd   = content.indexOf('\n', selection.start);
        const end = lineEnd === -1 ? content.length : lineEnd;
        const line = content.slice(lineStart, end);
        const next = content.slice(0, end) + '\n' + line + content.slice(end);
        setContent(next);
        return;
      }
      case 'copy_all': {
        Clipboard.setStringAsync(content);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      case 'date': {
        const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const pos = selection.start;
        setContent(content.slice(0, pos) + dateStr + content.slice(selection.end));
        setSelection({ start: pos + dateStr.length, end: pos + dateStr.length });
        return;
      }
      case 'datetime': {
        const dtStr = new Date().toLocaleString('ru-RU');
        const pos = selection.start;
        setContent(content.slice(0, pos) + dtStr + content.slice(selection.end));
        setSelection({ start: pos + dtStr.length, end: pos + dtStr.length });
        return;
      }
    }
  }

  async function handleShare() {
    try {
      await saveNow();
      const fileName = `${title}.${ext}`;
      const path = (FileSystem.cacheDirectory ?? '') + fileName;
      await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Поделиться документом' });
      } else {
        await Clipboard.setStringAsync(content);
        Alert.alert('Скопировано', 'Содержимое скопировано в буфер обмена.');
      }
    } catch { Alert.alert('Ошибка', 'Не удалось поделиться файлом.'); }
  }

  async function handleExportPDF() {
    try {
      await saveNow();
      const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:-apple-system,sans-serif;padding:40px;max-width:800px;margin:auto;line-height:1.6}
        pre{background:#f5f5f5;padding:16px;border-radius:4px;overflow-x:auto;font-size:13px}
        h1{border-bottom:2px solid #eee;padding-bottom:8px}
      </style></head><body><h1>${title}</h1><pre>${escaped}</pre></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS !== 'web') {
        const can = await Sharing.isAvailableAsync();
        if (can) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      }
    } catch { Alert.alert('Ошибка', 'Не удалось экспортировать в PDF.'); }
  }

  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const text = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('Импортировать файл', `Заменить содержимое содержимым "${asset.name}"?`, [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Заменить', onPress: () => { setContent(text); setTitle(asset.name.replace(/\.[^/.]+$/, '')); } },
      ]);
    } catch { Alert.alert('Ошибка', 'Не удалось открыть файл.'); }
  }

  // ── Toolbar definitions ───────────────────────────────────────────────────
  const mdActions = [
    { icon: 'bold' as const,          onPress: () => applyFormat('bold') },
    { icon: 'italic' as const,        onPress: () => applyFormat('italic') },
    { label: '~~',                    onPress: () => applyFormat('strike') },
    { icon: 'code' as const,          onPress: () => applyFormat('code') },
    { divider: true, onPress: () => {} },
    { label: 'H1',                    onPress: () => applyFormat('h1') },
    { label: 'H2',                    onPress: () => applyFormat('h2') },
    { label: 'H3',                    onPress: () => applyFormat('h3') },
    { divider: true, onPress: () => {} },
    { icon: 'list' as const,          onPress: () => applyFormat('bullet') },
    { icon: 'hash' as const,          onPress: () => applyFormat('numbered') },
    { icon: 'chevron-right' as const, onPress: () => applyFormat('quote') },
    { icon: 'check-square' as const,  onPress: () => applyFormat('checkbox') },
    { divider: true, onPress: () => {} },
    { icon: 'link' as const,          onPress: () => applyFormat('link') },
    { icon: 'minus' as const,         onPress: () => applyFormat('hr') },
    { icon: 'grid' as const,          onPress: () => applyFormat('table') },
    { icon: 'align-left' as const,    onPress: () => applyFormat('codeblock') },
    { divider: true, onPress: () => {} },
    { icon: 'calendar' as const,      onPress: () => applyFormat('date') },
  ];

  const codeActions = [
    { icon: 'message-square' as const, onPress: () => applyFormat('comment') },
    { icon: 'chevrons-right' as const, onPress: () => applyFormat('indent') },
    { icon: 'chevrons-left' as const,  onPress: () => applyFormat('dedent') },
    { divider: true, onPress: () => {} },
    { icon: 'copy' as const,           onPress: () => applyFormat('duplicate') },
    { icon: 'clipboard' as const,      onPress: () => applyFormat('copy_all') },
    { divider: true, onPress: () => {} },
    { icon: 'calendar' as const,       onPress: () => applyFormat('date') },
    { icon: 'clock' as const,          onPress: () => applyFormat('datetime') },
  ];

  const toolbarActions = isCode ? codeActions : mdActions;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const topPad = (Platform.OS === 'web' ? 67 : insets.top) + 4;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topPad, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={async () => { await saveNow(); router.back(); }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.topCenter}>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '22' }]}>
            <Text style={[styles.typeText, { color: typeInfo.color }]}>.{doc.type}</Text>
          </View>
          {isSaving && <Text style={[styles.savingText, { color: colors.mutedForeground }]}>Сохранение…</Text>}
        </View>

        <View style={styles.topRight}>
          <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => { setShowFind(v => !v); setShowInfo(false); if (!showFind) setTimeout(() => findRef.current?.focus(), 100); }}>
            <Feather name="search" size={19} color={showFind ? colors.primary : colors.foreground} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => { setShowInfo(v => !v); setShowFind(false); }}>
            <Feather name="bar-chart-2" size={19} color={showInfo ? colors.primary : colors.foreground} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleImport}>
            <Feather name="upload" size={19} color={colors.foreground} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => Alert.alert('Экспорт', 'Выберите формат', [
              { text: `Текст (.${ext})`, onPress: handleShare },
              { text: 'PDF',            onPress: handleExportPDF },
              { text: 'Копировать всё', onPress: () => { Clipboard.setStringAsync(content); Haptics.selectionAsync(); } },
              { text: 'Отмена',         style: 'cancel' },
            ])}>
            <Feather name="share-2" size={19} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ── Stats bar ── */}
      {showInfo && (
        <View style={[styles.infoBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {wordCount} {wordCount === 1 ? 'слово' : 'слов'} · {charCount} симв · {lineCount} строк
          </Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            обновлён {formatDate(doc.updatedAt)}
          </Text>
        </View>
      )}

      {/* ── Find & Replace bar ── */}
      {showFind && (
        <View style={[styles.findBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.findRow}>
            <View style={[styles.findInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                ref={findRef}
                style={[styles.findText, { color: colors.foreground }]}
                placeholder="Найти…"
                placeholderTextColor={colors.mutedForeground}
                value={findQuery}
                onChangeText={setFindQuery}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {matches.length > 0 && (
                <Text style={[styles.matchCount, { color: colors.primary }]}>
                  {matchIndex + 1}/{matches.length}
                </Text>
              )}
              {findQuery.length > 0 && matches.length === 0 && (
                <Text style={[styles.matchCount, { color: colors.destructive }]}>0</Text>
              )}
            </View>
            <Pressable style={styles.findBtn} onPress={() => goToMatch(matchIndex - 1)} hitSlop={6}>
              <Feather name="chevron-up" size={18} color={matches.length ? colors.foreground : colors.mutedForeground} />
            </Pressable>
            <Pressable style={styles.findBtn} onPress={() => goToMatch(matchIndex + 1)} hitSlop={6}>
              <Feather name="chevron-down" size={18} color={matches.length ? colors.foreground : colors.mutedForeground} />
            </Pressable>
            <Pressable style={styles.findBtn} onPress={() => { setShowFind(false); setFindQuery(''); }} hitSlop={6}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.replaceRow}>
            <View style={[styles.findInput, { backgroundColor: colors.secondary, borderColor: colors.border, flex: 1 }]}>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[styles.findText, { color: colors.foreground }]}
                placeholder="Заменить на…"
                placeholderTextColor={colors.mutedForeground}
                value={replaceQuery}
                onChangeText={setReplaceQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Pressable
              style={[styles.replaceBtn, { backgroundColor: matches.length ? colors.primary + '22' : colors.secondary }]}
              onPress={doReplace}>
              <Text style={[styles.replaceBtnText, { color: matches.length ? colors.primary : colors.mutedForeground }]}>Заменить</Text>
            </Pressable>
            <Pressable
              style={[styles.replaceBtn, { backgroundColor: matches.length ? colors.primary + '22' : colors.secondary }]}
              onPress={doReplaceAll}>
              <Text style={[styles.replaceBtnText, { color: matches.length ? colors.primary : colors.mutedForeground }]}>Все</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Editor ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

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
                fontSize,
                lineHeight: fontSize * 1.7,
              },
            ]}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder={isCode ? `// ${typeInfo.label}` : 'Начните писать…'}
            placeholderTextColor={colors.mutedForeground}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            autoCorrect={!isCode}
            autoCapitalize={isCode ? 'none' : 'sentences'}
            scrollEnabled={false}
          />

          {/* Line count badge for code */}
          {isCode && lineCount > 1 && (
            <View style={[styles.lineBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.lineBadgeText, { color: colors.mutedForeground }]}>
                {lineCount} стр · {charCount} симв
              </Text>
            </View>
          )}

          <View style={{ height: bottomInset + 52 }} />
        </ScrollView>

        <FormatToolbar actions={toolbarActions} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    gap: 0,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  topCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  savingText: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular' },

  findBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 6,
  },
  findRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replaceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  findInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 34,
  },
  findText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  matchCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  findBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  replaceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  replaceBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  titleRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
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
    fontFamily: 'Inter_400Regular',
  },
  lineBadge: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  lineBadgeText: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
