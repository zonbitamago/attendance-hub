# タスク一覧: マルチテナント団体対応

**入力**: `/specs/005-multi-tenant/` の設計ドキュメント
**前提条件**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**TDD原則（t-wada方式）**: このプロジェクトは厳格なTDD原則に従います：

1. **小さなステップ**: 1度に1つのテストケースに集中
2. **Red-Green-Refactor**: 各テストケースごとに：
   - **[Red]**: 失敗するテストを1つ書く
   - **[Green]**: そのテストを通す最小限のコードを書く
   - **[Refactor]**: テストを通したままコードを改善
3. **テストファースト**: 実装の前に必ずテストを書く
4. **テストの独立性**: 各テストは他のテストに依存してはならない

**構成**: タスクはユーザーストーリー別にグループ化され、各ストーリーを独立して実装・テスト可能にしています。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2, US3, US4, US5）
- 説明には正確なファイルパスを含める

---

## フェーズ1: セットアップ（共通インフラ）

**目的**: プロジェクトの初期化と基本構造

- [x] T001 nanoid依存関係をインストール（`npm install nanoid`）
- [x] T002 tsconfig.jsonでTypeScript strict modeが有効化されていることを確認
- [x] T003 Reactコンテキスト用のcontexts/ディレクトリを作成
- [x] T004 ブランチ005-multi-tenantを作成し、gitステータスがクリーンであることを確認

---

## フェーズ2: 基盤（必須の前提条件）

**目的**: すべてのユーザーストーリーの実装前に完了必須のコアインフラ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません

### データモデル更新（型定義）

- [x] T005 [P] types/index.tsにOrganizationインターフェースを追加（id, name, description?, createdAt）
- [x] T006 [P] types/index.tsのEventDateインターフェースにorganizationIdフィールドを追加
- [x] T007 [P] types/index.tsのGroupインターフェースにorganizationIdフィールドを追加
- [x] T008 [P] types/index.tsのMemberインターフェースにorganizationIdフィールドを追加
- [x] T009 [P] types/index.tsのAttendanceインターフェースにorganizationIdフィールドを追加
- [x] T010 [P] types/index.tsにCreateOrganizationInputとUpdateOrganizationInput型を追加

### バリデーションスキーマ更新

#### テストケース1: OrganizationSchemaの検証

- [ ] T011 **[Red]** [基盤] テスト記述: OrganizationSchemaが有効な団体データを検証（__tests__/lib/validation.test.ts）
- [ ] T012 **[Green]** [基盤] lib/validation.tsにOrganizationSchemaを追加（name: 1-100文字、description: 0-500文字オプション）
- [ ] T013 **[Green]** [基盤] バリデーションテストを実行してT011が通ることを確認
- [ ] T014 **[Refactor]** [基盤] 必要に応じてバリデーションスキーマ構造をクリーンアップ

#### テストケース2: CreateOrganizationInputSchemaの検証

- [ ] T015 **[Red]** [基盤] テスト記述: CreateOrganizationInputSchemaが入力を検証（__tests__/lib/validation.test.ts）
- [ ] T016 **[Green]** [基盤] lib/validation.tsにCreateOrganizationInputSchemaを追加
- [ ] T017 **[Green]** [基盤] バリデーションテストを実行してT015が通ることを確認
- [ ] T018 **[Refactor]** [基盤] スキーマ定義を最適化

#### テストケース3: UpdateOrganizationInputSchemaの検証

- [ ] T019 **[Red]** [基盤] テスト記述: UpdateOrganizationInputSchemaが少なくとも1つのフィールドを要求（__tests__/lib/validation.test.ts）
- [ ] T020 **[Green]** [基盤] lib/validation.tsにrefinementを含むUpdateOrganizationInputSchemaを追加
- [ ] T021 **[Green]** [基盤] バリデーションテストを実行してT019が通ることを確認
- [ ] T022 **[Refactor]** [基盤] すべてのバリデーションスキーマをレビューしてクリーンアップ

### ストレージ層更新

#### テストケース1: loadOrganizationsがデータなしで空配列を返す

- [ ] T023 **[Red]** [基盤] テスト記述: loadOrganizationsがデータなしで[]を返す（__tests__/lib/storage.test.ts）
- [ ] T024 **[Green]** [基盤] lib/storage.tsにSTORAGE_KEYS.ORGANIZATIONSを追加
- [ ] T025 **[Green]** [基盤] lib/storage.tsにloadOrganizations()を実装
- [ ] T026 **[Green]** [基盤] ストレージテストを実行してT023が通ることを確認
- [ ] T027 **[Refactor]** [基盤] ストレージキー構造をクリーンアップ

#### テストケース2: saveOrganizationsがlocalStorageにデータを永続化

- [ ] T028 **[Red]** [基盤] テスト記述: saveOrganizationsがlocalStorageに永続化（__tests__/lib/storage.test.ts）
- [ ] T029 **[Green]** [基盤] lib/storage.tsにsaveOrganizations(organizations)を実装
- [ ] T030 **[Green]** [基盤] ストレージテストを実行してT028が通ることを確認
- [ ] T031 **[Refactor]** [基盤] 必要に応じてJSONシリアライゼーションを最適化

#### テストケース3: イベント日付の団体スコープキー

- [ ] T032 **[Red]** [基盤] テスト記述: loadEventDates(orgId)がorgIdの正しいデータを返す（__tests__/lib/storage.test.ts）
- [ ] T033 **[Green]** [基盤] lib/storage.tsのSTORAGE_KEYS.EVENT_DATESをorgIdを受け取る関数に更新
- [ ] T034 **[Green]** [基盤] lib/storage.tsのloadEventDates(organizationId: string)シグネチャを更新
- [ ] T035 **[Green]** [基盤] lib/storage.tsのsaveEventDates(organizationId: string, eventDates: EventDate[])を更新
- [ ] T036 **[Green]** [基盤] ストレージテストを実行してT032が通ることを確認
- [ ] T037 **[Refactor]** [基盤] orgIdパラメータの命名が一貫していることを確認

#### テストケース4: グループの団体スコープキー

- [ ] T038 **[Red]** [基盤] テスト記述: loadGroups(orgId)がorgIdでデータを分離（__tests__/lib/storage.test.ts）
- [ ] T039 **[Green]** [基盤] lib/storage.tsのSTORAGE_KEYS.GROUPSをorgIdを受け取る関数に更新
- [ ] T040 **[Green]** [基盤] lib/storage.tsのloadGroups(organizationId: string)とsaveGroups(organizationId: string, groups: Group[])を更新
- [ ] T041 **[Green]** [基盤] ストレージテストを実行してT038が通ることを確認
- [ ] T042 **[Refactor]** [基盤] 重複コードパターンをクリーンアップ

#### テストケース5: メンバーの団体スコープキー

- [ ] T043 **[Red]** [基盤] テスト記述: loadMembers(orgId)がorgIdでデータを分離（__tests__/lib/storage.test.ts）
- [ ] T044 **[Green]** [基盤] lib/storage.tsのSTORAGE_KEYS.MEMBERSをorgIdを受け取る関数に更新
- [ ] T045 **[Green]** [基盤] lib/storage.tsのloadMembers(organizationId: string)とsaveMembers(organizationId: string, members: Member[])を更新
- [ ] T046 **[Green]** [基盤] ストレージテストを実行してT043が通ることを確認
- [ ] T047 **[Refactor]** [基盤] 共通ストレージパターンを統合

#### テストケース6: 出欠記録の団体スコープキー

- [ ] T048 **[Red]** [基盤] テスト記述: loadAttendances(orgId)がorgIdでデータを分離（__tests__/lib/storage.test.ts）
- [ ] T049 **[Green]** [基盤] lib/storage.tsのSTORAGE_KEYS.ATTENDANCESをorgIdを受け取る関数に更新
- [ ] T050 **[Green]** [基盤] lib/storage.tsのloadAttendances(organizationId: string)とsaveAttendances(organizationId: string, attendances: Attendance[])を更新
- [ ] T051 **[Green]** [基盤] ストレージテストを実行してT048が通ることを確認
- [ ] T052 **[Refactor]** [基盤] storage.tsの最終クリーンアップ

#### テストケース7: clearOrganizationDataが特定団体のすべてのデータを削除

- [ ] T053 **[Red]** [基盤] テスト記述: clearOrganizationDataが特定団体のデータのみ削除、他は残す（__tests__/lib/storage.test.ts）
- [ ] T054 **[Green]** [基盤] lib/storage.tsにclearOrganizationData(organizationId: string)を実装
- [ ] T055 **[Green]** [基盤] ストレージテストを実行してT053が通ることを確認
- [ ] T056 **[Refactor]** [基盤] clearOrganizationData実装を最適化

#### テストケース8: clearAllDataがすべてのattendance-hubデータを削除

- [ ] T057 **[Red]** [基盤] テスト記述: clearAllDataがすべてのattendance_*キーを削除（__tests__/lib/storage.test.ts）
- [ ] T058 **[Green]** [基盤] lib/storage.tsのclearAllData()をすべてのattendance-hubキー削除に更新
- [ ] T059 **[Green]** [基盤] ストレージテストを実行してT057が通ることを確認
- [ ] T060 **[Refactor]** [基盤] すべてのストレージ関数をレビューして最終化

**チェックポイント**: 基盤準備完了 - ユーザーストーリー実装を並列開始可能

---

## フェーズ3: ユーザーストーリー1 - 団体の作成と初期設定 (優先度: P1) 🎯 MVP

**ゴール**: 管理者は新しい団体を作成し、その団体専用の出欠管理システムを開始できる。各団体には自動的にランダムなIDが発行され、そのIDを含むURLで団体にアクセスできる。

**独立テスト**: トップページで団体を新規作成し、自動発行されたURLにアクセスして団体名が表示されることを確認する。

### Organization Service実装

#### テストケース1: createOrganizationが一意なIDを生成

- [ ] T061 **[Red]** [US1] テスト記述: createOrganizationが10文字のnanoidを生成（__tests__/lib/organization-service.test.ts）
- [ ] T062 **[Green]** [US1] nanoidを使用したgenerateOrganizationId()でlib/organization-service.tsを作成
- [ ] T063 **[Green]** [US1] lib/organization-service.tsにcreateOrganization(input: CreateOrganizationInput): Organizationを実装
- [ ] T064 **[Green]** [US1] organization-serviceテストを実行してT061が通ることを確認
- [ ] T065 **[Refactor]** [US1] organization-service.ts構造をクリーンアップ

#### テストケース2: createOrganizationが入力を検証

- [ ] T066 **[Red]** [US1] テスト記述: createOrganizationが無効な名前でエラーをスロー（__tests__/lib/organization-service.test.ts）
- [ ] T067 **[Green]** [US1] createOrganizationにCreateOrganizationInputSchemaを使用した入力検証を追加
- [ ] T068 **[Green]** [US1] テストを実行してT066が通ることを確認
- [ ] T069 **[Refactor]** [US1] 検証エラーメッセージを最適化

#### テストケース3: createOrganizationがlocalStorageに保存

- [ ] T070 **[Red]** [US1] テスト記述: createOrganizationがlocalStorageに永続化（__tests__/lib/organization-service.test.ts）
- [ ] T071 **[Green]** [US1] createOrganization実装にsaveOrganizations呼び出しを追加
- [ ] T072 **[Green]** [US1] テストを実行してT070が通ることを確認
- [ ] T073 **[Refactor]** [US1] createOrganization実装をレビュー

#### テストケース4: getAllOrganizationsがソート済みリストを返す

- [ ] T074 **[Red]** [US1] テスト記述: getAllOrganizationsがcreatedAt降順でソートされた団体を返す（__tests__/lib/organization-service.test.ts）
- [ ] T075 **[Green]** [US1] lib/organization-service.tsにgetAllOrganizations(): Organization[]を実装
- [ ] T076 **[Green]** [US1] テストを実行してT074が通ることを確認
- [ ] T077 **[Refactor]** [US1] ソートロジックを最適化

#### テストケース5: getOrganizationByIdが正しい団体またはnullを返す

- [ ] T078 **[Red]** [US1] テスト記述: getOrganizationByIdが有効なidで団体、それ以外でnullを返す（__tests__/lib/organization-service.test.ts）
- [ ] T079 **[Green]** [US1] lib/organization-service.tsにgetOrganizationById(id: string): Organization | nullを実装
- [ ] T080 **[Green]** [US1] テストを実行してT078が通ることを確認
- [ ] T081 **[Refactor]** [US1] getOrganizationById実装をクリーンアップ

### Organization Context実装

#### テストケース1: OrganizationProviderが団体コンテキストを提供

- [ ] T082 **[Red]** [US1] テスト記述: useOrganizationがコンテキストから団体を返す（__tests__/contexts/organization-context.test.tsx）
- [ ] T083 **[Green]** [US1] OrganizationContextでcontexts/organization-context.tsxを作成
- [ ] T084 **[Green]** [US1] contexts/organization-context.tsxにOrganizationProviderコンポーネントを実装
- [ ] T085 **[Green]** [US1] contexts/organization-context.tsxにuseOrganizationフックを実装
- [ ] T086 **[Green]** [US1] コンテキストテストを実行してT082が通ることを確認
- [ ] T087 **[Refactor]** [US1] useMemoでコンテキストプロバイダーを最適化

#### テストケース2: useOrganizationが団体未検出時にエラーをスロー

- [ ] T088 **[Red]** [US1] テスト記述: OrganizationProviderが団体未検出を処理（__tests__/contexts/organization-context.test.tsx）
- [ ] T089 **[Green]** [US1] OrganizationProviderに団体未検出時のエラーハンドリングを追加
- [ ] T090 **[Green]** [US1] テストを実行してT088が通ることを確認
- [ ] T091 **[Refactor]** [US1] エラーハンドリングロジックをクリーンアップ

### App Router構造変更

#### テストケース1: [org]レイアウトがOrganizationProviderを提供

- [ ] T092 **[Red]** [US1] テスト記述: [org]レイアウトがOrganizationProviderでレンダリング（__tests__/app/[org]/layout.test.tsx）
- [ ] T093 **[Green]** [US1] OrganizationProviderラッパーでapp/[org]/layout.tsxを作成
- [ ] T094 **[Green]** [US1] app/[org]/layout.tsxにローディングとエラー状態を追加
- [ ] T095 **[Green]** [US1] レイアウトテストを実行してT092が通ることを確認
- [ ] T096 **[Refactor]** [US1] レイアウトコンポーネント構造を最適化

#### テストケース2: 既存page.tsxを[org]/page.tsxに移動

- [ ] T097 **[Green]** [US1] app/page.tsx → app/[org]/page.tsxに移動
- [ ] T098 **[Green]** [US1] app/[org]/page.tsxでインポートを更新しuseOrganizationフックを使用
- [ ] T099 **[Green]** [US1] app/[org]/page.tsxのすべての内部リンクを{org}パラメータを含むよう更新
- [ ] T100 **[Refactor]** [US1] 移動したpage.tsxをクリーンアップ

#### テストケース3: 管理ページをapp/[org]/admin/に移動

- [ ] T101 **[Green]** [US1] app/admin/ → app/[org]/admin/に移動（構造を保持）
- [ ] T102 **[Green]** [US1] すべての管理ページのインポートをuseOrganization使用に更新
- [ ] T103 **[Green]** [US1] 管理ページのすべての内部リンクを{org}を含むよう更新
- [ ] T104 **[Refactor]** [US1] 管理ページのインポートとリンクをクリーンアップ

#### テストケース4: イベントページをapp/[org]/events/に移動

- [ ] T105 **[Green]** [US1] app/events/ → app/[org]/events/に移動（構造を保持）
- [ ] T106 **[Green]** [US1] イベントページのインポートをuseOrganization使用に更新
- [ ] T107 **[Green]** [US1] イベントページのすべての内部リンクを{org}を含むよう更新
- [ ] T108 **[Refactor]** [US1] イベントページのインポートとリンクをクリーンアップ

#### テストケース5: my-registerページをapp/[org]/my-register/に移動

- [ ] T109 **[Green]** [US1] app/my-register/ → app/[org]/my-register/に移動
- [ ] T110 **[Green]** [US1] my-registerページのインポートをuseOrganization使用に更新
- [ ] T111 **[Green]** [US1] my-registerページのすべての内部リンクを{org}を含むよう更新
- [ ] T112 **[Refactor]** [US1] my-registerページをクリーンアップ

### 新しいトップページ実装

#### テストケース1: 新トップページがランディングコンテンツを表示

- [ ] T113 **[Red]** [US1] テスト記述: トップページが説明と作成ボタンを表示（__tests__/app/page.test.tsx）
- [ ] T114 **[Green]** [US1] ランディングページコンテンツで新しいapp/page.tsxを作成
- [ ] T115 **[Green]** [US1] ページテストを実行してT113が通ることを確認
- [ ] T116 **[Refactor]** [US1] ランディングページレイアウトを最適化

#### テストケース2: トップページが団体作成を許可

- [ ] T117 **[Red]** [US1] テスト記述: トップページが団体を作成してリダイレクト（__tests__/app/page.test.tsx）
- [ ] T118 **[Green]** [US1] app/page.tsxに団体作成フォームを追加
- [ ] T119 **[Green]** [US1] createOrganizationを呼び出してリダイレクトするhandleCreateOrganizationを実装
- [ ] T120 **[Green]** [US1] テストを実行してT117が通ることを確認
- [ ] T121 **[Refactor]** [US1] フォーム処理ロジックをクリーンアップ

#### テストケース3: トップページが作成したURLをブックマーク用に表示

- [ ] T122 **[Red]** [US1] テスト記述: 作成後、ユーザーがコピーできるURLを表示（__tests__/app/page.test.tsx）
- [ ] T123 **[Green]** [US1] app/page.tsxの団体作成後にURL表示コンポーネントを追加
- [ ] T124 **[Green]** [US1] テストを実行してT122が通ることを確認
- [ ] T125 **[Refactor]** [US1] URL表示のUXを改善

### UI and Polish

- [ ] T126 **[Refactor]** [US1] 団体作成フォームにTailwind CSSスタイリングを適用（モバイルファースト）
- [ ] T127 **[Refactor]** [US1] アクセシビリティのためにセマンティックHTMLとARIAラベルを追加
- [ ] T128 **[Refactor]** [US1] 入力フィールドが標準スタイリングに従うことを確保（text-gray-900 placeholder:text-gray-400）

**チェックポイント**: ユーザーストーリー1が完全に機能 - ユーザーが団体を作成しURLでアクセス可能

---

## フェーズ4: ユーザーストーリー2 - 団体別データの管理 (優先度: P1)

**ゴール**: 各団体の管理者は、自分の団体専用のグループ、メンバー、イベント、出欠記録を管理できる。他の団体のデータは一切見えず、操作もできない。

**独立テスト**: 2つの異なる団体を作成し、それぞれにグループとメンバーを追加して、他の団体から見えないことを確認する。

### サービス層更新（organizationId対応）

#### テストケース1: group-serviceがorganizationIdを受け取り使用

- [ ] T129 **[Red]** [US2] テスト記述: createGroupがorganizationIdを要求しグループに追加（__tests__/lib/group-service.test.ts）
- [ ] T130 **[Green]** [US2] lib/group-service.tsのcreateGroupシグネチャを第1パラメータとしてorganizationIdを受け取るよう更新
- [ ] T131 **[Green]** [US2] createGroupがgroupオブジェクトにorganizationIdを追加するよう更新
- [ ] T132 **[Green]** [US2] createGroupがsaveGroups(organizationId, groups)を呼び出すよう更新
- [ ] T133 **[Green]** [US2] テストを実行してT129が通ることを確認
- [ ] T134 **[Refactor]** [US2] group-service.tsをクリーンアップ

#### テストケース2: getGroupsByOrganizationが正しくフィルタ

- [ ] T135 **[Red]** [US2] テスト記述: getGroupsByOrganizationが団体のグループのみを返す（__tests__/lib/group-service.test.ts）
- [ ] T136 **[Green]** [US2] lib/group-service.tsのgetGroupsがorganizationIdパラメータを受け取るよう更新
- [ ] T137 **[Green]** [US2] getGroupsがloadGroups(organizationId)を呼び出すよう更新
- [ ] T138 **[Green]** [US2] テストを実行してT135が通ることを確認
- [ ] T139 **[Refactor]** [US2] getGroups実装を最適化

#### テストケース3: updateGroupとdeleteGroupがorganizationIdを使用

- [ ] T140 **[Red]** [US2] テスト記述: updateGroup/deleteGroupがorganizationIdで動作（__tests__/lib/group-service.test.ts）
- [ ] T141 **[Green]** [US2] lib/group-service.tsのupdateGroupとdeleteGroupがorganizationIdを受け取るよう更新
- [ ] T142 **[Green]** [US2] テストを実行してT140が通ることを確認
- [ ] T143 **[Refactor]** [US2] group-service.ts更新を最終化

#### テストケース4: event-serviceがorganizationIdを受け取り使用

- [ ] T144 **[Red]** [US2] テスト記述: createEventDateがorganizationIdを要求（__tests__/lib/event-service.test.ts）
- [ ] T145 **[Green]** [US2] lib/event-service.tsのすべてのevent-service関数がorganizationIdを受け取るよう更新
- [ ] T146 **[Green]** [US2] すべてのevent-service関数が団体スコープストレージを使用するよう更新
- [ ] T147 **[Green]** [US2] テストを実行してT144が通ることを確認
- [ ] T148 **[Refactor]** [US2] event-service.tsをクリーンアップ

#### テストケース5: member-serviceがorganizationIdを受け取り使用

- [ ] T149 **[Red]** [US2] テスト記述: createMemberがorganizationIdを要求（__tests__/lib/member-service.test.ts）
- [ ] T150 **[Green]** [US2] lib/member-service.tsのすべてのmember-service関数がorganizationIdを受け取るよう更新
- [ ] T151 **[Green]** [US2] すべてのmember-service関数が団体スコープストレージを使用するよう更新
- [ ] T152 **[Green]** [US2] テストを実行してT149が通ることを確認
- [ ] T153 **[Refactor]** [US2] member-service.tsをクリーンアップ

#### テストケース6: attendance-serviceがorganizationIdを受け取り使用

- [ ] T154 **[Red]** [US2] テスト記述: registerAttendanceがorganizationIdを要求（__tests__/lib/attendance-service.test.ts）
- [ ] T155 **[Green]** [US2] lib/attendance-service.tsのすべてのattendance-service関数がorganizationIdを受け取るよう更新
- [ ] T156 **[Green]** [US2] すべてのattendance-service関数が団体スコープストレージを使用するよう更新
- [ ] T157 **[Green]** [US2] テストを実行してT154が通ることを確認
- [ ] T158 **[Refactor]** [US2] attendance-service.tsをクリーンアップ

### コンポーネント更新（organizationId prop追加）

#### テストケース1: bulk-registerコンポーネントがorganizationIdを使用

- [ ] T159 **[Red]** [US2] テスト記述: MemberSelectorがorganizationIdを受け取り使用（__tests__/components/bulk-register/member-selector.test.tsx）
- [ ] T160 **[Green]** [US2] components/bulk-register/member-selector.tsxのMemberSelectorにorganizationId propを追加
- [ ] T161 **[Green]** [US2] MemberSelectorがサービス層にorganizationIdを渡すよう更新
- [ ] T162 **[Green]** [US2] テストを実行してT159が通ることを確認
- [ ] T163 **[Refactor]** [US2] MemberSelectorコンポーネントをクリーンアップ

#### テストケース2: EventListがorganizationIdを使用

- [ ] T164 **[Red]** [US2] テスト記述: EventListがorganizationIdを受け取り使用（__tests__/components/bulk-register/event-list.test.tsx）
- [ ] T165 **[Green]** [US2] components/bulk-register/event-list.tsxのEventListにorganizationId propを追加
- [ ] T166 **[Green]** [US2] EventListがサービス層にorganizationIdを渡すよう更新
- [ ] T167 **[Green]** [US2] テストを実行してT164が通ることを確認
- [ ] T168 **[Refactor]** [US2] EventListコンポーネントをクリーンアップ

### ページ更新（useOrganization使用）

#### テストケース1: 管理ページが団体コンテキストを使用

- [ ] T169 **[Red]** [US2] テスト記述: グループページが現在の団体を使用（__tests__/app/[org]/admin/groups/page.test.tsx）
- [ ] T170 **[Green]** [US2] app/[org]/admin/groups/page.tsxをuseOrganizationフック使用に更新
- [ ] T171 **[Green]** [US2] グループページがサービス関数にorganization.idを渡すよう更新
- [ ] T172 **[Green]** [US2] テストを実行してT169が通ることを確認
- [ ] T173 **[Refactor]** [US2] グループページをクリーンアップ

#### テストケース2: イベントページが団体コンテキストを使用

- [ ] T174 **[Red]** [US2] テスト記述: イベント管理ページが現在の団体を使用（__tests__/app/[org]/admin/events/page.test.tsx）
- [ ] T175 **[Green]** [US2] app/[org]/admin/events/page.tsxをorganization.id使用に更新
- [ ] T176 **[Green]** [US2] テストを実行してT174が通ることを確認
- [ ] T177 **[Refactor]** [US2] イベント管理ページをクリーンアップ

#### テストケース3: イベント詳細ページが団体コンテキストを使用

- [ ] T178 **[Red]** [US2] テスト記述: イベント詳細ページが現在の団体を使用（__tests__/app/[org]/events/[id]/page.test.tsx）
- [ ] T179 **[Green]** [US2] app/[org]/events/[id]/page.tsxをorganization.id使用に更新
- [ ] T180 **[Green]** [US2] テストを実行してT178が通ることを確認
- [ ] T181 **[Refactor]** [US2] イベント詳細ページをクリーンアップ

#### テストケース4: My-registerページが団体コンテキストを使用

- [ ] T182 **[Red]** [US2] テスト記述: My-registerページが現在の団体を使用（__tests__/app/[org]/my-register/page.test.tsx）
- [ ] T183 **[Green]** [US2] app/[org]/my-register/page.tsxをコンポーネントにorganization.idを渡すよう更新
- [ ] T184 **[Green]** [US2] テストを実行してT182が通ることを確認
- [ ] T185 **[Refactor]** [US2] my-registerページをクリーンアップ

### データ分離の検証

#### テストケース1: 複数団体のデータが分離されている

- [ ] T186 **[Red]** [US2] 統合テスト記述: 2団体作成、各々にデータ追加、分離を検証（__tests__/integration/data-isolation.test.ts）
- [ ] T187 **[Green]** [US2] 統合テストを実行してデータ分離が動作することを検証
- [ ] T188 **[Refactor]** [US2] データ分離エッジケーステストを追加

**チェックポイント**: ユーザーストーリー2完了 - 団体間でデータが完全に分離

---

## フェーズ5: ユーザーストーリー3 - 団体設定の編集と削除 (優先度: P2)

**ゴール**: 団体の管理者は、団体名や説明を編集したり、団体全体を削除したりできる。削除時には全ての関連データ（グループ、メンバー、イベント、出欠記録）も削除される。

**独立テスト**: 団体を作成し、データを追加した後、団体設定で名前を変更し、最後に団体を削除して全データが消えることを確認する。

### Organization Service拡張

#### テストケース1: updateOrganizationが名前と説明を更新

- [ ] T189 **[Red]** [US3] テスト記述: updateOrganizationが団体フィールドを更新（__tests__/lib/organization-service.test.ts）
- [ ] T190 **[Green]** [US3] lib/organization-service.tsにupdateOrganization(id: string, input: UpdateOrganizationInput)を実装
- [ ] T191 **[Green]** [US3] UpdateOrganizationInputSchemaを使用した検証を追加
- [ ] T192 **[Green]** [US3] テストを実行してT189が通ることを確認
- [ ] T193 **[Refactor]** [US3] updateOrganization実装をクリーンアップ

#### テストケース2: updateOrganizationが未知の団体でエラーをスロー

- [ ] T194 **[Red]** [US3] テスト記述: updateOrganizationが存在しないidでスロー（__tests__/lib/organization-service.test.ts）
- [ ] T195 **[Green]** [US3] updateOrganizationにエラーハンドリングを追加
- [ ] T196 **[Green]** [US3] テストを実行してT194が通ることを確認
- [ ] T197 **[Refactor]** [US3] エラーメッセージを最適化

#### テストケース3: deleteOrganizationがリストから団体を削除

- [ ] T198 **[Red]** [US3] テスト記述: deleteOrganizationがリストから団体を削除（__tests__/lib/organization-service.test.ts）
- [ ] T199 **[Green]** [US3] lib/organization-service.tsにdeleteOrganization(id: string)を実装
- [ ] T200 **[Green]** [US3] 存在しない団体のエラーハンドリングを追加
- [ ] T201 **[Green]** [US3] テストを実行してT198が通ることを確認
- [ ] T202 **[Refactor]** [US3] deleteOrganizationをクリーンアップ

#### テストケース4: deleteOrganizationがclearOrganizationDataを呼び出す（カスケード）

- [ ] T203 **[Red]** [US3] テスト記述: deleteOrganizationがclearOrganizationDataを呼び出す（__tests__/lib/organization-service.test.ts）
- [ ] T204 **[Green]** [US3] deleteOrganizationにclearOrganizationData呼び出しを追加
- [ ] T205 **[Green]** [US3] テストを実行してT203が通ることを確認（カスケード削除）
- [ ] T206 **[Refactor]** [US3] deleteOrganization実装を最終化

### 団体設定ページ実装

#### テストケース1: 団体管理ページが団体情報を表示

- [ ] T207 **[Red]** [US3] テスト記述: 団体ページが現在の団体情報を表示（__tests__/app/[org]/admin/organizations/page.test.tsx）
- [ ] T208 **[Green]** [US3] app/[org]/admin/organizations/page.tsxを作成
- [ ] T209 **[Green]** [US3] useOrganizationを使用して団体名と説明を表示
- [ ] T210 **[Green]** [US3] テストを実行してT207が通ることを確認
- [ ] T211 **[Refactor]** [US3] 団体ページレイアウトをクリーンアップ

#### テストケース2: 団体ページが名前/説明の更新を許可

- [ ] T212 **[Red]** [US3] テスト記述: 団体ページが団体名を更新可能（__tests__/app/[org]/admin/organizations/page.test.tsx）
- [ ] T213 **[Green]** [US3] app/[org]/admin/organizations/page.tsxに団体更新フォームを追加
- [ ] T214 **[Green]** [US3] updateOrganizationを呼び出すhandleUpdateOrganizationを実装
- [ ] T215 **[Green]** [US3] テストを実行してT212が通ることを確認
- [ ] T216 **[Refactor]** [US3] フォーム処理を最適化

#### テストケース3: 団体ページが確認付き削除を許可

- [ ] T217 **[Red]** [US3] テスト記述: 団体ページが削除確認ダイアログを表示（__tests__/app/[org]/admin/organizations/page.test.tsx）
- [ ] T218 **[Green]** [US3] app/[org]/admin/organizations/page.tsxに確認ダイアログ付き削除ボタンを追加
- [ ] T219 **[Green]** [US3] deleteOrganizationを呼び出して/にリダイレクトするhandleDeleteOrganizationを実装
- [ ] T220 **[Green]** [US3] テストを実行してT217が通ることを確認
- [ ] T221 **[Refactor]** [US3] 削除処理ロジックをクリーンアップ

### UI and Polish

- [ ] T222 **[Refactor]** [US3] 団体設定ページにTailwind CSSスタイリングを適用
- [ ] T223 **[Refactor]** [US3] セマンティックHTMLとアクセシビリティ機能を追加
- [ ] T224 **[Refactor]** [US3] 入力フィールドが標準スタイリングガイドラインに従うことを確保

**チェックポイント**: ユーザーストーリー3完了 - 団体の編集と削除が可能

---

## フェーズ6: ユーザーストーリー4 - 既存データの自動マイグレーション (優先度: P1) 🎯 MVP

**ゴール**: 既存のユーザーが初めてマルチテナント版にアクセスした際、現在のデータを「デフォルト団体」として自動的に移行し、データを失わずに継続して使用できる。

**独立テスト**: 旧バージョンのlocalStorageデータを手動で作成し、新バージョンで初回アクセス時に自動的にマイグレーションされることを確認する。

### Migration Module実装

#### テストケース1: hasLegacyDataがレガシーキーを検出

- [ ] T225 **[Red]** [US4] テスト記述: hasLegacyDataがレガシーキー存在時にtrueを返す（__tests__/lib/migration.test.ts）
- [ ] T226 **[Green]** [US4] LEGACY_STORAGE_KEYS定数でlib/migration.tsを作成
- [ ] T227 **[Green]** [US4] lib/migration.tsにhasLegacyData(): booleanを実装
- [ ] T228 **[Green]** [US4] テストを実行してT225が通ることを確認
- [ ] T229 **[Refactor]** [US4] hasLegacyData実装をクリーンアップ

#### テストケース2: isMigrationCompletedがフラグをチェック

- [ ] T230 **[Red]** [US4] テスト記述: isMigrationCompletedがフラグ設定時にtrueを返す（__tests__/lib/migration.test.ts）
- [ ] T231 **[Green]** [US4] lib/migration.tsにisMigrationCompleted(): booleanを実装
- [ ] T232 **[Green]** [US4] テストを実行してT230が通ることを確認
- [ ] T233 **[Refactor]** [US4] フラグチェックを最適化

#### テストケース3: migrateToMultiTenantがレガシーデータなしでfalseを返す

- [ ] T234 **[Red]** [US4] テスト記述: migrateToMultiTenantがレガシーデータなしで{migrated: false}を返す（__tests__/lib/migration.test.ts）
- [ ] T235 **[Green]** [US4] lib/migration.tsにmigrateToMultiTenant(): MigrationResultスケルトンを実装
- [ ] T236 **[Green]** [US4] hasLegacyDataチェックと早期リターンを追加
- [ ] T237 **[Green]** [US4] テストを実行してT234が通ることを確認
- [ ] T238 **[Refactor]** [US4] 早期リターンロジックをクリーンアップ

#### テストケース4: migrateToMultiTenantが完了済みでfalseを返す

- [ ] T239 **[Red]** [US4] テスト記述: migrateToMultiTenantが完了済みならスキップ（__tests__/lib/migration.test.ts）
- [ ] T240 **[Green]** [US4] migrateToMultiTenantにisMigrationCompletedチェックを追加
- [ ] T241 **[Green]** [US4] テストを実行してT239が通ることを確認
- [ ] T242 **[Refactor]** [US4] マイグレーションスキップロジックを最適化

#### テストケース5: migrateToMultiTenantがデフォルト団体を作成

- [ ] T243 **[Red]** [US4] テスト記述: migrateToMultiTenantがnanoidで「マイ団体」を作成（__tests__/lib/migration.test.ts）
- [ ] T244 **[Green]** [US4] migrateToMultiTenantにデフォルト団体作成ロジックを追加
- [ ] T245 **[Green]** [US4] organization-serviceからgenerateOrganizationId()を使用
- [ ] T246 **[Green]** [US4] テストを実行してT243が通ることを確認
- [ ] T247 **[Refactor]** [US4] デフォルト団体作成をクリーンアップ

#### テストケース6: migrateToMultiTenantがイベント日付をマイグレーション

- [ ] T248 **[Red]** [US4] テスト記述: migrateToMultiTenantがイベント日付にorganizationIdを追加（__tests__/lib/migration.test.ts）
- [ ] T249 **[Green]** [US4] イベント日付マイグレーションロジックを追加（レガシー読込、orgId追加、新規保存）
- [ ] T250 **[Green]** [US4] マイグレーション成功後のレガシーキー削除を追加
- [ ] T251 **[Green]** [US4] テストを実行してT248が通ることを確認
- [ ] T252 **[Refactor]** [US4] イベント日付マイグレーションをクリーンアップ

#### テストケース7: migrateToMultiTenantがグループをマイグレーション

- [ ] T253 **[Red]** [US4] テスト記述: migrateToMultiTenantがグループにorganizationIdを追加（__tests__/lib/migration.test.ts）
- [ ] T254 **[Green]** [US4] グループマイグレーションロジックを追加（イベントと同パターン）
- [ ] T255 **[Green]** [US4] テストを実行してT253が通ることを確認
- [ ] T256 **[Refactor]** [US4] グループマイグレーションをクリーンアップ

#### テストケース8: migrateToMultiTenantがメンバーをマイグレーション

- [ ] T257 **[Red]** [US4] テスト記述: migrateToMultiTenantがメンバーにorganizationIdを追加（__tests__/lib/migration.test.ts）
- [ ] T258 **[Green]** [US4] メンバーマイグレーションロジックを追加
- [ ] T259 **[Green]** [US4] テストを実行してT257が通ることを確認
- [ ] T260 **[Refactor]** [US4] メンバーマイグレーションをクリーンアップ

#### テストケース9: migrateToMultiTenantが出欠記録をマイグレーション

- [ ] T261 **[Red]** [US4] テスト記述: migrateToMultiTenantが出欠記録にorganizationIdを追加（__tests__/lib/migration.test.ts）
- [ ] T262 **[Green]** [US4] 出欠記録マイグレーションロジックを追加
- [ ] T263 **[Green]** [US4] テストを実行してT261が通ることを確認
- [ ] T264 **[Refactor]** [US4] 出欠記録マイグレーションをクリーンアップ

#### テストケース10: migrateToMultiTenantが完了フラグを設定

- [ ] T265 **[Red]** [US4] テスト記述: migrateToMultiTenantがattendance_migration_completedフラグを設定（__tests__/lib/migration.test.ts）
- [ ] T266 **[Green]** [US4] migrateToMultiTenant末尾に完了フラグ設定を追加
- [ ] T267 **[Green]** [US4] テストを実行してT265が通ることを確認
- [ ] T268 **[Refactor]** [US4] migrateToMultiTenantを最終化

#### テストケース11: migrateToMultiTenantがエラーを処理

- [ ] T269 **[Red]** [US4] テスト記述: migrateToMultiTenantが失敗時にエラーを返す（__tests__/lib/migration.test.ts）
- [ ] T270 **[Green]** [US4] migrateToMultiTenantにtry-catchエラーハンドリングを追加
- [ ] T271 **[Green]** [US4] エラー時にレガシーキーが削除されないことを確保（ロールバック安全性）
- [ ] T272 **[Green]** [US4] テストを実行してT269が通ることを確認
- [ ] T273 **[Refactor]** [US4] エラーハンドリングを最適化

### トップページにマイグレーション統合

#### テストケース1: トップページがマウント時にmigrateToMultiTenantを呼び出す

- [ ] T274 **[Red]** [US4] テスト記述: トップページがuseEffectでmigrateToMultiTenantを呼び出す（__tests__/app/page.test.tsx）
- [ ] T275 **[Green]** [US4] app/page.tsxにmigrateToMultiTenantを呼び出すuseEffectを追加
- [ ] T276 **[Green]** [US4] テストを実行してT274が通ることを確認
- [ ] T277 **[Refactor]** [US4] useEffect依存関係をクリーンアップ

#### テストケース2: トップページがマイグレーション後にデフォルト団体にリダイレクト

- [ ] T278 **[Red]** [US4] テスト記述: トップページがマイグレーション時に/{defaultOrgId}/にリダイレクト（__tests__/app/page.test.tsx）
- [ ] T279 **[Green]** [US4] app/page.tsxにresult.migratedがtrueの時のrouter.pushロジックを追加
- [ ] T280 **[Green]** [US4] テストを実行してT278が通ることを確認
- [ ] T281 **[Refactor]** [US4] リダイレクトロジックを最適化

#### テストケース3: トップページがマイグレーション失敗時にエラーメッセージを表示

- [ ] T282 **[Red]** [US4] テスト記述: トップページがマイグレーション失敗時にエラーを表示（__tests__/app/page.test.tsx）
- [ ] T283 **[Green]** [US4] app/page.tsxにエラーハンドリングUIを追加
- [ ] T284 **[Green]** [US4] テストを実行してT282が通ることを確認
- [ ] T285 **[Refactor]** [US4] エラーメッセージUXを改善

### 統合テスト

#### テストケース1: 完全なマイグレーションワークフロー統合テスト

- [ ] T286 **[Red]** [US4] 統合テスト記述: すべてのデータ型での完全なマイグレーションワークフロー（__tests__/integration/migration.test.ts）
- [ ] T287 **[Green]** [US4] 統合テストを実行して完全なマイグレーションが動作することを検証
- [ ] T288 **[Refactor]** [US4] 統合テストにエッジケースを追加

**チェックポイント**: ユーザーストーリー4完了 - レガシーデータマイグレーションが自動で動作

---

## フェーズ7: ユーザーストーリー5 - 団体URLの共有とブックマーク (優先度: P2)

**ゴール**: ユーザーは団体のURLをブックマークしたり、他の人と共有したりできる。URLには自動発行されたランダムIDが含まれ、このURLを知っている人だけがアクセスできる。

**独立テスト**: 団体のURLをブックマークし、後日そのブックマークから直接アクセスできることを確認する。

### URL処理とエラーハンドリング

#### テストケース1: 存在しない団体の404ページ

- [ ] T289 **[Red]** [US5] テスト記述: [org]レイアウトが無効な団体IDで404を表示（__tests__/app/[org]/layout.test.tsx）
- [ ] T290 **[Green]** [US5] app/[org]/layout.tsxに団体未検出時の404エラーハンドリングを追加
- [ ] T291 **[Green]** [US5] テストを実行してT289が通ることを確認
- [ ] T292 **[Refactor]** [US5] 404エラーメッセージを改善

#### テストケース2: トップページが団体一覧を表示しない

- [ ] T293 **[Red]** [US5] テスト記述: トップページが団体一覧を表示しない（プライバシー）（__tests__/app/page.test.tsx）
- [ ] T294 **[Green]** [US5] app/page.tsxがgetAllOrganizationsを呼び出さず団体リストを表示しないことを確保
- [ ] T295 **[Green]** [US5] テストを実行してT293が通ることを確認
- [ ] T296 **[Refactor]** [US5] ランディングページにプライバシー通知を追加

#### テストケース3: セッションをまたいでURLブックマークが動作

- [ ] T297 **[Red]** [US5] 統合テスト記述: URLをブックマークして後でアクセス（__tests__/integration/url-bookmark.test.ts）
- [ ] T298 **[Green]** [US5] 統合テストを実行してブックマークが動作することを検証
- [ ] T299 **[Refactor]** [US5] 団体作成成功画面にURL保存指示を追加

### UI改善

- [ ] T300 **[Refactor]** [US5] 団体作成成功画面に「このURLを保存してください」通知を追加
- [ ] T301 **[Refactor]** [US5] 団体URLのクリップボードコピーボタンを追加
- [ ] T302 **[Refactor]** [US5] 可読性向上のためにURL表示フォーマットを改善

**チェックポイント**: ユーザーストーリー5完了 - URLのブックマークと共有が可能

---

## フェーズ8: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善

### コード品質チェック

- [ ] T303 完全なテストスイートを実行してすべてのテストが通ることを確認（既存84テストを含む）
- [ ] T304 TypeScript型チェックを実行（`npx tsc --noEmit`）してエラーを修正
- [ ] T305 ESLintを実行（`npm run lint`）してリントエラーを修正
- [ ] T306 コードクリーンアップ: 未使用インポートとコメントアウトされたコードを削除

### コードレビュー（憲法準拠チェック）

- [ ] T307 **[コードレビュー]** 型安全性チェック: `any`型の不適切な使用がないことを確認
- [ ] T308 **[コードレビュー]** TDDサイクルチェック: すべての新規コードがテストファーストで実装されたことを確認
- [ ] T309 **[コードレビュー]** セキュリティパターンチェック: Zodでの入力検証、XSS保護を確認
- [ ] T310 **[コードレビュー]** パフォーマンスチェック: OrganizationProviderでuseMemoの適切な使用を確認
- [ ] T311 **[コードレビュー]** アクセシビリティチェック: フォームのセマンティックHTML、ARIAラベルを確認
- [ ] T312 **[コードレビュー]** UI/UXチェック: すべてのテキストが日本語、入力フィールドがスタイリングガイドラインに従うことを確認
- [ ] T313 **[コードレビュー]** レスポンシブデザインチェック: モバイルファーストTailwind CSS実装を確認

### 機能テスト

- [ ] T314 パフォーマンステスト: ページロード時間が目標を満たすことを確認（3G接続で3秒以内）
- [ ] T315 アクセシビリティテスト: キーボードナビゲーションとスクリーンリーダー互換性を確認
- [ ] T316 モバイルテスト: 320px、768px、1024pxビューポートでレイアウトを確認
- [ ] T317 クロスブラウザテスト: Chrome、Firefox、Safariで確認
- [ ] T318 エッジケーステスト: localStorageクォータ超過エラーハンドリングをテスト
- [ ] T319 エッジケーステスト: ID衝突ハンドリングをテスト（極めて稀）
- [ ] T320 エッジケーステスト: localStorage無効シナリオをテスト

### ドキュメント

- [ ] T321 [P] README.mdをマルチテナント機能説明で更新
- [ ] T322 [P] CLAUDE.mdを最新のプロジェクト構造とコマンドで更新
- [ ] T323 [P] quickstart.md指示が新規開発者向けに動作することを確認
- [ ] T324 **[必須]** SPECIFICATION.mdを更新:
  - [ ] バージョン番号を更新（v1.x → v2.0）
  - [ ] 機能一覧にマルチテナント機能を追加
  - [ ] データモデル変更を反映（Organization追加、全エンティティにorganizationId追加）
  - [ ] API仕様にOrganization Service関数を追加
  - [ ] UI/UX仕様に新トップページと団体設定ページを追加
  - [ ] localStorage構造変更を文書化
  - [ ] テスト仕様の統計を更新（新規テスト数を追加）
  - [ ] 変更履歴に005-multi-tenant実装完了を記録

### コードレビュー問題解決

- [ ] T325 **[修正]** コードレビューで特定された問題を修正（該当する場合）
- [ ] T326 **[Green]** 修正後にすべてのテストを再実行して通ることを確認
- [ ] T327 **[手動]** 修正後に手動テストで機能を確認

---

## 依存関係と実行順序

### フェーズ依存関係

- **セットアップ（フェーズ1）**: 依存関係なし - すぐに開始可能
- **基盤（フェーズ2）**: セットアップ完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー（フェーズ3+）**: すべて基盤フェーズ完了に依存
  - ユーザーストーリーは並列進行可能（人員があれば）
  - または優先度順に順次実行（P1 → P2 → P3）
- **仕上げ（最終フェーズ）**: すべての希望するユーザーストーリーの完了に依存

### ユーザーストーリー依存関係

```
基盤（フェーズ2） - 最初に完了必須
    ↓
    ├── US1（フェーズ3）- 団体作成 [P1] 🎯 MVP
    │   ↓
    │   ├── US2（フェーズ4）- データ管理 [P1]
    │   ├── US3（フェーズ5）- 設定編集 [P2]
    │   └── US5（フェーズ7）- URL共有 [P2]
    └── US4（フェーズ6）- マイグレーション [P1] (独立) 🎯 MVP
```

### 各ユーザーストーリー内（TDD必須）

**重要 - t-wada TDD原則**:
- **1度に1つのテストケース**: 複数のテストケースをまとめない
- **各テストでRed-Green-Refactorサイクル**:
  1. Red: 失敗するテストを1つ書く
  2. Green: そのテストを通す最小限のコードを書く
  3. Refactor: テストを通したままコードを改善
- **小さなステップ**: 各タスクは1つの特定の動作に集中
- **テストの独立性**: 各テストは独立して実行可能
- **同一機能内で並列実行なし**: 同一機能のテストは順次実行必須

### 並列実行機会

**重要**: 並列実行はTDD要件によって制限されます:

**テストケース内**: Red-Green-Refactorステップを並列実行しない（順次実行必須）

**異なるユーザーストーリー間**: 異なるチームメンバーで並列実行可能:
- 開発者A: US1（団体作成）
- 開発者B: US4（マイグレーション）- 独立
- US1完了後:
  - 開発者C: US2（データ管理）
  - 開発者D: US3（設定編集）

**基盤フェーズ内**: [P]マークのタスクは並列実行可能:
- T005-T010: 型定義（異なるファイル）
- T011-T022: バリデーションスキーマ（テストケース毎は順次、異なるスキーマは並列可）

---

## 並列実行例: 基盤フェーズ

```bash
# 型定義（並列実行可 - 異なるファイル）:
タスクT005: "types/index.tsにOrganizationインターフェースを追加"
タスクT006: "types/index.tsのEventDateにorganizationIdを追加"
タスクT007: "types/index.tsのGroupにorganizationIdを追加"
# など

# バリデーションスキーマ（スキーマ毎に1テストケースずつ）:
# OrganizationSchema:
タスクT011: [Red] OrganizationSchemaのテストを書く
タスクT012: [Green] OrganizationSchemaを実装
タスクT013: [Green] テストを実行
タスクT014: [Refactor] クリーンアップ
# その後CreateOrganizationInputSchema:
タスクT015: [Red] テストを書く
# など
```

---

## 実装戦略

### MVP優先（フェーズ3: ユーザーストーリー1 + フェーズ6: ユーザーストーリー4）

1. フェーズ1を完了: セットアップ（4タスク）
2. フェーズ2を完了: 基盤 - 重要（56タスク）
3. フェーズ3を完了: US1 - 団体作成（68タスク）
4. フェーズ6を完了: US4 - マイグレーション（64タスク）
5. **検証 & デプロイ** 🎯

これで既存ユーザーのデータ保護を含む、機能的なマルチテナントシステムが完成します。

### 段階的デリバリー

1. MVP: セットアップ + 基盤 + US1 + US4 → テスト → デプロイ 🎯
2. US2（データ管理）を追加 → 独立テスト → デプロイ
3. US3（設定編集）を追加 → 独立テスト → デプロイ
4. US5（URL共有）を追加 → 独立テスト → デプロイ
5. 仕上げフェーズ → 最終デプロイ

### 並列チーム戦略

2-3名の開発者がいる場合:

1. **全員で**: セットアップ + 基盤を完了（フェーズ1-2）
2. **基盤完了後**:
   - 開発者A: US1（団体作成）- 優先
   - 開発者B: US4（マイグレーション）- 並列実行可能
3. **US1完了後**:
   - 開発者A: US2（データ管理）
   - 開発者C: US3（設定編集）またはUS5（URL共有）

---

## 注意事項

**一般**:
- [P]タスク = 異なるファイル、同一フェーズ内で依存関係なし
- [Story]ラベルはタスクを特定のユーザーストーリーにマッピング（追跡可能性のため）
- 各ユーザーストーリーは独立して完了・テスト可能であるべき
- Red-Green-Refactorサイクル毎または論理グループ毎にコミット
- 任意のチェックポイントで停止してストーリーを独立検証

**TDD固有（プロジェクト憲法により必須）**:
- **[Red]**、**[Green]**、**[Refactor]**ラベルはすべてのテスト関連タスクで必須
- **1度に1つのテストケース**: 複数のテストケースを1タスクにまとめない
- **小さなステップ**: 各Red-Green-Refactorサイクルは30分以内で完了可能であるべき
- **Redを確認**: 実装前に必ずテストが失敗することを確認
- **Greenを確認**: 実装後に必ずテストが通ることを確認
- **独立テスト**: 各テストは実行順序に依存せず独立して実行可能
- **同一機能内で並列実行なし**: 同一機能のテストは順次実行必須

**データマイグレーション**:
- マイグレーションテストは100%コードカバレッジを達成必須（重要なロジック）
- 成功と失敗の両方のシナリオをテスト
- ロールバック安全性を確保（エラー時にレガシーキーを削除しない）

**URLと団体ID**:
- nanoidを使用して10文字の団体IDを生成
- IDはURL安全（小文字英数字）
- ID一意性と衝突ハンドリングをテスト

**日本語UI**:
- すべてのUIテキストは日本語
- エラーメッセージは日本語
- コードベース内の既存日本語テキストパターンに従う

---

**タスク数概要**:
- **合計タスク**: 327
- **フェーズ1（セットアップ）**: 4タスク
- **フェーズ2（基盤）**: 56タスク
- **フェーズ3（US1 - 団体作成）**: 68タスク 🎯 MVP
- **フェーズ4（US2 - データ管理）**: 60タスク
- **フェーズ5（US3 - 設定編集）**: 36タスク
- **フェーズ6（US4 - マイグレーション）**: 64タスク 🎯 MVP
- **フェーズ7（US5 - URL共有）**: 14タスク
- **フェーズ8（仕上げ）**: 25タスク

**並列実行機会**: タスクの約20-30%が並列実行可能（主に型定義と異なるユーザーストーリー）

**推奨MVPスコープ**: フェーズ1 + フェーズ2 + フェーズ3（US1）+ フェーズ6（US4）= 192タスク 🎯
