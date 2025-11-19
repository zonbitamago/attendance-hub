# Implementation Plan: 統合ストレージ層

**Branch**: `010-unified-storage` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: 環境に応じたストレージ切り替え機能を実装する

## Summary

環境変数`NEXT_PUBLIC_USE_SUPABASE`に基づいてlocalStorageとSupabaseを自動的に切り替える統合ストレージ層を実装する。本番環境では自動的にSupabaseを使用し、ローカル開発ではデフォルトでlocalStorageを使用する。`npm run dev:supabase`コマンドでローカル環境でもSupabaseをテスト可能。

## Technical Context

**Language/Version**: TypeScript 5.9（strict mode）
**Primary Dependencies**: Next.js 16, React 19.2, Tailwind CSS 3.4, @supabase/supabase-js
**Storage**: localStorage / Supabase PostgreSQL（環境により切り替え）
**Testing**: Jest 29+, React Testing Library 14+
**Target Platform**: Web（Vercel）
**Project Type**: web
**Performance Goals**: 既存パフォーマンス維持（200ms以内の応答時間）
**Constraints**: 無料枠内（Supabase 500MB、Vercel 100GB帯域）
**Scale/Scope**: 既存467テストのpass維持、4サービスファイル更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | ステータス | 備考 |
|------|-----------|------|
| I. セキュリティ第一開発 | ✅ Pass | Supabaseモード時はRLS適用、環境変数で認証情報管理 |
| II. 無料枠最適化 | ✅ Pass | 追加コストなし、既存インフラ活用 |
| III. 型安全性 | ✅ Pass | TypeScript strict mode維持、統一インターフェース定義 |
| IV. レスポンシブ・モバイルファースト | ✅ N/A | UI変更なし |
| V. サーバーレスアーキテクチャ | ✅ Pass | Next.js App Router継続使用 |
| VI. アクセシビリティ基準 | ✅ N/A | UI変更なし |
| VII. 日本語対応 | ✅ Pass | ドキュメント日本語、エラーメッセージ日本語 |
| VIII. テスト駆動開発 | ✅ Pass | TDDサイクル遵守、既存テスト維持 |
| IX. パフォーマンス基準 | ✅ Pass | パフォーマンス劣化なし |

## Project Structure

### Documentation (this feature)

```text
specs/010-unified-storage/
├── spec.md              # 仕様書
├── plan.md              # 本ファイル
├── research.md          # リサーチ結果
├── data-model.md        # データモデル
├── quickstart.md        # クイックスタート
├── contracts/           # インターフェース定義
│   └── unified-storage.ts
├── checklists/          # チェックリスト
│   └── requirements.md
└── tasks.md             # タスク一覧（/speckit.tasksで生成）
```

### Source Code (repository root)

```text
lib/
├── unified-storage.ts   # 新規: 統合ストレージ層
├── storage.ts           # 既存: localStorage操作
├── supabase-storage.ts  # 既存: Supabase操作
├── organization-service.ts  # 更新: import先変更
├── group-service.ts     # 更新: import先変更
├── event-service.ts     # 更新: import先変更
└── attendance-service.ts # 更新: import先変更

__tests__/
└── lib/
    └── unified-storage.test.ts  # 新規: テスト
```

**Structure Decision**: 既存のNext.js App Router構造を維持。新規ファイル`lib/unified-storage.ts`を追加し、既存サービスファイルのimport先を変更する。

## Complexity Tracking

> 憲法違反なし - このセクションは空です

## 実装フェーズ概要

### Phase 1: 統合ストレージ層の実装

1. `lib/unified-storage.ts`を新規作成
2. ストレージモード判定ロジックを実装
3. 両ストレージバックエンドの統一インターフェースを提供

### Phase 2: サービスファイルの更新

1. `organization-service.ts`のimport先を変更
2. `group-service.ts`のimport先を変更
3. `event-service.ts`のimport先を変更
4. `attendance-service.ts`のimport先を変更

### Phase 3: 開発環境の設定

1. `package.json`に`dev:supabase`スクリプトを追加
2. 環境変数のドキュメント更新

### Phase 4: テストと検証

1. 統合ストレージ層のテストを追加
2. 既存テストの動作確認
3. ローカル・Supabaseモードの動作確認

### Phase 5: ドキュメント更新

1. README.md更新
2. SPECIFICATION.md更新
3. CLAUDE.md更新（必要に応じて）

## 関連ドキュメント

- [リサーチ](./research.md)
- [データモデル](./data-model.md)
- [クイックスタート](./quickstart.md)
- [インターフェース定義](./contracts/unified-storage.ts)
