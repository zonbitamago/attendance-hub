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
- **データ永続化**: ブラウザのlocalStorageを使用してデータを保存

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
- **バリデーション**: [Zod 3.23](https://zod.dev/)
- **日付処理**: [date-fns 4.1](https://date-fns.org/)
- **ID生成**: [nanoid 5.1](https://github.com/ai/nanoid)
- **テスト**: [Jest 29](https://jestjs.io/) + [React Testing Library 16](https://testing-library.com/)

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
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

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
│       └── my-register/          # 一括出欠登録
│           └── page.tsx              # 複数イベント一括登録
├── contexts/              # React Context
│   └── organization-context.tsx  # 団体コンテキスト
├── components/            # 再利用可能なコンポーネント
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
│   ├── storage.ts        # localStorage操作（団体スコープ対応）
│   ├── organization-service.ts  # 団体関連ロジック
│   ├── group-service.ts  # グループ関連ロジック
│   ├── event-service.ts  # イベント関連ロジック
│   ├── member-service.ts # メンバー関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── migration.ts      # データマイグレーション
│   ├── validation.ts     # Zodスキーマ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト（233テスト）
│   ├── app/
│   ├── components/
│   │   ├── bulk-register/
│   │   └── event-detail/  # イベント詳細コンポーネントテスト
│   ├── contexts/
│   ├── integration/
│   └── lib/
└── specs/                # 機能仕様・設計ドキュメント
    ├── 001-attendance-prototype/
    ├── 002-input-text-visibility/
    ├── 004-bulk-attendance-register/
    ├── 005-multi-tenant/
    ├── 006-ci-cd-setup/
    └── 007-event-member-attendance/  # イベント画面 個人別出欠状況表示
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

- **テストスイート**: 233テスト
- **カバレッジ**: branches: 30%以上、functions: 50%以上、lines: 45%以上、statements: 45%以上
- **CI**: すべてのPRで自動実行

全233テストが実装されています:

- **ストレージ**: localStorage操作のテスト（団体スコープ対応）
- **団体サービス**: 団体CRUD操作、ID生成のテスト
- **グループサービス**: グループCRUD操作のテスト
- **イベントサービス**: イベントCRUD操作のテスト
- **メンバーサービス**: メンバー作成のテスト
- **出欠登録サービス**: 出欠登録・更新・一括登録のテスト
- **マイグレーション**: レガシーデータ自動移行のテスト
- **Reactコンテキスト**: OrganizationProviderのテスト
- **UIコンポーネント**: MemberSelector、EventList、AttendanceFilters、GroupAttendanceAccordion、MemberAttendanceListのテスト
- **パフォーマンステスト**: 100メンバーでの大規模データセットテスト（200ms以内）
- **ページ統合**: トップ、管理画面、一括登録、団体設定、イベント詳細ページのテスト
- **統合テスト**: データ分離、マイグレーション、URLブックマークのテスト

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

最終更新: 2025-11-11
