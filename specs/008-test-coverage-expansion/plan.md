# Implementation Plan: Test Coverage Expansion

**Branch**: `008-test-coverage-expansion` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-test-coverage-expansion/spec.md`

## Summary

不足している重要ファイルのテストを追加し、プロジェクト全体のコードカバレッジを47.98%から70%以上に向上させる。特に、date-utils.ts（11.11%）、error-utils.ts（8.88%）、および0%カバレッジの重要ページ（出欠登録、イベント詳細、管理画面）にテストを追加する。既存の234テストに影響を与えず、約100-150の新規テストを追加する。

## Technical Context

**Language/Version**: TypeScript 5.9（strict mode必須）
**Primary Dependencies**: Jest 29、@testing-library/react 14、@testing-library/jest-dom
**Storage**: N/A（テストフィーチャー、既存のlocalStorageストレージを使用）
**Testing**: Jest 29（ユニット・統合テスト）、React Testing Library 14（コンポーネントテスト）
**Target Platform**: Node.js 20.x、22.x（GitHub Actions CIマトリックス）
**Project Type**: web（Next.js 16 App Router、React 19.2）
**Performance Goals**: ユーティリティ関数テスト実行時間90秒以内、ページコンポーネントテスト実行時間120秒以内
**Constraints**: 既存234テスト全てがpass、カバレッジ閾値（branches: 30%、functions: 50%、lines: 45%、statements: 45%）維持、CI/CD成功
**Scale/Scope**: 7ファイルに100-150テスト追加、234テスト→350-400テスト

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ III. 型安全性（非交渉可能）
- **準拠**: テストコードもTypeScript strict modeで記述
- **準拠**: モック関数の型定義に`jest.MockedFunction`を使用
- **準拠**: テストデータの型定義を明示的に記述

### ✅ VIII. テスト駆動開発（TDD）
- **特殊ケース**: 既存コードに対するテスト追加のため、通常のRed-Green-Refactorサイクルとは異なる
- **アプローチ**: 「Green（既存実装）→ Test（テスト追加）→ Refactor（改善）」の順序
- **準拠**: テストファーストの精神を維持（テストが仕様として機能）
- **準拠**: 小さなステップで進める（1ファイルずつテスト追加）
- **準拠**: テストの独立性を確保
- **準拠**: テストコードの品質をプロダクションコードと同等に維持

### ✅ VII. 日本語対応とローカライゼーション
- **準拠**: テスト名（describe、it/test）を日本語で記載
- **準拠**: このplan.mdを含む全ドキュメントを日本語で記載
- **例**: `describe('出欠登録ページの基本表示', () => { test('イベント情報が表示される', ...) })`

### ✅ テストツール（憲法VIII参照）
- **準拠**: Jest 29以上（既存インフラ）
- **準拠**: React Testing Library 14以上（既存インフラ）
- **準拠**: テスト対象優先度に従う（ビジネスロジック、Reactコンポーネント、ユーティリティ関数）

### ✅ II. 無料枠最適化
- **準拠**: 新しい有料サービスは導入しない
- **準拠**: 既存のテストインフラ（Jest、Testing Library）のみ使用

### ⚠️ IX. パフォーマンス基準
- **追加目標**: テスト実行時間の目標を設定（SC-012、SC-013）
- **監視**: npm testの実行時間を測定し、90-120秒以内を維持

### ✅ Documentation Maintenance
- **準拠**: フィーチャー完了後、README.mdとSPECIFICATION.mdを更新
- **更新内容**: テスト総数、カバレッジ統計、最終更新日

**総合評価**: 全ての必須原則に準拠。特殊な正当化は不要。

## Project Structure

### Documentation (this feature)

```text
specs/008-test-coverage-expansion/
├── spec.md              # 仕様書（完了）
├── plan.md              # このファイル（現在作成中）
├── quickstart.md        # Phase 1で作成予定
├── checklists/
│   └── requirements.md  # 仕様品質チェックリスト（完了）
└── tasks.md             # Phase 2で/speckit.tasksコマンドにより作成
```

### Source Code (repository root)

```text
attendance-hub/
├── __tests__/                               # テストディレクトリ（既存）
│   ├── app/
│   │   ├── [org]/
│   │   │   └── events/
│   │   │       └── [id]/
│   │   │           ├── page.test.tsx        # 🆕 P1: イベント詳細ページ
│   │   │           └── register/
│   │   │               └── page.test.tsx    # 🆕 P1: 出欠登録ページ
│   │   │   └── admin/
│   │   │       ├── groups/
│   │   │       │   └── page.test.tsx        # 🆕 P2: グループ管理ページ
│   │   │       ├── events/
│   │   │       │   └── page.test.tsx        # 🆕 P2: イベント管理ページ
│   │   │       └── my-register/
│   │   │           └── page.test.tsx        # 🆕 P2: 一括出欠登録ページ
│   ├── lib/
│   │   ├── date-utils.test.ts               # 🆕 P1: 日付ユーティリティ
│   │   └── error-utils.test.ts              # 🆕 P2: エラーユーティリティ
│   └── ... (既存テストファイル)
├── app/                                     # テスト対象（既存実装）
│   └── [org]/
│       ├── events/[id]/page.tsx             # 対象: イベント詳細
│       ├── events/[id]/register/page.tsx    # 対象: 出欠登録
│       ├── admin/groups/page.tsx            # 対象: グループ管理
│       ├── admin/events/page.tsx            # 対象: イベント管理
│       └── my-register/page.tsx             # 対象: 一括出欠登録
├── lib/                                     # テスト対象（既存実装）
│   ├── date-utils.ts                        # 対象: 日付ユーティリティ
│   └── error-utils.ts                       # 対象: エラーユーティリティ
├── jest.config.js                           # Jest設定（既存）
├── jest.setup.js                            # Jestセットアップ（既存）
└── package.json                             # テストスクリプト（既存）
```

**Structure Decision**: 既存のテストディレクトリ構造に従う。`__tests__/`配下にソースコードのディレクトリ構造を反映したテストファイルを配置。このアプローチにより、テストファイルとテスト対象ファイルの対応が明確になる。

## Phase Breakdown

### Phase 0: Research & Setup（不要）

**判断**: このフィーチャーは既存のテストインフラ（Jest、Testing Library）を使用し、新しい技術選択や設計判断を必要としない。研究フェーズはスキップし、Phase 1（テスト設計）から開始する。

**理由**:
- 既存のテストパターンが確立されている
- テスト対象のファイルが既に実装済み
- モック戦略、アサーションスタイルが統一されている
- 技術的な「NEEDS CLARIFICATION」が存在しない

### Phase 1: Test Design & Contracts

#### 1.1 既存テストパターンの分析

既存の優れたテストファイルを分析し、本フィーチャーで踏襲すべきパターンを抽出する：

**参照テストファイル**:
- `__tests__/app/page.test.tsx` - ページコンポーネントのモックパターン
- `__tests__/components/event-detail/member-attendance-list.test.tsx` - 複雑なコンポーネントのテスト
- `__tests__/lib/attendance-service.test.ts` - サービス層のテスト
- `__tests__/lib/storage.test.ts` - ユーティリティ関数のテスト

**抽出すべきパターン**:
- モックの使用方法（useRouter、useParams、useOrganization、localStorage）
- Testing Libraryのベストプラクティス（render、screen、fireEvent、waitFor）
- テストの構造（describe、beforeEach、afterEach、test/it）
- アサーションスタイル（expect、toBeInTheDocument、toHaveBeenCalledWith）
- 日本語テスト名の命名規則

#### 1.2 テスト設計ドキュメントの作成

各ファイルに対するテスト設計を`contracts/`ディレクトリに記録する：

**contracts/test-plan-summary.md**（概要）:
- P0優先度ファイル（3ファイル）
- P1優先度ファイル（4ファイル）
- 各ファイルの推定テスト数
- 総計: 100-150テスト

**contracts/date-utils-test-plan.md**（詳細例）:
- テスト対象関数一覧（6関数）
- 各関数のテストケース（正常系、異常系、境界値）
- モック戦略（jest.useFakeTimersの使用）
- 期待カバレッジ: 90%+

**contracts/page-test-plan.md**（詳細例）:
- テスト対象ページ一覧（5ページ）
- 各ページの主要機能
- モック対象（useRouter、useParams、useOrganization、サービス層）
- 期待カバレッジ: 80%+

#### 1.3 Quickstart Guide の作成

**quickstart.md**（テスト実行ガイド）:
- テスト実行コマンド（`npm test`、`npm test -- --watch`、`npm test -- --coverage`）
- 特定ファイルのテスト実行方法（`npm test date-utils`）
- カバレッジレポートの見方
- CI/CDでのテスト実行確認方法
- トラブルシューティング（モックが動作しない、非同期テストがタイムアウトするなど）

#### 1.4 Agent Context Update

**更新対象**: `CLAUDE.md`

**追加内容**:
- 新規テストファイルの追加（7ファイル）
- テスト総数の更新（234 → 350-400）
- カバレッジ統計の更新（47.98% → 70%+）
- 最終更新日の更新

**実行**: `.specify/scripts/bash/update-agent-context.sh claude`

### Phase 2: Tasks Generation（/speckit.tasksコマンドで実行）

Phase 2は本コマンド（/speckit.plan）のスコープ外。次のコマンド（/speckit.tasks）で実行される。

**期待されるタスク構成**:
```
Phase 0: Investigation & Baseline
  - T001: 既存テストパターン分析
  - T002: カバレッジベースライン測定

Phase 1: P0 Unit Tests（ユーティリティ）
  - T003: lib/date-utils.test.ts 作成
  - T004: lib/error-utils.test.ts 作成

Phase 2: P0 Page Tests（重要画面）
  - T005: app/[org]/events/[id]/register/page.test.tsx 作成
  - T006: app/[org]/events/[id]/page.test.tsx 作成

Phase 3: P1 Admin Tests（管理画面）
  - T007: app/[org]/admin/groups/page.test.tsx 作成
  - T008: app/[org]/admin/events/page.test.tsx 作成
  - T009: app/[org]/my-register/page.test.tsx 作成

Phase 4: Documentation & Verification
  - T010: README.md更新
  - T011: SPECIFICATION.md更新
  - T012: カバレッジ最終確認
  - T013: CI/CD動作確認
```

## Risk Analysis

### 高リスク

**R1: 既存テストへの影響**
- **リスク**: 新規テスト追加により既存の234テストが失敗する
- **軽減策**: 各テストファイル追加後に`npm test`を実行し、既存テストが全てpassすることを確認
- **検出**: CI/CDで自動検出

**R2: モック戦略の不一致**
- **リスク**: 既存のモックパターンと異なる方法でモックすると、テストが不安定になる
- **軽減策**: Phase 1.1で既存パターンを十分に分析し、統一したモック戦略を使用
- **検出**: コードレビューで確認

### 中リスク

**R3: カバレッジ目標未達**
- **リスク**: テストを追加しても目標の70%に到達しない
- **軽減策**: 各ファイルのテスト追加後にカバレッジを測定し、不足があれば追加テストケースを記述
- **検出**: `npm test -- --coverage`で測定

**R4: テスト実行時間の増加**
- **リスク**: 100-150テスト追加により、テスト実行時間が目標（90-120秒）を超える
- **軽減策**: 並列実行の活用（Jestのデフォルト動作）、不要なモックの削減
- **検出**: CI/CDの実行時間モニタリング

### 低リスク

**R5: テストの保守性**
- **リスク**: テストコードが複雑になり、保守が困難になる
- **軽減策**: 既存のテストパターンを踏襲し、明確な日本語のテスト名を使用
- **検出**: コードレビュー

## Success Metrics（再掲）

以下のSuccess Criteriaを達成することで、フィーチャーの成功を測定する：

### カバレッジ目標
- ✅ SC-001: date-utils.ts 11.11% → 90%+
- ✅ SC-002: error-utils.ts 8.88% → 90%+
- ✅ SC-003: register/page.tsx 0% → 80%+
- ✅ SC-004: events/[id]/page.tsx 0% → 80%+
- ✅ SC-005: admin/groups/page.tsx 0% → 80%+
- ✅ SC-006: admin/events/page.tsx 0% → 80%+
- ✅ SC-007: my-register/page.tsx 0% → 80%+
- ✅ SC-008: 全体カバレッジ 47.98% → 70%+

### テスト品質
- ✅ SC-009: テスト総数 234 → 350-400
- ✅ SC-010: 全テストpass、CI/CD成功
- ✅ SC-011: カバレッジ閾値維持

### パフォーマンス
- ✅ SC-012: ユーティリティ関数テスト実行 90秒以内
- ✅ SC-013: ページコンポーネントテスト実行 120秒以内

## Next Steps

1. **Quickstart Guide作成**: テスト実行の手順書を作成
2. **Test Plan作成**: contracts/配下に詳細なテスト設計を記録
3. **Agent Context更新**: CLAUDE.mdを更新
4. **Tasks生成**: `/speckit.tasks`コマンドを実行してタスク一覧を生成
5. **実装開始**: tasks.mdに従ってテストを追加

## Complexity Tracking

本フィーチャーでは憲法違反や複雑性の正当化は不要。全ての原則に準拠している。
