import { DocType } from '@/types/document';

export function extensionToDocType(ext: string): DocType {
  const map: Record<string, DocType> = {
    // Text
    md: 'md', markdown: 'md', mdx: 'mdx',
    txt: 'txt', text: 'txt',
    rtf: 'rtf',
    // Web
    html: 'html', htm: 'htm',
    css: 'css', scss: 'scss', sass: 'scss', less: 'less',
    // JavaScript / TypeScript
    js: 'js', mjs: 'mjs', cjs: 'js',
    ts: 'ts', mts: 'mts', cts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    vue: 'vue',
    svelte: 'svelte',
    // Data
    json: 'json', json5: 'json5',
    xml: 'xml',
    csv: 'csv',
    tsv: 'tsv',
    yaml: 'yaml', yml: 'yaml',
    toml: 'toml',
    ini: 'ini', cfg: 'ini', conf: 'ini',
    env: 'env',
    // Systems / compiled
    py: 'py', pyw: 'py',
    java: 'java',
    c: 'c', h: 'c',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
    cs: 'cs',
    go: 'go',
    rs: 'rs',
    rb: 'rb', rake: 'rb',
    php: 'php',
    swift: 'swift',
    kt: 'kt', kts: 'kt',
    dart: 'dart',
    r: 'r',
    lua: 'lua',
    scala: 'scala',
    ex: 'ex', exs: 'ex',
    clj: 'clj', cljs: 'clj',
    // Shell
    sh: 'sh', bash: 'bash', zsh: 'zsh',
    bat: 'bat', cmd: 'bat',
    ps1: 'ps1', psm1: 'ps1',
    // Specialized
    sql: 'sql',
    graphql: 'graphql', gql: 'graphql',
    proto: 'proto',
    tex: 'tex', latex: 'tex',
    diff: 'diff', patch: 'diff',
    log: 'log',
    dockerfile: 'dockerfile',
  };
  return map[ext.toLowerCase()] ?? 'txt';
}

export function docTypeToExtension(type: DocType): string {
  const map: Record<DocType, string> = {
    note: 'txt', md: 'md', mdx: 'mdx', txt: 'txt', rtf: 'rtf',
    html: 'html', htm: 'htm', css: 'css', scss: 'scss', less: 'less',
    js: 'js', mjs: 'mjs', ts: 'ts', mts: 'mts', jsx: 'jsx', tsx: 'tsx', vue: 'vue', svelte: 'svelte',
    json: 'json', json5: 'json5', xml: 'xml', csv: 'csv', tsv: 'tsv',
    yaml: 'yaml', toml: 'toml', ini: 'ini', env: 'env',
    py: 'py', java: 'java', c: 'c', cpp: 'cpp', cs: 'cs', go: 'go', rs: 'rs',
    rb: 'rb', php: 'php', swift: 'swift', kt: 'kt', dart: 'dart',
    r: 'r', lua: 'lua', scala: 'scala', ex: 'ex', clj: 'clj',
    sh: 'sh', bash: 'sh', zsh: 'zsh', bat: 'bat', ps1: 'ps1',
    sql: 'sql', graphql: 'graphql', proto: 'proto', tex: 'tex',
    diff: 'diff', log: 'log', dockerfile: 'dockerfile',
  };
  return map[type] ?? type;
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
    return { text: newText, selection: { start: selection.start - before.length, end: selection.end - before.length } };
  }

  const newText = text.slice(0, selection.start) + before + selected + after + text.slice(selection.end);
  return { text: newText, selection: { start: selection.start + before.length, end: selection.end + before.length } };
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
    const newText = text.slice(0, lineStart) + text.slice(lineStart + prefix.length);
    return {
      text: newText,
      selection: { start: Math.max(lineStart, selection.start - prefix.length), end: selection.end - prefix.length },
    };
  }

  const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart);
  return {
    text: newText,
    selection: { start: selection.start + prefix.length, end: selection.end + prefix.length },
  };
}

const TODAY = new Date().toLocaleDateString('ru-RU');

export const TEMPLATES_DATA = [
  // ── Text ──────────────────────────────────────────────────────────────────
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

**Дата:** ${TODAY}
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

## 🔥 Срочно
- [ ] 
- [ ] 

## 📅 На этой неделе
- [ ] 
- [ ] 
- [ ] 

## 💡 Позже
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

> Краткое описание проекта в одну строку.

## Возможности

- ✅ 
- ✅ 
- ✅ 

## Установка

\`\`\`bash
npm install
\`\`\`

## Использование

\`\`\`bash
npm start
\`\`\`

## Конфигурация

| Параметр | Значение | Описание |
| --- | --- | --- |
| PORT | 3000 | Порт сервера |

## Лицензия

[MIT](LICENSE)
`,
  },
  {
    id: 'diary',
    title: 'Дневник',
    description: 'Личный дневник',
    type: 'md' as DocType,
    category: 'text' as const,
    content: `# ${TODAY}

## Как прошёл день?


## Что было хорошего?

- 
- 

## Что можно улучшить?

- 

## Планы на завтра

- [ ] 
- [ ] 

---
*Настроение: 😊*
`,
  },
  {
    id: 'article',
    title: 'Статья',
    description: 'Структура для статьи',
    type: 'md' as DocType,
    category: 'text' as const,
    content: `# Заголовок статьи

*Автор: Ваше имя · ${TODAY}*

## Введение

Краткое введение в тему.

## Основная часть

### Раздел 1


### Раздел 2


### Раздел 3


## Заключение


## Источники

1. 
2. 
`,
  },
  // ── Web ───────────────────────────────────────────────────────────────────
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { margin-bottom: 16px; }
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
    id: 'css-styles',
    title: 'CSS стили',
    description: 'Базовые CSS стили',
    type: 'css' as DocType,
    category: 'web' as const,
    content: `/* ── Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Variables ── */
:root {
  --color-primary: #2F81F7;
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --color-muted: #6b7280;
  --radius: 8px;
  --font-sans: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ── Base ── */
body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover { text-decoration: underline; }
`,
  },
  {
    id: 'vue-component',
    title: 'Vue компонент',
    description: 'Single File Component',
    type: 'vue' as DocType,
    category: 'web' as const,
    content: `<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Нажми меня</button>
    <p>{{ count }} нажатий</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Мой компонент')
const count = ref(0)

function handleClick() {
  count.value++
}
</script>

<style scoped>
.container {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #42B883;
  color: white;
  cursor: pointer;
}
</style>
`,
  },
  // ── Code ──────────────────────────────────────────────────────────────────
  {
    id: 'python-script',
    title: 'Python скрипт',
    description: 'Базовый Python файл',
    type: 'py' as DocType,
    category: 'code' as const,
    content: `#!/usr/bin/env python3
"""Описание скрипта."""

from typing import Optional


def main() -> None:
    """Точка входа."""
    print("Привет, мир!")


def greet(name: str, greeting: Optional[str] = None) -> str:
    """Создаёт приветствие."""
    msg = greeting or "Привет"
    return f"{msg}, {name}!"


if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'js-script',
    title: 'JavaScript',
    description: 'ES модуль',
    type: 'js' as DocType,
    category: 'code' as const,
    content: `/**
 * @module my-module
 * @description Описание модуля
 */

'use strict';

/**
 * @param {string} name
 * @returns {string}
 */
function greet(name) {
  return \`Привет, \${name}!\`;
}

async function main() {
  const message = greet('мир');
  console.log(message);
}

main().catch(console.error);
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
  version: string;
  debug?: boolean;
}

type Result<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: string;
};

function processConfig(config: Config): Result<string> {
  if (!config.name) {
    return { ok: false, error: 'Имя обязательно' };
  }
  return { ok: true, data: \`\${config.name} v\${config.version}\` };
}

export type { Config, Result };
export { processConfig };
`,
  },
  {
    id: 'go-main',
    title: 'Go программа',
    description: 'Основной файл Go',
    type: 'go' as DocType,
    category: 'code' as const,
    content: `package main

import (
\t"fmt"
\t"os"
)

func main() {
\tif err := run(); err != nil {
\t\tfmt.Fprintln(os.Stderr, err)
\t\tos.Exit(1)
\t}
}

func run() error {
\tfmt.Println("Привет, мир!")
\treturn nil
}
`,
  },
  {
    id: 'rust-main',
    title: 'Rust программа',
    description: 'main.rs',
    type: 'rs' as DocType,
    category: 'code' as const,
    content: `use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Привет, мир!");
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Сумма: {}", sum);
    
    Ok(())
}

fn greet(name: &str) -> String {
    format!("Привет, {}!", name)
}
`,
  },
  {
    id: 'kotlin-main',
    title: 'Kotlin',
    description: 'Файл Kotlin',
    type: 'kt' as DocType,
    category: 'code' as const,
    content: `data class User(
    val id: Long,
    val name: String,
    val email: String,
)

fun main() {
    val user = User(
        id = 1L,
        name = "Иван",
        email = "ivan@example.com",
    )
    println("Пользователь: \${user.name}")
    greet(user)
}

fun greet(user: User) {
    println("Привет, \${user.name}!")
}
`,
  },
  {
    id: 'swift-main',
    title: 'Swift',
    description: 'Swift файл',
    type: 'swift' as DocType,
    category: 'code' as const,
    content: `import Foundation

struct User {
    let id: Int
    let name: String
    let email: String
}

class UserService {
    private var users: [User] = []

    func addUser(_ user: User) {
        users.append(user)
    }

    func findUser(byId id: Int) -> User? {
        users.first { $0.id == id }
    }
}

let service = UserService()
service.addUser(User(id: 1, name: "Иван", email: "ivan@example.com"))
print("Готово!")
`,
  },
  {
    id: 'sql-queries',
    title: 'SQL запросы',
    description: 'Набор SQL запросов',
    type: 'sql' as DocType,
    category: 'code' as const,
    content: `-- Создание таблицы пользователей
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс по email
CREATE INDEX idx_users_email ON users(email);

-- Вставка записи
INSERT INTO users (name, email)
VALUES ('Иван Иванов', 'ivan@example.com');

-- Выборка всех пользователей
SELECT id, name, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Обновление записи
UPDATE users
SET name = 'Новое имя'
WHERE id = 1;

-- Удаление записи
DELETE FROM users WHERE id = 1;
`,
  },
  {
    id: 'shell-script',
    title: 'Shell скрипт',
    description: 'Bash / Shell скрипт',
    type: 'sh' as DocType,
    category: 'code' as const,
    content: `#!/bin/bash
# ── Описание скрипта ──────────────────────────────
# Использование: ./script.sh [options]

set -euo pipefail

# ── Цвета ─────────────────────────────────────────
RED='\\033[0;31m'
GREEN='\\033[0;32m'
NC='\\033[0m'  # No Color

# ── Функции ───────────────────────────────────────
log()  { echo -e "\${GREEN}[INFO]\${NC}  $1"; }
err()  { echo -e "\${RED}[ERROR]\${NC} $1" >&2; }

# ── Основной код ──────────────────────────────────
main() {
  log "Запуск скрипта..."
  
  # Ваш код здесь
  
  log "Готово!"
}

main "$@"
`,
  },
  {
    id: 'dockerfile',
    title: 'Dockerfile',
    description: 'Docker образ',
    type: 'dockerfile' as DocType,
    category: 'code' as const,
    content: `# ── Build stage ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
`,
  },
  // ── Data ──────────────────────────────────────────────────────────────────
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
    "port": 3000,
    "host": "localhost"
  },
  "features": {
    "auth": true,
    "darkMode": true
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
    content: `Имя,Фамилия,Email,Телефон,Роль
Иван,Иванов,ivan@example.com,+7 900 000 0001,Разработчик
Мария,Петрова,maria@example.com,+7 900 000 0002,Дизайнер
Алексей,Смирнов,alex@example.com,+7 900 000 0003,Менеджер
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
description: Описание проекта

server:
  host: localhost
  port: 3000
  debug: false
  cors:
    origin: "*"
    methods: [GET, POST, PUT, DELETE]

database:
  host: localhost
  port: 5432
  name: mydb
  pool:
    min: 2
    max: 10
`,
  },
  {
    id: 'toml-config',
    title: 'TOML конфиг',
    description: 'Конфиг в формате TOML',
    type: 'toml' as DocType,
    category: 'data' as const,
    content: `[package]
name = "my-project"
version = "1.0.0"
authors = ["Your Name <you@example.com>"]
description = "Описание проекта"

[server]
host = "localhost"
port = 3000
debug = false

[database]
host = "localhost"
port = 5432
name = "mydb"
`,
  },
  {
    id: 'env-template',
    title: '.env файл',
    description: 'Переменные окружения',
    type: 'env' as DocType,
    category: 'data' as const,
    content: `# Окружение
NODE_ENV=development

# Сервер
PORT=3000
HOST=localhost

# База данных
DATABASE_URL=postgres://user:password@localhost:5432/mydb
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# API ключи
# API_KEY=your-api-key
`,
  },
  {
    id: 'graphql-schema',
    title: 'GraphQL схема',
    description: 'GraphQL SDL схема',
    type: 'graphql' as DocType,
    category: 'data' as const,
    content: `# ── Types ────────────────────────────────────────
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
  createdAt: String!
}

# ── Queries ───────────────────────────────────────
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(published: Boolean): [Post!]!
}

# ── Mutations ─────────────────────────────────────
type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, content: String!, authorId: ID!): Post!
  publishPost(id: ID!): Post!
}
`,
  },
];
