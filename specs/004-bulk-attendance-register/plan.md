# Implementation Plan: 複数イベント一括出欠登録

**Branch**: `004-bulk-attendance-register` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-bulk-attendance-register/spec.md`

## Summary

メンバーが自分の出欠を複数イベントに一括で登録・更新できる機能を実装する。現在はイベントごとに個別登録が必要で、グループと名前を毎回選択する必要があるが、本機能により1画面で複数イベントへの登録が可能となり、操作時間を70%以上削減する。

**技術的アプローチ**:
- 新規ページ `/my-register` を作成（Next.js App Router）
- サービス層に `upsertAttendance` および `upsertBulkAttendances` 関数を追加
- 既存の重複登録バグを修正（同一メンバー×同一イベントの重複防止）
- セッション中のみメンバー情報を保持（React state、localStorage不使用）
- TDDに基づき、テストファースト開発

## Technical Context

**Language/Version**: TypeScript 5.9（strict mode）
**Primary Dependencies**:
- Next.js 16.0（App Router）
- React 19.2
- Tailwind CSS 3.4
- Zod 3.23（バリデーション）
- Jest 29（テスト）
- React Testing Library 14（コンポーネントテスト）

**Storage**: localStorage（プロトタイプ、将来的にSupabase PostgreSQLへ移行予定）
**Testing**: Jest 29 + React Testing Library 14（TDDアプローチ）
**Target Platform**: Web（モバイルファースト・レスポンシブ）
**Project Type**: Web application（Next.js App Router）
**Performance Goals**:
- 一括登録処理: 5秒以内（50イベント）
- ページ初回ロード: 3秒以内（3G接続）
- Time to Interactive: 5秒以内

**Constraints**:
- localStorageへの永続化なし（セッション中のみメモリ保持）
- 重複レコードゼロの保証（upsert実装）
- 既存の個別登録機能との並行稼働

**Scale/Scope**:
- 最大50イベントの一括選択をサポート
- 既存3ページ + 新規1ページ
- サービス層関数: 既存12関数 + 新規2関数
- 新規テストケース: 約30〜40ケース

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### セキュリティ第一開発（原則I）
- ✅ **適用外**: 本機能は認証機能を含まない（プロトタイプフェーズ）
- ⚠️ **将来対応**: Supabase移行時に認証・RLSを実装予定

### 無料枠最適化（原則II）
- ✅ **遵守**: localStorageのみ使用、外部APIコールなし
- ✅ **遵守**: 有料依存関係なし

### 型安全性（原則III）
- ✅ **遵守**: TypeScript strict mode必須
- ✅ **遵守**: すべての新規関数・コンポーネントに明示的な型定義
- ✅ **遵守**: Zodスキーマから型推論（`z.infer<typeof Schema>`）

### レスポンシブ・モバイルファースト設計（原則IV）
- ✅ **遵守**: Tailwind CSSでモバイルファーストUI
- ✅ **遵守**: 320px（モバイル）、768px（タブレット）、1024px（デスクトップ）でテスト
- ✅ **解決**: カードリスト形式UIで横スクロール不要（research.mdで決定）

### サーバーレスアーキテクチャ（原則V）
- ✅ **遵守**: クライアントサイドのみ（localStorage操作）
- ✅ **遵守**: ステートレス（sessionStorage/localStorage不使用、React state）

### アクセシビリティ基準（原則VI）
- ✅ **遵守**: セマンティックHTML（`<button>`, `<form>`, `<label>`）
- ✅ **遵守**: キーボードナビゲーション（Enter/Space/Tab）
- ✅ **遵守**: 十分な色コントラスト比（4.5:1以上）

### 日本語対応とローカライゼーション（原則VII）
- ✅ **遵守**: すべてのUIテキストを日本語で実装
- ✅ **遵守**: エラーメッセージも日本語（明確で丁寧な表現）

### テスト駆動開発（原則VIII）
- ✅ **遵守**: Red-Green-Refactorサイクル厳守
- ✅ **遵守**: テストファースト（実装前にテストを書く）
- ✅ **遵守**: カバレッジ目標: ビジネスロジック80%以上

### パフォーマンス基準（原則IX）
- ✅ **遵守**: 初期ページロード3秒以内（localStorage読み込みのみ）
- ✅ **遵守**: 一括登録処理5秒以内（50イベント、バッチ処理で最適化）

### ドキュメント管理（原則X）
- ✅ **遵守**: tasks.mdの最後にSPECIFICATION.md更新タスクを含める

**評価結果（Phase 1後）**: ✅ すべての必須原則を遵守。Phase 0のresearch.mdでモバイルUI問題も解決済み。

## Project Structure

### Documentation (this feature)

```text
specs/004-bulk-attendance-register/
├── spec.md              # 機能仕様書（完成済み）
├── plan.md              # このファイル（実装計画）
├── research.md          # Phase 0: 技術調査結果（完成済み）
├── data-model.md        # Phase 1: データモデル設計（完成済み）
├── quickstart.md        # Phase 1: 開発手順書（完成済み）
├── contracts/           # Phase 1: API契約定義（完成済み）
│   └── attendance-service-api.md
├── checklists/          # 品質チェックリスト
│   └── requirements.md  # 仕様品質チェック（完成済み）
└── tasks.md             # Phase 2: タスク一覧（/speckit.tasksで生成）
```

### Source Code (repository root)

```text
attendance-hub/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # トップページ（一括登録へのリンク追加）
│   ├── my-register/              # 【新規】一括出欠登録
│   │   └── page.tsx
│   ├── events/[id]/
│   │   ├── page.tsx              # イベント詳細
│   │   └── register/page.tsx     # 個別出欠登録（既存）
│   └── admin/
│       └── page.tsx              # 管理画面（一括登録へのリンク追加）
│
├── lib/                           # ビジネスロジック・サービス層
│   ├── storage.ts                # localStorage操作（既存）
│   ├── attendance-service.ts     # 【拡張】upsert関数を追加
│   ├── event-service.ts          # イベント取得（既存）
│   ├── member-service.ts         # メンバー取得（既存）
│   ├── group-service.ts          # グループ取得（既存）
│   └── validation.ts             # 【拡張】一括登録用Zodスキーマ追加
│
├── types/                         # TypeScript型定義
│   └── index.ts                  # 【拡張】BulkAttendanceInput型など追加
│
├── components/                    # 再利用可能コンポーネント
│   ├── loading-spinner.tsx       # ローディング表示（既存）
│   └── bulk-register/            # 【新規】一括登録専用コンポーネント
│       ├── member-selector.tsx   # グループ・メンバー選択
│       ├── event-list.tsx        # イベント複数選択
│       └── status-grid.tsx       # イベント×ステータス設定グリッド
│
├── __tests__/                     # テスト
│   ├── lib/
│   │   └── attendance-service.test.ts  # 【拡張】upsert関数のテスト追加
│   └── app/
│       └── my-register/
│           └── page.test.tsx     # 【新規】一括登録ページのテスト
│
└── specs/                         # 機能仕様・設計ドキュメント
    ├── 001-attendance-prototype/
    ├── 002-input-text-visibility/
    ├── 003-event-attendance-count/
    └── 004-bulk-attendance-register/  # 本フィーチャー
```

**Structure Decision**:
既存のNext.js App Router構造を維持し、新規ページ `app/my-register/` を追加。サービス層は既存の `lib/attendance-service.ts` を拡張してupsert機能を追加することで、コードの凝集度を高める。コンポーネントは再利用性を考慮し、`components/bulk-register/` 配下に配置。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本フィーチャーでは憲法違反はないため、このセクションは空欄。

---

## Phase 0: Research & Technical Decisions ✅ COMPLETE

**Deliverable**: [research.md](./research.md)

### 完了した調査項目

1. ✅ **Upsert実装パターン**: `eventDateId + memberId`複合キーによる重複防止
2. ✅ **一括登録UIパターン**: カードリスト形式（モバイルファースト）
3. ✅ **エラーハンドリング戦略**: 部分的な成功を許容、詳細なフィードバック
4. ✅ **パフォーマンス最適化**: バッチ処理（1回read/write）

---

## Phase 1: Design & Contracts ✅ COMPLETE

### 完成した成果物

1. ✅ **Data Model**: [data-model.md](./data-model.md)
   - ER図（Mermaid形式）
   - 新規型定義（BulkAttendanceInput, BulkAttendanceResult）
   - データ整合性ルール

2. ✅ **API Contracts**: [contracts/attendance-service-api.md](./contracts/attendance-service-api.md)
   - `upsertAttendance`関数仕様
   - `upsertBulkAttendances`関数仕様
   - パラメータ詳細、戻り値、エラーケース、使用例

3. ✅ **Quickstart**: [quickstart.md](./quickstart.md)
   - セットアップ手順
   - TDD開発フロー
   - テスト実行方法
   - 手動テスト・パフォーマンステスト

4. ✅ **Agent Context**: CLAUDE.md更新完了
   - TypeScript 5.9（strict mode）追加
   - localStorage情報追加

---

## Phase 2: Task Breakdown

Phase 2は `/speckit.tasks` コマンドで実行。

`tasks.md`には以下のタスクグループを含める:

1. **サービス層のupsert実装**（TDD）
   - `upsertAttendance`のテスト→実装
   - `upsertBulkAttendances`のテスト→実装
   - 重複レコードクリーンアップのテスト→実装

2. **型定義とバリデーション**
   - `types/index.ts`に新規型追加
   - `lib/validation.ts`にZodスキーマ追加
   - バリデーションテスト

3. **一括登録UIコンポーネント**（TDD）
   - `components/bulk-register/member-selector.tsx`
   - `components/bulk-register/event-list.tsx`
   - `components/bulk-register/status-grid.tsx`
   - 各コンポーネントのテスト

4. **一括登録ページ**
   - `app/my-register/page.tsx`実装
   - 統合テスト（E2E風）

5. **ナビゲーション統合**
   - `app/page.tsx`にリンク追加
   - `app/admin/page.tsx`にリンク追加

6. **ドキュメント更新**
   - SPECIFICATION.md更新（憲法 原則X）

---

## Next Steps

1. ✅ Phase 0-1完了（research.md, data-model.md, contracts/, quickstart.md, CLAUDE.md更新）

2. **次のコマンド**: `/speckit.tasks`
   - `tasks.md`を生成
   - 実装可能な粒度のタスクに分解
   - 依存関係を明確化

3. **その後**: `/speckit.implement`
   - TDDサイクルでタスクを実行
   - テストカバレッジ80%以上を維持

---

**Branch**: `004-bulk-attendance-register`
**Plan Status**: ✅ Phase 0-1 Complete
**Ready for**: `/speckit.tasks` command
