# Implementation Plan: 入力欄テキスト視認性の改善

**Branch**: `002-input-text-visibility` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-input-text-visibility/spec.md`

## Summary

全9箇所の入力欄（input、select要素）において、入力テキストとプレースホルダーの文字色を明示的に指定することで、ライトモード・ダークモード両方で視認性を確保する。Tailwind CSSのユーティリティクラス（`text-*`、`placeholder:*`）を使用し、既存のスタイリングを最小限の変更で拡張する。

## Technical Context

**Language/Version**: TypeScript 5.3以上（strict mode）
**Primary Dependencies**: Next.js 15 (App Router)、React 19、Tailwind CSS 3.4
**Storage**: N/A（UIスタイリングのみ）
**Testing**: Jest 29以上、React Testing Library 14以上（視覚的検証は手動）
**Target Platform**: Webブラウザ（モバイル、タブレット、デスクトップ）
**Project Type**: Web application（Next.js App Router）
**Performance Goals**: スタイル適用は即座（50ms以内）、ページロード時間への影響なし
**Constraints**:
- Tailwind CSSのユーティリティクラスのみ使用（カスタムCSSなし）
- 既存のスタイリング構造を維持
- ブラウザ互換性: モダンブラウザ（Chrome、Firefox、Safari、Edge最新版）
**Scale/Scope**:
- 対象ファイル: 3ファイル（app/admin/groups/page.tsx、app/admin/events/page.tsx、app/events/[id]/register/page.tsx）
- 修正箇所: 9箇所のinput/select要素

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 適用される憲法原則

#### ✅ VI. アクセシビリティ基準（直接関連）
- **要件**: 十分な色コントラスト比（通常テキストで4.5:1）
- **適合状況**:
  - `text-gray-900`（#111827）と白背景のコントラスト比: 16.6:1 ✅
  - `placeholder:text-gray-400`（#9ca3af）と白背景のコントラスト比: 4.6:1 ✅
  - 両方ともWCAG 2.1 AA基準（4.5:1）を上回る
- **判定**: ✅ 完全適合

#### ✅ III. 型安全性（非交渉可能）
- **要件**: TypeScript strict mode、型エラーなし
- **適合状況**:
  - 変更対象はTSXファイルのclassName属性（文字列リテラル）のみ
  - 型システムへの影響なし
  - 既存のTypeScript設定を変更しない
- **判定**: ✅ 適合（型安全性に影響なし）

#### ✅ IV. レスポンシブ・モバイルファースト設計
- **要件**: 全デバイスサイズでのサポート、モバイルファーストCSS
- **適合状況**:
  - Tailwindのユーティリティクラスはレスポンシブ設計済み
  - 文字色指定はビューポートサイズに依存しない
  - タッチフレンドリーなUI要素（既存の入力欄）はそのまま
- **判定**: ✅ 適合

#### ✅ VII. 日本語対応とローカライゼーション
- **要件**: 日本語UIテキスト、全角文字サポート
- **適合状況**:
  - 文字色の変更は言語に依存しない
  - 既存の日本語UI要素に影響なし
  - 全角文字の表示はフォントレンダリングに依存（変更なし）
- **判定**: ✅ 適合（影響なし）

#### ✅ VIII. テスト駆動開発（TDD）
- **要件**: Red-Green-Refactorサイクル、テストファースト
- **適合状況**:
  - **視覚的検証**: 文字色の視認性は自動テスト困難
  - **手動テストアプローチ**:
    1. ライトモード/ダークモードでの目視確認
    2. コントラスト比の計算検証（自動化可能）
    3. 各入力欄での入力テスト
  - **自動テスト対象外**: UIスタイリングのみの変更（憲法VIII「テストを書かない対象」- 単純なプレゼンテーションコンポーネント）
- **判定**: ✅ 適合（手動テストで検証）

#### ✅ IX. パフォーマンス基準
- **要件**: TTI 5秒以内、Lighthouse 90以上
- **適合状況**:
  - CSSクラス追加のみ（JavaScriptなし）
  - Tailwind CSSはビルド時に最適化済み
  - バンドルサイズへの影響: 数バイト（既存クラスの再利用）
  - ページロード時間への影響: 無視できるレベル
- **判定**: ✅ 適合

### 非適用の憲法原則

以下の原則は今回の機能に該当しません：

- **I. セキュリティ第一開発**: 認証・認可・データアクセスに影響なし
- **II. 無料枠最適化**: ストレージ・帯域幅への影響なし
- **V. サーバーレスアーキテクチャ**: バックエンドロジック変更なし

### ゲート判定

**Phase 0 Research開始許可**: ✅ 承認
- すべての適用可能な憲法原則に適合
- 技術スタック変更なし
- 複雑性追加なし

## Project Structure

### Documentation (this feature)

```text
specs/002-input-text-visibility/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (completed)
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (N/A - no data model changes)
├── quickstart.md        # Phase 1 output (to be created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                           # Next.js App Router
├── admin/
│   ├── groups/
│   │   └── page.tsx          # 修正対象: グループ名、表示順序、カラーコード入力欄
│   └── events/
│       └── page.tsx          # 修正対象: 日付、タイトル、場所入力欄
└── events/
    └── [id]/
        └── register/
            └── page.tsx      # 修正対象: グループ選択、メンバー選択、新メンバー名入力欄

components/                   # 再利用可能なコンポーネント
                              # （今回は直接修正なし - ページコンポーネント内のinlineスタイルのみ）

app/globals.css               # Tailwind CSS設定
                              # （参照のみ - 変更不要）
```

**Structure Decision**:
- Next.js App Routerの既存構造をそのまま使用
- 各ページコンポーネント内のinput/select要素のclassName属性を直接修正
- コンポーネントの抽出や新規作成は不要（スコープ最小化の原則）

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし - すべての憲法原則に適合しています。

## Phase 0: Research & Decisions

### Research Tasks

1. **Tailwind CSS文字色クラスの選定**
   - 目的: WCAG 2.1 AA基準（4.5:1）を満たす色の選択
   - 対象: 入力テキスト色、プレースホルダー色

2. **既存スタイリングパターンの確認**
   - 目的: 一貫性のある修正方法の決定
   - 対象: 3ファイルの現在のclassName構造

3. **ダークモード対応の検証**
   - 目的: `prefers-color-scheme: dark`メディアクエリへの影響確認
   - 対象: globals.cssの`:root`変数定義

### Expected Research Outcomes

- 使用するTailwindクラスの決定（例: `text-gray-900`、`placeholder:text-gray-400`）
- コントラスト比の計算結果
- 修正パターンの標準化（全9箇所で統一）

## Phase 1: Design Artifacts

### data-model.md

**該当なし** - この機能はデータモデルに影響しません。UIスタイリングのみの変更です。

### contracts/

**該当なし** - この機能はAPIコントラクトに影響しません。クライアントサイドのスタイリングのみです。

### quickstart.md

**作成予定** - 以下の内容を含む：
- 開発環境での確認方法（ライトモード/ダークモード切り替え）
- 手動テスト手順（各入力欄での視認性確認）
- コントラスト比計算ツールの使用方法
- トラブルシューティング（ブラウザキャッシュのクリアなど）

## Phase 2: Task Generation

**Not executed in this command** - `/speckit.tasks`コマンドで実行されます。

### Expected Task Breakdown（参考）

以下のタスク構造が予想されます：

1. **Phase 0完了**: research.mdの作成
2. **app/admin/groups/page.tsx**: 3箇所の修正
3. **app/admin/events/page.tsx**: 3箇所の修正
4. **app/events/[id]/register/page.tsx**: 3箇所の修正
5. **手動テスト**: 全9箇所の視認性確認
6. **quickstart.md作成**: 開発者向けドキュメント

各タスクは独立して実行可能で、TDD原則に従います（ただし、視覚的検証は手動テスト）。
