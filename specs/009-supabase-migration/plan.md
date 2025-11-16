# Implementation Plan: Supabase Migration with Multi-Tenant RLS

**Branch**: `009-supabase-migration` | **Date**: 2025-11-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-supabase-migration/spec.md`

## Summary

localStorage から Supabase PostgreSQL + Row Level Security (RLS) への完全移行を実施し、マルチテナント機能（005-multi-tenant）をデータベースレベルで統合する。全エンティティ（Organization, EventDate, Group, Member, Attendance）をPostgreSQLテーブルに移行し、外部キー制約、インデックス、RLSポリシーを設定する。サービス層を同期処理から非同期処理（async/await）に変更し、集計処理をSQLクエリで実装する。認証機能は後回しとし、データストレージ層のみを実装する。

## Technical Context

**Language/Version**: TypeScript 5.9（strict mode必須）
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, @supabase/supabase-js（最新安定版）, Zod（既存）
**Storage**: Supabase PostgreSQL（無料プラン: 500MB ストレージ、50,000 月間アクティブユーザー）
**Testing**: Jest 29, React Testing Library 14, @testing-library/jest-dom
**Target Platform**: Web（Next.js App Router）、Node.js 20.x/22.x（CI/CD）
**Project Type**: Web（フロントエンド + Next.js API Routes）
**Performance Goals**:
- データベースクエリ: 200ms以内（100メンバーの集計処理）
- 1000+レコードのクエリ: 500ms以内
- ページロード: 3G接続で3秒以内（既存基準維持）

**Constraints**:
- 大規模な変更（約236ファイル: 新規20、大幅変更10、軽微変更25、テスト更新181）
- Supabase無料プランの制限内（500MB ストレージ、API呼び出し数）
- テストカバレッジ維持（約85%）、最小閾値（branches: 30%, functions: 50%, lines: 45%, statements: 45%）
- CI/CD全チェック通過（型チェック、リント、テスト、ビルド）

**Scale/Scope**:
- 5テーブル、約20インデックス、5 RLSポリシー
- 181既存テスト + 新規テスト（Supabase Client モック）
- 10サービス関数ファイル、25ページコンポーネント
- 想定データ規模: 10-20団体、各団体100メンバー、月間10イベント

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. セキュリティ第一開発

- ✅ **Row Level Security (RLS)**: 全テーブルにRLSポリシーを設定し、団体IDベースのアクセス制御を実装
- ⚠️ **認証**: 本フィーチャーでは認証機能は範囲外（後続フィーチャーで実装予定）
  - **正当化**: URLパスの団体IDで基本的なアクセス制御を行い、将来の認証機能追加時に拡張可能な設計とする
- ✅ **入力検証**: 既存のZodスキーマを引き続き使用し、データベース制約と一致させる
- ✅ **秘密情報管理**: Supabase接続情報（URL, API Key）を環境変数（.env.local）で管理

**判定**: 条件付き合格（認証は後続フィーチャーで実装）

### II. 無料枠最適化

- ✅ **Supabase無料プラン**: 500MB ストレージ以下、50,000 月間アクティブユーザー以下
- ✅ **クエリ最適化**: インデックス設定、SQL集計によりネットワーク転送を最小化
- ✅ **有料依存なし**: Supabaseの無料プランのみ使用

**判定**: 合格

### III. 型安全性（非交渉可能）

- ✅ **TypeScript strict mode**: 既存の設定を維持
- ✅ **型定義**: Supabase CLIで自動生成される型定義（database.types.ts）を使用
- ✅ **既存型**: types/index.ts のデータモデルをそのまま使用

**判定**: 合格

### IV. レスポンシブ・モバイルファースト設計

- ✅ **既存UI維持**: UIレイアウトは変更せず、データ取得部分のみ非同期化
- ✅ **ローディング状態**: 非同期データ取得中にローディングスピナー/スケルトンUIを表示

**判定**: 合格

### V. サーバーレスアーキテクチャ

- ✅ **Supabase Client**: クライアントサイドから直接Supabase APIを呼び出し（サーバーレス）
- ✅ **ステートレス**: データベース接続プーリングはSupabaseが管理
- ✅ **静的生成優先**: 既存のSSG/SSRバランスを維持

**判定**: 合格

### VI. アクセシビリティ基準

- ✅ **既存基準維持**: UIは変更しないため、既存のアクセシビリティ基準を維持
- ✅ **ローディング状態**: スクリーンリーダー対応のローディング表示

**判定**: 合格

### VII. 日本語対応とローカライゼーション

- ✅ **UI**: 既存の日本語UIを維持
- ✅ **エラーメッセージ**: データベースエラーを日本語のユーザーフレンドリーなメッセージに変換
- ✅ **ドキュメント**: 本計画書、research.md、data-model.md、quickstart.md を日本語で作成

**判定**: 合格

### VIII. テスト駆動開発（TDD）

- ✅ **Red-Green-Refactor**: 既存のTDDアプローチを維持
- ✅ **テストカバレッジ**: 現在のレベル（約85%）を維持、最小閾値を満たす
- ✅ **Supabase Clientモック**: `__mocks__/@supabase/supabase-js.ts` を作成

**判定**: 合格

### IX. パフォーマンス基準

- ✅ **ページロード**: 既存の3秒以内を維持
- ✅ **クエリパフォーマンス**: インデックス最適化、SQL集計により200ms以内（100メンバー）
- ✅ **ネットワーク最適化**: 必要なデータのみ取得、バッチ処理の活用

**判定**: 合格

**総合判定**: ✅ 合格（認証機能は後続フィーチャーで実装する条件付き）

## Project Structure

### Documentation (this feature)

```text
specs/009-supabase-migration/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: Database schema design
├── quickstart.md        # Phase 1: Setup and development guide
├── contracts/           # Phase 1: API contracts and SQL schemas
│   ├── database-schema.sql    # PostgreSQL DDL
│   ├── rls-policies.sql       # Row Level Security policies
│   ├── indexes.sql            # Performance indexes
│   └── test-data.sql          # Seed data for development
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks output)
```

### Source Code (repository root)

```text
lib/
├── supabase/
│   ├── client.ts              # Supabase Client initialization
│   └── database.types.ts      # Auto-generated types from Supabase CLI
├── storage.ts                 # localStorage interface (to be replaced or extended)
├── supabase-storage.ts        # NEW: Supabase implementation of storage interface
├── organization-service.ts    # MODIFY: async/await
├── event-service.ts           # MODIFY: async/await
├── group-service.ts           # MODIFY: async/await
├── member-service.ts          # MODIFY: async/await
├── attendance-service.ts      # MODIFY: async/await, SQL aggregation
├── validation.ts              # KEEP: Zod schemas
├── date-utils.ts              # KEEP: Date utilities
└── error-utils.ts             # KEEP: Error handling

contexts/
└── organization-context.tsx   # MODIFY: async data fetching from Supabase

app/
├── [org]/
│   ├── page.tsx              # MODIFY: async data fetching
│   ├── admin/
│   │   ├── groups/page.tsx   # MODIFY: async data fetching
│   │   ├── events/page.tsx   # MODIFY: async data fetching
│   │   └── organizations/page.tsx # MODIFY: async data fetching
│   ├── events/[id]/
│   │   ├── page.tsx          # MODIFY: async data fetching
│   │   └── register/page.tsx # MODIFY: async data fetching
│   └── my-register/page.tsx  # MODIFY: async data fetching
└── ...

__tests__/
├── lib/
│   ├── supabase-storage.test.ts    # NEW: Supabase storage tests
│   ├── organization-service.test.ts # MODIFY: async tests
│   ├── event-service.test.ts       # MODIFY: async tests
│   ├── group-service.test.ts       # MODIFY: async tests
│   ├── member-service.test.ts      # MODIFY: async tests
│   └── attendance-service.test.ts  # MODIFY: async tests
├── __mocks__/
│   └── @supabase/
│       └── supabase-js.ts          # NEW: Supabase Client mock
└── ...

supabase/
├── migrations/
│   ├── 001_create_organizations.sql
│   ├── 002_create_event_dates.sql
│   ├── 003_create_groups.sql
│   ├── 004_create_members.sql
│   ├── 005_create_attendances.sql
│   ├── 006_enable_rls.sql
│   └── 007_create_indexes.sql
├── seed.sql                        # Development seed data
└── config.toml                     # Supabase configuration

.env.local                          # NEW: Supabase connection info (gitignored)
.env.example                        # NEW: Environment variable template
```

**Structure Decision**: Web application（Next.js App Router）を維持し、Supabaseクライアントライブラリを追加。既存のディレクトリ構造を変更せず、新規ディレクトリ（lib/supabase/, supabase/）を追加する。

## Complexity Tracking

*本フィーチャーでは、Constitution Checkの違反はありません。*

## Phase 0: Research & Design Decisions

### R1: Supabase Client Setup

**Decision**: `@supabase/supabase-js` v2系の最新安定版を使用

**Rationale**:
- 公式クライアントライブラリで、型安全性とTypeScript統合が優れている
- RLS、リアルタイム、認証など将来の拡張に対応
- Next.js App Routerとの統合パターンが確立されている

**Alternatives Considered**:
- **Prisma + Supabase**: より抽象度の高いORMだが、RLSとの統合が複雑
- **直接PostgreSQL接続**: 柔軟性は高いが、Supabaseの無料プランではコネクションプーリングの利点を失う

**Implementation Notes**:
- `lib/supabase/client.ts` でシングルトンClientを初期化
- 環境変数: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- SSR対応: クライアントサイドのみ使用（認証なしのため問題なし）

---

### R2: RLS Policy Design（認証なし）

**Decision**: `organization_id` カラムでのRLSポリシーを設定し、認証なしアクセスに対応

**Rationale**:
- 現在は認証機能がないため、URLパスの団体IDをクライアントサイドで設定
- 将来的にSupabase Authを追加した際に、`auth.uid()` ベースのポリシーに拡張可能

**Alternatives Considered**:
- **認証機能を同時実装**: スコープが大きくなりすぎ、段階的な移行が困難
- **RLSなし**: セキュリティリスクが高く、マルチテナント分離が不十分

**Implementation Notes**:
```sql
-- 例: event_datesテーブルのRLSポリシー
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization's events"
ON event_dates
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true));
```

- クライアントサイドで `SET app.current_organization_id = 'abc123';` を実行
- 将来の拡張: `auth.uid()` とOrganizationの紐付けテーブルを追加

---

### R3: 非同期化戦略

**Decision**: 既存のサービス層関数を async/await に変更し、インターフェースを維持

**Rationale**:
- UIレイヤーへの影響を最小限に抑える（関数名、引数、戻り値の型は維持）
- 段階的な移行が可能（localStorage → Supabase の切り替えフラグを実装可能）

**Alternatives Considered**:
- **完全なリライト**: リスクが高く、既存テストが全て無効になる
- **wrapper関数**: 余分な抽象化レイヤーが追加され、複雑性が増す

**Implementation Notes**:
```typescript
// Before (同期)
export function getAllEventDates(orgId: string): EventDate[] {
  return loadEventDates(orgId);
}

// After (非同期)
export async function getAllEventDates(orgId: string): Promise<EventDate[]> {
  return await loadEventDates(orgId);
}
```

---

### R4: 集計処理のSQL化

**Decision**: TypeScriptループ処理をSQLのJOIN + GROUP BYに置き換え

**Rationale**:
- パフォーマンス向上（ネットワーク転送量削減、データベース側で集計）
- スケーラビリティ（100メンバー → 1000メンバーでも同等のパフォーマンス）

**Alternatives Considered**:
- **TypeScriptでの集計維持**: シンプルだが、データ量増加時にパフォーマンス劣化
- **Supabase Functions**: サーバーサイド関数だが、無料プランの制限あり

**Implementation Notes**:
```sql
-- 例: グループ別出欠集計
SELECT
  g.id as group_id,
  g.name as group_name,
  COUNT(CASE WHEN a.status = '◯' THEN 1 END) as attending,
  COUNT(CASE WHEN a.status = '△' THEN 1 END) as maybe,
  COUNT(CASE WHEN a.status = '✗' THEN 1 END) as not_attending
FROM groups g
LEFT JOIN members m ON m.group_id = g.id
LEFT JOIN attendances a ON a.member_id = m.id AND a.event_date_id = $1
WHERE g.organization_id = $2
GROUP BY g.id, g.name
ORDER BY g.order;
```

---

### R5: テスト戦略（Supabase Clientモック）

**Decision**: `__mocks__/@supabase/supabase-js.ts` でSupabase Clientをモック

**Rationale**:
- 実際のデータベースに接続せずテスト可能
- テスト実行速度の維持（localStorage同等）
- CI/CDでのSupabaseプロジェクト不要

**Alternatives Considered**:
- **Test Supabaseプロジェクト**: 実環境に近いが、CI/CDが複雑化、コスト増
- **In-Memory PostgreSQL**: セットアップが複雑、テスト実行が遅い

**Implementation Notes**:
```typescript
// __mocks__/@supabase/supabase-js.ts
export const createClient = jest.fn(() => ({
  from: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
  })),
}));
```

---

## Phase 1: Detailed Design

### Data Model

詳細は [data-model.md](./data-model.md) を参照

### API Contracts

詳細は [contracts/](./contracts/) を参照

### Quickstart Guide

詳細は [quickstart.md](./quickstart.md) を参照

---

## Risk Management

### R1: 大規模な非同期化によるバグ混入（高）

**影響**: 全ページで非同期処理エラー、ローディング状態の不備、レースコンディション

**軽減策**:
- 段階的な実装（サービス層 → UI層の順）
- 各ファイル変更後にテスト実行
- async/await のベストプラクティスに従う（エラーハンドリング、Promise.all の活用）

**検出**: 型チェック、ESLint、テスト、ブラウザでの手動確認

---

### R2: RLSポリシーの設定ミスによるデータ漏洩（高）

**影響**: 他の団体のデータが見える、意図しないデータ変更

**軽減策**:
- 各RLSポリシーを個別にテスト（2つの団体でデータ分離を検証）
- Supabase Dashboardでポリシーを手動確認
- 統合テストで複数団体のシナリオをテスト

**検出**: 統合テスト、手動テスト

---

### R3: テストカバレッジの低下（中）

**影響**: カバレッジが85% → 閾値未達、CI/CD失敗

**軽減策**:
- 各ファイル変更後にカバレッジ測定
- 不足している場合は追加テストケースを記述
- モック戦略を統一（Supabase Clientモック）

**検出**: `npm test -- --coverage` で測定

---

### R4: パフォーマンス劣化（中）

**影響**: ページロード遅延、クエリタイムアウト

**軽減策**:
- インデックスの適切な設定
- SQLクエリの最適化（EXPLAIN ANALYZEで確認）
- パフォーマンステスト（100メンバー、200ms以内）

**検出**: パフォーマンステスト、Lighthouse、ブラウザDevTools

---

## Success Criteria Alignment

本実装計画は、spec.mdで定義された以下の成功基準を満たすように設計されています：

- ✅ **SC-001**: 全テストスイート（181テスト）が100% pass、ビルド成功
- ✅ **SC-002**: テストカバレッジ維持（約85%）、最小閾値満たす
- ✅ **SC-003**: マルチテナント機能が正常動作（RLSによるデータ分離）
- ✅ **SC-004**: RLSポリシーによる完全なデータ分離（自動テストで検証）
- ✅ **SC-005**: パフォーマンステスト通過（100メンバー、200ms以内）
- ✅ **SC-006**: インデックス最適化（1000+レコード、500ms以内）
- ✅ **SC-007**: ローディング状態とエラーハンドリング実装
- ✅ **SC-008**: CI/CDパイプライン全pass

---

## Next Steps

1. ✅ Phase 0 完了: research.md 生成
2. 次: Phase 1 - data-model.md, contracts/, quickstart.md 生成
3. 次: `/speckit.tasks` 実行でタスクリスト生成
4. 次: `/speckit.implement` 実行で実装開始
