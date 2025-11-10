# Tasks: イベント画面 個人別出欠状況表示機能

**Input**: Design documents from `/specs/007-event-member-attendance/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/attendance-service.md

**TDD Principles (t-wada)**: このプロジェクトはTDDが必須です。以下の原則を厳守してください：

1. **Small Steps (小さなステップ)**: 一度に1つのテストケースに集中
2. **Red-Green-Refactor**: 各テストケースごとに：
   - **[Red]**: 1つの失敗するテストを書く
   - **[Green]**: そのテストを通す最小限のコードを書く
   - **[Refactor]**: テストが通った状態を保ちながらコードを改善
3. **Test-First (テストファースト)**: 常に実装の前にテストを書く
4. **Test Independence**: 各テストは他のテストに依存しない

**Organization**: タスクはユーザーストーリーごとにグループ化されており、各ストーリーを独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1, US2, US3, US4）
- 説明には正確なファイルパスを含む

---

## Phase 1: Setup（共通インフラ）

**目的**: プロジェクトの初期化と基本構造

- [x] T001 新規型定義をtypes/index.tsに追加（MemberAttendanceDetail, AttendanceFilterStatus, AttendanceSortBy）

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーが依存するコアインフラ。このフェーズ完了後にユーザーストーリー作業を開始可能。

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません。

### サービス層: getGroupMemberAttendances() 実装

このセクションではTDDサイクルに従い、8つのテストケースを順次実装します。

#### テストケース1: 出欠登録済みと未登録のメンバーを正しく返す

- [x] T002 **[Red]** テストを書く: 出欠登録済みと未登録のメンバーを正しく返す（__tests__/lib/attendance-service.test.ts）
- [x] T003 **[Green]** getGroupMemberAttendances()関数の基本実装（lib/attendance-service.ts）
- [x] T004 **[Green]** T002のテストを実行して成功することを確認
- [x] T005 **[Refactor]** コードを整理・改善（テストが通った状態を保つ）

#### テストケース2: 全員が出欠登録済みの場合

- [x] T006 **[Red]** テストを書く: 全員が出欠登録済みの場合（__tests__/lib/attendance-service.test.ts）
- [x] T007 **[Green]** T006を通すように実装を拡張（lib/attendance-service.ts）
- [x] T008 **[Green]** すべてのテスト（T002, T006）が通ることを確認
- [x] T009 **[Refactor]** 重複コードを除去、変数名を改善

#### テストケース3: 全員が未登録の場合

- [x] T010 **[Red]** テストを書く: 全員が未登録の場合（__tests__/lib/attendance-service.test.ts）
- [x] T011 **[Green]** T010を通すように実装を拡張（lib/attendance-service.ts）
- [x] T012 **[Green]** すべてのテスト（T002, T006, T010）が通ることを確認
- [x] T013 **[Refactor]** コード構造を最適化

#### テストケース4: グループにメンバーが0人の場合

- [x] T014 **[Red]** テストを書く: グループにメンバーが0人の場合（__tests__/lib/attendance-service.test.ts）
- [x] T015 **[Green]** T014を通すように実装を拡張（lib/attendance-service.ts）
- [x] T016 **[Green]** すべてのテスト（T002, T006, T010, T014）が通ることを確認

#### テストケース5: グループが存在しない場合

- [x] T017 **[Red]** テストを書く: グループが存在しない場合は空配列を返す（__tests__/lib/attendance-service.test.ts）
- [x] T018 **[Green]** T017を通すように実装を拡張（lib/attendance-service.ts）
- [x] T019 **[Green]** すべてのテスト（T002, T006, T010, T014, T017）が通ることを確認

#### テストケース6: 名前順ソート（日本語）

- [x] T020 **[Red]** テストを書く: メンバーが名前の五十音順でソートされる（__tests__/lib/attendance-service.test.ts）
- [x] T021 **[Green]** localeCompare('ja')を使用したソート実装（lib/attendance-service.ts）
- [x] T022 **[Green]** すべてのテスト（T002～T020）が通ることを確認
- [x] T023 **[Refactor]** ソートロジックを整理

#### テストケース7: 名前順ソート（アルファベット）

- [x] T024 **[Red]** テストを書く: メンバーが名前のアルファベット順でソートされる（__tests__/lib/attendance-service.test.ts）
- [x] T025 **[Green]** T024を通すように実装を確認（既存のlocaleCompareで対応）
- [x] T026 **[Green]** すべてのテスト（T002～T024）が通ることを確認

#### テストケース8: 大量データ（パフォーマンステスト）

- [x] T027 **[Red]** テストを書く: 100人のメンバーでもパフォーマンスが許容範囲内（__tests__/lib/attendance-service.test.ts）
- [x] T028 **[Green]** T027を通すように実装を最適化（lib/attendance-service.ts）
- [x] T029 **[Green]** すべてのテスト（T002～T027）が通ることを確認
- [x] T030 **[Refactor]** 最終的なコード整理とドキュメント追加

**Checkpoint**: サービス層が完成。全ユーザーストーリーの実装を並列開始可能。

---

## Phase 3: User Story 1 - グループメンバーの出欠確認 (Priority: P1)

**Goal**: イベント主催者がグループをクリックして、メンバー名と出欠ステータス（◯/△/✗/-）を表示できる。

**Independent Test**: イベント詳細画面でグループ名をクリックし、そのグループのメンバーリストと各自の出欠ステータス（◯/△/✗/-）が表示されることを確認。未登録メンバーも「-」として表示される。

**Value**: これは最も基本的な機能であり、MVP（Minimum Viable Product）として独立して動作可能。

### コンポーネント層: MemberAttendanceList

#### テストケース1: メンバー名とステータスの表示

- [ ] T031 **[Red]** [US1] テストを書く: メンバー名とステータスが表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T032 **[Green]** [US1] MemberAttendanceListコンポーネントの基本実装（components/event-detail/member-attendance-list.tsx）
- [ ] T033 **[Green]** [US1] T031のテストを実行して成功することを確認
- [ ] T034 **[Refactor]** [US1] コンポーネント構造を整理

#### テストケース2: 未登録メンバーの表示

- [ ] T035 **[Red]** [US1] テストを書く: 未登録メンバーが「-（未登録）」と表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T036 **[Green]** [US1] T035を通すように実装を拡張（components/event-detail/member-attendance-list.tsx）
- [ ] T037 **[Green]** [US1] すべてのテスト（T031, T035）が通ることを確認

#### テストケース3: 空の状態メッセージ

- [ ] T038 **[Red]** [US1] テストを書く: メンバーが0人の場合「メンバーがいません」と表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T039 **[Green]** [US1] T038を通すように実装を拡張（components/event-detail/member-attendance-list.tsx）
- [ ] T040 **[Green]** [US1] すべてのテスト（T031, T035, T038）が通ることを確認
- [ ] T041 **[Refactor]** [US1] 条件分岐を整理

### コンポーネント層: GroupAttendanceAccordion

#### テストケース1: アコーディオンの展開/折りたたみ

- [ ] T042 **[Red]** [US1] テストを書く: グループ名をクリックするとメンバーリストが表示される（__tests__/components/event-detail/group-attendance-accordion.test.tsx）
- [ ] T043 **[Green]** [US1] GroupAttendanceAccordionコンポーネントの基本実装（components/event-detail/group-attendance-accordion.tsx）
- [ ] T044 **[Green]** [US1] T042のテストを実行して成功することを確認
- [ ] T045 **[Refactor]** [US1] 状態管理を整理

#### テストケース2: ARIA属性の確認

- [ ] T046 **[Red]** [US1] テストを書く: aria-expanded, aria-controls属性が正しく設定される（__tests__/components/event-detail/group-attendance-accordion.test.tsx）
- [ ] T047 **[Green]** [US1] ARIA属性を追加（components/event-detail/group-attendance-accordion.tsx）
- [ ] T048 **[Green]** [US1] すべてのテスト（T042, T046）が通ることを確認

#### テストケース3: キーボード操作（Enter/Space）

- [ ] T049 **[Red]** [US1] テストを書く: EnterキーまたはSpaceキーでアコーディオンが操作できる（__tests__/components/event-detail/group-attendance-accordion.test.tsx）
- [ ] T050 **[Green]** [US1] キーボードイベントハンドラを実装（components/event-detail/group-attendance-accordion.tsx）
- [ ] T051 **[Green]** [US1] すべてのテスト（T042, T046, T049）が通ることを確認
- [ ] T052 **[Refactor]** [US1] イベントハンドラを整理

### 統合: イベント詳細ページ

- [ ] T053 [US1] イベント詳細ページにGroupAttendanceAccordionを統合（app/[org]/events/[id]/page.tsx）
- [ ] T054 [US1] expandedGroups状態を管理するuseStateを追加（app/[org]/events/[id]/page.tsx）
- [ ] T055 [US1] getGroupMemberAttendances()を呼び出してデータを取得（app/[org]/events/[id]/page.tsx）
- [ ] T056 [US1] 手動テスト: ブラウザでアコーディオンの展開/折りたたみを確認
- [ ] T057 [US1] 手動テスト: メンバー名とステータスが正しく表示されることを確認
- [ ] T058 [US1] 手動テスト: 未登録メンバーが「-」と表示されることを確認

**US1 完了基準**:
- ✅ グループをクリックすると全メンバーが表示される
- ✅ 出欠ステータス（◯/△/✗/-）が正しく表示される
- ✅ キーボード操作で展開/折りたたみ可能
- ✅ すべてのテストがパス

---

## Phase 4: User Story 2 - 特定ステータスのメンバーフィルタリング (Priority: P2)

**Goal**: 参加者のみ、欠席者のみなど、特定の出欠状況のメンバーのみを表示できる。

**Independent Test**: フィルタドロップダウンから「参加のみ」を選択し、◯ステータスのメンバーのみが表示されることを確認。

**Value**: US1に依存するが、US1が完了していれば独立して実装・テスト可能。

**Dependencies**: US1完了後に開始可能

### コンポーネント層: AttendanceFilters（フィルタ部分）

#### テストケース1: フィルタドロップダウンの表示

- [ ] T059 **[Red]** [US2] テストを書く: フィルタドロップダウンが表示され、選択肢が正しい（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T060 **[Green]** [US2] AttendanceFiltersコンポーネントの基本実装（フィルタ部分のみ）（components/event-detail/attendance-filters.tsx）
- [ ] T061 **[Green]** [US2] T059のテストを実行して成功することを確認
- [ ] T062 **[Refactor]** [US2] セレクト要素を整理

#### テストケース2: フィルタ選択時のコールバック

- [ ] T063 **[Red]** [US2] テストを書く: フィルタを選択するとonFilterChange()が呼ばれる（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T064 **[Green]** [US2] onFilterChangeコールバックを実装（components/event-detail/attendance-filters.tsx）
- [ ] T065 **[Green]** [US2] すべてのテスト（T059, T063）が通ることを確認

### フィルタロジック: MemberAttendanceList

#### テストケース3: 参加のみフィルタ

- [ ] T066 **[Red]** [US2] テストを書く: filterStatus='attending'の場合、◯ステータスのメンバーのみ表示（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T067 **[Green]** [US2] フィルタロジックをMemberAttendanceListに実装（components/event-detail/member-attendance-list.tsx）
- [ ] T068 **[Green]** [US2] T066のテストを実行して成功することを確認

#### テストケース4: 未定のみフィルタ

- [ ] T069 **[Red]** [US2] テストを書く: filterStatus='maybe'の場合、△ステータスのメンバーのみ表示（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T070 **[Green]** [US2] T069を通すように実装を拡張（components/event-detail/member-attendance-list.tsx）
- [ ] T071 **[Green]** [US2] すべてのテスト（T066, T069）が通ることを確認

#### テストケース5: 欠席のみフィルタ

- [ ] T072 **[Red]** [US2] テストを書く: filterStatus='notAttending'の場合、✗ステータスのメンバーのみ表示（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T073 **[Green]** [US2] T072を通すように実装を拡張（components/event-detail/member-attendance-list.tsx）
- [ ] T074 **[Green]** [US2] すべてのテスト（T066, T069, T072）が通ることを確認

#### テストケース6: 未登録のみフィルタ

- [ ] T075 **[Red]** [US2] テストを書く: filterStatus='unregistered'の場合、status=nullのメンバーのみ表示（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T076 **[Green]** [US2] T075を通すように実装を拡張（components/event-detail/member-attendance-list.tsx）
- [ ] T077 **[Green]** [US2] すべてのテスト（T066, T069, T072, T075）が通ることを確認
- [ ] T078 **[Refactor]** [US2] フィルタロジックを整理

#### テストケース7: フィルタ適用で0件の場合のメッセージ

- [ ] T079 **[Red]** [US2] テストを書く: フィルタ適用で表示メンバーが0件の場合、適切なメッセージが表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T080 **[Green]** [US2] 空の状態メッセージを実装（components/event-detail/member-attendance-list.tsx）
- [ ] T081 **[Green]** [US2] すべてのテスト（T066～T079）が通ることを確認

### 統合: イベント詳細ページ

- [ ] T082 [US2] AttendanceFiltersコンポーネントをイベント詳細ページに追加（app/[org]/events/[id]/page.tsx）
- [ ] T083 [US2] filterStatus状態を管理するuseStateを追加（app/[org]/events/[id]/page.tsx）
- [ ] T084 [US2] MemberAttendanceListにfilterStatusを渡す（app/[org]/events/[id]/page.tsx）
- [ ] T085 [US2] 手動テスト: フィルタドロップダウンで「参加のみ」を選択し、◯のみ表示されることを確認
- [ ] T086 [US2] 手動テスト: すべてのフィルタオプション（△/✗/-）が正しく動作することを確認

**US2 完了基準**:
- ✅ フィルタドロップダウンが表示される
- ✅ 各フィルタ（すべて/参加/未定/欠席/未登録）が正しく動作
- ✅ フィルタ適用で0件の場合、適切なメッセージが表示される
- ✅ すべてのテストがパス

---

## Phase 5: User Story 3 - メンバーのソート (Priority: P3)

**Goal**: メンバーリストを名前順またはステータス順で並び替えできる。

**Independent Test**: ソート切り替えボタンをクリックし、名前順（五十音順/アルファベット順）とステータス順（◯→△→✗→-）で並び順が変わることを確認。

**Value**: US1に依存するが、US1が完了していれば独立して実装・テスト可能。

**Dependencies**: US1完了後に開始可能

### コンポーネント層: AttendanceFilters（ソート部分）

#### テストケース1: ソートボタンの表示

- [ ] T087 **[Red]** [US3] テストを書く: ソート切り替えボタンが表示される（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T088 **[Green]** [US3] ソート部分をAttendanceFiltersに追加（components/event-detail/attendance-filters.tsx）
- [ ] T089 **[Green]** [US3] T087のテストを実行して成功することを確認

#### テストケース2: ソート選択時のコールバック

- [ ] T090 **[Red]** [US3] テストを書く: ソートを変更するとonSortChange()が呼ばれる（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T091 **[Green]** [US3] onSortChangeコールバックを実装（components/event-detail/attendance-filters.tsx）
- [ ] T092 **[Green]** [US3] すべてのテスト（T087, T090）が通ることを確認

### ソートロジック: MemberAttendanceList

#### テストケース3: 名前順ソート

- [ ] T093 **[Red]** [US3] テストを書く: sortBy='name'の場合、メンバーが名前の昇順で表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T094 **[Green]** [US3] 名前順ソートロジックを実装（components/event-detail/member-attendance-list.tsx）
- [ ] T095 **[Green]** [US3] T093のテストを実行して成功することを確認

#### テストケース4: ステータス順ソート

- [ ] T096 **[Red]** [US3] テストを書く: sortBy='status'の場合、メンバーが◯→△→✗→-の順で表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T097 **[Green]** [US3] ステータス順ソートロジックを実装（components/event-detail/member-attendance-list.tsx）
- [ ] T098 **[Green]** [US3] すべてのテスト（T093, T096）が通ることを確認
- [ ] T099 **[Refactor]** [US3] ソートロジックを整理

#### テストケース5: フィルタ後のソート適用

- [ ] T100 **[Red]** [US3] テストを書く: フィルタ適用後もソートが正しく適用される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T101 **[Green]** [US3] フィルタとソートの組み合わせを確認（components/event-detail/member-attendance-list.tsx）
- [ ] T102 **[Green]** [US3] すべてのテスト（T093～T100）が通ることを確認

### 統合: イベント詳細ページ

- [ ] T103 [US3] sortBy状態を管理するuseStateを追加（app/[org]/events/[id]/page.tsx）
- [ ] T104 [US3] MemberAttendanceListにsortByを渡す（app/[org]/events/[id]/page.tsx）
- [ ] T105 [US3] 手動テスト: ソートボタンで名前順に変更し、五十音順/アルファベット順になることを確認
- [ ] T106 [US3] 手動テスト: ソートボタンでステータス順に変更し、◯→△→✗→-の順になることを確認
- [ ] T107 [US3] 手動テスト: フィルタとソートの組み合わせが正しく動作することを確認

**US3 完了基準**:
- ✅ ソート切り替えボタンが表示される
- ✅ 名前順ソート（五十音順/アルファベット順）が動作
- ✅ ステータス順ソート（◯→△→✗→-）が動作
- ✅ フィルタとソートの組み合わせが正しく動作
- ✅ すべてのテストがパス

---

## Phase 6: User Story 4 - メンバー名検索 (Priority: P3)

**Goal**: 検索ボックスで特定のメンバーを素早く見つけられる。

**Independent Test**: 検索ボックスにメンバー名の一部を入力し、該当するメンバーのみが全グループを横断して表示されることを確認。

**Value**: US1に依存するが、US1が完了していれば独立して実装・テスト可能。

**Dependencies**: US1完了後に開始可能

### コンポーネント層: AttendanceFilters（検索部分）

#### テストケース1: 検索ボックスの表示

- [ ] T108 **[Red]** [US4] テストを書く: 検索ボックスが表示される（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T109 **[Green]** [US4] 検索ボックスをAttendanceFiltersに追加（components/event-detail/attendance-filters.tsx）
- [ ] T110 **[Green]** [US4] T108のテストを実行して成功することを確認

#### テストケース2: 検索文字列変更時のコールバック

- [ ] T111 **[Red]** [US4] テストを書く: 検索ボックスに入力するとonSearchChange()が呼ばれる（__tests__/components/event-detail/attendance-filters.test.tsx）
- [ ] T112 **[Green]** [US4] onSearchChangeコールバックを実装（components/event-detail/attendance-filters.tsx）
- [ ] T113 **[Green]** [US4] すべてのテスト（T108, T111）が通ることを確認

### 検索ロジック: MemberAttendanceList

#### テストケース3: 部分一致検索

- [ ] T114 **[Red]** [US4] テストを書く: searchQueryに「田中」と入力すると、名前に「田中」を含むメンバーのみ表示（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T115 **[Green]** [US4] 検索ロジックを実装（components/event-detail/member-attendance-list.tsx）
- [ ] T116 **[Green]** [US4] T114のテストを実行して成功することを確認

#### テストケース4: 大文字小文字区別なし

- [ ] T117 **[Red]** [US4] テストを書く: 検索は大文字小文字を区別しない（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T118 **[Green]** [US4] toLowerCase()で正規化（components/event-detail/member-attendance-list.tsx）
- [ ] T119 **[Green]** [US4] すべてのテスト（T114, T117）が通ることを確認

#### テストケース5: 検索結果が0件の場合

- [ ] T120 **[Red]** [US4] テストを書く: 検索結果が0件の場合、適切なメッセージが表示される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T121 **[Green]** [US4] 空の状態メッセージを実装（components/event-detail/member-attendance-list.tsx）
- [ ] T122 **[Green]** [US4] すべてのテスト（T114, T117, T120）が通ることを確認
- [ ] T123 **[Refactor]** [US4] 検索ロジックを整理

#### テストケース6: 検索とフィルタ・ソートの組み合わせ

- [ ] T124 **[Red]** [US4] テストを書く: 検索結果にフィルタとソートが適用される（__tests__/components/event-detail/member-attendance-list.test.tsx）
- [ ] T125 **[Green]** [US4] 検索→フィルタ→ソートの順で適用されることを確認（components/event-detail/member-attendance-list.tsx）
- [ ] T126 **[Green]** [US4] すべてのテスト（T114～T124）が通ることを確認

### パフォーマンス最適化: useMemoでメモ化

- [ ] T127 [US4] useMemoを使用してフィルタ/ソート/検索結果をメモ化（components/event-detail/member-attendance-list.tsx）
- [ ] T128 [US4] 依存配列が正しく設定されていることを確認（components/event-detail/member-attendance-list.tsx）

### 統合: イベント詳細ページ

- [ ] T129 [US4] searchQuery状態を管理するuseStateを追加（app/[org]/events/[id]/page.tsx）
- [ ] T130 [US4] MemberAttendanceListにsearchQueryを渡す（app/[org]/events/[id]/page.tsx）
- [ ] T131 [US4] 手動テスト: 検索ボックスに「田中」と入力し、該当メンバーのみ表示されることを確認
- [ ] T132 [US4] 手動テスト: 検索文字列を変更し、リアルタイムで結果が更新されることを確認
- [ ] T133 [US4] 手動テスト: 検索をクリアすると全メンバーが表示されることを確認
- [ ] T134 [US4] 手動テスト: 検索とフィルタ・ソートの組み合わせが正しく動作することを確認

**US4 完了基準**:
- ✅ 検索ボックスが表示される
- ✅ 部分一致検索が動作（大文字小文字区別なし）
- ✅ 検索結果が0件の場合、適切なメッセージが表示される
- ✅ 検索とフィルタ・ソートの組み合わせが動作
- ✅ リアルタイムで検索結果が更新される
- ✅ すべてのテストがパス

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 最終的な統合、パフォーマンス確認、ドキュメント更新

### パフォーマンステスト

- [ ] T135 100人のモックデータを作成してパフォーマンステストを実行
- [ ] T136 アコーディオン展開が1秒以内に完了することを確認
- [ ] T137 フィルタ/ソート/検索が200ms以内に完了することを確認

### アクセシビリティ確認

- [ ] T138 キーボードナビゲーション（Tab、Enter、Space）をすべてのコンポーネントで確認
- [ ] T139 ARIA属性（aria-expanded, aria-controls）が正しく設定されていることを確認
- [ ] T140 フォーカス表示が明確であることを確認

### レスポンシブデザイン確認

- [ ] T141 モバイル（320px）でUIが正しく表示されることを確認
- [ ] T142 タブレット（768px）でUIが正しく表示されることを確認
- [ ] T143 デスクトップ（1024px以上）でUIが正しく表示されることを確認

### 統合テスト

- [ ] T144 イベント詳細ページ全体の統合テストを実行（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T145 すべてのユーザーストーリーの受け入れシナリオが満たされることを確認

### ドキュメント更新

- [ ] T146 README.mdを更新（新機能の追加、テスト数の更新、最終更新日）
- [ ] T147 SPECIFICATION.mdを更新（機能一覧、データモデル、UI/UX仕様、テスト仕様、変更履歴）
- [ ] T148 CLAUDE.mdの「最近の変更」セクションを更新

### コード品質

- [ ] T149 ESLintを実行してエラーがないことを確認（npm run lint）
- [ ] T150 TypeScript型チェックを実行してエラーがないことを確認（npx tsc --noEmit）
- [ ] T151 すべてのテストを実行してパスすることを確認（npm test）
- [ ] T152 プロダクションビルドを実行して成功することを確認（npm run build）

---

## Dependencies & Parallel Execution

### User Story Dependencies（ストーリー間の依存関係）

```
Phase 1 (Setup) → Phase 2 (Foundational)
                      ↓
                 Phase 3 (US1) ← MVP
                      ↓
    ┌─────────────────┼─────────────────┐
    ↓                 ↓                 ↓
Phase 4 (US2)    Phase 5 (US3)    Phase 6 (US4)
    └─────────────────┼─────────────────┘
                      ↓
                 Phase 7 (Polish)
```

**重要**: Phase 2完了後、US1の実装が必須。US1完了後、US2/US3/US4は並列実装可能。

### Parallel Execution Opportunities（並列実行の機会）

#### Phase 2（Foundational）
- テストケース1～8は順次実行（各テストが前のテストに依存）

#### Phase 3（US1）
- T031-T041（MemberAttendanceList）と T042-T052（GroupAttendanceAccordion）は並列実行可能
- T053-T058（統合）は上記2つ完了後

#### Phase 4（US2）
- US1完了後に開始
- T059-T065（AttendanceFilters）と T066-T081（MemberAttendanceList）は並列実行可能

#### Phase 5（US3）
- US1完了後に開始（US2と並列実行可能）
- T087-T092（AttendanceFilters）と T093-T102（MemberAttendanceList）は並列実行可能

#### Phase 6（US4）
- US1完了後に開始（US2, US3と並列実行可能）
- T108-T113（AttendanceFilters）と T114-T126（MemberAttendanceList）は並列実行可能

#### Phase 7（Polish）
- US1～US4すべて完了後に開始
- T135-T143（各種確認）は並列実行可能

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**MVP Scope**: User Story 1のみ
- グループをクリックすると個人の出欠状況が表示される
- 基本的な閲覧機能として独立して価値を提供

**MVP Timeline**: T001～T058（58タスク）

### Incremental Delivery

1. **Iteration 1** (MVP): US1 - グループメンバーの出欠確認
2. **Iteration 2**: US2 - フィルタリング
3. **Iteration 3**: US3 + US4 - ソートと検索（並列実装可能）
4. **Iteration 4**: Phase 7 - Polish

### Testing Strategy

- **TDD厳守**: すべてのコードはテストファーストで実装
- **Red-Green-Refactor**: 各テストケースごとに実施
- **独立性**: 各ユーザーストーリーは独立してテスト可能
- **カバレッジ目標**: 全体70%以上、ビジネスロジック80%以上

---

## Summary

- **Total Tasks**: 152タスク
- **Phases**: 7フェーズ
- **User Stories**: 4ストーリー（US1: P1, US2: P2, US3: P3, US4: P3）
- **MVP**: US1のみ（58タスク）
- **Parallel Opportunities**: US2/US3/US4は並列実装可能
- **TDD Approach**: すべてのコードでRed-Green-Refactorサイクルを実施
- **Independent Testing**: 各ユーザーストーリーは独立してテスト可能

---

## Next Steps

1. **Phase 1**: T001を実行して型定義を追加
2. **Phase 2**: T002から順次TDDサイクルでgetGroupMemberAttendances()を実装
3. **Phase 3**: US1の実装（MVP完成）
4. **Phase 4-6**: US2/US3/US4を並列実装
5. **Phase 7**: 最終的なPolishとドキュメント更新

すべてのタスクがチェックボックス形式で記載されているため、進捗管理が容易です。TDD原則に従い、テストファーストで安全かつ確実に実装を進めてください。
