# Implementation Plan: Glassmorphism Redesign - Sky Theme Light Mode

**Branch**: `001-glassmorphism-redesign` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-glassmorphism-redesign/spec.md`

## Summary

全6ページをSkyテーマ（ライトモード専用）にデザインリニューアルします。既存のダークモード機能（ThemeToggleコンポーネント、`dark:` Tailwindクラス）を完全削除し、Skyカラーパレット（sky-50〜sky-600）を統一的に適用します。すべてのナビゲーションリンクをアイコン付きボタンスタイルに変更し、グラデーション背景とホバーエフェクトを実装します。

**技術アプローチ**:
- 既存のReactコンポーネントファイル（6ページ）のTailwind CSSクラスを直接書き換え
- モックアップファイル（`samples/landing-pages/final-*.html`）からスタイルパターンを参照
- データモデル・APIロジックは一切変更せず、プレゼンテーション層のみを更新
- 既存のテストは引き続き通過することを確認（デザイン変更のため新規テスト不要）

## Technical Context

**Language/Version**: TypeScript 5.9（strict mode）
**Primary Dependencies**:
- Next.js 16（App Router）
- React 19.2
- Tailwind CSS 3.4（Skyカラーパレット: sky-50〜sky-900）
**Storage**: N/A（UIのみの変更、データストレージは変更なし）
**Testing**: Jest 29 + React Testing Library 14（既存テストが通過することを確認）
**Target Platform**: Web（モバイル 320px〜デスクトップ 1920px、レスポンシブ対応）
**Project Type**: Web application（Next.js App Router）
**Performance Goals**: デザイン変更のみのため、既存のLighthouseスコア（90以上）を維持
**Constraints**:
- 既存の機能（イベント作成、出欠登録など）に影響を与えない
- すべてのページで既存テストが通過する
- レスポンシブデザインを維持（320px〜1920px）
**Scale/Scope**: 6ページの更新、ThemeToggleコンポーネント1つの削除、すべての`dark:`クラスの削除

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### セキュリティ第一開発（I）
- ✅ **適合**: UIのみの変更のため、セキュリティに影響なし
- ✅ 既存の認証・認可ロジックは変更なし
- ✅ データベースアクセス・RLSポリシーは変更なし

### 無料枠最適化（II）
- ✅ **適合**: デザイン変更のみで、リソース使用量は変化なし
- ✅ 追加の依存関係なし（既存のTailwind CSS 3.4を使用）
- ✅ バンドルサイズへの影響は最小（ThemeToggleコンポーネント削除により若干減少）

### 型安全性（III）
- ✅ **適合**: TypeScript strict modeを維持
- ✅ コンポーネントのProps型は変更なし
- ✅ `any`型の使用なし

### レスポンシブ・モバイルファースト設計（IV）
- ✅ **適合**: すべてのページでモバイル（320px）〜デスクトップ（1920px）対応を維持
- ✅ ナビゲーションボタンは`flex-wrap`でモバイルでも適切に折り返し
- ✅ タップターゲットサイズ（44x44px以上）を維持

### サーバーレスアーキテクチャ（V）
- ✅ **適合**: UIのみの変更のため、サーバーサイドロジックは変更なし

### アクセシビリティ基準（VI）
- ✅ **適合**: セマンティックHTML要素を維持
- ✅ 色コントラスト比を確認（gray-900テキスト on 白背景 = 21:1、WCAG AA基準を大幅に上回る）
- ✅ キーボードナビゲーション・フォーカスインジケーターを維持

### 日本語対応とローカライゼーション（VII）
- ✅ **適合**: UIテキストは変更なし（既存の日本語を維持）
- ✅ この計画書（plan.md）は日本語で記載

### テスト駆動開発（VIII）
- ⚠️ **部分適合**: デザインのみの変更のため、新規テストは不要
- ✅ 既存テスト（565テスト）がすべて通過することを確認
- ✅ TDDサイクルは適用せず、既存テストでリグレッションを検証

### パフォーマンス基準（IX）
- ✅ **適合**: デザイン変更のみで、パフォーマンスへの影響は最小
- ✅ Lighthouseスコア90以上を維持

**総合評価**: ✅ すべての憲法原則に適合。デザインのみの変更のため、ビジネスロジック・セキュリティ・パフォーマンスへの影響はありません。

## Project Structure

### Documentation (this feature)

```text
specs/001-glassmorphism-redesign/
├── spec.md              # フィーチャー仕様書
├── plan.md              # 本ファイル（実装計画）
├── research.md          # Phase 0: デザインパターン調査結果
├── quickstart.md        # Phase 1: 開発者向けクイックスタート
└── checklists/
    └── requirements.md  # 仕様品質チェックリスト
```

**注意**: このフィーチャーはUIのみの変更のため、`data-model.md` と `contracts/` は作成しません。

### Source Code (repository root)

```text
attendance-hub/
├── app/                              # Next.js App Router（6ページを更新）
│   ├── page.tsx                      # ✏️ 組織作成ページ
│   ├── [org]/
│   │   ├── page.tsx                  # ✏️ イベント一覧
│   │   ├── admin/
│   │   │   ├── page.tsx              # ✏️ 管理画面トップ
│   │   │   └── groups/page.tsx       # ✏️ グループ管理
│   │   ├── events/[id]/page.tsx      # ✏️ イベント詳細
│   │   └── my-register/page.tsx      # ✏️ 一括登録
│   └── globals.css                   # 変更なし
├── components/
│   └── ui/
│       └── theme-toggle.tsx          # ❌ 削除
├── __tests__/
│   └── components/ui/
│       └── theme-toggle.test.tsx     # ❌ 削除
└── samples/
    └── landing-pages/                # 📖 参照用モックアップ
        ├── final-1-top.html
        ├── final-2-events-list.html
        ├── final-3-admin-top.html
        ├── final-4-admin-groups.html
        ├── final-5-event-detail.html
        └── final-6-bulk-register.html
```

**Structure Decision**:
- Next.js App Router構造を使用（既存プロジェクトと同じ）
- UIコンポーネントファイルを直接編集（6ファイル）
- ThemeToggleコンポーネントとそのテストファイルを削除（2ファイル）
- 合計8ファイルを変更

## Complexity Tracking

このフィーチャーは憲法に違反していないため、このセクションは空です。

---

## Phase 0: Design Pattern Research

### 研究タスク

このフィーチャーは既存のモックアップファイルに基づいているため、新規の技術調査は不要ですが、以下のデザインパターンを文書化します：

1. **Skyカラーパレットの使用法**
   - 背景グラデーション: `bg-gradient-to-br from-white via-sky-50 to-white`
   - カードスタイル: `bg-white border border-sky-100 rounded-xl shadow-lg`
   - ボタンスタイル: `bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700`
   - ナビゲーションボタン: `bg-white border border-sky-200 hover:bg-sky-50 hover:border-sky-300`

2. **ボタンスタイルナビゲーションのパターン**
   - 基本クラス: `inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700`
   - ホバー: `hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm`
   - アイコン: `w-5 h-5 text-sky-600`（SVG）

3. **レスポンシブ対応**
   - ナビゲーションボタンの折り返し: `flex-wrap gap-3`
   - モバイル（320px）でのタップターゲットサイズ確保

**Output**: `research.md` にデザインパターンを文書化

## Phase 1: Design & Contracts

### データモデル

**該当なし**: このフィーチャーはUIのみの変更のため、データモデルの変更はありません。

### API契約

**該当なし**: このフィーチャーはUIのみの変更のため、API契約の変更はありません。

### クイックスタート

既存の `specs/001-attendance-prototype/quickstart.md` を参照し、必要に応じて `specs/001-glassmorphism-redesign/quickstart.md` を作成します。

**内容**:
- デザインリニューアルの概要
- モックアップファイルの参照方法
- ローカル開発環境でのビジュアル確認手順
- 既存テストの実行方法

**Output**: `quickstart.md` を作成

### Agent Context Update

実装計画完了後、`.specify/scripts/bash/update-agent-context.sh claude` を実行して、CLAUDE.mdに新しい技術情報を追加します。

**追加内容**:
- Skyカラーパレット（sky-50〜sky-600）の使用
- ダークモード削除（ライトモード専用）
- ボタンスタイルナビゲーションパターン

---

## Phase 2: Task Breakdown

**注意**: タスク生成は `/speckit.tasks` コマンドで実行します。このコマンド（`/speckit.plan`）では tasks.md は作成しません。

**期待されるタスク構造**:
1. ThemeToggleコンポーネントとテストファイルを削除
2. 6ページのTailwind CSSクラスを更新（Skyテーマ適用）
3. すべてのファイルから`dark:`クラスを削除
4. ブラウザでビジュアル確認（全6ページ）
5. 既存テスト実行とリグレッション確認
6. ビルド確認

---

## Risks & Mitigations

| リスク | 影響 | 対策 |
|--------|------|------|
| 既存テストが失敗する | 高 | 各ページ更新後に `npm test` を実行し、失敗したテストを即座に修正 |
| レスポンシブデザインが崩れる | 中 | 320px、768px、1024px の3つのビューポートで手動確認 |
| `dark:` クラスの削除漏れ | 低 | `grep -r "dark:" app/ components/` でコードベース全体を検索して確認 |
| アクセシビリティ低下 | 中 | 色コントラスト比をWebAIMツールで確認（gray-900 on white = 21:1） |

---

## Success Metrics

実装完了時に以下を確認：

- [ ] ThemeToggleコンポーネントが完全に削除されている
- [ ] すべてのページでSkyカラーパレット（sky-50〜sky-600）が適用されている
- [ ] すべてのナビゲーションリンクがアイコン付きボタンスタイルになっている
- [ ] `dark:` Tailwindクラスがコードベースに存在しない
- [ ] 既存の565テストがすべて通過する
- [ ] `npm run build` が成功する
- [ ] 320px、768px、1024px の各ビューポートでレイアウトが正常に表示される
- [ ] モックアップファイルとビジュアルが一致している

---

**Next Steps**: `/speckit.tasks` コマンドを実行してタスク一覧を生成し、実装フェーズに進みます。
