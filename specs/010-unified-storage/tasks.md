# Tasks: 統合ストレージ層

**Input**: Design documents from `/specs/010-unified-storage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**TDD Principles (t-wada)**: 憲法に従い、Red-Green-Refactorサイクルを遵守します。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: ユーザーストーリー（US1, US2, US3）

---

## Phase 1: Setup

**Purpose**: プロジェクト初期化と基本構造の確認

- [X] T001 現在のプロジェクト構造を確認し、lib/unified-storage.tsの配置場所を決定
- [X] T002 [P] 環境変数の現状を確認（.env.local、.env.production）

---

## Phase 2: Foundational (統合ストレージ層)

**Purpose**: 全ユーザーストーリーの基盤となる統合ストレージ層を実装

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できません

### Test Case 1: ストレージモード判定

- [X] T003 **[Red]** Write test: getStorageMode()がlocalStorageモードを返す (__tests__/lib/unified-storage.test.ts)
- [X] T004 **[Green]** getStorageMode()関数を実装し、環境変数判定ロジックを追加 (lib/unified-storage.ts)
- [X] T005 **[Green]** テストを実行してT003がpassすることを確認
- [X] T006 **[Refactor]** コードを整理（テストがpassのまま）

### Test Case 2: 本番環境でのSupabase強制使用

- [X] T007 **[Red]** Write test: NODE_ENV=productionの場合はSupabaseモードを返す (__tests__/lib/unified-storage.test.ts)
- [X] T008 **[Green]** 本番環境判定ロジックを追加 (lib/unified-storage.ts)
- [X] T009 **[Green]** テストを実行してT003とT007がpassすることを確認
- [X] T010 **[Refactor]** コードを整理（テストがpassのまま）

### Test Case 3: Organization操作（localStorage）

- [X] T011 **[Red]** Write test: loadOrganization()がlocalStorageから読み込む (__tests__/lib/unified-storage.test.ts)
- [X] T012 **[Green]** loadOrganization()をlocalStorageモード用に実装 (lib/unified-storage.ts)
- [X] T013 **[Green]** テストを実行してT011がpassすることを確認
- [X] T014 **[Refactor]** コードを整理（テストがpassのまま）

### Test Case 4: Organization操作（Supabase）

- [X] T015 **[Red]** Write test: Supabaseモード時にloadOrganization()がSupabaseから読み込む (__tests__/lib/unified-storage.test.ts)
- [X] T016 **[Green]** loadOrganization()をSupabaseモード用に拡張 (lib/unified-storage.ts)
- [X] T017 **[Green]** テストを実行してT011とT015がpassすることを確認
- [X] T018 **[Refactor]** コードを整理（テストがpassのまま）

### Test Case 5: 全エンティティ操作の実装

- [X] T019 **[Red]** Write test: loadGroups(), saveGroups()の動作確認 (__tests__/lib/unified-storage.test.ts)
- [X] T020 **[Green]** Groups操作を実装 (lib/unified-storage.ts)
- [X] T021 **[Green]** テストを実行してpassすることを確認

- [X] T022 **[Red]** Write test: loadMembers(), saveMembers()の動作確認 (__tests__/lib/unified-storage.test.ts)
- [X] T023 **[Green]** Members操作を実装 (lib/unified-storage.ts)
- [X] T024 **[Green]** テストを実行してpassすることを確認

- [X] T025 **[Red]** Write test: loadEventDates(), saveEventDates()の動作確認 (__tests__/lib/unified-storage.test.ts)
- [X] T026 **[Green]** EventDates操作を実装 (lib/unified-storage.ts)
- [X] T027 **[Green]** テストを実行してpassすることを確認

- [X] T028 **[Red]** Write test: loadAttendances(), saveAttendances()の動作確認 (__tests__/lib/unified-storage.test.ts)
- [X] T029 **[Green]** Attendances操作を実装 (lib/unified-storage.ts)
- [X] T030 **[Green]** テストを実行してpassすることを確認

- [X] T031 **[Refactor]** 全エンティティ操作のコードを整理（テストがpassのまま）

**Checkpoint**: 統合ストレージ層が完成 - サービスファイルの更新を開始可能

---

## Phase 3: User Story 1 - ローカル開発でのlocalStorage使用 (Priority: P1) 🎯 MVP

**Goal**: デフォルトでlocalStorageを使用し、Supabase設定なしでローカル開発を可能にする

**Independent Test**: `npm run dev`を実行し、団体・グループ・イベント・出欠を登録してlocalStorageにデータが保存されることを確認

### サービスファイルの更新

- [X] T032 [US1] organization-service.tsのimportを./storageから./unified-storageに変更 (lib/organization-service.ts)
- [X] T033 [US1] group-service.tsのimportを./storageから./unified-storageに変更 (lib/group-service.ts)
- [X] T034 [US1] event-service.tsのimportを./storageから./unified-storageに変更 (lib/event-service.ts)
- [X] T035 [US1] attendance-service.tsのimportを./storageから./unified-storageに変更 (lib/attendance-service.ts)

### 動作確認

- [X] T036 [US1] 既存テストを実行して全てpassすることを確認 (npm test)
- [X] T037 [US1] 型チェックを実行してエラーがないことを確認 (npx tsc --noEmit)
- [X] T038 [US1] ローカル環境で`npm run dev`を実行し、localStorageモードで動作することを確認

**Checkpoint**: User Story 1完了 - ローカル開発でlocalStorageが使用される

---

## Phase 4: User Story 2 - ローカル環境でのSupabaseテスト (Priority: P2)

**Goal**: 専用コマンドでSupabaseモードを有効化し、ローカルでSupabase接続をテスト可能にする

**Independent Test**: `npm run dev:supabase`を実行し、団体を作成してSupabaseダッシュボードでデータが登録されていることを確認

### npm script追加

- [X] T039 [US2] package.jsonに`dev:supabase`スクリプトを追加 (package.json)
- [ ] T040 [US2] Windows対応のためcross-envパッケージの導入を検討し、必要に応じてインストール

### 動作確認

- [X] T041 [US2] `npm run dev:supabase`を実行し、Supabaseモードで起動することを確認
- [X] T042 [US2] 団体を作成し、Supabaseダッシュボードでデータが登録されていることを確認

**Checkpoint**: User Story 2完了 - ローカル環境でSupabaseテストが可能

---

## Phase 5: User Story 3 - 本番環境でのSupabase自動使用 (Priority: P1)

**Goal**: 本番環境で自動的にSupabaseが使用され、データが永続的に保存される

**Independent Test**: Vercelにデプロイ後、団体を作成してSupabaseダッシュボードでデータが登録されていることを確認

### 設定確認

- [X] T043 [US3] Vercel環境変数の設定手順をドキュメント化 (specs/010-unified-storage/quickstart.md)
- [X] T044 [US3] NODE_ENV=production時にSupabaseが強制使用されることをコードで確認

### 動作確認

- [X] T045 [US3] ビルドを実行してエラーがないことを確認 (npm run build)

**Checkpoint**: User Story 3完了 - 本番環境でSupabaseが自動使用される

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全ユーザーストーリーに影響する改善

### Code Quality Checks

- [X] T046 全テストを実行して全てpassすることを確認 (npm test)
- [X] T047 TypeScript型チェックを実行してエラーがないことを確認 (npx tsc --noEmit)
- [X] T048 ESLintを実行してlinting issuesを修正 (npm run lint)
- [X] T049 コードクリーンアップ: 未使用のimportとコメントアウトされたコードを削除

### Code Review (Constitution Compliance Check)

- [X] T050 **[Code Review]** 型安全性チェック: `any`型の不適切な使用がないことを確認
- [X] T051 **[Code Review]** TDDサイクルチェック: 全ての新コードがテストファーストで実装されたことを確認
- [X] T052 **[Code Review]** セキュリティパターンチェック: 入力検証、エラーハンドリングを確認

### Functional Testing

- [X] T053 パフォーマンステスト: 既存の200ms以内の応答時間が維持されていることを確認
- [X] T054 エッジケーステスト: Supabase認証情報欠落時のエラーメッセージを確認

### Documentation

- [X] T055 [P] README.mdを更新: 新しいnpm scriptと環境変数の説明を追加
- [X] T056 [P] CLAUDE.mdを更新: 最近の変更セクションに010-unified-storageを追加
- [X] T057 **[Required]** SPECIFICATION.md更新
  - [X] バージョン番号の更新
  - [X] 機能一覧に新機能を追加
  - [X] API仕様に新規関数を追加
  - [X] テスト仕様の統計を更新
  - [X] 変更履歴に実装完了を記録

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了に依存 - 全ユーザーストーリーをブロック
- **User Story 1 (Phase 3)**: Foundational完了に依存
- **User Story 2 (Phase 4)**: User Story 1完了に依存（同じコードベースを使用）
- **User Story 3 (Phase 5)**: User Story 1完了に依存（同じコードベースを使用）
- **Polish (Phase 6)**: 全ユーザーストーリー完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーに依存なし
- **User Story 2 (P2)**: User Story 1完了後に開始（統合ストレージ層を使用）
- **User Story 3 (P1)**: User Story 1完了後に開始（統合ストレージ層を使用）

### Parallel Opportunities

**TDD必須のため、同一フィーチャー内での並列実行は制限されます**:
- **テストケース内**: Red-Green-Refactorは順次実行（並列不可）
- **異なるテストケース**: 順次実行（1つずつ）
- **異なるユーザーストーリー**: チームメンバーが異なれば並列可能

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了（CRITICAL - 全ストーリーをブロック）
3. Phase 3: User Story 1完了
4. **STOP and VALIDATE**: ローカル環境でlocalStorageが正しく動作することを確認
5. デプロイ/デモ可能

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立テスト → デプロイ（MVP!）
3. User Story 2追加 → 独立テスト → デプロイ
4. User Story 3追加 → 独立テスト → デプロイ
5. 各ストーリーは前のストーリーを壊さずに価値を追加

---

## Notes

- [P] タスク = 異なるファイル、依存なし
- [Story] ラベル = 特定のユーザーストーリーへのマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理グループ後にコミット
- 任意のチェックポイントで停止してストーリーを独立検証可能

**TDD固有**:
- **[Red]**, **[Green]**, **[Refactor]** ラベルは全テスト関連タスクで必須
- **1つずつテストケース**: 複数のテストケースを1つのタスクにまとめない
- **小さなステップ**: 各Red-Green-Refactorサイクルは30分以内で完了可能
- **Redを確認**: 実装前に必ずテストがFAILすることを確認
- **Greenを確認**: 実装後に必ずテストがPASSすることを確認
