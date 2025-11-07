# Implementation Plan: イベント人数表示機能

**Branch**: `003-event-attendance-count` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-event-attendance-count/spec.md`

## Summary

イベント一覧画面、イベント詳細画面、イベント管理画面の3つの画面に、各イベントの出欠人数（参加・未定・欠席・合計）を表示する機能を追加します。既存の `calculateEventSummary` 関数（グループ別集計）に加えて、新たに `calculateEventTotalSummary` 関数を実装し、イベント全体の集計を行います。

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: Next.js 16, React 19.2, Tailwind CSS 3.4
**Storage**: localStorage (プロトタイプ、将来的にSupabase PostgreSQLへ移行)
**Testing**: Jest 29, React Testing Library 14
**Target Platform**: Web (モバイルファースト、レスポンシブデザイン)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 100件以上のイベントで2秒以内に人数表示を読み込み
**Constraints**: localStorage容量制限、クライアントサイド集計のパフォーマンス
**Scale/Scope**: 3画面の UI更新、1つの新規関数追加、テストケース追加

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

- ✅ **型安全性**: TypeScript strict mode使用、`any`型なし
- ✅ **TDD原則**: テストファーストで実装（Red-Green-Refactor）
- ✅ **セキュリティ**: 既存のlocalStorageアクセスパターンを踏襲、入力検証不要（表示のみ）
- ✅ **無料枠最適化**: 新規サービス不要、既存スタック内で実装
- ✅ **レスポンシブデザイン**: Tailwind CSSでモバイルファースト
- ✅ **日本語対応**: すべてのUIテキストは日本語
- ✅ **パフォーマンス**: クライアントサイド集計、useMemoでメモ化検討
- ✅ **アクセシビリティ**: セマンティックHTML、適切な色コントラスト

### Post-Design Check (Phase 1)

- ✅ **型安全性**: EventTotalSummary 型を定義、戻り値の型を明示
- ✅ **TDD原則**: テストケースを先に定義し、Red-Green-Refactorサイクルで実装
- ✅ **セキュリティ**: 表示のみのため新規セキュリティリスクなし
- ✅ **無料枠最適化**: クライアントサイド集計のみ、追加コストなし
- ✅ **レスポンシブデザイン**: 既存のTailwind CSSパターンを踏襲
- ✅ **日本語対応**: すべてのUIテキストは日本語（「参加」「未定」「欠席」「計」）
- ✅ **パフォーマンス**: useMemo によるメモ化、O(n) の効率的な集計
- ✅ **アクセシビリティ**: 数値表示にセマンティックなマークアップ

**結論**: すべての憲法原則に準拠しています。Phase 2（タスク生成）に進む準備が整いました。

## Project Structure

### Documentation (this feature)

```text
specs/003-event-attendance-count/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if needed)
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # イベント一覧画面 [UPDATE]
│   ├── admin/
│   │   └── events/page.tsx # イベント管理画面 [UPDATE]
│   └── events/
│       └── [id]/page.tsx   # イベント詳細画面 [UPDATE]
├── components/            # 再利用可能なコンポーネント
│   └── (新規コンポーネント検討)
├── lib/                   # ビジネスロジック
│   └── attendance-service.ts  # [UPDATE] calculateEventTotalSummary 追加
├── types/
│   └── index.ts           # [REVIEW] EventTotalSummary型の確認
└── __tests__/
    └── lib/
        └── attendance-service.test.ts  # [UPDATE] 新関数のテスト追加
```

**Structure Decision**: 既存の Next.js App Router 構造を使用。Web application パターンで、フロントエンド中心の実装。新規ファイルは不要で、既存ファイルの更新のみで対応可能。

## Complexity Tracking

この機能は憲法の原則に準拠しており、違反はありません。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                |
