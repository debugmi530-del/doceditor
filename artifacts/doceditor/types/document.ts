export type DocType =
  | 'note' | 'md' | 'txt'
  | 'html' | 'css' | 'js' | 'ts' | 'jsx' | 'tsx'
  | 'json' | 'xml' | 'csv' | 'yaml'
  | 'py' | 'java' | 'c' | 'cpp' | 'go' | 'rs' | 'sh';

export interface Doc {
  id: string;
  title: string;
  type: DocType;
  content: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}

export interface DocTemplate {
  id: string;
  title: string;
  description: string;
  type: DocType;
  content: string;
  category: 'text' | 'code' | 'data' | 'web';
}

export const DOC_TYPE_INFO: Record<DocType, { label: string; color: string; isCode: boolean; iconName: string }> = {
  note:  { label: 'Заметка',     color: '#F7B731', isCode: false, iconName: 'file-text' },
  md:    { label: 'Markdown',    color: '#54A0FF', isCode: false, iconName: 'hash' },
  txt:   { label: 'Текст',       color: '#A0AEC0', isCode: false, iconName: 'file' },
  html:  { label: 'HTML',        color: '#E86040', isCode: true,  iconName: 'code' },
  css:   { label: 'CSS',         color: '#2196F3', isCode: true,  iconName: 'feather' },
  js:    { label: 'JavaScript',  color: '#F7DF1E', isCode: true,  iconName: 'zap' },
  ts:    { label: 'TypeScript',  color: '#3178C6', isCode: true,  iconName: 'zap' },
  jsx:   { label: 'JSX',         color: '#61DAFB', isCode: true,  iconName: 'code' },
  tsx:   { label: 'TSX',         color: '#61DAFB', isCode: true,  iconName: 'code' },
  json:  { label: 'JSON',        color: '#8ED6FB', isCode: true,  iconName: 'database' },
  xml:   { label: 'XML',         color: '#FF7043', isCode: true,  iconName: 'code' },
  csv:   { label: 'CSV',         color: '#66BB6A', isCode: false, iconName: 'list' },
  yaml:  { label: 'YAML',        color: '#CB3837', isCode: true,  iconName: 'settings' },
  py:    { label: 'Python',      color: '#FFD43B', isCode: true,  iconName: 'cpu' },
  java:  { label: 'Java',        color: '#ED8B00', isCode: true,  iconName: 'cpu' },
  c:     { label: 'C',           color: '#A8B9CC', isCode: true,  iconName: 'cpu' },
  cpp:   { label: 'C++',         color: '#00599C', isCode: true,  iconName: 'cpu' },
  go:    { label: 'Go',          color: '#00ADD8', isCode: true,  iconName: 'cpu' },
  rs:    { label: 'Rust',        color: '#CE422B', isCode: true,  iconName: 'cpu' },
  sh:    { label: 'Shell',       color: '#4EAA25', isCode: true,  iconName: 'terminal' },
};

export const ALL_DOC_TYPES: DocType[] = [
  'note', 'md', 'txt',
  'html', 'css', 'js', 'ts', 'jsx', 'tsx',
  'json', 'xml', 'csv', 'yaml',
  'py', 'java', 'c', 'cpp', 'go', 'rs', 'sh',
];

export function getWordCount(content: string): number {
  return content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'только что';
  if (diff < hour) return `${Math.floor(diff / minute)} мин назад`;
  if (diff < day) return `${Math.floor(diff / hour)} ч назад`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} дн назад`;

  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
