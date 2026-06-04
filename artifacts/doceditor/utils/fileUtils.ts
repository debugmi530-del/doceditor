import { DocType } from '@/types/document';

export function extensionToDocType(ext: string): DocType {
  const map: Record<string, DocType> = {
    md: 'md', markdown: 'md',
    txt: 'txt',
    html: 'html', htm: 'html',
    css: 'css',
    js: 'js', mjs: 'js',
    ts: 'ts', mts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    json: 'json',
    xml: 'xml',
    csv: 'csv',
    yaml: 'yaml', yml: 'yaml',
    py: 'py', pyw: 'py',
    java: 'java',
    c: 'c',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
    go: 'go',
    rs: 'rs',
    sh: 'sh', bash: 'sh', zsh: 'sh',
  };
  return map[ext.toLowerCase()] ?? 'txt';
}

export function docTypeToExtension(type: DocType): string {
  const map: Record<DocType, string> = {
    note: 'txt', md: 'md', txt: 'txt',
    html: 'html', css: 'css', js: 'js', ts: 'ts', jsx: 'jsx', tsx: 'tsx',
    json: 'json', xml: 'xml', csv: 'csv', yaml: 'yaml',
    py: 'py', java: 'java', c: 'c', cpp: 'cpp', go: 'go', rs: 'rs', sh: 'sh',
  };
  return map[type];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function wrapSelection(
  text: string,
  selection: { start: number; end: number },
  before: string,
  after: string
): { text: string; selection: { start: number; end: number } } {
  const selected = text.slice(selection.start, selection.end);
  const alreadyWrapped =
    text.slice(selection.start - before.length, selection.start) === before &&
    text.slice(selection.end, selection.end + after.length) === after;

  if (alreadyWrapped) {
    const newText =
      text.slice(0, selection.start - before.length) +
      selected +
      text.slice(selection.end + after.length);
    return {
      text: newText,
      selection: {
        start: selection.start - before.length,
        end: selection.end - before.length,
      },
    };
  }

  const newText =
    text.slice(0, selection.start) +
    before +
    selected +
    after +
    text.slice(selection.end);

  return {
    text: newText,
    selection: {
      start: selection.start + before.length,
      end: selection.end + before.length,
    },
  };
}

export function insertLinePrefix(
  text: string,
  selection: { start: number; end: number },
  prefix: string
): { text: string; selection: { start: number; end: number } } {
  const lineStart = text.lastIndexOf('\n', selection.start - 1) + 1;
  const lineText = text.slice(lineStart, selection.start);
  const alreadyHasPrefix = lineText.startsWith(prefix);

  if (alreadyHasPrefix) {
    const newText =
      text.slice(0, lineStart) + text.slice(lineStart + prefix.length);
    return {
      text: newText,
      selection: {
        start: Math.max(lineStart, selection.start - prefix.length),
        end: selection.end - prefix.length,
      },
    };
  }

  const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart);
  return {
    text: newText,
    selection: {
      start: selection.start + prefix.length,
      end: selection.end + prefix.length,
    },
  };
}

export const TEMPLATES_DATA = [
  {
    id: 'blank-note',
    title: 'Чистая заметка',
    description: 'Начните с нуля',
    type: 'note' as DocType,
    category: 'text' as const,
    content: '',
  },
  {
    id: 'meeting-notes',
    title: 'Протокол встречи',
    description: 'Структура для встреч',
    type: 'md' as DocType,
    category: 'text' as const,
    content: `# Протокол встречи

**Дата:** ${new Date().toLocaleDateString('ru-RU')}
**Участники:** 

---

## Повестка дня

1. 
2. 
3. 

## Обсуждение

### Пункт 1


### Пункт 2


## Решения

- [ ] 
- [ ] 

## Следующая встреча

**Дата:** 
**Тема:** 
`,
  },
  {
    id: 'todo-list',
    title: 'Список задач',
    description: 'Чекбоксы задач',
    type: 'md' as DocType,
    category: 'text' as const,
    content: `# Список задач

## Срочно
- [ ] 
- [ ] 

## На этой неделе
- [ ] 
- [ ] 

## Позже
- [ ] 
- [ ] 
`,
  },
  {
    id: 'readme',
    title: 'README',
    description: 'Документация проекта',
    type: 'md' as DocType,
    category: 'text' as const,
    content: `# Название проекта

Краткое описание проекта.

## Установка

\`\`\`bash
npm install
\`\`\`

## Использование

\`\`\`bash
npm start
\`\`\`

## Возможности

- 
- 
- 

## Лицензия

MIT
`,
  },
  {
    id: 'html-template',
    title: 'HTML страница',
    description: 'Базовый HTML шаблон',
    type: 'html' as DocType,
    category: 'web' as const,
    content: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Мой документ</title>
  <style>
    body {
      font-family: -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>Заголовок</h1>
  <p>Содержимое страницы.</p>
</body>
</html>
`,
  },
  {
    id: 'json-config',
    title: 'JSON конфиг',
    description: 'Конфигурационный файл',
    type: 'json' as DocType,
    category: 'data' as const,
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "config": {
    "debug": false,
    "port": 3000
  }
}
`,
  },
  {
    id: 'csv-table',
    title: 'CSV таблица',
    description: 'Таблица данных',
    type: 'csv' as DocType,
    category: 'data' as const,
    content: `Имя,Фамилия,Email,Телефон
Иван,Иванов,ivan@example.com,+7 900 000 0001
Мария,Петрова,maria@example.com,+7 900 000 0002
`,
  },
  {
    id: 'python-script',
    title: 'Python скрипт',
    description: 'Базовый Python файл',
    type: 'py' as DocType,
    category: 'code' as const,
    content: `#!/usr/bin/env python3
"""Описание скрипта."""

def main():
    print("Привет, мир!")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'js-script',
    title: 'JavaScript',
    description: 'Файл JavaScript',
    type: 'js' as DocType,
    category: 'code' as const,
    content: `/**
 * Описание модуля
 */

function main() {
  console.log('Привет, мир!');
}

main();
`,
  },
  {
    id: 'ts-module',
    title: 'TypeScript',
    description: 'TypeScript модуль',
    type: 'ts' as DocType,
    category: 'code' as const,
    content: `interface Config {
  name: string;
  value: number;
}

function process(config: Config): string {
  return \`\${config.name}: \${config.value}\`;
}

export { Config, process };
`,
  },
  {
    id: 'yaml-config',
    title: 'YAML конфиг',
    description: 'Конфиг в формате YAML',
    type: 'yaml' as DocType,
    category: 'data' as const,
    content: `name: my-project
version: 1.0.0

server:
  host: localhost
  port: 3000
  debug: false

database:
  host: localhost
  port: 5432
  name: mydb
`,
  },
  {
    id: 'shell-script',
    title: 'Shell скрипт',
    description: 'Bash / Shell скрипт',
    type: 'sh' as DocType,
    category: 'code' as const,
    content: `#!/bin/bash
# Описание скрипта

set -e

echo "Запуск..."

# Ваш код здесь

echo "Готово!"
`,
  },
];
