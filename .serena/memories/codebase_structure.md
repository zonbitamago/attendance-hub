# コードベース構造

## ディレクトリ構造

```
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（イベント一覧）
│   ├── admin/             # 管理画面
│   │   ├── page.tsx              # 管理トップ
│   │   ├── groups/page.tsx       # グループ管理
│   │   └── events/page.tsx       # イベント管理
│   ├── events/            # イベント関連
│   │   └── [id]/
│   │       ├── page.tsx          # イベント詳細
│   │       └── register/page.tsx # 出欠登録
│   ├── my-register/       # 一括出欠登録
│   │   └── page.tsx
│   └── globals.css        # Tailwind CSS
├── components/            # 再利用可能なコンポーネント
│   ├── bulk-register/     # 一括登録関連
│   │   ├── member-selector.tsx
│   │   └── event-list.tsx
│   ├── loading-spinner.tsx
│   └── skeleton.tsx
├── contexts/              # Reactコンテキスト
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── storage.ts        # localStorage操作（レガシー）
│   ├── supabase/         # Supabase関連
│   │   ├── client.ts     # Supabaseクライアント
│   │   └── storage.ts    # Supabaseストレージ操作
│   ├── group-service.ts  # グループ関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── validation.ts     # Zodスキーマ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト
│   ├── app/              # ページテスト
│   ├── components/       # コンポーネントテスト
│   └── lib/              # ライブラリテスト
├── __mocks__/            # テスト用モック
├── specs/                # 機能仕様・設計ドキュメント
│   ├── 001-attendance-prototype/
│   ├── 002-input-text-visibility/
│   ├── 004-bulk-attendance-register/
│   ├── 005-multi-tenant/
│   ├── 006-ci-cd-setup/
│   ├── 007-event-member-attendance/
│   ├── 008-test-coverage-expansion/
│   └── 009-supabase-migration/
├── supabase/             # Supabase設定・マイグレーション
├── .github/              # GitHub Actions
│   └── workflows/
└── coverage/             # テストカバレッジレポート
```

## 主要ファイル

### 設定ファイル
- `tsconfig.json` - TypeScript設定（strict mode有効）
- `next.config.js` - Next.js設定
- `tailwind.config.js` - Tailwind CSS設定
- `jest.config.js` - Jest設定
- `eslint.config.mjs` - ESLint設定
- `.prettierrc` - Prettier設定

### 環境変数
- `.env.local` - ローカル環境変数（Supabase接続情報等）
- `.env.example` - 環境変数テンプレート

### ドキュメント
- `README.md` - プロジェクト概要（エンドユーザー向け）
- `SPECIFICATION.md` - 技術仕様書
- `CLAUDE.md` - 開発ガイドライン

## 命名規則

### ファイル名
- コンポーネント: `kebab-case.tsx`（例: `member-selector.tsx`）
- ユーティリティ: `kebab-case.ts`（例: `date-utils.ts`）
- テスト: `*.test.ts` / `*.test.tsx`

### コード内
- 変数・関数: `camelCase`
- クラス・型: `PascalCase`
- 定数: `UPPER_SNAKE_CASE`
