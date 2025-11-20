# Attendance Hub

[![CI](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml)

グループやイベントの出欠確認を簡単に管理できるWebアプリケーションです。

## 機能

### ✨ 主な機能

- **マルチテナント対応**: 複数の団体を独立して管理（New! v2.0）
- **団体専用URL**: 各団体に一意のURLを自動発行、ブックマークで簡単アクセス（New! v2.0）
- **プライバシー保護**: 団体一覧は非公開、URLを知っている人のみアクセス可能（New! v2.0）
- **自動データマイグレーション**: 既存データを自動的に「マイ団体」として移行（New! v2.0）
- **イベント管理**: イベント日程を作成・管理
- **グループ管理**: 団体・パート・セクションなどのグループを作成・管理
- **出欠登録**: メンバーの出欠状況（◯/△/✗）を簡単に登録
- **複数イベント一括登録**: 複数のイベントに対して出欠を一括登録・更新
- **集計表示**: 出席/未定/欠席の人数をリアルタイムで集計
- **個別ステータス設定**: イベントごとに異なる出欠状況を一括設定可能
- **個人別出欠状況表示**: グループごとにメンバー名と出欠ステータス（◯/△/✗/-）を確認（New! v2.1）
- **高度なフィルタ・ソート・検索**: 出欠状況でフィルタ、名前/ステータスでソート、メンバー名検索（New! v2.1）
- **使い方ガイドページ**: スクリーンショット付きの操作ガイドを各団体ページに表示（New! v2.4）
- **統合デザインシステム**: 一貫性のあるUI/UXを実現する共通コンポーネント（New! v2.6）
- **Skyテーマデザイン**: モダンで爽やかなSkyカラーパレットを採用したライトモードデザイン（New! v2.7）
- **データ永続化**: Supabase PostgreSQLデータベースでデータを永続化、ローカルではlocalStorageも併用

### 📱 対応環境

- モバイルファースト設計 (320px〜1920px対応)
- モダンブラウザ (Chrome, Firefox, Safari, Edge)
- レスポンシブデザイン
- アクセシビリティ対応（WCAG AA基準）

## 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: [TypeScript 5.9](https://www.typescriptlang.org/) (Strict Mode)
- **UIライブラリ**: [React 19.2](https://react.dev/)
- **スタイリング**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **データベース**: [Supabase](https://supabase.com/) PostgreSQL (v2.3以降)
- **バリデーション**: [Zod 3.23](https://zod.dev/)
- **日付処理**: [date-fns 4.1](https://date-fns.org/)
- **ID生成**: [nanoid 5.1](https://github.com/ai/nanoid)
- **テスト**: [Jest 29](https://jestjs.io/) + [React Testing Library 16](https://testing-library.com/)

## デザインシステム

アプリケーション全体で一貫したUI/UXを実現するため、5つの共通UIコンポーネントを提供しています。

### コンポーネント一覧

| コンポーネント | 説明 | バリアント |
|---------------|------|-----------|
| **Button** | インタラクティブなアクション用ボタン | `primary`, `secondary`, `danger`, `ghost` |
| **Input** | フォーム入力フィールド（テキスト、パスワード等） | - |
| **Card** | コンテンツをグループ化するコンテナ | - |
| **Message** | フィードバックメッセージ表示 | `error`, `success`, `warning`, `info` |
| **Heading** | セマンティックな見出し（h1〜h6） | `level={1-6}` |

### 使用例

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Message } from '@/components/ui/message';
import { Heading } from '@/components/ui/heading';

// カード内にフォームを配置
<Card>
  <Heading level={2}>ログイン</Heading>
  <Input
    type="email"
    placeholder="メールアドレス"
    ariaLabel="メールアドレス"
  />
  <Button variant="primary">送信</Button>
  <Message type="error">エラーが発生しました</Message>
</Card>
```

### 特徴

- **アクセシビリティ**: WCAG 2.1 AA準拠、適切なARIA属性
- **Skyテーマ**: 爽やかなブルー系カラーパレットでモダンなデザイン
- **レスポンシブ**: モバイルからデスクトップまで対応
- **TypeScript**: 完全な型定義とforwardRef対応

## セットアップ

### 前提条件

- Node.js 18.x以降
- npm 9.x以降

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd attendance-hub

# 依存パッケージをインストール
npm install
```

### 開発サーバーの起動

```bash
# localStorage モード（デフォルト）
npm run dev

# Supabase モード
npm run dev:supabase
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

### ストレージモード

アプリケーションは環境に応じて自動的にストレージバックエンドを切り替えます：

| 環境 | ストレージ |
|------|------------|
| 本番環境（Vercel） | Supabase PostgreSQL |
| ローカル + `dev:supabase` | Supabase PostgreSQL |
| ローカル（デフォルト） | localStorage |

### ビルド

```bash
npm run build
```

### テストの実行

```bash
# 全テストを実行
npm test

# ウォッチモードで実行
npm test -- --watch

# 型チェック
npx tsc --noEmit

# ガイド用スクリーンショット生成（E2E）
npm run capture-screenshots
```

## プロジェクト構造

```
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ランディングページ（団体作成）
│   └── [org]/             # 団体専用ルート（マルチテナント）
│       ├── layout.tsx            # 団体レイアウト
│       ├── page.tsx              # 団体トップ（イベント一覧）
│       ├── not-found.tsx         # 404ページ
│       ├── admin/                # 管理画面
│       │   ├── page.tsx              # 管理トップ
│       │   ├── groups/page.tsx       # グループ管理
│       │   ├── events/page.tsx       # イベント管理
│       │   └── organizations/page.tsx # 団体設定
│       ├── events/               # イベント関連
│       │   └── [id]/
│       │       ├── page.tsx          # イベント詳細
│       │       └── register/page.tsx # 出欠登録
│       ├── my-register/          # 一括出欠登録
│       │   └── page.tsx              # 複数イベント一括登録
│       └── guide/                # 使い方ガイド
│           └── page.tsx              # スクリーンショット付きガイド
├── contexts/              # React Context
│   └── organization-context.tsx  # 団体コンテキスト
├── components/            # 再利用可能なコンポーネント
│   ├── ui/                # 共通UIコンポーネント（デザインシステム）
│   │   ├── button.tsx           # ボタン（primary/secondary/danger/ghost）
│   │   ├── input.tsx            # 入力フィールド
│   │   ├── card.tsx             # カードコンテナ
│   │   ├── message.tsx          # メッセージ（error/success/warning/info）
│   │   └── heading.tsx          # 見出し（h1-h6）
│   ├── bulk-register/     # 一括登録関連コンポーネント
│   │   ├── member-selector.tsx   # メンバー選択
│   │   └── event-list.tsx        # イベント一覧
│   ├── event-detail/      # イベント詳細関連コンポーネント
│   │   ├── attendance-filters.tsx # フィルタ・ソート・検索
│   │   ├── group-attendance-accordion.tsx # グループ別アコーディオン
│   │   └── member-attendance-list.tsx     # メンバー出欠リスト
│   ├── loading-spinner.tsx  # ローディング表示
│   └── skeleton.tsx         # スケルトンUI
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── supabase/
│   │   └── client.ts     # Supabaseクライアント
│   ├── unified-storage.ts   # 統合ストレージ層（localStorage/Supabase自動切替）
│   ├── storage.ts        # localStorage操作（団体スコープ対応）
│   ├── supabase-storage.ts  # Supabaseストレージ層
│   ├── organization-service.ts  # 団体関連ロジック
│   ├── group-service.ts  # グループ関連ロジック
│   ├── event-service.ts  # イベント関連ロジック
│   ├── member-service.ts # メンバー関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── migration.ts      # データマイグレーション
│   ├── validation.ts     # Zodスキーマ
│   ├── error-utils.ts    # エラーユーティリティ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト（485テスト、カバレッジ90%+）
│   ├── app/
│   │   ├── page.test.tsx            # トップページテスト
│   │   └── [org]/
│   │       ├── admin/               # 管理画面テスト
│   │       │   ├── groups/page.test.tsx   # グループ管理（23テスト）
│   │       │   ├── events/page.test.tsx   # イベント管理（26テスト）
│   │       │   └── organizations/page.test.tsx
│   │       ├── events/[id]/
│   │       │   ├── page.test.tsx          # イベント詳細（17テスト）
│   │       │   └── register/page.test.tsx # 出欠登録（21テスト）
│   │       └── my-register/page.test.tsx  # 一括登録（19テスト）
│   ├── components/
│   │   ├── bulk-register/
│   │   └── event-detail/  # イベント詳細コンポーネントテスト
│   ├── contexts/
│   ├── integration/
│   └── lib/
├── e2e/                  # E2Eテスト（Playwright）
│   └── capture-screenshots.spec.ts # ガイド用スクリーンショット生成
├── public/images/guide/  # 使い方ガイドのスクリーンショット画像
└── specs/                # 機能仕様・設計ドキュメント
    ├── 001-attendance-prototype/
    ├── 002-input-text-visibility/
    ├── 004-bulk-attendance-register/
    ├── 005-multi-tenant/
    ├── 006-ci-cd-setup/
    ├── 007-event-member-attendance/  # イベント画面 個人別出欠状況表示
    └── 008-test-coverage-expansion/  # テストカバレッジ拡張（411テスト、84%カバレッジ）
```

## 使い方

### 0. 団体を作成（初回のみ）

1. トップページ（[http://localhost:3000](http://localhost:3000)）にアクセス
2. 団体名と説明を入力
3. 「団体を作成」ボタンをクリック
4. 表示される専用URLをブックマーク（⚠️ 重要）
5. 「団体にアクセスする」ボタンで団体の管理画面へ

**注意**: 団体URLを忘れるとアクセスできなくなります。必ずブックマークしてください。

### 1. イベントを作成

1. 団体トップページまたは管理画面から「イベント管理」へ
2. イベント日付、タイトル、場所を入力
3. 「イベントを追加」ボタンをクリック

### 2. グループを作成

1. 管理画面から「グループ管理」へ
2. グループ名、表示順序、カラーを入力
3. 「グループを追加」ボタンをクリック

### 3. 個別に出欠を登録

1. トップページのイベント一覧から対象イベントをクリック
2. 「出欠を登録」ボタンをクリック
3. グループ、メンバー、出欠状況（◯/△/✗）を選択
4. 「登録」ボタンをクリック

### 4. 複数イベントを一括登録（新機能）

1. トップページまたは管理画面の「一括出欠登録」をクリック
2. グループと名前を1回選択
3. 登録対象のイベントにチェック
4. 各イベントごとに出欠状況（◯/△/✗）を設定
5. 「一括登録」ボタンで複数イベントを一度に登録
6. 登録成功後、自動的にトップページへ戻ります

### 5. 出欠状況を確認（機能強化！）

**イベント詳細ページで個人別出欠状況を確認**:

1. トップページでイベント一覧と各イベントの出欠数を確認
2. イベント詳細ページでグループ別の集計と個人別の出欠を確認

**新機能** - イベント詳細ページで使える便利機能:

- **グループ別アコーディオン**: グループ名をクリックしてメンバーリストを展開/折りたたみ
- **フィルタ**: 参加のみ/未定のみ/欠席のみ/未登録のみで絞り込み
- **ソート**: 名前順（五十音順/アルファベット順）またはステータス順（◯→△→✗→-）で並び替え
- **検索**: メンバー名の部分一致で素早く検索（大文字小文字区別なし）
- **組み合わせ**: 検索+フィルタ+ソートを同時に使用可能

### 6. 出欠情報を編集・削除

- イベント詳細ページで各メンバーの出欠情報を編集・削除可能

## テスト

- **テストスイート**: 552テスト（36スイート）
- **カバレッジ**: statements: 90%+, branches: 77%+, functions: 92%+, lines: 90%+
- **CI**: すべてのPRで自動実行（型チェック、lint、テスト、ビルド）

全552テストが実装されています:

**ユーティリティ・サービス層** (70テスト):
- **日付ユーティリティ**: 日付フォーマット、相対日付、バリデーション (94.44%カバレッジ)
- **エラーユーティリティ**: エラーメッセージ処理、Zodエラー変換 (100%カバレッジ)
- **ストレージ**: localStorage操作（団体スコープ対応）
- **団体サービス**: 団体CRUD操作、ID生成のテスト (100%カバレッジ)
- **グループサービス**: グループCRUD操作のテスト (97.61%カバレッジ)
- **イベントサービス**: イベントCRUD操作のテスト
- **メンバーサービス**: メンバー作成のテスト
- **出欠登録サービス**: 出欠登録・更新・一括登録のテスト (94.8%カバレッジ)
- **マイグレーション**: レガシーデータ自動移行のテスト (96.22%カバレッジ)
- **バリデーション**: Zodスキーマのテスト

**ページコンポーネント** (106テスト):
- **トップページ**: ランディングページ、団体作成
- **団体トップページ**: イベント一覧、出欠集計
- **イベント詳細ページ**: 個人別出欠表示、フィルタ・ソート・検索 (17テスト、98.36%カバレッジ)
- **出欠登録ページ**: 個別登録フォーム (21テスト、92.77%カバレッジ)
- **一括登録ページ**: 複数イベント一括登録 (19テスト、95.31%カバレッジ)
- **グループ管理ページ**: グループCRUD、色選択 (23テスト、94.2%カバレッジ)
- **イベント管理ページ**: イベントCRUD、日付選択、useMemoメモ化 (26テスト、93.82%カバレッジ)
- **団体設定ページ**: 団体情報編集・削除

**UIコンポーネント** (115テスト):
- **Button**: ボタンコンポーネント - 4バリアント、disabled、ローディング状態 (100%カバレッジ)
- **Input**: 入力フィールド - テキスト/パスワード、バリデーション、アクセシビリティ (100%カバレッジ)
- **Card**: カードコンテナ - 子要素、カスタムクラス (100%カバレッジ)
- **Message**: メッセージ表示 - 4タイプ、閉じるボタン (100%カバレッジ)
- **Heading**: 見出し - h1〜h6レベル (100%カバレッジ)
- **MemberSelector**: メンバー選択コンポーネント (100%カバレッジ)
- **EventList**: イベント一覧コンポーネント (91.66%カバレッジ)
- **AttendanceFilters**: フィルタ・ソート・検索 (100%カバレッジ)
- **GroupAttendanceAccordion**: グループ別アコーディオン (100%カバレッジ)
- **MemberAttendanceList**: メンバー出欠リスト (95.83%カバレッジ)
- **パフォーマンステスト**: 100メンバーでの大規模データセットテスト（200ms以内）

**統合テスト・コンテキスト** (15テスト):
- **Reactコンテキスト**: OrganizationProviderのテスト
- **データ分離**: 団体間のデータ分離テスト
- **マイグレーション**: レガシーデータ自動移行テスト
- **URLブックマーク**: 団体専用URL動作テスト

```bash
# テストを実行
npm test

# カバレッジレポートを生成
npm test -- --coverage
```

## 開発

### コーディング規約

- ESLint + Prettierによるコードフォーマット
- TypeScript strictモード有効
- TDD（Test-Driven Development）必須
- 日本語のコメントとUI

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

### コミット前の確認

```bash
# リンターを実行
npm run lint

# テストを実行
npm test

# ビルドを確認
npm run build
```

## ライセンス

MIT

---

最終更新: 2025-11-20 (v2.7 - Glassmorphism Redesign with Sky Theme)
