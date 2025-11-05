# Tasks: 出欠確認プロトタイプ

**Input**: Design documents from `/specs/001-attendance-prototype/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: このプロトタイプでは基本的なユニットテストのみ実装（TDD 簡略化、憲法原則 VIII のプロトタイプ例外）。各ユーザーストーリーの実装後にコアロジックのテストを追加。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（US1, US2, US3, US4）
- 説明には正確なファイルパスを含む

## Path Conventions

プロジェクトルートからの相対パス：

- `app/` - Next.js App Router ページ
- `components/` - 再利用可能な React コンポーネント
- `lib/` - ビジネスロジック・ユーティリティ
- `types/` - TypeScript 型定義
- `__tests__/` - テストファイル

---

## Phase 1: Setup (共有インフラストラクチャ)

**目的**: プロジェクトの初期化と基本構造の構築

- [ ] T001 Next.js 15 プロジェクトを初期化（create-next-app with TypeScript, Tailwind CSS, App Router）
- [ ] T002 [P] package.json に依存関係を追加（zod, date-fns, jest, @testing-library/react）
- [ ] T003 [P] tsconfig.json を strict mode 有効化で設定
- [ ] T004 [P] tailwind.config.js をモバイルファースト設定で構成
- [ ] T005 [P] jest.config.js と jest.setup.js を設定
- [ ] T006 [P] ESLint + Prettier 設定（.eslintrc.json, .prettierrc）
- [ ] T007 プロジェクト構造を作成（app/, components/, lib/, types/, **tests**/ディレクトリ）
- [ ] T008 [P] app/globals.css に Tailwind CSS ディレクティブとベーススタイルを追加
- [ ] T009 [P] app/layout.tsx にルートレイアウトを作成（日本語フォント、メタデータ）

**Checkpoint**: セットアップ完了 - 開発サーバーが起動し、基本的な Next.js アプリが表示される

---

## Phase 2: Foundational (ブロッキング必須要件)

**目的**: すべてのユーザーストーリーが依存するコアインフラストラクチャ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できない

- [ ] T010 [P] TypeScript 型定義を作成（Group, Attendance, AttendanceStatus, Summary）in types/index.ts
- [ ] T011 [P] Zod バリデーションスキーマを実装（GroupSchema, AttendanceSchema, CreateGroupInputSchema, CreateAttendanceInputSchema）in lib/validation.ts
- [ ] T012 [P] localStorage 操作関数を実装（loadGroups, saveGroups, loadAttendances, saveAttendances, safeLoadData, safeSetItem）in lib/storage.ts
- [ ] T013 [P] 日付フォーマットユーティリティを実装（date-fns で日本語ロケール対応）in lib/date-utils.ts
- [ ] T014 [P] エラーハンドリングユーティリティを実装（try-catch ラッパー、エラーメッセージ生成）in lib/error-utils.ts

**Checkpoint**: 基盤準備完了 - ユーザーストーリー実装を並列開始可能

---

## Phase 3: User Story 1 - グループを作成して出欠を登録する (Priority: P1) 🎯 MVP

**Goal**: ユーザーがグループを作成し、名前と出欠状況（◯/△/✗）を登録できる。ローカルストレージにデータを永続化。

**Independent Test**:

1. グループを作成し、グループ一覧に表示されることを確認
2. グループを選択し、名前と出欠状況を登録
3. ページをリロードしてもデータが保持されることを確認

### Implementation for User Story 1

- [ ] T015 [P] [US1] グループサービスを実装（createGroup, getAllGroups, getGroupById）in lib/group-service.ts
- [ ] T016 [P] [US1] 出欠登録サービスを実装（createAttendance, getAttendancesByGroupId）in lib/attendance-service.ts
- [ ] T017 [P] [US1] グループ一覧コンポーネントを作成（GroupList）in components/group-list.tsx
- [ ] T018 [P] [US1] グループフォームコンポーネントを作成（GroupForm with validation）in components/group-form.tsx
- [ ] T019 [P] [US1] 出欠登録フォームコンポーネントを作成（AttendanceForm with status selection）in components/attendance-form.tsx
- [ ] T020 [US1] トップページを実装（グループ一覧表示、新規作成ボタン）in app/page.tsx
- [ ] T021 [US1] グループ作成ページを実装（GroupForm 使用）in app/groups/new/page.tsx
- [ ] T022 [US1] グループ詳細ページを実装（グループ情報表示、出欠登録フォーム表示）in app/groups/[id]/page.tsx
- [ ] T023 [US1] 出欠登録ページを実装（AttendanceForm 使用、登録後にグループ詳細へリダイレクト）in app/groups/[id]/register/page.tsx
- [ ] T024 [US1] 入力バリデーションとエラーメッセージ表示を実装（全フォームに日本語エラーメッセージ）
- [ ] T025 [US1] ローディング状態とトランジションを追加（React Suspense, useTransition）
- [ ] T026 [US1] モバイルレスポンシブスタイルを調整（320px〜1920px 対応）

### Tests for User Story 1

- [ ] T027 [P] [US1] storage.ts のユニットテストを作成 in **tests**/lib/storage.test.ts
- [ ] T028 [P] [US1] group-service.ts のユニットテストを作成 in **tests**/lib/group-service.test.ts
- [ ] T029 [P] [US1] attendance-service.ts のユニットテストを作成（createAttendance, getAttendancesByGroupId）in **tests**/lib/attendance-service.test.ts

**Checkpoint**: US1 完了 - グループ作成と出欠登録が完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - グループの集計結果を確認する (Priority: P2)

**Goal**: グループごとの出欠状況（◯/△/✗ の人数）を集計し、一目で把握できる。

**Independent Test**:

1. 複数のユーザーが異なる出欠状況で登録
2. グループ詳細ページで「◯: X 人」「△: Y 人」「✗: Z 人」「合計: N 人」が正しく表示されることを確認

### Implementation for User Story 2

- [ ] T030 [US2] 集計ロジックを実装（calculateSummary）in lib/attendance-service.ts
- [ ] T031 [US2] 集計カードコンポーネントを作成（SummaryCard with 出欠状況別の人数表示）in components/summary-card.tsx
- [ ] T032 [US2] グループ詳細ページに集計表示を追加（app/groups/[id]/page.tsx を更新）
- [ ] T033 [US2] 集計結果のスタイリング（視覚的に分かりやすいカードデザイン、アイコン使用）
- [ ] T034 [US2] リアルタイム更新対応（出欠登録後に集計を再計算）

### Tests for User Story 2

- [ ] T035 [P] [US2] calculateSummary のユニットテストを作成 in **tests**/lib/attendance-service.test.ts
- [ ] T036 [P] [US2] SummaryCard コンポーネントのテストを作成 in **tests**/components/summary-card.test.tsx

**Checkpoint**: US2 完了 - 集計機能が動作し、US1 と独立してテスト可能

---

## Phase 5: User Story 3 - 登録内容を確認・編集する (Priority: P3)

**Goal**: ユーザーが自分の登録した出欠状況を確認し、変更または削除できる。

**Independent Test**:

1. 出欠登録の一覧を表示
2. 出欠状況を「◯」から「△」に変更し、集計結果も更新されることを確認
3. 登録を削除し、一覧と集計から除外されることを確認

### Implementation for User Story 3

- [ ] T037 [US3] 出欠登録の編集・削除機能を実装（updateAttendance, deleteAttendance）in lib/attendance-service.ts
- [ ] T038 [US3] 出欠一覧コンポーネントを作成（AttendanceList with 編集・削除ボタン）in components/attendance-list.tsx
- [ ] T039 [US3] グループ詳細ページに出欠一覧を追加（編集・削除機能付き）
- [ ] T040 [US3] 編集モーダルまたはインライン編集 UI を実装
- [ ] T041 [US3] 削除確認ダイアログを実装（誤削除防止）
- [ ] T042 [US3] 編集・削除後の集計結果自動更新を実装

### Tests for User Story 3

- [ ] T043 [P] [US3] updateAttendance と deleteAttendance のユニットテストを作成 in **tests**/lib/attendance-service.test.ts

**Checkpoint**: US3 完了 - 編集・削除機能が動作し、US1, US2 と独立してテスト可能

---

## Phase 6: User Story 4 - グループの出欠履歴を表示する (Priority: P3)

**Goal**: グループの出欠履歴を時系列で表示し、参加者の動向を把握できる。

**Independent Test**:

1. 履歴ページを開く
2. 「11/5 10:00 田中太郎 - ◯」のように登録順に表示されることを確認

### Implementation for User Story 4

- [ ] T044 [US4] 履歴取得ロジックを実装（getAttendanceHistoryByGroupId with 時系列ソート）in lib/attendance-service.ts
- [ ] T045 [US4] 履歴表示コンポーネントを作成（HistoryList with 日時フォーマット）in components/history-list.tsx
- [ ] T046 [US4] 履歴ページを実装 in app/groups/[id]/history/page.tsx
- [ ] T047 [US4] グループ詳細ページに履歴へのリンクを追加
- [ ] T048 [US4] 履歴の日付フォーマットを日本語で表示（date-fns 使用）

### Tests for User Story 4

- [ ] T049 [P] [US4] getAttendanceHistoryByGroupId のユニットテストを作成 in **tests**/lib/attendance-service.test.ts

**Checkpoint**: US4 完了 - 全ユーザーストーリーが独立して機能

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーにまたがる改善

- [ ] T050 [P] エラーハンドリングの強化（localStorage 容量超過、データ破損の対応）
- [ ] T051 [P] ローディング状態の改善（スケルトン UI、スピナー）
- [ ] T052 [P] アクセシビリティ改善（ARIA 属性、キーボードナビゲーション、フォーカス管理）
- [ ] T053 [P] パフォーマンス最適化（useMemo for 集計、React.memo でコンポーネント最適化）
- [ ] T054 [P] モバイル UI/UX の最終調整（タッチターゲットサイズ、スワイプジェスチャー）
- [ ] T055 [P] エラーメッセージの日本語表現を改善（丁寧語、分かりやすさ）
- [ ] T056 コードのリファクタリング（重複削除、命名改善、コメント追加）
- [ ] T057 全機能の統合テスト（quickstart.md の検証シナリオ実行）
- [ ] T058 [P] README.md を更新（プロジェクト概要、セットアップ手順、デモスクリーンショット）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup 完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-6)**: Foundational 完了に依存
  - ストーリー間は並列実行可能（スタッフがいる場合）
  - または優先順位順に逐次実行（P1 → P2 → P3）
- **Polish (Phase 7)**: 実装したいすべてのユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P2)**: Foundational 後に開始可能 - US1 と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational 後に開始可能 - US1, US2 と統合するが独立してテスト可能
- **User Story 4 (P3)**: Foundational 後に開始可能 - US1 と統合するが独立してテスト可能

### Within Each User Story

- 実装タスク → テストタスク（テストはコア機能の実装後）
- 型定義・サービス → コンポーネント → ページ
- コア実装 → 統合 → スタイリング・最適化
- ストーリー完了後に次の優先順位へ

### Parallel Opportunities

- Setup 内の[P]タスク（T002-T009）は並列実行可能
- Foundational 内の[P]タスク（T010-T014）は並列実行可能
- Foundational 完了後、全ユーザーストーリーを並列開始可能（チーム規模による）
- 各ユーザーストーリー内の[P]タスクは並列実行可能
- テストタスク（各ストーリー内）は並列実行可能
- Polish フェーズの[P]タスク（T050-T055, T058）は並列実行可能

---

## Parallel Example: User Story 1

```bash
# US1の実装タスクを並列実行:
Task T015: "グループサービスを実装 in lib/group-service.ts"
Task T016: "出欠登録サービスを実装 in lib/attendance-service.ts"
Task T017: "グループ一覧コンポーネントを作成 in components/group-list.tsx"
Task T018: "グループフォームコンポーネントを作成 in components/group-form.tsx"
Task T019: "出欠登録フォームコンポーネントを作成 in components/attendance-form.tsx"

# US1のテストを並列実行:
Task T027: "storage.tsのユニットテスト in __tests__/lib/storage.test.ts"
Task T028: "group-service.tsのユニットテスト in __tests__/lib/group-service.test.ts"
Task T029: "attendance-service.tsのユニットテスト in __tests__/lib/attendance-service.test.ts"
```

---

## Parallel Example: User Story 2

```bash
# US2の実装タスクを並列実行（US1完了後）:
Task T031: "集計カードコンポーネントを作成 in components/summary-card.tsx"

# US2のテストを並列実行:
Task T035: "calculateSummaryのユニットテスト in __tests__/lib/attendance-service.test.ts"
Task T036: "SummaryCardコンポーネントのテスト in __tests__/components/summary-card.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 完了: Setup
2. Phase 2 完了: Foundational（CRITICAL - 全ストーリーをブロック）
3. Phase 3 完了: User Story 1
4. **STOP and VALIDATE**: US1 を独立してテスト
5. 準備できていればデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational 完了 → 基盤準備完了
2. User Story 1 追加 → 独立してテスト → デプロイ/デモ（MVP！）
3. User Story 2 追加 → 独立してテスト → デプロイ/デモ
4. User Story 3 追加 → 独立してテスト → デプロイ/デモ
5. User Story 4 追加 → 独立してテスト → デプロイ/デモ
6. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チームで Setup + Foundational を一緒に完了
2. Foundational 完了後:
   - 開発者 A: User Story 1
   - 開発者 B: User Story 2
   - 開発者 C: User Story 3
   - 開発者 D: User Story 4
3. ストーリーが独立して完了・統合

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルはタスクを特定のユーザーストーリーに紐付け、トレーサビリティを確保
- 各ユーザーストーリーは独立して完了・テスト可能
- プロトタイプのため、TDD サイクルは簡略化（テストは実装後）
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証可能
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を壊す相互依存

## Task Summary

- **Total Tasks**: 58
- **Setup Tasks**: 9
- **Foundational Tasks**: 5
- **User Story 1 (P1 - MVP)**: 15 tasks (12 implementation + 3 tests)
- **User Story 2 (P2)**: 7 tasks (5 implementation + 2 tests)
- **User Story 3 (P3)**: 7 tasks (6 implementation + 1 test)
- **User Story 4 (P3)**: 6 tasks (5 implementation + 1 test)
- **Polish**: 9 tasks

**Parallel Opportunities**: 31 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = 26 tasks

**Ready for**: `/speckit.implement` コマンドによる実装開始
