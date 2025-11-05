# Quick Start Guide: 出欠確認プロトタイプ

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)
**Date**: 2025-11-05

## Overview

このガイドでは、出欠確認プロトタイプの開発環境をセットアップし、実装を開始するまでの手順を説明します。

## Prerequisites

開発を始める前に、以下がインストールされていることを確認してください：

- **Node.js 20.x以上** ([公式サイト](https://nodejs.org/))
- **npm 10.x以上** (Node.jsに同梱)
- **Git 2.x以上**
- **VSCode** (推奨エディタ、拡張機能含む)

## Initial Setup

### 1. プロジェクトのセットアップ

```bash
# リポジトリのルートディレクトリで実行
cd /Users/k-takiuchi/Documents/attendance-hub

# Next.js 15プロジェクトを初期化
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 依存関係のインストール
npm install
```

### 2. 追加パッケージのインストール

```bash
# バリデーション
npm install zod

# 日付フォーマット
npm install date-fns

# テスティング（開発環境）
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install -D @testing-library/user-event

# 型チェック・リンティング（create-next-appに含まれる場合はスキップ）
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
npm install -D prettier eslint-config-prettier
```

### 3. 設定ファイルの作成

#### `tsconfig.json`

TypeScript strict modeを有効化：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `next.config.js`

完全にクライアントサイドのSPAとして設定：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静的エクスポート（オプション）
  reactStrictMode: true,
};

module.exports = nextConfig;
```

#### `tailwind.config.js`

モバイルファースト設計：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // プロジェクト固有のカラースキーム
      },
    },
  },
  plugins: [],
};
```

#### `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

module.exports = createJestConfig(customJestConfig);
```

#### `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
```

#### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100
}
```

### 4. プロジェクト構造の作成

```bash
# ディレクトリ構造を作成
mkdir -p app/groups/new
mkdir -p app/groups/[id]/register
mkdir -p app/groups/[id]/history
mkdir -p components
mkdir -p lib
mkdir -p types
mkdir -p __tests__/lib
mkdir -p __tests__/components
mkdir -p public
```

## Development Workflow

### TDD サイクル（t-wada流）

1. **Red（失敗するテストを書く）**

```bash
# テストファイルを作成
touch __tests__/lib/storage.test.ts

# テストを実行（失敗することを確認）
npm test storage.test.ts
```

2. **Green（テストを通す最小限の実装）**

```bash
# 実装ファイルを作成
touch lib/storage.ts

# テストを実行（成功することを確認）
npm test storage.test.ts
```

3. **Refactor（リファクタリング）**

テストが通った状態で、コードの品質を改善します。

### 実装順序

[plan.md](plan.md)の「Phase 1: Implementation Order」に従って実装します：

#### Phase 0: セットアップ

```bash
# パッケージインストール（上記参照）
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開いて動作確認。

#### Phase 1-A: コア機能（MVP）

1. **データ型定義** (`types/index.ts`)

```typescript
export type AttendanceStatus = '◯' | '△' | '✗';

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  groupId: string;
  userName: string;
  status: AttendanceStatus;
  createdAt: string;
}
```

2. **localStorage操作** (`lib/storage.ts`)

```typescript
export function loadGroups(): Group[] { /* ... */ }
export function saveGroups(groups: Group[]): void { /* ... */ }
export function loadAttendances(): Attendance[] { /* ... */ }
export function saveAttendances(attendances: Attendance[]): void { /* ... */ }
```

3. **バリデーション** (`lib/validation.ts`)

Zodスキーマを定義（[data-model.md](data-model.md)参照）

4. **サービスレイヤー**
   - `lib/group-service.ts`: グループCRUD
   - `lib/attendance-service.ts`: 出欠登録CRUD + 集計

5. **ページとコンポーネント**
   - `app/page.tsx`: グループ一覧
   - `app/groups/new/page.tsx`: グループ作成
   - `app/groups/[id]/page.tsx`: グループ詳細
   - `app/groups/[id]/register/page.tsx`: 出欠登録

## Testing

### ユニットテストの実行

```bash
# 全テスト実行
npm test

# 特定のテストファイルを実行
npm test storage.test.ts

# ウォッチモード（開発中）
npm test -- --watch

# カバレッジレポート
npm test -- --coverage
```

### テストの書き方（例）

```typescript
// __tests__/lib/storage.test.ts
import { loadGroups, saveGroups } from '@/lib/storage';
import { Group } from '@/types';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loadGroups returns empty array when no data', () => {
    const groups = loadGroups();
    expect(groups).toEqual([]);
  });

  test('saveGroups and loadGroups persist data', () => {
    const groups: Group[] = [
      {
        id: 'test-1',
        name: 'Test Group',
        createdAt: new Date().toISOString(),
      },
    ];

    saveGroups(groups);
    const loaded = loadGroups();

    expect(loaded).toEqual(groups);
  });
});
```

## Running the App

### 開発サーバー

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### ビルド

```bash
npm run build
```

### 本番モード

```bash
npm run start
```

### リンティング

```bash
npm run lint
```

## Browser DevTools

### localStorage の確認

1. ブラウザのDevToolsを開く（F12）
2. Application（またはStorage）タブを開く
3. Local Storageを展開
4. `attendance-hub:groups` と `attendance-hub:attendances` を確認

### データのクリア

```javascript
// コンソールで実行
localStorage.clear();
```

## Troubleshooting

### 問題: `npm run dev` が起動しない

```bash
# node_modules削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題: TypeScriptの型エラー

```bash
# 型チェック
npx tsc --noEmit

# VSCodeの型キャッシュをリセット
# Command Palette (Cmd+Shift+P) → "TypeScript: Restart TS Server"
```

### 問題: localStorageが保存されない

- ブラウザのプライベートモードでは制限される場合があります
- ブラウザの設定でCookieとサイトデータが許可されているか確認

### 問題: テストが動かない

```bash
# jest.config.jsとjest.setup.jsが正しく設定されているか確認
npm test -- --debug
```

## VSCode Extensions (推奨)

開発効率を上げるための推奨拡張機能：

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Jest** (`Orta.vscode-jest`)
- **TypeScript Error Translator** (`mattpocock.ts-error-translator`)

`.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Orta.vscode-jest",
    "mattpocock.ts-error-translator"
  ]
}
```

## Git Workflow

### コミットメッセージ（日本語）

```bash
git commit -m "feat: グループ作成機能を実装"
git commit -m "test: group-serviceのテストを追加"
git commit -m "fix: 出欠登録のバリデーションエラーを修正"
```

### ブランチ戦略

```bash
# フィーチャーブランチは既に作成済み
git branch  # → 001-attendance-prototype

# 作業の保存
git add .
git commit -m "適切なメッセージ"
git push origin 001-attendance-prototype
```

## Next Steps

1. Phase 1-Aのコア機能を実装（[plan.md](plan.md)参照）
2. 各機能ごとにテストを書く（TDDサイクル）
3. 動作確認とデバッグ
4. Phase 1-B以降の機能を追加

具体的なタスクリストは `/speckit.tasks` コマンドで生成できます。

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [date-fns Documentation](https://date-fns.org/)
- [Testing Library Documentation](https://testing-library.com/)
- [t-wada's TDD Principles](https://www.youtube.com/watch?v=Q-FJ3XmFlT8)

## Support

質問や問題がある場合は、プロジェクトの憲法 ([`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)) を参照してください。
