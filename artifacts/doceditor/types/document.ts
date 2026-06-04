export type DocType =
  | 'note' | 'md' | 'mdx' | 'txt' | 'rtf'
  | 'html' | 'htm' | 'css' | 'scss' | 'less'
  | 'js' | 'mjs' | 'ts' | 'mts' | 'jsx' | 'tsx' | 'vue' | 'svelte'
  | 'json' | 'json5' | 'xml' | 'csv' | 'tsv' | 'yaml' | 'toml' | 'ini' | 'env'
  | 'py' | 'java' | 'c' | 'cpp' | 'cs' | 'go' | 'rs' | 'rb' | 'php'
  | 'swift' | 'kt' | 'dart' | 'r' | 'lua' | 'scala' | 'ex' | 'clj'
  | 'sh' | 'bash' | 'zsh' | 'bat' | 'ps1'
  | 'sql' | 'graphql' | 'proto' | 'tex' | 'diff' | 'log' | 'dockerfile';

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

export const DOC_TYPE_INFO: Record<DocType, { label: string; color: string; isCode: boolean; iconName: string; commentPrefix?: string; commentSuffix?: string }> = {
  note:       { label: 'Заметка',      color: '#F7B731', isCode: false, iconName: 'file-text' },
  md:         { label: 'Markdown',     color: '#54A0FF', isCode: false, iconName: 'hash' },
  mdx:        { label: 'MDX',          color: '#3B82F6', isCode: false, iconName: 'hash' },
  txt:        { label: 'Текст',        color: '#A0AEC0', isCode: false, iconName: 'file' },
  rtf:        { label: 'Rich Text',    color: '#9CA3AF', isCode: false, iconName: 'file-text' },
  html:       { label: 'HTML',         color: '#E86040', isCode: true,  iconName: 'code',     commentPrefix: '<!-- ', commentSuffix: ' -->' },
  htm:        { label: 'HTML',         color: '#E86040', isCode: true,  iconName: 'code',     commentPrefix: '<!-- ', commentSuffix: ' -->' },
  css:        { label: 'CSS',          color: '#2196F3', isCode: true,  iconName: 'feather',  commentPrefix: '/* ', commentSuffix: ' */' },
  scss:       { label: 'SCSS',         color: '#CD6799', isCode: true,  iconName: 'feather',  commentPrefix: '// ' },
  less:       { label: 'Less',         color: '#1D365D', isCode: true,  iconName: 'feather',  commentPrefix: '// ' },
  js:         { label: 'JavaScript',   color: '#F7DF1E', isCode: true,  iconName: 'zap',      commentPrefix: '// ' },
  mjs:        { label: 'ES Module',    color: '#F7DF1E', isCode: true,  iconName: 'zap',      commentPrefix: '// ' },
  ts:         { label: 'TypeScript',   color: '#3178C6', isCode: true,  iconName: 'zap',      commentPrefix: '// ' },
  mts:        { label: 'TypeScript',   color: '#3178C6', isCode: true,  iconName: 'zap',      commentPrefix: '// ' },
  jsx:        { label: 'JSX',          color: '#61DAFB', isCode: true,  iconName: 'code',     commentPrefix: '// ' },
  tsx:        { label: 'TSX',          color: '#61DAFB', isCode: true,  iconName: 'code',     commentPrefix: '// ' },
  vue:        { label: 'Vue',          color: '#42B883', isCode: true,  iconName: 'code',     commentPrefix: '// ' },
  svelte:     { label: 'Svelte',       color: '#FF3E00', isCode: true,  iconName: 'code',     commentPrefix: '// ' },
  json:       { label: 'JSON',         color: '#8ED6FB', isCode: true,  iconName: 'database' },
  json5:      { label: 'JSON5',        color: '#8ED6FB', isCode: true,  iconName: 'database', commentPrefix: '// ' },
  xml:        { label: 'XML',          color: '#FF7043', isCode: true,  iconName: 'code',     commentPrefix: '<!-- ', commentSuffix: ' -->' },
  csv:        { label: 'CSV',          color: '#66BB6A', isCode: false, iconName: 'list' },
  tsv:        { label: 'TSV',          color: '#4CAF50', isCode: false, iconName: 'list' },
  yaml:       { label: 'YAML',         color: '#CB3837', isCode: true,  iconName: 'settings', commentPrefix: '# ' },
  toml:       { label: 'TOML',         color: '#9B4DCA', isCode: true,  iconName: 'settings', commentPrefix: '# ' },
  ini:        { label: 'INI',          color: '#607D8B', isCode: true,  iconName: 'settings', commentPrefix: '; ' },
  env:        { label: '.env',         color: '#ECC94B', isCode: true,  iconName: 'settings', commentPrefix: '# ' },
  py:         { label: 'Python',       color: '#FFD43B', isCode: true,  iconName: 'cpu',      commentPrefix: '# ' },
  java:       { label: 'Java',         color: '#ED8B00', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  c:          { label: 'C',            color: '#A8B9CC', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  cpp:        { label: 'C++',          color: '#00599C', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  cs:         { label: 'C#',           color: '#9B4F96', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  go:         { label: 'Go',           color: '#00ADD8', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  rs:         { label: 'Rust',         color: '#CE422B', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  rb:         { label: 'Ruby',         color: '#CC342D', isCode: true,  iconName: 'cpu',      commentPrefix: '# ' },
  php:        { label: 'PHP',          color: '#8892BF', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  swift:      { label: 'Swift',        color: '#FA7343', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  kt:         { label: 'Kotlin',       color: '#7F52FF', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  dart:       { label: 'Dart',         color: '#00B4AB', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  r:          { label: 'R',            color: '#276DC3', isCode: true,  iconName: 'cpu',      commentPrefix: '# ' },
  lua:        { label: 'Lua',          color: '#000080', isCode: true,  iconName: 'cpu',      commentPrefix: '-- ' },
  scala:      { label: 'Scala',        color: '#DC322F', isCode: true,  iconName: 'cpu',      commentPrefix: '// ' },
  ex:         { label: 'Elixir',       color: '#6E4A7E', isCode: true,  iconName: 'cpu',      commentPrefix: '# ' },
  clj:        { label: 'Clojure',      color: '#5881D8', isCode: true,  iconName: 'cpu',      commentPrefix: '; ' },
  sh:         { label: 'Shell',        color: '#4EAA25', isCode: true,  iconName: 'terminal', commentPrefix: '# ' },
  bash:       { label: 'Bash',         color: '#4EAA25', isCode: true,  iconName: 'terminal', commentPrefix: '# ' },
  zsh:        { label: 'Zsh',          color: '#4EAA25', isCode: true,  iconName: 'terminal', commentPrefix: '# ' },
  bat:        { label: 'Batch',        color: '#00BFFF', isCode: true,  iconName: 'terminal', commentPrefix: 'rem ' },
  ps1:        { label: 'PowerShell',   color: '#012456', isCode: true,  iconName: 'terminal', commentPrefix: '# ' },
  sql:        { label: 'SQL',          color: '#F29111', isCode: true,  iconName: 'database', commentPrefix: '-- ' },
  graphql:    { label: 'GraphQL',      color: '#E10098', isCode: true,  iconName: 'git-merge', commentPrefix: '# ' },
  proto:      { label: 'Protobuf',     color: '#6DB33F', isCode: true,  iconName: 'code',     commentPrefix: '// ' },
  tex:        { label: 'LaTeX',        color: '#008080', isCode: false, iconName: 'book',     commentPrefix: '% ' },
  diff:       { label: 'Diff',         color: '#F97316', isCode: true,  iconName: 'git-commit' },
  log:        { label: 'Log',          color: '#6B7280', isCode: false, iconName: 'activity' },
  dockerfile: { label: 'Dockerfile',   color: '#2496ED', isCode: true,  iconName: 'box',      commentPrefix: '# ' },
};

export const ALL_DOC_TYPES: DocType[] = [
  'note', 'md', 'mdx', 'txt', 'rtf',
  'html', 'htm', 'css', 'scss', 'less',
  'js', 'mjs', 'ts', 'mts', 'jsx', 'tsx', 'vue', 'svelte',
  'json', 'json5', 'xml', 'csv', 'tsv', 'yaml', 'toml', 'ini', 'env',
  'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'rb', 'php',
  'swift', 'kt', 'dart', 'r', 'lua', 'scala', 'ex', 'clj',
  'sh', 'bash', 'zsh', 'bat', 'ps1',
  'sql', 'graphql', 'proto', 'tex', 'diff', 'log', 'dockerfile',
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
