# Tasks: Test Coverage Expansion

**Feature**: 008-test-coverage-expansion
**Branch**: `008-test-coverage-expansion`
**Status**: Ready for Implementation
**Created**: 2025-11-11

## TDD Principles

このフィーチャーは既存コードに対するテスト追加であるため、通常のRed-Green-Refactorサイクルとは異なるアプローチを取ります：

**特殊なTDDアプローチ**:
1. **Green（既存実装）**: 実装コードは既に存在し、動作している
2. **Test（テスト追加）**: テストを追加し、既存の動作を検証する
3. **Refactor（改善）**: テストがpassすることを確認しながら、必要に応じてテストをリファクタリング

**原則**:
- **小さなステップ**: 1ファイルずつテストを追加
- **テストの独立性**: 各テストは他のテストに依存しない
- **既存テストの保護**: 各タスク完了後、全234テストがpassすることを確認
- **日本語テスト名**: describeとtestブロックは日本語で記述

## Overview

- **Total Tasks**: 38タスク
- **Estimated Time**: 25-32時間
- **Test Files to Create**: 7ファイル
- **Estimated New Tests**: 115-150テスト
- **Target Coverage**: 47.98% → 70%以上

## Phase 0: Investigation & Baseline ✅ 完了

このフェーズでは既存のテストパターンを分析し、カバレッジのベースラインを測定します。

- [x] T001 既存テストパターンを分析し、モック戦略とアサーションスタイルを文書化する（__tests__/app/page.test.tsx、__tests__/components/event-detail/member-attendance-list.test.tsx、__tests__/lib/attendance-service.test.tsを参照）→ existing-test-patterns.md作成
- [x] T002 現在のカバレッジベースラインを測定する（`npm test -- --coverage`を実行し、結果をスクリーンショットまたはテキストで保存）→ coverage-baseline.md作成

**Phase 0 完了基準**:

- ✅ 既存テストパターンが文書化されている（existing-test-patterns.md）
- ✅ 現在のカバレッジ（47.98%）が確認されている（coverage-baseline.md）
- ✅ モック戦略（useRouter、useParams、useOrganization、サービス層）が明確になっている

## Phase 1: US1 - ユーティリティ関数の完全テストカバレッジ ✅ 完了

**User Story 1 (Priority P1)**: 開発者が日付フォーマットやエラーハンドリングのユーティリティ関数を変更する際、既存の機能が破壊されていないことを自動的に検証できる。

**Independent Test**: date-utils.tsとerror-utils.tsの全関数に対するユニットテストを実行し、90%以上のカバレッジを達成することで、これらのユーティリティが独立して正しく動作することを検証できる。

### Date Utils Tests

- [x] T003 [P] [US1] date-utils.tsのテストファイルを作成し、formatDate関数の正常系テストを実装する（__tests__/lib/date-utils.test.ts）→ 5テスト追加
- [x] T004 [US1] formatDate関数の異常系テスト（null、undefined、無効な日付）を追加する（__tests__/lib/date-utils.test.ts）→ T003に含む
- [x] T005 [P] [US1] formatShortDate、formatLongDate、formatTime関数のテストを実装する（__tests__/lib/date-utils.test.ts）→ 13テスト追加
- [x] T006 [US1] getCurrentTimestamp関数のテストをjest.useFakeTimersを使用して実装する（__tests__/lib/date-utils.test.ts）→ 4テスト追加
- [x] T007 [US1] formatRelativeTime関数の全エッジケース（たった今、N分前、N時間前、N日前、8日以上）をテストする（__tests__/lib/date-utils.test.ts）→ 7テスト追加
- [x] T008 [US1] date-utils.tsのカバレッジを測定し、90%以上を確認する（`npm test date-utils -- --coverage`）→ 94.44%達成 ✅

### Error Utils Tests

- [x] T009 [P] [US1] error-utils.tsのテストファイルを作成し、AppErrorクラスのテストを実装する（__tests__/lib/error-utils.test.ts）→ 4テスト追加
- [x] T010 [US1] formatZodError関数のテスト（複数エラー、フィールドパス付きエラー）を実装する（__tests__/lib/error-utils.test.ts）→ 4テスト追加
- [x] T011 [P] [US1] getErrorMessage、getErrorMessages関数のテスト（ZodError、AppError、通常のError、不明なエラー）を実装する（__tests__/lib/error-utils.test.ts）→ 13テスト追加
- [x] T012 [US1] tryCatch、tryCatchSync関数のテスト（成功ケース、失敗ケース、console.errorスパイ）を実装する（__tests__/lib/error-utils.test.ts）→ 12テスト追加
- [x] T013 [US1] successMessage関数とErrorMessagesオブジェクトのテストを実装する（__tests__/lib/error-utils.test.ts）→ 9テスト追加
- [x] T014 [US1] error-utils.tsのカバレッジを測定し、90%以上を確認する（`npm test error-utils -- --coverage`）→ 100%達成 ✅

### Phase 1 Verification

- [x] T015 [US1] Phase 1の全テストを実行し、新規テストがpassすることを確認する（`npm test date-utils error-utils`）→ 70テスト全てpass ✅
- [x] T016 [US1] 既存の234テストがpassすることを確認する（`npm test`）→ 304テスト全てpass（234既存 + 70新規）✅

**Phase 1 Independent Test Criteria**:

- ✅ date-utils.tsの全6関数がテストされている（29テスト）
- ✅ error-utils.tsの全関数がテストされている（41テスト）
- ✅ 両ファイルのカバレッジが90%以上（date-utils: 94.44%, error-utils: 100%）
- ✅ 推定35-45の新規テスト追加 → 実際70テスト追加
- ✅ 既存234テスト全てがpass → 304テスト全てpass

## Phase 2: US2 - 出欠登録ページの統合テスト

**User Story 2 (Priority P1)**: 開発者が出欠登録フォームのロジックを変更する際、ユーザーが正しく出欠を登録できること、バリデーションが機能すること、エラーケースが適切に処理されることを自動的に検証できる。

**Independent Test**: 出欠登録ページのコンポーネントテストを実行し、フォーム操作からデータ作成までの全フローが正常に動作することを検証できる。モックを使用してサービス層から独立してテスト可能。

- [ ] T017 [US2] 出欠登録ページのテストファイルを作成し、共通モック（useRouter、useParams、useOrganization、サービス層）を設定する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T018 [US2] 基本表示のテスト（イベント情報表示、LoadingSpinner、イベント不在時のリダイレクト、グループ0件時のメッセージ）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T019 [US2] グループ選択のテスト（グループ一覧表示、選択時のメンバー一覧読み込み、未選択時の動作）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T020 [US2] メンバー選択のテスト（既存メンバー一覧、既存選択時の新規入力無効化、新規入力時の既存選択無効化）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T021 [US2] 出欠ステータス選択のテスト（3つのボタン表示、クリック時の選択状態変更、デフォルト「◯」）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T022 [US2] フォーム送信のテスト（既存メンバーで登録、新規メンバーで登録、成功時のリダイレクト、二重送信防止）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T023 [US2] バリデーションエラーのテスト（グループ未選択、メンバー未選択かつ新規名前未入力）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T024 [US2] エラーハンドリングのテスト（createMember失敗、createAttendance失敗、組織情報なし）を実装する（__tests__/app/[org]/events/[id]/register/page.test.tsx）
- [ ] T025 [US2] 出欠登録ページのカバレッジを測定し、80%以上を確認する（`npm test register/page -- --coverage`）
- [ ] T026 [US2] Phase 2の全テストと既存234テストがpassすることを確認する（`npm test`）

**Phase 2 Independent Test Criteria**:
- ✅ 出欠登録ページの全フロー（グループ選択、メンバー選択/新規作成、ステータス選択、送信、エラーハンドリング）がテストされている
- ✅ カバレッジが80%以上
- ✅ 推定20-25の新規テスト追加
- ✅ 既存234テスト全てがpass

## Phase 3: US3 - イベント詳細ページの統合テスト

**User Story 3 (Priority P1)**: 開発者がイベント詳細表示、出欠集計、フィルター・ソート機能を変更する際、既存の機能が破壊されていないことを自動的に検証できる。

**Independent Test**: イベント詳細ページのコンポーネントテストを実行し、データ表示、集計計算、フィルター適用などが正常に動作することを検証できる。

- [ ] T027 [US3] イベント詳細ページのテストファイルを作成し、共通モック（useRouter、useParams、useOrganization、サービス層）を設定する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T028 [US3] 基本表示のテスト（イベント情報表示、ローディング、イベント不在時のリダイレクト、出欠登録ボタンのリンク）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T029 [US3] 全体出欠状況の集計表示テスト（参加・未定・欠席・合計人数、出欠登録0件時のメッセージ）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T030 [US3] グループ別出欠状況のテスト（各グループの集計表示、アコーディオンのトグル、複数グループ表示）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T031 [US3] フィルター・ソート・検索機能のテスト（フィルタステータス変更、ソート基準変更、検索クエリ変更がAttendanceFiltersに伝わる）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T032 [US3] useMemoの動作確認テスト（totalSummary、groupMembersMapのメモ化）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T033 [US3] エラーハンドリングのテスト（データ読み込み失敗、組織情報なし）を実装する（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T034 [US3] イベント詳細ページのカバレッジを測定し、80%以上を確認する（`npm test events/\\[id\\]/page -- --coverage`）
- [ ] T035 [US3] Phase 3の全テストと既存234テストがpassすることを確認する（`npm test`）

**Phase 3 Independent Test Criteria**:
- ✅ イベント詳細ページの全機能（データ表示、集計計算、フィルター、ソート、検索、空状態、エラー処理）がテストされている
- ✅ カバレッジが80%以上
- ✅ 推定20-25の新規テスト追加
- ✅ 既存234テスト全てがpass

## Phase 4: US4 - 管理画面のテスト追加

**User Story 4 (Priority P2)**: 開発者が管理画面（グループ管理、イベント管理、一括出欠登録）のCRUD操作を変更する際、既存の機能が破壊されていないことを自動的に検証できる。

**Independent Test**: 各管理画面のコンポーネントテストを実行し、作成・編集・削除・一括操作が正常に動作することを検証できる。

### Groups Admin Tests

- [ ] T036 [P] [US4] グループ管理ページのテストファイルを作成し、基本表示テスト（ページタイトル、ローディング、グループ0件時のメッセージ）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T037 [US4] グループ一覧表示のテスト（グループ名、表示順序、カラー、編集・削除ボタン）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T038 [US4] グループ新規作成のテスト（フォーム入力、作成ボタン、HTML5バリデーション、カラープレビュー、作成成功後のフォームクリア）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T039 [US4] グループ編集のテスト（編集ボタン、フォームへの既存データ入力、タイトル変更、更新ボタン、キャンセル）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T040 [US4] グループ削除のテスト（削除ボタン、確認ダイアログ、確認後のdeleteGroup呼び出し、キャンセル時）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T041 [US4] エラーハンドリングのテスト（createGroup失敗、updateGroup失敗、deleteGroup失敗、組織情報なし）を実装する（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T042 [US4] グループ管理ページのカバレッジを測定し、80%以上を確認する（`npm test admin/groups/page -- --coverage`）

### Events Admin Tests

- [ ] T043 [P] [US4] イベント管理ページのテストファイルを作成し、基本表示テスト（ページタイトル、ローディング、イベント0件時のメッセージ）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T044 [US4] イベント一覧表示のテスト（タイトル、日付、場所、出欠人数表示、編集・削除ボタン）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T045 [US4] イベント新規作成のテスト（フォーム入力、作成ボタン、HTML5バリデーション、場所任意、作成成功後のフォームクリア）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T046 [US4] イベント編集のテスト（編集ボタン、フォームへの既存データ入力、タイトル変更、更新ボタン、キャンセル）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T047 [US4] イベント削除のテスト（削除ボタン、確認ダイアログ、確認後のdeleteEventDate呼び出し、キャンセル時）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T048 [US4] useMemoによる出欠集計のテスト（eventSummaries計算、メモ化動作）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T049 [US4] エラーハンドリングのテスト（createEventDate失敗、updateEventDate失敗、deleteEventDate失敗、組織情報なし）を実装する（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T050 [US4] イベント管理ページのカバレッジを測定し、80%以上を確認する（`npm test admin/events/page -- --coverage`）

### Bulk Register Tests

- [ ] T051 [P] [US4] 一括出欠登録ページのテストファイルを作成し、基本表示テスト（ページタイトル、MemberSelector、メンバー未選択時はEventList非表示）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T052 [US4] メンバー選択のテスト（メンバー選択時にEventList表示、memberSelectionステート保存）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T053 [US4] イベント選択のテスト（イベント選択時に選択一覧追加、デフォルトステータス「◯」、選択解除で削除）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T054 [US4] イベントステータス変更のテスト（個別イベントステータス変更、eventStatusesステート保存）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T055 [US4] 一括登録処理のテスト（有効入力で実行、新規メンバー作成、upsertBulkAttendances呼び出し、成功メッセージ、更新件数表示、1秒後リダイレクト、失敗件数表示）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T056 [US4] バリデーションのテスト（メンバー未選択時エラー、イベント未選択時エラー、組織情報なし時エラー）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T057 [US4] UI状態管理のテスト（送信中ボタン無効化、ボタンテキスト「登録中...」、イベント選択数表示）を実装する（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T058 [US4] 一括出欠登録ページのカバレッジを測定し、80%以上を確認する（`npm test my-register/page -- --coverage`）

### Phase 4 Verification

- [ ] T059 [US4] Phase 4の全テストと既存234テストがpassすることを確認する（`npm test`）

**Phase 4 Independent Test Criteria**:
- ✅ 3つの管理画面（グループ管理、イベント管理、一括出欠登録）の全CRUD操作がテストされている
- ✅ 各ページのカバレッジが80%以上
- ✅ 推定40-55の新規テスト追加
- ✅ 既存234テスト全てがpass

## Phase 5: Documentation & Verification

このフェーズでは全体カバレッジを確認し、ドキュメントを更新します。

- [ ] T060 全体のカバレッジを測定し、70%以上を確認する（`npm test -- --coverage`）
- [ ] T061 全テスト（既存234 + 新規115-150）がpassすることを確認する（`npm test`）
- [ ] T062 CI/CDが成功することを確認する（GitHub Actionsで自動実行、またはローカルで`npm run lint && npm run build`）
- [ ] T063 README.mdを更新する（テスト総数、カバレッジ統計、最終更新日を更新）
- [ ] T064 SPECIFICATION.mdを更新する（テスト仕様セクションにテストケース数とカバレッジ率を追加、変更履歴に実装完了を記録）

**Phase 5 完了基準**:
- ✅ 全体カバレッジが70%以上
- ✅ テスト総数が350-400（234 + 115-150）
- ✅ 全テストがpass
- ✅ CI/CDが成功
- ✅ README.mdとSPECIFICATION.mdが更新されている

## Dependencies

### User Story Dependencies

各User Storyは独立して実装・テスト可能です：

```
Phase 0 (Investigation)
    ↓
┌───┴───┬───────┬───────┐
│       │       │       │
US1     US2     US3     US4  (並列実行可能)
│       │       │       │
└───┬───┴───────┴───────┘
    ↓
Phase 5 (Documentation & Verification)
```

**並列実行の機会**:
- Phase 1（US1）、Phase 2（US2）、Phase 3（US3）、Phase 4（US4）は独立しているため、並列で実装可能
- 各Phase内で`[P]`マークのタスクは並列実行可能（異なるファイル、依存関係なし）

### Task Dependencies Within Phases

**Phase 1内**:
- T003-T008（date-utils）とT009-T014（error-utils）は並列実行可能
- T015-T016は前のタスク完了後に実行

**Phase 2-4内**:
- テストファイル作成（T017、T027、T036など）は独立して並列実行可能
- 各テストカテゴリ（基本表示、フォーム送信など）内のタスクは順次実行推奨

## Implementation Strategy

### MVP Scope（最小限の価値提供）

**MVP = User Story 1のみ実装**:
- date-utils.tsとerror-utils.tsのテスト追加
- 全ページで使用されるユーティリティのカバレッジ向上
- 推定35-45テスト追加、カバレッジ約55-60%到達

**MVP完了後の追加価値**:
- US2実装でデータ作成画面を保護（重要度高）
- US3実装でメイン閲覧画面を保護（重要度高）
- US4実装で管理画面を保護（重要度中）

### Incremental Delivery

各User Storyは独立した価値を提供するため、以下の順序で段階的にデリバリー可能：

1. **Phase 1完了時**: ユーティリティ関数が保護される（影響範囲最大）
2. **Phase 2完了時**: 出欠登録機能が保護される（ユーザーデータ作成）
3. **Phase 3完了時**: イベント閲覧機能が保護される（最頻利用画面）
4. **Phase 4完了時**: 管理機能が保護される（データ管理基盤）
5. **Phase 5完了時**: 全体カバレッジ70%達成、ドキュメント完備

### Parallel Execution Examples

**Example 1: Phase 1並列実行**
```bash
# ターミナル1
npm test -- --watch date-utils

# ターミナル2（別のエンジニアまたはセッション）
npm test -- --watch error-utils
```

**Example 2: Phase全体並列実行**
```bash
# エンジニアA: US1実装
cd attendance-hub && git checkout -b us1-utils-tests

# エンジニアB: US2実装（別ブランチ）
cd attendance-hub && git checkout -b us2-register-tests

# エンジニアC: US3実装（別ブランチ）
cd attendance-hub && git checkout -b us3-event-detail-tests
```

## Success Metrics

### Quantitative Metrics

- ✅ **SC-001**: date-utils.ts 11.11% → 90%+
- ✅ **SC-002**: error-utils.ts 8.88% → 90%+
- ✅ **SC-003**: register/page.tsx 0% → 80%+
- ✅ **SC-004**: events/[id]/page.tsx 0% → 80%+
- ✅ **SC-005**: admin/groups/page.tsx 0% → 80%+
- ✅ **SC-006**: admin/events/page.tsx 0% → 80%+
- ✅ **SC-007**: my-register/page.tsx 0% → 80%+
- ✅ **SC-008**: 全体カバレッジ 47.98% → 70%+
- ✅ **SC-009**: テスト総数 234 → 350-400
- ✅ **SC-010**: 全テストpass、CI/CD成功
- ✅ **SC-011**: カバレッジ閾値維持
- ✅ **SC-012**: ユーティリティ関数テスト実行 90秒以内
- ✅ **SC-013**: ページコンポーネントテスト実行 120秒以内

### Qualitative Metrics

- ✅ テストが保守しやすい（既存パターンに従う）
- ✅ テスト名が明確で理解しやすい（日本語）
- ✅ エッジケースが網羅されている
- ✅ モック戦略が一貫している

## Notes

- **既存テストの保護**: 各タスク完了後、必ず`npm test`を実行して既存234テストがpassすることを確認してください
- **カバレッジ測定**: 各テストファイル追加後、個別にカバレッジを測定し、目標（90%または80%）に到達しているか確認してください
- **日本語テスト名**: describe、test/itブロックは全て日本語で記述してください（例: `describe('出欠登録ページの基本表示', () => { test('イベント情報が表示される', ...) })`）
- **モック戦略**: 既存のテストパターン（__tests__/app/page.test.tsx、__tests__/components/event-detail/member-attendance-list.test.tsxなど）を参照し、統一したモック方法を使用してください
- **HTMLカバレッジレポート**: カバレッジが目標に到達しない場合、`open coverage/lcov-report/index.html`でHTMLレポートを開き、未カバーの行を特定して追加テストケースを実装してください
