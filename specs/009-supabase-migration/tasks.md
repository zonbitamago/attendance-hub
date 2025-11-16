# Implementation Tasks: Supabase Migration with Multi-Tenant RLS

**Feature**: 009-supabase-migration
**Branch**: `009-supabase-migration`
**Created**: 2025-11-15
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

## Summary

localStorage から Supabase PostgreSQL + Row Level Security (RLS) への完全移行。マルチテナント機能を RLS で統合し、サービス層を非同期化、集計処理を SQL 化する。全181テストを pass させ、カバレッジ85%を維持する。

**総タスク数**: 220タスク（厳密なTDD - ベイビーステップで再編成）
**TDD原則**: 1機能ごとにRed-Green-Refactorサイクルを適用（t-wada準拠）
**推奨MVP**: Phase 3（User Story 1 - データストレージの完全移行、T001-T068）
**開発期間**: 6-8週間（ベイビーステップによる安全・確実な実装）

**フェーズ別タスク数**:
- Phase 1: Setup (10タスク)
- Phase 2: Foundational (10タスク)
- Phase 3: US1 - データストレージ移行 (48タスク、15サイクル)
- Phase 4: US2 - RLS (34タスク、10サイクル)
- Phase 5: US3 - サービス層非同期化 (35タスク、9サイクル)
- Phase 6: US4 - UI層非同期対応 (42タスク、10サイクル)
- Phase 7: US5 - テスト統合 (19タスク、6サイクル)
- Phase 8: Polish (22タスク、5サイクル)

---

## Task Dependencies & Execution Order

### User Story Completion Order

```
Phase 1: Setup (T001-T010)
         ↓
Phase 2: Foundational (T011-T020)
         ↓
     ┌───┴───┐
     ↓       ↓
Phase 3: US1  Phase 4: US2 (並行可能)
(T021-T035)   (T036-T045)
     ↓           ↓
     └─────┬─────┘
           ↓
    Phase 5: US3 (T046-T058)
           ↓
    Phase 6: US4 (T059-T070)
           ↓
    Phase 7: US5 (T071-T080)
           ↓
    Phase 8: Polish (T081-T085)
```

### Critical Path

1. Setup & Foundational → US1（データストレージ移行）→ US2（RLS）→ US3（サービス層非同期化）→ US4（UI層対応）→ US5（テスト更新）

### Parallel Execution Opportunities

**Phase 3 (US1) での並列実行**:
- Supabase Client setup (T021-T023)
- 各マイグレーションファイル作成 (T024-T028) [並列可能]

**Phase 4 (US2) での並列実行**:
- 各RLSポリシー作成 (T037-T041) [並列可能]

**Phase 5 (US3) での並列実行**:
- 各サービス層の非同期化 (T047-T051) [並列可能]

**Phase 6 (US4) での並列実行**:
- 各ページコンポーネントの非同期対応 (T061-T067) [並列可能]

---

## Phase 1: Setup（プロジェクト初期化）

**Goal**: Supabaseプロジェクト作成、環境設定、依存関係インストール

**Duration**: 約1-2時間

### Tasks

- [X] T001 Supabaseアカウント作成と新規プロジェクト作成（quickstart.md Step 1参照）
- [X] T002 Supabase API認証情報（URL, API Key）を取得して保存
- [X] T003 [P] .env.local ファイルを作成し、Supabase接続情報を設定
- [X] T004 [P] .env.example ファイルを作成（テンプレート）
- [X] T005 [P] .gitignore に .env*.local が含まれていることを確認
- [X] T006 @supabase/supabase-js をインストール（npm install @supabase/supabase-js）
- [X] T007 [P] package.json に @supabase/supabase-js が追加されたことを確認
- [X] T008 [P] lib/supabase/ ディレクトリを作成
- [X] T009 [P] supabase/ ディレクトリを作成（マイグレーションファイル用）
- [X] T010 [P] __tests__/__mocks__/@supabase/ ディレクトリを作成

**Verification**: 環境変数が正しく読み込まれ、依存関係がインストールされている

---

## Phase 2: Foundational（基盤構築）

**Goal**: データベーススキーマ適用、Supabase Client初期化、モック作成

**Duration**: 約2-3時間

**Independent Test**: Supabase Clientから空のクエリが実行でき、RLSポリシーが正しく動作する

### Tasks

- [X] T011 [P] [FOUNDATIONAL] contracts/database-schema.sql の内容をSupabase SQL Editorで実行（5テーブル作成）
- [X] T012 [P] [FOUNDATIONAL] contracts/rls-policies.sql の内容をSupabase SQL Editorで実行（RLS有効化）
- [X] T013 [P] [FOUNDATIONAL] contracts/indexes.sql の内容をSupabase SQL Editorで実行（パフォーマンス最適化）
- [X] T014 [FOUNDATIONAL] Supabase Dashboardでテーブル作成を確認（organizations, event_dates, groups, members, attendances）
- [X] T015 [FOUNDATIONAL] lib/supabase/client.ts を作成（Supabase Client初期化、createClient使用）
- [X] T016 [FOUNDATIONAL] Supabase Client接続テストをブラウザコンソールで実行（空のクエリ）
- [X] T017 [P] [FOUNDATIONAL] __tests__/__mocks__/@supabase/supabase-js.ts を作成（Supabase Clientモック）
- [X] T018 [P] [FOUNDATIONAL] lib/supabase/database.types.ts のプレースホルダーを作成（後でSupabase CLIで自動生成）
- [X] T019 [FOUNDATIONAL] 開発用テストデータを投入（quickstart.md Step 6参照、団体・グループ・メンバー・イベント）
- [X] T020 [FOUNDATIONAL] Supabase Dashboardでテストデータを確認

**Verification**: データベーススキーマが正しく適用され、Supabase Clientが接続できる

---

## Phase 3: User Story 1 - データストレージの完全移行

**Priority**: P1
**Goal**: localStorageからSupabase PostgreSQLへの完全移行

**Duration**: 約12-16時間（ベイビーステップ）

**TDD Approach**: 1機能ごとにRed-Green-Refactorサイクル

**Independent Test**: Supabaseプロジェクトに接続し、各テーブルにデータを作成・読み込み・更新・削除できる。外部キー制約とカスケード削除が正常に動作する。

**Acceptance Criteria**:
- 5つのテーブル（organizations, event_dates, groups, members, attendances）が作成されている
- 外部キー制約により、organizationsを削除すると関連データがカスケード削除される
- attendancesテーブルの一意制約により、同じ(event_date_id, member_id)の重複登録が防止される
- インデックスを使用したクエリが200ms以内で完了する

### Tasks

**準備**
- [X] T021 [US1] lib/storage.ts の現在の実装を確認（localStorage操作のインターフェース把握）
- [X] T022 [US1] lib/supabase-storage.ts の骨格を作成（空のファイル、基本構造のみ）
- [X] T023 [US1] __tests__/lib/supabase-storage.test.ts の骨格を作成（describe構造のみ）

**Cycle 1: loadOrganizations**
- [X] T024 [Red] [US1] loadOrganizationsのテストを作成（失敗するテスト）
- [X] T025 [Green] [US1] loadOrganizationsを実装（テストを通す最小限の実装）
- [X] T026 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 2: saveOrganizations**
- [X] T027 [Red] [US1] saveOrganizationsのテストを作成（失敗するテスト）
- [X] T028 [Green] [US1] saveOrganizationsを実装（テストを通す最小限の実装）
- [X] T029 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 3: loadEventDates**
- [X] T030 [Red] [US1] loadEventDatesのテストを作成（失敗するテスト）
- [X] T031 [Green] [US1] loadEventDatesを実装（テストを通す最小限の実装）
- [X] T032 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 4: saveEventDates**
- [X] T033 [Red] [US1] saveEventDatesのテストを作成（失敗するテスト）
- [X] T034 [Green] [US1] saveEventDatesを実装（テストを通す最小限の実装）
- [X] T035 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 5: loadGroups**
- [X] T036 [Red] [US1] loadGroupsのテストを作成（失敗するテスト）
- [X] T037 [Green] [US1] loadGroupsを実装（テストを通す最小限の実装）
- [X] T038 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 6: saveGroups**
- [X] T039 [Red] [US1] saveGroupsのテストを作成（失敗するテスト）
- [X] T040 [Green] [US1] saveGroupsを実装（テストを通す最小限の実装）
- [X] T041 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 7: loadMembers**
- [X] T042 [Red] [US1] loadMembersのテストを作成（失敗するテスト）
- [X] T043 [Green] [US1] loadMembersを実装（テストを通す最小限の実装）
- [X] T044 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 8: saveMembers**
- [X] T045 [Red] [US1] saveMembersのテストを作成（失敗するテスト）
- [X] T046 [Green] [US1] saveMembersを実装（テストを通す最小限の実装）
- [X] T047 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 9: loadAttendances**
- [X] T048 [Red] [US1] loadAttendancesのテストを作成（失敗するテスト）
- [X] T049 [Green] [US1] loadAttendancesを実装（テストを通す最小限の実装）
- [X] T050 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 10: saveAttendances**
- [X] T051 [Red] [US1] saveAttendancesのテストを作成（失敗するテスト）
- [X] T052 [Green] [US1] saveAttendancesを実装（テストを通す最小限の実装）
- [X] T053 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 11: clearOrganizationData**
- [X] T054 [Red] [US1] clearOrganizationDataのテストを作成（失敗するテスト）
- [X] T055 [Green] [US1] clearOrganizationDataを実装（カスケード削除はDBが自動実行）
- [X] T056 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 12: エラーハンドリング**
- [X] T057 [Red] [US1] エラーハンドリングのテストを作成（Supabaseエラー時の挙動）
- [X] T058 [Green] [US1] エラーハンドリングを実装（Supabaseエラーを日本語メッセージに変換）
- [X] T059 [Refactor] [US1] テスト実行・確認、コード改善

**Cycle 13: カスケード削除の検証**
- [X] T060 [Red] [US1] カスケード削除のテストを作成（organizationを削除して関連データも削除）
- [X] T061 [Green] [US1] カスケード削除の動作確認（DB側の機能なので実装不要、テストのみ）
- [X] T062 [Refactor] [US1] テスト実行・確認

**Cycle 14: 一意制約の検証**
- [X] T063 [Red] [US1] 一意制約のテストを作成（同じevent_date_id + member_idで2回挿入）
- [X] T064 [Green] [US1] 一意制約の動作確認（DB側の機能なので実装不要、テストのみ）
- [X] T065 [Refactor] [US1] テスト実行・確認

**Cycle 15: パフォーマンステスト**
- [X] T066 [Red] [US1] パフォーマンステストを作成（1000+レコードのクエリが500ms以内）
- [X] T067 [Green] [US1] パフォーマンステスト実行・調整
- [X] T068 [Refactor] [US1] 全テスト実行、100% pass確認

**Verification**: Supabaseストレージ層が正しく動作し、全テストがpass（15サイクル完了）

---

## Phase 4: User Story 2 - マルチテナントのデータベースレベル分離

**Priority**: P1
**Goal**: Row Level Security (RLS) ポリシーによる団体別データ分離

**Duration**: 約6-8時間（ベイビーステップ）

**TDD Approach**: 1テストケースごとにRed-Green-Refactorサイクル

**Independent Test**: 2つの異なる団体を作成し、それぞれのデータを挿入した後、各団体のコンテキストで他の団体のデータが見えないことを確認する。

**Acceptance Criteria**:
- RLSポリシーが全テーブルに設定されている
- 団体A（organization_id='abc123'）のコンテキストでクエリすると、団体Aのデータのみ返される
- 団体Aのコンテキストで団体Bのデータを直接IDで取得しようとすると、RLSによりアクセスが拒否される
- 存在しない団体ID（'nonexistent'）でクエリすると、空の結果セットが返される

### Tasks

**準備**
- [X] T069 [US2] RLSポリシーがSupabaseに正しく適用されているか確認（Phase 2で完了）

**Cycle 1: setOrganizationContext 関数**
- [X] T070 [Red] [US2] setOrganizationContextのテストを作成（失敗するテスト）
- [X] T071 [Green] [US2] lib/supabase-storage.ts に setOrganizationContext 関数を実装（current_setting設定）
- [X] T072 [Refactor] [US2] テスト実行・確認、コード改善

**Cycle 2: OrganizationContext統合**
- [X] T073 [Red] [US2] OrganizationContextのテストを作成（setOrganizationContext呼び出しテスト）
- [X] T074 [Green] [US2] contexts/organization-context.tsx を修正（setOrganizationContextを呼び出す）
- [X] T075 [Refactor] [US2] テスト実行・確認、コード改善

**Cycle 3: 団体別データ分離テスト（organizations）**
- [ ] T076 [Red] [US2] 団体A/Bでorganizationsデータ分離のテストを作成
- [ ] T077 [Green] [US2] RLSポリシーの動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T078 [Refactor] [US2] テスト実行・確認

**Cycle 4: 団体別データ分離テスト（event_dates）**
- [ ] T079 [Red] [US2] 団体A/Bでevent_datesデータ分離のテストを作成
- [ ] T080 [Green] [US2] RLSポリシーの動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T081 [Refactor] [US2] テスト実行・確認

**Cycle 5: 団体別データ分離テスト（groups）**
- [ ] T082 [Red] [US2] 団体A/Bでgroupsデータ分離のテストを作成
- [ ] T083 [Green] [US2] RLSポリシーの動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T084 [Refactor] [US2] テスト実行・確認

**Cycle 6: 団体別データ分離テスト（members）**
- [ ] T085 [Red] [US2] 団体A/Bでmembersデータ分離のテストを作成
- [ ] T086 [Green] [US2] RLSポリシーの動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T087 [Refactor] [US2] テスト実行・確認

**Cycle 7: 団体別データ分離テスト（attendances）**
- [ ] T088 [Red] [US2] 団体A/Bでattendancesデータ分離のテストを作成
- [ ] T089 [Green] [US2] RLSポリシーの動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T090 [Refactor] [US2] テスト実行・確認

**Cycle 8: アクセス拒否テスト**
- [ ] T091 [Red] [US2] 団体Aから団体BのデータをIDで直接取得するテストを作成
- [ ] T092 [Green] [US2] RLSによるアクセス拒否の動作確認（DB側の機能なので実装不要、テストのみ）
- [ ] T093 [Refactor] [US2] テスト実行・確認

**Cycle 9: 存在しない団体IDテスト**
- [ ] T094 [Red] [US2] 存在しない団体IDでのクエリテストを作成
- [ ] T095 [Green] [US2] 空の結果セットが返されることを確認（DB側の機能なので実装不要、テストのみ）
- [ ] T096 [Refactor] [US2] テスト実行・確認

**Cycle 10: 団体削除後のRLSテスト**
- [ ] T097 [Red] [US2] 団体削除後のRLSテストを作成
- [ ] T098 [Green] [US2] 削除済み団体のコンテキストで空の結果確認（DB側の機能なので実装不要、テストのみ）
- [ ] T099 [Refactor] [US2] テスト実行・確認

**統合確認**
- [ ] T100 [US2] Supabase Dashboardで手動でRLSポリシーをテスト（複数団体作成・確認）
- [ ] T101 [US2] 統合テスト実行（複数団体シナリオ）
- [ ] T102 [US2] 全RLSテストpass確認

**Verification**: RLSポリシーが正しく動作し、団体間のデータが完全に分離されている（10サイクル完了）

---

## Phase 5: User Story 3 - サービス層の非同期化

**Priority**: P2
**Goal**: 全サービス層関数をasync/awaitに変更、集計処理をSQL化

**Duration**: 約16-20時間（ベイビーステップ）

**TDD Approach**: 1サービスごとにRed-Green-Refactorサイクル

**Independent Test**: 各サービス関数を呼び出し、正しいデータが返されることを確認する。集計関数（calculateEventSummary, calculateEventTotalSummary）がSQLで実行され、正しい結果を返すことを検証する。

**Acceptance Criteria**:
- Supabaseデータベースにデータが存在する状態で、getAllEventDates(orgId)を呼び出すと、全イベントが日付昇順で返される
- calculateEventSummary(orgId, eventId)を呼び出すと、SQLのGROUP BYクエリによりグループ別の出欠集計が返される
- 100メンバー、10イベントのデータに対して集計関数を呼び出すと、200ms以内に結果が返される
- upsertBulkAttendances関数を使用すると、バッチ処理により効率的に処理され、重複データが自動的に更新される

### Tasks

**準備**
- [X] T103 [US3] サービス層の非同期化戦略を確認（plan.md R3参照）

**Cycle 1: organization-service**
- [X] T104 [Red] [US3] __tests__/lib/organization-service.test.ts を async 対応に更新
- [X] T105 [Red] [US3] テスト実行して失敗確認
- [X] T106 [Green] [US3] lib/organization-service.ts を async/await に変更
- [X] T107 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 2: event-service**
- [ ] T108 [Red] [US3] __tests__/lib/event-service.test.ts を async 対応に更新
- [ ] T109 [Red] [US3] テスト実行して失敗確認
- [ ] T110 [Green] [US3] lib/event-service.ts を async/await に変更
- [ ] T111 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 3: group-service**
- [ ] T112 [Red] [US3] __tests__/lib/group-service.test.ts を async 対応に更新
- [ ] T113 [Red] [US3] テスト実行して失敗確認
- [ ] T114 [Green] [US3] lib/group-service.ts を async/await に変更
- [ ] T115 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 4: member-service**
- [ ] T116 [Red] [US3] __tests__/lib/member-service.test.ts を async 対応に更新
- [ ] T117 [Red] [US3] テスト実行して失敗確認
- [ ] T118 [Green] [US3] lib/member-service.ts を async/await に変更
- [ ] T119 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 5: attendance-service（基本関数）**
- [ ] T120 [Red] [US3] __tests__/lib/attendance-service.test.ts の基本関数を async 対応に更新
- [ ] T121 [Red] [US3] テスト実行して失敗確認
- [ ] T122 [Green] [US3] lib/attendance-service.ts の基本関数を async/await に変更
- [ ] T123 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 6: calculateEventSummary（SQL集計）**
- [ ] T124 [Red] [US3] calculateEventSummaryのSQL集計テストを作成
- [ ] T125 [Green] [US3] calculateEventSummary を SQL GROUP BY で実装
- [ ] T126 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 7: calculateEventTotalSummary（SQL集計）**
- [ ] T127 [Red] [US3] calculateEventTotalSummaryのSQL集計テストを作成
- [ ] T128 [Green] [US3] calculateEventTotalSummary を SQL 集計で実装
- [ ] T129 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 8: upsertBulkAttendances**
- [ ] T130 [Red] [US3] upsertBulkAttendancesのテストを作成（バッチ処理、重複更新確認）
- [ ] T131 [Green] [US3] upsertBulkAttendances を Supabase upsert() で実装
- [ ] T132 [Refactor] [US3] テスト実行・確認、コード改善

**Cycle 9: パフォーマンステスト**
- [ ] T133 [Red] [US3] パフォーマンステストを作成（100メンバー、200ms以内）
- [ ] T134 [Green] [US3] パフォーマンステスト実行・調整
- [ ] T135 [Refactor] [US3] テスト実行・確認

**統合確認**
- [ ] T136 [US3] 型チェック実行（npx tsc --noEmit）、エラー修正
- [ ] T137 [US3] 全サービス層テスト実行、100% pass確認

**Verification**: 全サービス層が非同期化され、集計処理がSQLで実装され、全テストがpass（9サイクル完了）

---

## Phase 6: User Story 4 - UI層の非同期対応とローディング状態

**Priority**: P3
**Goal**: 全ページコンポーネントを非同期対応、ローディング状態とエラーハンドリング実装

**Duration**: 約18-24時間（ベイビーステップ）

**TDD Approach**: 1ページごとにRed-Green-Refactorサイクル

**Independent Test**: 各ページにアクセスし、データ読み込み中にローディングスピナーが表示され、読み込み完了後に正しいデータが表示されることを確認する。

**Acceptance Criteria**:
- イベント一覧ページ（/[org]/）にアクセスすると、データベースからデータ取得中にローディングスピナーが表示される
- 出欠登録ページでデータ取得エラーが発生すると、ユーザーフレンドリーなエラーメッセージが表示される
- 複数の非同期操作が並行実行される際、一部が失敗しても成功した操作の結果は表示される
- OrganizationContextがSupabaseから団体データを取得し、存在しない団体IDでアクセスすると404エラーページが表示される

### Tasks

**Cycle 1: OrganizationContext**
- [ ] T138 [Red] [US4] __tests__/contexts/organization-context.test.tsx を作成（Supabase非同期取得テスト）
- [ ] T139 [Green] [US4] contexts/organization-context.tsx を Supabase 非同期取得に対応（useEffect使用）
- [ ] T140 [Green] [US4] contexts/organization-context.tsx にローディング状態とエラー状態を追加
- [ ] T141 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 2: イベント一覧ページ**
- [ ] T142 [Red] [US4] __tests__/app/[org]/page.test.tsx を非同期対応に更新
- [ ] T143 [Green] [US4] app/[org]/page.tsx を非同期データ取得に対応（イベント一覧）
- [ ] T144 [Green] [US4] app/[org]/page.tsx にローディングスピナーを追加
- [ ] T145 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 3: グループ管理ページ**
- [ ] T146 [Red] [US4] __tests__/app/[org]/admin/groups/page.test.tsx を非同期対応に更新
- [ ] T147 [Green] [US4] app/[org]/admin/groups/page.tsx を非同期データ取得に対応
- [ ] T148 [Green] [US4] app/[org]/admin/groups/page.tsx にローディングスピナーを追加
- [ ] T149 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 4: イベント管理ページ**
- [ ] T150 [Red] [US4] __tests__/app/[org]/admin/events/page.test.tsx を非同期対応に更新
- [ ] T151 [Green] [US4] app/[org]/admin/events/page.tsx を非同期データ取得に対応
- [ ] T152 [Green] [US4] app/[org]/admin/events/page.tsx にローディングスピナーを追加
- [ ] T153 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 5: 団体管理ページ**
- [ ] T154 [Red] [US4] __tests__/app/[org]/admin/organizations/page.test.tsx を非同期対応に更新
- [ ] T155 [Green] [US4] app/[org]/admin/organizations/page.tsx を非同期データ取得に対応
- [ ] T156 [Green] [US4] app/[org]/admin/organizations/page.tsx にローディングスピナーを追加
- [ ] T157 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 6: イベント詳細ページ**
- [ ] T158 [Red] [US4] __tests__/app/[org]/events/[id]/page.test.tsx を非同期対応に更新
- [ ] T159 [Green] [US4] app/[org]/events/[id]/page.tsx を非同期データ取得に対応
- [ ] T160 [Green] [US4] app/[org]/events/[id]/page.tsx にローディングスピナーを追加
- [ ] T161 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 7: 出欠登録ページ**
- [ ] T162 [Red] [US4] __tests__/app/[org]/events/[id]/register/page.test.tsx を非同期対応に更新
- [ ] T163 [Green] [US4] app/[org]/events/[id]/register/page.tsx を非同期データ取得に対応
- [ ] T164 [Green] [US4] app/[org]/events/[id]/register/page.tsx にローディングスピナーを追加
- [ ] T165 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 8: 一括出欠登録ページ**
- [ ] T166 [Red] [US4] __tests__/app/[org]/my-register/page.test.tsx を非同期対応に更新
- [ ] T167 [Green] [US4] app/[org]/my-register/page.tsx を非同期データ取得に対応
- [ ] T168 [Green] [US4] app/[org]/my-register/page.tsx にローディングスピナーを追加
- [ ] T169 [Refactor] [US4] テスト実行・確認、コード改善

**Cycle 9: エラーハンドリング**
- [ ] T170 [Red] [US4] 各ページのエラーハンドリングテストを作成
- [ ] T171 [Green] [US4] 全ページにエラーハンドリングとユーザーフレンドリーなエラーメッセージを追加
- [ ] T172 [Refactor] [US4] テスト実行・確認

**Cycle 10: 404エラーハンドリング**
- [ ] T173 [Red] [US4] OrganizationContextの404エラーハンドリングテストを作成
- [ ] T174 [Green] [US4] 存在しない団体IDでアクセスすると404エラーページが表示される実装
- [ ] T175 [Refactor] [US4] テスト実行・確認

**統合確認**
- [ ] T176 [US4] ブラウザで全ページの動作確認（ローディング、データ表示、エラー）
- [ ] T177 [US4] 型チェック実行、エラー修正
- [ ] T178 [US4] リンティング実行（npm run lint）、警告修正
- [ ] T179 [US4] 全UI層テスト実行、100% pass確認

**Verification**: 全ページが非同期対応され、ローディング状態とエラーハンドリングが実装されている（10サイクル完了）

---

## Phase 7: User Story 5 - テスト戦略の更新とカバレッジ維持

**Priority**: P2
**Goal**: 全テストをSupabase Client対応に更新、カバレッジ85%維持

**Duration**: 約8-12時間（ベイビーステップ）

**TDD Approach**: 1テストファイルごとにRed-Green-Refactorサイクル

**Note**: Phase 3-6でテストは既に非同期対応済み。このフェーズは統合テスト、カバレッジ測定、CI/CD確認に集中。

**Independent Test**: 全テストスイートを実行し、181個のテストすべてがpassすることを確認する。カバレッジレポートで閾値（85%以上）を満たすことを検証する。

**Acceptance Criteria**:
- Supabase Clientモックが実装されている状態で、サービス層のテストを実行すると、全テストがpassする
- 非同期処理のテストが追加されている状態で、async/await関数をテストすると、Promiseが正しく解決される
- `npm test`を実行すると、カバレッジが最小閾値（branches: 30%, functions: 50%, lines: 45%, statements: 45%）を満たし、現在のレベル（約85%）を維持する
- CI/CDパイプラインでプルリクエストが作成されると、全テスト、リント、ビルドが自動実行され、すべてpassする

### Tasks

**Cycle 1: Supabase Clientモック検証**
- [ ] T180 [Red] [US5] Supabase Clientモック（__mocks__/@supabase/supabase-js.ts）のテストを作成
- [ ] T181 [Green] [US5] Supabase Clientモックの動作確認、必要に応じて修正
- [ ] T182 [Refactor] [US5] テスト実行・確認

**Cycle 2: 統合テスト実行**
- [ ] T183 [Red] [US5] 全テスト実行（npm test）、失敗したテストを特定
- [ ] T184 [Green] [US5] 失敗したテスト1個目を修正（Supabase Clientモック、async/await対応）
- [ ] T185 [Refactor] [US5] テスト実行・確認

**Cycle 3-N: 失敗テスト修正（繰り返し）**
- [ ] T186 [Red] [US5] 失敗したテスト2個目を特定
- [ ] T187 [Green] [US5] 失敗したテスト2個目を修正
- [ ] T188 [Refactor] [US5] テスト実行・確認
- [ ] T189 [US5] 失敗テストが0になるまで Cycle 3を繰り返し

**Cycle N+1: カバレッジ測定**
- [ ] T190 [Red] [US5] カバレッジ測定（npm test -- --coverage）、現在のレベル（85%）と比較
- [ ] T191 [Green] [US5] カバレッジ不足箇所を特定（HTMLレポート確認）、必要に応じて追加テスト作成
- [ ] T192 [Refactor] [US5] カバレッジ再測定、85%維持確認

**Cycle N+2: 全テストpass確認**
- [ ] T193 [Red] [US5] 全テスト実行（npm test）
- [ ] T194 [Green] [US5] 全テスト100% pass確認、失敗があれば修正
- [ ] T195 [Refactor] [US5] テスト実行・確認

**Cycle N+3: CI/CD確認**
- [ ] T196 [Red] [US5] CI/CD実行（git push）
- [ ] T197 [Green] [US5] 全チェック（テスト、リント、ビルド）pass確認
- [ ] T198 [Refactor] [US5] 失敗があれば修正、再実行

**Verification**: 全テストがpassし、カバレッジが85%を維持し、CI/CDが成功する（6サイクル完了）

---

## Phase 8: Polish & Cross-Cutting Concerns（仕上げ）

**Goal**: ドキュメント更新、最終確認、マージ準備

**Duration**: 約4-6時間（ベイビーステップ）

**Note**: 最終確認とドキュメント更新。TDD完了後の仕上げ作業。

### Tasks

**Cycle 1: ドキュメント更新**
- [ ] T199 [Polish] README.md を更新（Supabase情報追加、テスト数更新、最終更新日）
- [ ] T200 [Polish] SPECIFICATION.md を更新（データベース情報追加、カバレッジ統計更新）
- [ ] T201 [Polish] CLAUDE.md を確認（Agent context更新済み）
- [ ] T202 [Polish] .env.example が正しく設定されているか確認

**Cycle 2: E2Eテスト**
- [ ] T203 [Polish] 全ページをブラウザで手動確認（イベント一覧）
- [ ] T204 [Polish] 全ページをブラウザで手動確認（グループ管理）
- [ ] T205 [Polish] 全ページをブラウザで手動確認（イベント管理）
- [ ] T206 [Polish] 全ページをブラウザで手動確認（イベント詳細）
- [ ] T207 [Polish] 全ページをブラウザで手動確認（出欠登録）
- [ ] T208 [Polish] 全ページをブラウザで手動確認（一括出欠登録）

**Cycle 3: パフォーマンステスト**
- [ ] T209 [Polish] パフォーマンステスト実行（Lighthouse）
- [ ] T210 [Polish] 100メンバー集計200ms以内確認
- [ ] T211 [Polish] パフォーマンス問題があれば修正

**Cycle 4: 最終チェック**
- [ ] T212 [Polish] 型チェック最終確認（npx tsc --noEmit）
- [ ] T213 [Polish] リンティング最終確認（npm run lint）
- [ ] T214 [Polish] ビルド最終確認（npm run build）
- [ ] T215 [Polish] 全テスト最終実行、100% pass確認
- [ ] T216 [Polish] カバレッジ最終確認（85%以上）

**Cycle 5: Git commit & PR**
- [ ] T217 [Polish] Git commit（日本語または英語のコミットメッセージ）
- [ ] T218 [Polish] GitHub Pull Request作成（日本語でSummary作成）
- [ ] T219 [Polish] CI/CDチェック完了確認
- [ ] T220 [Polish] PRマージ

**Verification**: 全ドキュメントが更新され、全チェックがpassし、PRがマージ可能（5サイクル完了）

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**推奨MVP**: Phase 3（User Story 1）まで実装

- データストレージの完全移行が完了すれば、基本的なSupabase統合が動作する
- RLS、非同期化、UI対応、テスト更新は段階的に追加可能

### Incremental Delivery

1. **Week 1**: Phase 1-3（Setup + Foundational + US1）
   - Supabaseセットアップ、データストレージ移行
   - **Deliverable**: Supabaseからデータ取得・保存可能

2. **Week 2**: Phase 4-5（US2 + US3）
   - RLS実装、サービス層非同期化
   - **Deliverable**: マルチテナント分離、SQL集計

3. **Week 3**: Phase 6-7（US4 + US5）
   - UI層非同期対応、テスト更新
   - **Deliverable**: 全ページ動作、全テストpass

4. **Week 4**: Phase 8（Polish）
   - ドキュメント更新、最終確認、マージ
   - **Deliverable**: プロダクションレディ

### Parallel Execution Tips

- **並列実行可能な [P] タスク**: 異なるファイルを編集するタスクは並列実行可能
- **依存関係に注意**: 同じファイルを編集するタスクは順次実行
- **テスト優先**: 各フェーズの最後にテストを実行し、問題を早期発見

---

## Risk Mitigation

- **R1: 大規模な非同期化によるバグ混入**: 各ファイル変更後にテスト実行、段階的な実装
- **R2: RLSポリシーの設定ミスによるデータ漏洩**: 各RLSポリシーを個別にテスト、複数団体シナリオで検証
- **R3: テストカバレッジの低下**: 各ファイル変更後にカバレッジ測定、不足箇所に追加テスト
- **R4: パフォーマンス劣化**: インデックス設定、SQLクエリ最適化、パフォーマンステスト

---

## Success Criteria (from spec.md)

- ✅ **SC-001**: 全テストスイート（181テスト）が100% pass、ビルド成功
- ✅ **SC-002**: テストカバレッジ維持（約85%）、最小閾値満たす
- ✅ **SC-003**: マルチテナント機能が正常動作（3団体以上で検証）
- ✅ **SC-004**: RLSポリシーによる完全なデータ分離（自動テストで100%検証）
- ✅ **SC-005**: パフォーマンステスト通過（100メンバー、200ms以内）
- ✅ **SC-006**: インデックス最適化（1000+レコード、500ms以内）
- ✅ **SC-007**: ローディング状態とエラーハンドリング実装
- ✅ **SC-008**: CI/CDパイプライン全pass

---

## Notes

- 各タスクの詳細な実装方法は plan.md の Phase 0（Research & Design Decisions）を参照
- データモデルの詳細は data-model.md を参照
- Supabaseセットアップ手順は quickstart.md を参照
- SQL スキーマは contracts/ ディレクトリを参照
