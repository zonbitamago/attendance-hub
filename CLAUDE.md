# attendance-hub 開発ガイドライン

全機能の実装計画から自動生成。最終更新: 2025-11-09

## アクティブな技術スタック

- **TypeScript 5.9**（strict mode）
- **Next.js 16**（App Router）
- **React 19.2**
- **Tailwind CSS 3.4**
- **localStorage**（プロトタイプ用、将来的にSupabase PostgreSQLへ移行）

## プロジェクト構造

```text
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
│   │   └── page.tsx              # 複数イベント一括登録
│   └── globals.css        # Tailwind CSS
├── components/            # 再利用可能なコンポーネント
│   ├── bulk-register/     # 一括登録関連コンポーネント
│   │   ├── member-selector.tsx   # メンバー選択
│   │   └── event-list.tsx        # イベント一覧
│   ├── loading-spinner.tsx  # ローディング表示
│   └── skeleton.tsx         # スケルトンUI
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── storage.ts        # localStorage操作
│   ├── group-service.ts  # グループ関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── validation.ts     # Zodスキーマ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト
│   ├── app/
│   │   ├── my-register/page.test.tsx  # 一括登録ページ
│   │   └── ...
│   ├── components/
│   │   ├── bulk-register/
│   │   │   ├── member-selector.test.tsx
│   │   │   └── event-list.test.tsx
│   │   └── ...
│   └── lib/
│       ├── storage.test.ts
│       ├── group-service.test.ts
│       └── attendance-service.test.ts
└── specs/                # 機能仕様・設計ドキュメント
    ├── 001-attendance-prototype/
    │   ├── spec.md
    │   ├── plan.md
    │   ├── data-model.md
    │   └── quickstart.md
    ├── 002-input-text-visibility/
    │   ├── spec.md
    │   ├── plan.md
    │   └── tasks.md
    └── 004-bulk-attendance-register/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テスト（ウォッチモード）
npm test -- --watch

# リンティング
npm run lint

# ビルド
npm run build

# 型チェック
npx tsc --noEmit
```

## CI/CD

### 自動チェック

すべてのプルリクエストで以下が自動実行されます：

- **型チェック**: `npx tsc --noEmit`
- **リント**: `npm run lint`
- **テスト**: `npm test`（カバレッジ測定付き）
- **ビルド**: `npm run build`

### CI失敗時の対応

1. GitHub ActionsのActionsタブでエラー詳細を確認
2. ローカルで該当するコマンドを実行して再現
3. 修正後、再度プッシュして自動再実行

### カバレッジ要件

- **最小閾値**: branches: 30%、functions: 50%、lines: 45%、statements: 45%
- **閾値未達時**: ビルドが失敗し、マージ不可

## ドキュメント言語規約

### プロジェクト標準言語: 日本語

**必須**: すべてのプロジェクトドキュメントは**日本語**で記載すること：

- ✅ **日本語で記載するドキュメント**:
  - 機能仕様書（`specs/*/spec.md`）
  - 実装計画（`specs/*/plan.md`）
  - タスク一覧（`specs/*/tasks.md`）
  - チェックリスト（`specs/*/checklists/*.md`）
  - README.md
  - SPECIFICATION.md
  - CLAUDE.md（本ファイル）
  - コミットメッセージ（日本語または英語）
  - プルリクエストの説明

- ⚠️ **例外**: 以下は英語で記載可：
  - コード内のコメント（英語推奨、日本語も可）
  - 変数名・関数名・クラス名（英語必須）
  - npm scripts（英語必須）
  - 設定ファイル（package.json、tsconfig.jsonなど）

**理由**:
- プロジェクトの主要ユーザーとメンテナーは日本語話者
- 日本語で記載することで、仕様の理解と保守性が向上
- 一貫性のあるドキュメント体験を提供

**speckitワークフロー使用時の注意**:
- `/speckit.specify` などのコマンド使用時は、フィーチャー説明を**日本語**で入力すること
- 英語で生成された場合は、速やかに日本語に翻訳すること

## コーディング規約

### TypeScript

- **Strict mode必須**: すべての型チェックオプションを有効化
- **`any`の禁止**: 正当な理由がない限り使用しない
- **型推論の活用**: Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- **明示的な戻り値の型**: 関数の戻り値の型は明示的に指定

### React

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: useState、useEffect、useContextなどを活用
- **クライアントコンポーネント**: `'use client'`ディレクティブを使用
- **Props型定義**: インターフェースで明示的に定義

### Tailwind CSS

- **ユーティリティファースト**: カスタムCSSは最小限に
- **モバイルファースト**: 基本スタイルはモバイル、レスポンシブは`sm:`、`md:`、`lg:`で
- **アクセシビリティ**: 適切なコントラスト比、フォーカス表示

#### 入力欄の標準スタイル（必須）

すべての入力欄（`<input>`、`<select>`、`<textarea>`）には、以下のクラスを**必ず含める**こと：

```
text-gray-900 placeholder:text-gray-400
```

**理由**: Feature 002で視認性改善を実施。ライトモード・ダークモード両方で良好なコントラスト比（WCAG AA基準）を確保。

**完全な入力欄classNameの例**:
```tsx
// input / select / textarea共通
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
```

**チェックリスト**:
- [ ] 新規入力欄に `text-gray-900 placeholder:text-gray-400` が含まれているか
- [ ] 既存の入力欄スタイルと一貫性があるか

### テスト（TDD）

- **Red-Green-Refactor**: t-wadaのTDD原則に従う
  1. Red: まず失敗するテストを書く
  2. Green: テストを通す最小限の実装
  3. Refactor: 動作を保ちながらコードを改善
- **テストファースト**: 実装前にテストを書く
- **独立性**: 各テストは他のテストに依存しない

## 最近の変更

- **2025-11-16**: 009-supabase-migration Phase 6-7完了（v2.3 - Supabase PostgreSQL対応）
  - データストレージをlocalStorageからSupabase PostgreSQLに完全移行
  - 全ページのUI層を非同期対応（ローディング状態、エラーハンドリング）
  - 404エラーハンドリング実装（存在しない団体IDで404ページ表示）
  - Supabase Clientモック実装、18テスト追加
  - エラーハンドリングテスト追加（3ページ）
  - 467テスト全てpass、カバレッジ90.17%達成
  - ビルド成功、CI/CD成功
- **2025-11-11**: 007-event-member-attendance フィーチャーを完了
  - イベント画面 個人別出欠状況表示機能実装
  - グループ別アコーディオン（展開/折りたたみ）
  - フィルタ機能（参加/未定/欠席/未登録）
  - ソート機能（名前順/ステータス順）
  - 検索機能（部分一致、大文字小文字区別なし）
  - パフォーマンステスト（100メンバー、200ms以内）
  - アクセシビリティ対応（ARIA属性、キーボード操作）
  - レスポンシブデザイン（320px～1024px+）
  - 233テスト全てpass、ビルド成功
- **2025-11-09**: 004-bulk-attendance-register フィーチャーを完了
  - 複数イベント一括出欠登録機能実装
  - `/my-register` 新規ページ追加
  - イベントごとの個別ステータス設定
  - 重複登録防止（upsert機能）
  - 84テスト全てpass、ビルド成功
- **2025-11-07**: Next.js 16とReact 19正式版へアップグレード
  - Next.js 15 → 16.0.1
  - React 19 → 19.2.0
  - TypeScript 5.9.3
- **2025-11-06**: 002-input-text-visibility フィーチャーを完了
  - 入力欄のテキスト視認性を改善
  - ダークモード対応のテキストカラー調整
  - プレースホルダーとラベルの可読性向上
- **2025-11-06**: 001-attendance-prototype データモデル刷新
  - EventDate中心の設計に移行
  - グループベースからイベントベースのUI実装
  - 44テスト全てpass、ビルド成功
- **2025-11-05**: 001-attendance-prototype フィーチャーを追加
  - TypeScript strict mode
  - Next.js 15 + React 19 + App Router
  - Tailwind CSS 3.4
  - localStorageによるデータ永続化

## 参考ドキュメント

- [プロジェクト憲法](.specify/memory/constitution.md) - 開発原則とガバナンス
- [仕様書](specs/001-attendance-prototype/spec.md) - 機能要件
- [実装計画](specs/001-attendance-prototype/plan.md) - 技術的な実装詳細
- [データモデル](specs/001-attendance-prototype/data-model.md) - エンティティ設計
- [クイックスタート](specs/001-attendance-prototype/quickstart.md) - 開発環境セットアップ

## 開発フロー

1. **仕様確認**: `specs/001-attendance-prototype/spec.md`で要件を理解
2. **テスト作成**: `__tests__/`にテストを先に書く（Red）
3. **実装**: テストを通す最小限のコードを書く（Green）
   - ⚠️ **入力欄作成時の必須チェック**:
     - `<input>`、`<select>`、`<textarea>`に `text-gray-900 placeholder:text-gray-400` が含まれているか確認
     - 既存の入力欄（admin/groups、admin/events、events/[id]/register）と同じスタイルになっているか確認
4. **リファクタリング**: コードを整理・改善（Refactor）
5. **動作確認**: ブラウザで実際の動作を確認
6. **ドキュメント更新**（機能追加・変更時は必須）:
   - 📝 **README.md**: エンドユーザー向けドキュメント
     - 技術スタック（バージョン情報）
     - 機能一覧（新機能の追加）
     - プロジェクト構造（新ディレクトリ・ファイルの追加）
     - 使い方（新機能の使用手順）
     - テスト数
     - 最終更新日
   - 📝 **SPECIFICATION.md**: 技術仕様書（該当する場合）
     - 実装済み機能の記録
     - 技術的な詳細
   - ⚠️ **重要**: 機能追加・変更を行った場合は、README.mdとSPECIFICATION.mdの**両方**を更新すること
7. **コミット**: 日本語または英語で明確なメッセージを付けてコミット

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies
- TypeScript 5.9 (strict mode) + Next.js 16, React 19.2, Tailwind CSS 3.4 (003-event-attendance-count)
- localStorage (プロトタイプ、将来的にSupabase PostgreSQLへ移行) (003-event-attendance-count)
- TypeScript 5.9（strict mode） (004-bulk-attendance-register)
- localStorage（プロトタイプ、将来的にSupabase PostgreSQLへ移行予定） (004-bulk-attendance-register)
- TypeScript 5.9 (strict mode必須) + Next.js 16 (App Router), React 19.2, Tailwind CSS 3.4, nanoid（ランダムID生成） (005-multi-tenant)
- localStorage（プロトタイプ用、将来的にSupabase PostgreSQLへ移行予定） (005-multi-tenant)
- TypeScript 5.9 + Node.js 20.x, 22.x (マトリックステスト) (006-ci-cd-setup)
- N/A (設定ファイルのみ) (006-ci-cd-setup)
- TypeScript 5.9 (strict mode必須) + Next.js 16.0.1, React 19.2.0, Tailwind CSS 3.4 (007-event-member-attendance)
- TypeScript 5.9（strict mode必須） + Jest 29、@testing-library/react 14、@testing-library/jest-dom (008-test-coverage-expansion)
- N/A（テストフィーチャー、既存のlocalStorageストレージを使用） (008-test-coverage-expansion)
- TypeScript 5.9（strict mode必須） + Next.js 16.0.1, React 19.2.0, @supabase/supabase-js（最新安定版）, Zod（既存） (009-supabase-migration)
- Supabase PostgreSQL（無料プラン: 500MB ストレージ、50,000 月間アクティブユーザー） (009-supabase-migration)

## Recent Changes
- 004-bulk-attendance-register: Added `/my-register` page, MemberSelector, EventList components, upsertBulkAttendances function
- 003-event-attendance-count: Added TypeScript 5.9 (strict mode) + Next.js 16, React 19.2, Tailwind CSS 3.4
