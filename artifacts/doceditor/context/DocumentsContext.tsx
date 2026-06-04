import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Doc, DocType, getWordCount } from '@/types/document';
import { generateId } from '@/utils/fileUtils';

const STORAGE_KEY = '@doceditor_documents_v1';

interface DocumentsContextValue {
  docs: Doc[];
  loading: boolean;
  createDoc: (title: string, type: DocType, content?: string) => Promise<Doc>;
  updateDoc: (id: string, changes: Partial<Pick<Doc, 'title' | 'content'>>) => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getDoc: (id: string) => Doc | undefined;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: DocType | 'all' | 'favorites';
  setActiveFilter: (f: DocType | 'all' | 'favorites') => void;
  filteredDocs: Doc[];
  sortBy: 'updated' | 'created' | 'name';
  setSortBy: (s: 'updated' | 'created' | 'name') => void;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DocType | 'all' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Doc[];
          setDocs(parsed);
        } else {
          const starter: Doc = {
            id: generateId(),
            title: 'Добро пожаловать!',
            type: 'md',
            content: `# DocEditor\n\nПриложение для создания и редактирования документов любых форматов.\n\n## Возможности\n\n- Поддержка 20+ форматов файлов\n- Редактор с форматированием\n- Шаблоны документов\n- Импорт файлов с устройства\n- Экспорт и отправка\n\n## Форматы\n\nТекстовые: \`.note\`, \`.md\`, \`.txt\`\n\nКод: \`.js\`, \`.ts\`, \`.py\`, \`.go\`, \`.rs\` и другие\n\nДанные: \`.json\`, \`.csv\`, \`.yaml\`, \`.xml\`\n\nВеб: \`.html\`, \`.css\`\n`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isFavorite: true,
          };
          setDocs([starter]);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([starter]));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Doc[]) => {
    setDocs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const createDoc = useCallback(
    async (title: string, type: DocType, content = ''): Promise<Doc> => {
      const doc: Doc = {
        id: generateId(),
        title,
        type,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false,
      };
      await persist([doc, ...docs]);
      return doc;
    },
    [docs, persist]
  );

  const updateDoc = useCallback(
    async (id: string, changes: Partial<Pick<Doc, 'title' | 'content'>>) => {
      const next = docs.map((d) =>
        d.id === id ? { ...d, ...changes, updatedAt: Date.now() } : d
      );
      await persist(next);
    },
    [docs, persist]
  );

  const deleteDoc = useCallback(
    async (id: string) => {
      await persist(docs.filter((d) => d.id !== id));
    },
    [docs, persist]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const next = docs.map((d) =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      );
      await persist(next);
    },
    [docs, persist]
  );

  const getDoc = useCallback(
    (id: string) => docs.find((d) => d.id === id),
    [docs]
  );

  const filteredDocs = React.useMemo(() => {
    let result = [...docs];

    if (activeFilter === 'favorites') {
      result = result.filter((d) => d.isFavorite);
    } else if (activeFilter !== 'all') {
      result = result.filter((d) => d.type === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title, 'ru');
      if (sortBy === 'created') return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [docs, activeFilter, searchQuery, sortBy]);

  return (
    <DocumentsContext.Provider
      value={{
        docs,
        loading,
        createDoc,
        updateDoc,
        deleteDoc,
        toggleFavorite,
        getDoc,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        filteredDocs,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used inside DocumentsProvider');
  return ctx;
}
