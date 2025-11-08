# Tasks: 複数イベント一括出欠登録

**Input**: Design documents from `/specs/004-bulk-attendance-register/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**TDD Principles (t-wada)**: 本プロジェクトはTDD必須です。以下の原則を厳守してください:

1. **Small Steps (小さなステップ)**: 一度に1つのテストケースに集中
2. **Red-Green-Refactor**: 各テストケースごとに:
   - **[Red]**: 失敗するテストを1つ書く
   - **[Green]**: そのテストを通す最小限のコードを書く
   - **[Refactor]**: テストを通したまま、コードを改善
3. **Test-First (テストファースト)**: 必ず実装の前にテストを書く
4. **Test Independence**: 各テストは他のテストに依存しない

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含める

## Path Conventions

本プロジェクトはNext.js App Routerを使用:
- **アプリケーション**: `app/`（ページ、レイアウト）
- **ビジネスロジック**: `lib/`（サービス、ユーティリティ）
- **型定義**: `types/`
- **コンポーネント**: `components/`
- **テスト**: `__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクト初期化と基本構造

- [ ] T001 Git stashで現在の変更を退避（必要に応じて）
- [ ] T002 ブランチ `004-bulk-attendance-register` にいることを確認

**Checkpoint**: セットアップ完了 - 基盤タスクに進める

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリーの実装前に完了すべきコアインフラ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始不可

### 型定義の追加

- [x] T003 [P] `types/index.ts`に`BulkAttendanceInput`型を追加
- [x] T004 [P] `types/index.ts`に`BulkAttendanceResult`型を追加

**Checkpoint**: 基盤準備完了 - ユーザーストーリー実装を並列開始可能

---

## Phase 3: User Story 1 - 複数イベントへの一括出欠登録 (Priority: P1) 🎯 MVP

**Goal**: メンバーが1画面で複数イベントの出欠を一括登録できる

**Independent Test**: `/my-register`ページにアクセスし、グループと名前を選択後、複数のイベントにチェックを入れてステータスを設定し、一括登録ボタンを押すことで、選択したすべてのイベントに出欠が登録されることを確認できる

### サービス層: upsertAttendance 関数

#### Test Case 1: 新規レコードを作成する

- [x] T005 **[Red]** [US1] テストを書く: upsertAttendanceが新規レコードを作成する (`__tests__/lib/attendance-service.test.ts`)
- [x] T006 **[Green]** [US1] `lib/attendance-service.ts`に`upsertAttendance`関数のスケルトンを作成
- [x] T007 **[Green]** [US1] 新規レコード作成ロジックを実装してT005を通す
- [x] T008 **[Green]** [US1] テストを実行してT005がパスすることを確認
- [x] T009 **[Refactor]** [US1] コードを整理（テストは通ったまま）

#### Test Case 2: 既存レコードを更新する

- [x] T010 **[Red]** [US1] テストを書く: upsertAttendanceが既存レコードを更新する (`__tests__/lib/attendance-service.test.ts`)
- [x] T011 **[Green]** [US1] 既存レコード検索と更新ロジックを実装してT010を通す
- [x] T012 **[Green]** [US1] テストを実行してT005とT010が両方パスすることを確認
- [x] T013 **[Refactor]** [US1] コード構造を改善（テストは通ったまま）

#### Test Case 3: createdAtを保持する（重複レコード処理に統合）

- [x] T014 **[Red]** [US1] テストを書く: 重複レコードがある場合、最新のものを保持し古いものを削除する (`__tests__/lib/attendance-service.test.ts`)
- [x] T015 **[Green]** [US1] 重複レコード処理ロジック（最新のもの保持、createdAt保持）を実装してT014を通す
- [x] T016 **[Green]** [US1] テストを実行してT005, T010, T014が全てパスすることを確認
- [x] T017 **[Refactor]** [US1] 必要に応じてリファクタリング

### サービス層: upsertBulkAttendances 関数

#### Test Case 4: 全件成功（新規と既存の混在を含む）

- [x] T018 **[Red]** [US1] テストを書く: すべて新規レコードの場合、全件成功する (`__tests__/lib/attendance-service.test.ts`)
- [x] T019 **[Green]** [US1] `lib/attendance-service.ts`に`upsertBulkAttendances`関数を作成
- [x] T020 **[Green]** [US1] バッチ処理ロジックを実装してT018を通す
- [x] T021 **[Green]** [US1] テストを実行してT018がパスすることを確認
- [x] T022 **[Refactor]** [US1] コードを整理

#### Test Case 5: 新規と既存が混在

- [x] T023 **[Red]** [US1] テストを書く: 新規レコードと既存レコードが混在する場合、それぞれsuccessとupdatedに分類される (`__tests__/lib/attendance-service.test.ts`)
- [x] T024 **[Green]** [US1] 既存レコード判定と分類ロジックを実装してT023を通す
- [x] T025 **[Green]** [US1] テストを実行してT018とT023が両方パスすることを確認
- [x] T026 **[Refactor]** [US1] エラーハンドリングコードを整理

#### Test Case 6: バリデーションエラー時の部分的失敗

- [x] T027 **[Red]** [US1] テストを書く: 無効な入力があっても他の有効な入力は処理される (`__tests__/lib/attendance-service.test.ts`)
- [x] T028 **[Green]** [US1] 部分的失敗のエラーハンドリングを実装してT027を通す
- [x] T029 **[Green]** [US1] テストを実行して全てのupsertBulkAttendancesテストがパスすることを確認
- [x] T030 **[Refactor]** [US1] 必要に応じてリファクタリング

#### Test Case 7: 空配列の処理

- [x] T030a **[Red]** [US1] テストを書く: 空配列を渡した場合の動作 (`__tests__/lib/attendance-service.test.ts`)
- [x] T030b **[Green]** [US1] 空配列のハンドリングを実装してT030aを通す
- [x] T030c **[Green]** [US1] テストを実行して全てのupsertBulkAttendancesテストがパスすることを確認

### UIコンポーネント: MemberSelector

#### Test Case 7: グループ選択が動作する

- [ ] T031 **[Red]** [US1] テストを書く: MemberSelectorがグループ一覧を表示する (`__tests__/components/bulk-register/member-selector.test.tsx`)
- [ ] T032 **[Green]** [US1] `components/bulk-register/member-selector.tsx`を作成
- [ ] T033 **[Green]** [US1] グループドロップダウンのUIを実装してT031を通す
- [ ] T034 **[Green]** [US1] テストを実行してT031がパスすることを確認
- [ ] T035 **[Refactor]** [US1] コンポーネントを整理

#### Test Case 8: メンバー選択が動作する

- [ ] T036 **[Red]** [US1] テストを書く: グループ選択後、メンバー一覧が表示される (`__tests__/components/bulk-register/member-selector.test.tsx`)
- [ ] T037 **[Green]** [US1] メンバードロップダウンのロジックを実装してT036を通す
- [ ] T038 **[Green]** [US1] テストを実行してT031とT036が両方パスすることを確認
- [ ] T039 **[Refactor]** [US1] ステート管理を整理

#### Test Case 9: 新規メンバー作成

- [ ] T040 **[Red]** [US1] テストを書く: 新規メンバー名を入力できる (`__tests__/components/bulk-register/member-selector.test.tsx`)
- [ ] T041 **[Green]** [US1] 新規メンバー入力フィールドを実装してT040を通す
- [ ] T042 **[Green]** [US1] テストを実行して全てのMemberSelectorテストがパスすることを確認
- [ ] T043 **[Refactor]** [US1] UIとロジックを整理

### UIコンポーネント: EventList

#### Test Case 10: イベント一覧表示

- [ ] T044 **[Red]** [US1] テストを書く: EventListがイベント一覧を表示する (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T045 **[Green]** [US1] `components/bulk-register/event-list.tsx`を作成
- [ ] T046 **[Green]** [US1] イベントカードのリスト表示を実装してT044を通す
- [ ] T047 **[Green]** [US1] テストを実行してT044がパスすることを確認
- [ ] T048 **[Refactor]** [US1] コンポーネントを整理

#### Test Case 11: イベント選択（チェックボックス）

- [ ] T049 **[Red]** [US1] テストを書く: チェックボックスでイベントを選択/解除できる (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T050 **[Green]** [US1] チェックボックスの状態管理を実装してT049を通す
- [ ] T051 **[Green]** [US1] テストを実行してT044とT049が両方パスすることを確認
- [ ] T052 **[Refactor]** [US1] ステート管理を整理

#### Test Case 12: 既存ステータス表示

- [ ] T053 **[Red]** [US1] テストを書く: 既存登録があるイベントに現在のステータスを表示 (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T054 **[Green]** [US1] 既存ステータス取得と表示ロジックを実装してT053を通す
- [ ] T055 **[Green]** [US1] テストを実行して全てのEventListテストがパスすることを確認
- [ ] T056 **[Refactor]** [US1] コードを整理

### UIコンポーネント: StatusGrid

#### Test Case 13: ステータスボタン表示

- [ ] T057 **[Red]** [US1] テストを書く: StatusGridが◯/△/✗ボタンを表示する (`__tests__/components/bulk-register/status-grid.test.tsx`)
- [ ] T058 **[Green]** [US1] `components/bulk-register/status-grid.tsx`を作成
- [ ] T059 **[Green]** [US1] ステータスボタンのUIを実装してT057を通す
- [ ] T060 **[Green]** [US1] テストを実行してT057がパスすることを確認
- [ ] T061 **[Refactor]** [US1] コンポーネントを整理

#### Test Case 14: ステータス選択

- [ ] T062 **[Red]** [US1] テストを書く: ステータスボタンをクリックして選択できる (`__tests__/components/bulk-register/status-grid.test.tsx`)
- [ ] T063 **[Green]** [US1] ステータス選択のロジックを実装してT062を通す
- [ ] T064 **[Green]** [US1] テストを実行してT057とT062が両方パスすることを確認
- [ ] T065 **[Refactor]** [US1] イベントハンドリングを整理

### ページ統合: MyRegisterPage

#### Test Case 15: ページ全体の統合

- [ ] T066 **[Red]** [US1] テストを書く: `/my-register`ページが全コンポーネントを統合する (`__tests__/app/my-register/page.test.tsx`)
- [ ] T067 **[Green]** [US1] `app/my-register/page.tsx`を作成
- [ ] T068 **[Green]** [US1] MemberSelector、EventList、StatusGridを統合してT066を通す
- [ ] T069 **[Green]** [US1] テストを実行してT066がパスすることを確認
- [ ] T070 **[Refactor]** [US1] ページレイアウトを整理

#### Test Case 16: 一括登録ボタンと成功メッセージ

- [ ] T071 **[Red]** [US1] テストを書く: 一括登録ボタンを押すと成功メッセージが表示される (`__tests__/app/my-register/page.test.tsx`)
- [ ] T072 **[Green]** [US1] 一括登録ボタンとupsertBulkAttendances呼び出しを実装してT071を通す
- [ ] T073 **[Green]** [US1] テストを実行してT066とT071が両方パスすることを確認
- [ ] T074 **[Refactor]** [US1] フォーム送信ロジックを整理

### ナビゲーション追加

- [ ] T075 [US1] `app/page.tsx`に「複数イベントの出欠を登録」リンクを追加
- [ ] T076 [US1] `app/admin/page.tsx`に「複数イベントの出欠を登録」リンクを追加

### UI/UXポリッシュ

- [ ] T077 **[Refactor]** [US1] Tailwind CSSでモバイルファーストのスタイリングを適用
- [ ] T078 **[Refactor]** [US1] セマンティックHTMLとアクセシビリティ機能を追加（`<label>`, `aria-label`など）
- [ ] T079 **[Refactor]** [US1] キーボードナビゲーション（Tab/Enter/Space）の動作確認と修正

**Checkpoint**: User Story 1が完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - 既存出欠の自動更新（重複防止） (Priority: P2)

**Goal**: 既存の出欠レコードを重複作成せず、自動的に更新する

**Independent Test**: 既に出欠登録済みのイベントに対して、異なるステータスで再登録を試みる。データを確認し、重複レコードが作成されず、既存レコードが更新されていることを検証できる

### 重複検出ロジック

#### Test Case 17: 重複レコードのクリーンアップ

- [ ] T080 **[Red]** [US2] テストを書く: 重複レコードが存在する場合、最新のもの以外を削除 (`__tests__/lib/attendance-service.test.ts`)
- [ ] T081 **[Green]** [US2] `lib/attendance-service.ts`の`upsertAttendance`に重複検出と削除ロジックを追加してT080を通す
- [ ] T082 **[Green]** [US2] テストを実行してT080がパスすることを確認
- [ ] T083 **[Refactor]** [US2] 重複削除ロジックを整理

#### Test Case 18: upsertでの重複防止

- [ ] T084 **[Red]** [US2] テストを書く: upsertAttendanceが常に1メンバー×1イベント=1レコードを保証 (`__tests__/lib/attendance-service.test.ts`)
- [ ] T085 **[Green]** [US2] upsertロジックが重複を作成しないことを確認してT084を通す
- [ ] T086 **[Green]** [US2] テストを実行してT080とT084が両方パスすることを確認
- [ ] T087 **[Refactor]** [US2] コードを整理

### 一括登録での重複防止

#### Test Case 19: upsertBulkAttendancesでの重複防止

- [ ] T088 **[Red]** [US2] テストを書く: upsertBulkAttendancesが既存レコードを正しく更新する (`__tests__/lib/attendance-service.test.ts`)
- [ ] T089 **[Green]** [US2] upsertBulkAttendancesが各レコードに対してupsertを呼び出すことを確認してT088を通す
- [ ] T090 **[Green]** [US2] テストを実行してT088がパスすることを確認
- [ ] T091 **[Refactor]** [US2] 必要に応じてリファクタリング

### UI更新: 既存レコード表示

#### Test Case 20: 既存登録の視覚的表示

- [ ] T092 **[Red]** [US2] テストを書く: EventListが既存登録を「既存: ◯」のように表示 (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T093 **[Green]** [US2] `components/bulk-register/event-list.tsx`に既存ステータス表示を実装してT092を通す
- [ ] T094 **[Green]** [US2] テストを実行してT092がパスすることを確認
- [ ] T095 **[Refactor]** [US2] UI表示を整理

### フィードバックメッセージ

#### Test Case 21: 更新件数の表示

- [ ] T096 **[Red]** [US2] テストを書く: 「5件登録（うち2件更新）」のメッセージを表示 (`__tests__/app/my-register/page.test.tsx`)
- [ ] T097 **[Green]** [US2] `app/my-register/page.tsx`にBulkAttendanceResultから更新件数を抽出してメッセージ表示するロジックを実装してT096を通す
- [ ] T098 **[Green]** [US2] テストを実行してT096がパスすることを確認
- [ ] T099 **[Refactor]** [US2] メッセージロジックを整理

**Checkpoint**: User Story 1と2が両方独立して機能する

---

## Phase 5: User Story 3 - イベントごとの個別ステータス設定 (Priority: P3)

**Goal**: 各イベントごとに異なるステータス（◯/△/✗）を個別に設定できる

**Independent Test**: 一括登録画面で3つのイベントを選択し、1つ目を「◯」、2つ目を「△」、3つ目を「✗」に設定して登録。各イベントの詳細ページで正しいステータスが登録されていることを確認できる

### UI拡張: イベントごとのステータス設定

#### Test Case 22: 個別ステータス設定UI

- [ ] T100 **[Red]** [US3] テストを書く: EventListの各イベントに個別のステータスボタンが表示される (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T101 **[Green]** [US3] `components/bulk-register/event-list.tsx`に各イベント行にStatusGridを統合してT100を通す
- [ ] T102 **[Green]** [US3] テストを実行してT100がパスすることを確認
- [ ] T103 **[Refactor]** [US3] コンポーネント構造を整理

#### Test Case 23: 個別ステータスの状態管理

- [ ] T104 **[Red]** [US3] テストを書く: 各イベントのステータスを個別に設定できる (`__tests__/components/bulk-register/event-list.test.tsx`)
- [ ] T105 **[Green]** [US3] イベントIDをキーとしたステータスマップを実装してT104を通す
- [ ] T106 **[Green]** [US3] テストを実行してT100とT104が両方パスすることを確認
- [ ] T107 **[Refactor]** [US3] ステート管理を整理

### ページ統合: 個別ステータスの送信

#### Test Case 24: 個別ステータスでの一括登録

- [ ] T108 **[Red]** [US3] テストを書く: 各イベントに異なるステータスを設定して一括登録できる (`__tests__/app/my-register/page.test.tsx`)
- [ ] T109 **[Green]** [US3] `app/my-register/page.tsx`でイベントごとのステータスを収集してupsertBulkAttendancesに渡すロジックを実装してT108を通す
- [ ] T110 **[Green]** [US3] テストを実行してT108がパスすることを確認
- [ ] T111 **[Refactor]** [US3] データ収集ロジックを整理

### オプション機能: 一括設定

#### Test Case 25: 全イベントに同じステータスを一括設定

- [ ] T112 **[Red]** [US3] テストを書く: 「全て◯にする」ボタンで全イベントのステータスを一括設定 (`__tests__/app/my-register/page.test.tsx`)
- [ ] T113 **[Green]** [US3] 一括設定ボタンとロジックを実装してT112を通す
- [ ] T114 **[Green]** [US3] テストを実行してT112がパスすることを確認
- [ ] T115 **[Refactor]** [US3] UIとロジックを整理

**Checkpoint**: 全ユーザーストーリーが独立して機能する

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

### コード品質チェック

- [ ] T116 全テストスイートを実行し、すべてのテストがパスすることを確認
- [ ] T117 TypeScript型チェック（`npx tsc --noEmit`）を実行してエラーを修正
- [ ] T118 ESLint（`npm run lint`）を実行してリンティング問題を修正
- [ ] T119 コードクリーンアップ: 未使用のインポートとコメントアウトされたコードを削除

### コードレビュー（憲法準拠チェック）

- [ ] T120 **[Code Review]** 型安全性チェック: `any`型の不適切な使用がないことを確認
- [ ] T121 **[Code Review]** TDDサイクルチェック: すべての新規コードがテストファーストで実装されたことを確認
- [ ] T122 **[Code Review]** セキュリティパターンチェック: 入力バリデーション、XSS保護を確認
- [ ] T123 **[Code Review]** パフォーマンスチェック: バッチ処理、最適化の適切な使用を確認
- [ ] T124 **[Code Review]** アクセシビリティチェック: セマンティックHTML、ARIAラベルを確認
- [ ] T125 **[Code Review]** UI/UXチェック: 日本語UIテキストの適切性を確認
- [ ] T126 **[Code Review]** レスポンシブデザインチェック: モバイルファースト実装を確認

### 機能テスト

- [ ] T127 パフォーマンステスト: 50イベントの一括登録が5秒以内に完了することを確認
- [ ] T128 アクセシビリティテスト: キーボードナビゲーションとスクリーンリーダー互換性を確認
- [ ] T129 モバイルテスト: 320px、768px、1024pxの各ビューポートでレイアウトを確認
- [ ] T130 クロスブラウザテスト: Chrome、Firefox、Safariで動作を確認
- [ ] T131 エッジケーステスト: spec.mdのエッジケースが正しく動作することを確認

### ドキュメント

- [ ] T132 [P] プロジェクトドキュメント（CLAUDE.md）を最新の変更で更新
- [ ] T133 [P] quickstart.mdの手順が機能することを検証
- [ ] T134 **[Required]** SPECIFICATION.md更新
  - [ ] バージョン番号の更新
  - [ ] 機能一覧に新機能を追加
  - [ ] データモデル変更の反映（該当なし）
  - [ ] API仕様に新規関数を追加（upsertAttendance, upsertBulkAttendances）
  - [ ] UI/UX仕様に新規ページを追加（/my-register）
  - [ ] テスト仕様の統計を更新
  - [ ] 変更履歴に実装完了を記録

### コードレビュー問題の解決

- [ ] T135 **[Fix]** コードレビューで特定された問題を修正（該当する場合）
- [ ] T136 **[Green]** 修正後、全テストを再実行してパスすることを確認
- [ ] T137 **[Manual]** 修正後、手動テストを実行して機能を確認

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3+)**: すべてFoundationalフェーズの完了に依存
  - ユーザーストーリーはその後並列実行可能（スタッフがいれば）
  - または優先順位順に順次実行（P1 → P2 → P3）
- **Polish (Final Phase)**: 希望するすべてのユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2)の後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2)の後に開始可能 - US1と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational (Phase 2)の後に開始可能 - US1/US2と統合するが独立してテスト可能

### 各ユーザーストーリー内

**TDD必須（t-wada原則）**:
- **一度に1つのテストケース**: 複数のテストケースをまとめて処理しない
- **各テストのRed-Green-Refactorサイクル**:
  1. Red: 失敗するテストを1つ書く
  2. Green: そのテストを通す最小限のコードを書く
  3. Refactor: テストを通したままコードを改善
- **Small steps**: 各タスクは1つの特定の動作に集中
- **Test independence**: 各テストは独立して実行可能

### 並列実行の機会

**重要**: TDD必須の場合、並列実行はRed-Green-Refactorサイクルによって制限される:
- **テストケース内**: Red-Green-Refactorステップを並列実行しない（順次実行必須）
- **同じ機能の異なるテストケース**: 順次実行すべき（一度に1つのテスト）
- **異なるユーザーストーリー**: 異なるチームメンバーが並列実行可能

**並列実行可能なタスク**:
- Phase 2のT003とT004（異なる型定義）
- 異なるユーザーストーリー（US1、US2、US3）を異なるチームメンバーが担当
- Phase 6のT132とT133（異なるドキュメント）

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1完了: Setup
2. Phase 2完了: Foundational（重要 - すべてのストーリーをブロック）
3. Phase 3完了: User Story 1
4. **停止して検証**: User Story 1を独立してテスト
5. 準備ができたらデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ
4. User Story 3追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーが前のストーリーを壊さずに価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundationalが完了したら:
   - 開発者A: User Story 1
   - 開発者B: User Story 2
   - 開発者C: User Story 3
3. ストーリーは独立して完了・統合

---

## Notes

**General**:
- [P]タスク = 異なるファイル、依存関係なし（TDD必須でない場合のみ有効）
- [Story]ラベルはタスクを特定のユーザーストーリーにマッピング（トレーサビリティ）
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理グループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、独立性を壊すストーリー間の依存

**TDD-Specific（憲法で必須）**:
- **[Red]**, **[Green]**, **[Refactor]** ラベルはすべてのテスト関連タスクに必須
- **一度に1つのテストケース**: 複数のテストケースを1つのタスクにまとめない
- **Small steps**: 各Red-Green-Refactorサイクルは30分以内に完了可能
- **Redの検証**: 実装前に必ずテストが失敗することを確認
- **Greenの検証**: 実装後に必ずテストがパスすることを確認
- **独立したテスト**: 各テストは実行順序に依存せずに独立して実行可能
- **同じ機能内での並列実行なし**: 同じ機能のテストは順次実行必須

---

## Task Summary

**Total Tasks**: 137
- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (User Story 1)**: 75 tasks
- **Phase 4 (User Story 2)**: 20 tasks
- **Phase 5 (User Story 3)**: 16 tasks
- **Phase 6 (Polish)**: 22 tasks

**Parallel Opportunities**:
- Phase 2: T003とT004（型定義）
- Phase 3-5: ユーザーストーリーを異なるチームメンバーが並列実行可能
- Phase 6: T132とT133（ドキュメント）

**Suggested MVP Scope**: User Story 1のみ（Phase 1-3、77タスク）

**Independent Test Criteria**:
- **User Story 1**: `/my-register`ページで複数イベントの一括登録が機能する
- **User Story 2**: 既存出欠の重複が発生せず、自動的に更新される
- **User Story 3**: 各イベントごとに異なるステータスを設定できる

**Format Validation**: ✅ すべてのタスクがチェックリスト形式に従っている（チェックボックス、ID、ラベル、ファイルパス）
