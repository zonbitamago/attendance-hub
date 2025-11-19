# Implementation Plan: デザインシステム改善

**Branch**: `011-design-system` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-design-system/spec.md`

## Summary

アプリケーション全体のUI一貫性を向上させるため、共通UIコンポーネント（Button/Input/Card/Message/Heading）を作成し、全11ページに適用する。ダークモード完全対応とWCAG 2.1 AAレベルのアクセシビリティを実現する。使い方ガイド（UIページ2つ、README、quickstart 10ファイル）も併せて更新する。

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: Next.js 16, React 19.2, Tailwind CSS 3.4
**Storage**: localStorage / Supabase PostgreSQL（環境により切り替え）
**Testing**: Jest 29 + React Testing Library 14
**Target Platform**: Web（モバイルファースト、レスポンシブ）
**Project Type**: Web application（Next.js App Router）
**Performance Goals**: Lighthouse Performance 90以上、初期ロード3秒以内
**Constraints**: 無料枠内（Vercel + Supabase）、WCAG 2.1 AA準拠
**Scale/Scope**: 11ページ、5共通コンポーネント、13ドキュメント更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 適合状況 | 備考 |
|------|----------|------|
| I. セキュリティ第一開発 | ✅ 適合 | UIコンポーネントのみ、セキュリティ影響なし |
| II. 無料枠最適化 | ✅ 適合 | 有料依存関係なし、バンドルサイズ増加は最小限 |
| III. 型安全性 | ✅ 適合 | 全コンポーネントをTypeScriptで型付け |
| IV. レスポンシブ・モバイルファースト | ✅ 適合 | Tailwind CSS使用、320px〜1440px対応 |
| V. サーバーレスアーキテクチャ | ✅ 適合 | クライアントコンポーネントのみ |
| VI. アクセシビリティ基準 | ✅ 適合 | WCAG 2.1 AA準拠を目標 |
| VII. 日本語対応 | ✅ 適合 | ドキュメント日本語、UIテキスト日本語 |
| VIII. TDD | ✅ 適合 | 共通コンポーネントのテストを先に作成 |
| IX. パフォーマンス基準 | ✅ 適合 | Lighthouse 90以上を目標 |

**ゲート判定**: ✅ PASS - 全原則に適合

## Project Structure

### Documentation (this feature)

```text
specs/011-design-system/
├── spec.md              # 機能仕様書
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 調査結果
├── data-model.md        # Phase 1: データモデル（コンポーネントProps定義）
├── quickstart.md        # Phase 1: クイックスタートガイド
├── contracts/           # Phase 1: コンポーネントAPI定義
│   └── components.md    # コンポーネントインターフェース
├── checklists/          # 品質チェックリスト
│   └── requirements.md  # 仕様品質チェック
└── tasks.md             # Phase 2: タスク一覧
```

### Source Code (repository root)

```text
components/
├── ui/                     # 新規: 共通UIコンポーネント
│   ├── button.tsx          # Buttonコンポーネント
│   ├── input.tsx           # Inputコンポーネント
│   ├── card.tsx            # Cardコンポーネント
│   ├── message.tsx         # Messageコンポーネント
│   └── heading.tsx         # Headingコンポーネント
├── bulk-register/          # 既存
├── loading-spinner.tsx     # 既存
└── skeleton.tsx            # 既存

app/
├── globals.css             # 更新: ダークモード変数追加
├── page.tsx                # 更新: 共通コンポーネント適用
├── guide/
│   └── page.tsx            # 更新: ガイドページ改善
└── [org]/
    ├── page.tsx            # 更新
    ├── guide/page.tsx      # 更新
    ├── my-register/page.tsx # 更新
    ├── admin/
    │   ├── page.tsx        # 更新
    │   ├── groups/page.tsx # 更新
    │   └── events/page.tsx # 更新
    └── events/[id]/
        ├── page.tsx        # 更新
        └── register/page.tsx # 更新

__tests__/
├── components/
│   └── ui/                 # 新規: 共通コンポーネントテスト
│       ├── button.test.tsx
│       ├── input.test.tsx
│       ├── card.test.tsx
│       ├── message.test.tsx
│       └── heading.test.tsx
└── ...

docs/
├── README.md               # 更新: デザインシステム説明追加
└── specs/*/quickstart.md   # 更新: UI説明を最新化（10ファイル）
```

**Structure Decision**: 既存のNext.js App Router構造を維持し、`components/ui/`ディレクトリに共通UIコンポーネントを集約。既存のcomponentsディレクトリとの一貫性を保ちつつ、再利用可能なUIパーツを明確に分離。

## Complexity Tracking

該当なし - 全ての原則に適合しており、正当化が必要な違反はない。

## Design Decisions

### コンポーネント設計方針

1. **Composition over Configuration**: 複雑なpropsより、シンプルなpropsの組み合わせを優先
2. **Tailwind CSS直接使用**: CSS-in-JSライブラリは使用せず、Tailwindクラスを直接適用
3. **クライアントコンポーネント**: インタラクティブな要素はすべて`'use client'`を使用
4. **Forward Ref**: DOM要素への参照が必要な場合に備えてforwardRefを使用

### ダークモード実装方針

1. **システム設定自動追従**: `prefers-color-scheme` メディアクエリを使用
2. **Tailwind dark:プレフィックス**: 各コンポーネントに`dark:`バリアントを追加
3. **カスタムプロパティ**: globals.cssでCSS変数を定義し、テーマカラーを管理

### テスト方針

1. **コンポーネント単体テスト**: 各バリアント・サイズ・状態をテスト
2. **アクセシビリティテスト**: aria属性、フォーカス管理をテスト
3. **スナップショットテスト**: 視覚的な退行を検出
