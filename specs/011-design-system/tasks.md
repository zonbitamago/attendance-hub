# Tasks: デザインシステム改善

**Input**: Design documents from `/specs/011-design-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD必須（プロジェクト憲法 VIII. テスト駆動開発）

**TDD Principles (t-wada)**:
1. **Small Steps (小さなステップ)**: 一度に1つのテストケースに集中
2. **Red-Green-Refactor**: テストごとにRed→Green→Refactorサイクル
3. **Test-First (テストファースト)**: 実装前にテストを書く
4. **Test Independence**: 各テストは他のテストに依存しない

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: ユーザーストーリーラベル (US1, US2, etc.)
- ファイルパスを含める

---

## Phase 1: Setup（共有インフラストラクチャ）

**Purpose**: プロジェクト構造の初期化

- [x] T001 共通UIコンポーネント用の `components/ui/` ディレクトリを作成
- [x] T002 コンポーネントテスト用の `__tests__/components/ui/` ディレクトリを作成

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: 全ユーザーストーリーの前提となるコンポーネント作成

**⚠️ CRITICAL**: このフェーズ完了まで、ユーザーストーリーの作業は開始不可

### Button コンポーネント（TDD）

#### テストケース 1: Primary バリアントのレンダリング

- [x] T003 **[Red]** テスト作成: Buttonがprimaryバリアントでレンダリングされる (`__tests__/components/ui/button.test.tsx`)
- [x] T004 **[Green]** Button型とベースコンポーネントを作成 (`components/ui/button.tsx`)
- [x] T005 **[Green]** テスト実行、T003がパスすることを確認
- [x] T006 **[Refactor]** コードを整理（テストは引き続きパス）

#### テストケース 2: 全バリアント（secondary, danger, ghost）

- [x] T007 **[Red]** テスト作成: Buttonがsecondary/danger/ghostバリアントでレンダリングされる
- [x] T008 **[Green]** 全バリアントスタイルを実装
- [x] T009 **[Green]** テスト実行、全てパスすることを確認
- [x] T010 **[Refactor]** バリアントスタイルを定数に抽出

#### テストケース 3: サイズ（sm, md, lg）

- [x] T011 **[Red]** テスト作成: Buttonが異なるサイズでレンダリングされる
- [x] T012 **[Green]** サイズバリアントを実装
- [x] T013 **[Green]** テスト実行、全てパスすることを確認

#### テストケース 4: 無効状態

- [x] T014 **[Red]** テスト作成: Buttonが無効状態を処理する
- [x] T015 **[Green]** 無効スタイルと動作を実装
- [x] T016 **[Green]** テスト実行、全てパスすることを確認

### Input コンポーネント（TDD）

#### テストケース 1: 基本レンダリング

- [x] T017 **[Red]** テスト作成: Inputが必須propsでレンダリングされる (`__tests__/components/ui/input.test.tsx`)
- [x] T018 **[Green]** Input型とベースコンポーネントを作成 (`components/ui/input.tsx`)
- [x] T019 **[Green]** テスト実行、T017がパスすることを確認

#### テストケース 2: エラー状態

- [x] T020 **[Red]** テスト作成: Inputがエラーメッセージを表示する
- [x] T021 **[Green]** エラー表示を実装
- [x] T022 **[Green]** テスト実行、全てパスすることを確認

#### テストケース 3: アクセシビリティ（aria-label）

- [x] T023 **[Red]** テスト作成: Inputが適切なaria属性を持つ
- [x] T024 **[Green]** aria-labelとaria-invalidを実装
- [x] T025 **[Green]** テスト実行、全てパスすることを確認

### Card コンポーネント（TDD）

#### テストケース 1: 基本レンダリング

- [x] T026 **[Red]** テスト作成: Cardがchildrenをレンダリングする (`__tests__/components/ui/card.test.tsx`)
- [x] T027 **[Green]** Card型とベースコンポーネントを作成 (`components/ui/card.tsx`)
- [x] T028 **[Green]** テスト実行、T026がパスすることを確認

#### テストケース 2: ホバーエフェクトとパディング

- [x] T029 **[Red]** テスト作成: Cardがhoverとpaddingのpropsを処理する
- [x] T030 **[Green]** ホバーとパディングバリアントを実装
- [x] T031 **[Green]** テスト実行、全てパスすることを確認

### Message コンポーネント（TDD）

#### テストケース 1: メッセージタイプ（error, success, warning, info）

- [x] T032 **[Red]** テスト作成: Messageが全タイプでアイコン付きレンダリングされる (`__tests__/components/ui/message.test.tsx`)
- [x] T033 **[Green]** Message型、ベースコンポーネント、アイコンを作成 (`components/ui/message.tsx`)
- [x] T034 **[Green]** テスト実行、T032がパスすることを確認

#### テストケース 2: アクセシビリティ（role="alert"）

- [x] T035 **[Red]** テスト作成: Messageがrole="alert"属性を持つ
- [x] T036 **[Green]** roleとaria-live属性を実装
- [x] T037 **[Green]** テスト実行、全てパスすることを確認

#### テストケース 3: 閉じるボタン

- [x] T038 **[Red]** テスト作成: MessageがonCloseコールバックを処理する
- [x] T039 **[Green]** 閉じるボタン機能を実装
- [x] T040 **[Green]** テスト実行、全てパスすることを確認

### Heading コンポーネント（TDD）

#### テストケース 1: 全見出しレベル（h1-h6）

- [x] T041 **[Red]** テスト作成: Headingが正しいHTML要素をレンダリングする (`__tests__/components/ui/heading.test.tsx`)
- [x] T042 **[Green]** Heading型とベースコンポーネントを作成 (`components/ui/heading.tsx`)
- [x] T043 **[Green]** テスト実行、T041がパスすることを確認

#### テストケース 2: 一貫したサイズ

- [x] T044 **[Red]** テスト作成: Headingが正しいサイズクラスを適用する
- [x] T045 **[Green]** 各レベルのサイズマッピングを実装
- [x] T046 **[Green]** テスト実行、全てパスすることを確認

**Checkpoint**: 全共通コンポーネント完成 - ユーザーストーリーの実装開始可能

---

## Phase 3: User Story 1 - 一貫したUI操作体験 (Priority: P1) 🎯 MVP

**Goal**: 全11ページでボタン・入力・カード・メッセージ・見出しのスタイルを統一

**Independent Test**: 任意のページでボタン/フォームの視覚的フィードバック（ホバー、フォーカス）が統一されていることを確認

### 管理画面の更新

- [x] T047 [US1] `app/[org]/admin/groups/page.tsx`を更新 - ボタンをButtonコンポーネントに置換（削除はdanger、編集はsecondary）
- [x] T048 [US1] `app/[org]/admin/groups/page.tsx`を更新 - 入力欄をInputコンポーネントに置換
- [x] T049 [US1] `app/[org]/admin/groups/page.tsx`を更新 - メッセージをMessageコンポーネントに置換
- [x] T050 [US1] `app/[org]/admin/groups/page.tsx`を更新 - 見出しをHeadingコンポーネントに置換

- [x] T051 [US1] `app/[org]/admin/events/page.tsx`を更新 - ボタンをButtonコンポーネントに置換
- [x] T052 [US1] `app/[org]/admin/events/page.tsx`を更新 - 入力欄をInputコンポーネントに置換
- [x] T053 [US1] `app/[org]/admin/events/page.tsx`を更新 - メッセージをMessageコンポーネントに置換
- [x] T054 [US1] `app/[org]/admin/events/page.tsx`を更新 - 見出しをHeadingコンポーネントに置換

- [x] T055 [US1] `app/[org]/admin/page.tsx`を更新 - CardとHeadingコンポーネントに置換

### イベント関連ページの更新

- [x] T056 [US1] `app/[org]/events/[id]/page.tsx`を更新 - 共通コンポーネントを適用
- [x] T057 [US1] `app/[org]/events/[id]/register/page.tsx`を更新 - 共通コンポーネントを適用
- [x] T058 [US1] `app/[org]/page.tsx`を更新 - ナビゲーションリンクをButtonコンポーネントに置換、見出しを更新

### その他ページの更新

- [x] T059 [US1] `app/page.tsx`を更新 - 共通コンポーネントを適用（ランディングページ）
- [x] T060 [US1] `app/[org]/my-register/page.tsx`を更新 - 共通コンポーネントを適用

### スペーシング統一

- [x] T061 [US1] 全更新ページでセクションマージンを`mb-6 sm:mb-8`に統一

**Checkpoint**: US1完了 - 全ページでUI一貫性が確保され、個別にテスト可能

---

## Phase 4: User Story 2 - ダークモードでの快適な閲覧 (Priority: P2)

**Goal**: システム設定に応じてダークモードが自動適用される

**Independent Test**: ブラウザ/OSをダークモードに設定し、全要素が適切な暗色系カラーで表示されることを確認

### ダークモード変数の追加

- [x] T062 [US2] `app/globals.css`を更新 - 拡張カラーパレット用のダークモードCSS変数を追加（Tailwind dark:プレフィックスで対応済み）

### コンポーネントのダークモード対応

- [x] T063 **[Red]** [US2] テスト作成: Buttonがダークモードスタイルでレンダリングされる (`__tests__/components/ui/button.test.tsx`)
- [x] T064 **[Green]** [US2] Buttonコンポーネントにdark:プレフィックスクラスを追加 (`components/ui/button.tsx`)
- [x] T065 **[Green]** [US2] テスト実行、パスすることを確認

- [x] T066 **[Red]** [US2] テスト作成: Inputがダークモードスタイルでレンダリングされる
- [x] T067 **[Green]** [US2] Inputコンポーネントにdark:プレフィックスクラスを追加
- [x] T068 **[Green]** [US2] テスト実行、パスすることを確認

- [x] T069 **[Red]** [US2] テスト作成: Cardがダークモードスタイルでレンダリングされる
- [x] T070 **[Green]** [US2] Cardコンポーネントにdark:プレフィックスクラスを追加
- [x] T071 **[Green]** [US2] テスト実行、パスすることを確認

- [x] T072 **[Red]** [US2] テスト作成: Messageがダークモードスタイルでレンダリングされる
- [x] T073 **[Green]** [US2] Messageコンポーネントにdark:プレフィックスクラスを追加
- [x] T074 **[Green]** [US2] テスト実行、パスすることを確認

- [x] T075 **[Red]** [US2] テスト作成: Headingがダークモードスタイルでレンダリングされる
- [x] T076 **[Green]** [US2] Headingコンポーネントにdark:プレフィックスクラスを追加
- [x] T077 **[Green]** [US2] テスト実行、パスすることを確認

**Checkpoint**: US2完了 - ダークモードが全コンポーネントに適用され、個別にテスト可能

---

## Phase 5: User Story 3 - スクリーンリーダーでの操作 (Priority: P3)

**Goal**: 全ての要素が適切にラベル付けされ、状態変化が通知される

**Independent Test**: VoiceOver/NVDAで操作し、全入力欄・ボタンが適切に読み上げられることを確認

### aria-label補完

- [x] T078 [US3] `app/page.tsx`の全Inputコンポーネントにaria-labelを監査・追加
- [x] T079 [US3] `app/[org]/admin/groups/page.tsx`の全Inputコンポーネントにaria-labelを監査・追加
- [x] T080 [US3] `app/[org]/admin/events/page.tsx`の全Inputコンポーネントにaria-labelを監査・追加
- [x] T081 [US3] `app/[org]/events/[id]/register/page.tsx`の全Inputコンポーネントにaria-labelを監査・追加
- [x] T082 [US3] `app/[org]/my-register/page.tsx`の全Inputコンポーネントにaria-labelを監査・追加

### role="alert"確認

- [x] T083 [US3] 全Messageコンポーネントにrole="alert"が適用されていることを確認（全ページ監査）

### フォーカス管理

- [x] T084 [US3] 全インタラクティブ要素に可視フォーカスインジケーターがあることを確認（全ページ監査）

**Checkpoint**: US3完了 - アクセシビリティが全ページで確保され、個別にテスト可能

---

## Phase 6: User Story 4 - 明確な情報階層の把握 (Priority: P4)

**Goal**: 見出しサイズとセクション区切りが一貫している

**Independent Test**: 任意のページでh1/h2/h3のサイズが統一され、セクション間隔が一貫していることを確認

### 見出し階層の確認

- [x] T085 [US4] 全ページで正しい見出し階層（h1 → h2 → h3）を監査
- [x] T086 [US4] 見出しレベルのスキップ（例：h1 → h3）を修正

**Checkpoint**: US4完了 - 情報階層が明確化され、個別にテスト可能

---

## Phase 7: User Story 5 - 最新ドキュメントの参照 (Priority: P5)

**Goal**: ドキュメントがUIの変更を反映している

**Independent Test**: README.mdと使い方ガイドを確認し、新UIの説明が正確であることを確認

### ガイドページの更新

- [x] T087 [US5] `app/guide/page.tsx`を更新 - 共通コンポーネントを適用し、読みやすさを改善（ドキュメント専用構造を維持）
- [x] T088 [US5] `app/[org]/guide/page.tsx`を更新 - 共通コンポーネントを適用し、読みやすさを改善（ドキュメント専用構造を維持）
- [x] T089 [US5] ガイドページ用の画像キャプチャを撮り直し - `npm run capture-screenshots`で20枚自動生成

### README更新

- [x] T090 [US5] `README.md`を更新 - デザインシステム概要セクションを追加
- [x] T091 [US5] `README.md`を更新 - 機能一覧とコンポーネントドキュメントを更新

**Checkpoint**: US5完了 - 全ドキュメントが最新UIを反映

---

## Phase 8: Polish（仕上げ・横断的関心事）

**Purpose**: 全ユーザーストーリーに影響する改善

### コード品質チェック

- [x] T092 全テストスイートを実行し、全てパスすることを確認 (`npm test`) - 565テストパス
- [x] T093 TypeScript型チェックを実行し、エラーを修正 (`npx tsc --noEmit`) - エラーなし
- [x] T094 ESLintを実行し、リンティング問題を修正 (`npm run lint`) - パス
- [x] T095 コードクリーンアップ: 未使用インポートとコメントアウトされたコードを削除 - 実装時に対応済み

### コードレビュー（憲法準拠チェック）

- [x] T096 **[コードレビュー]** 型安全性チェック: `any`型の不適切な使用がないことを確認 - UIコンポーネントとページで`any`なし
- [x] T097 **[コードレビュー]** TDDサイクルチェック: 全新規コードがテストファーストで実装されたことを確認 - 全コンポーネントでRed-Green-Refactor実施
- [x] T098 **[コードレビュー]** セキュリティパターンチェック: 入力検証、XSS保護を確認 - Zod検証、React自動エスケープ
- [x] T099 **[コードレビュー]** アクセシビリティチェック: セマンティックHTML、ARIAラベル、フォーカス管理を確認 - ARIA属性、role="alert"実装済み
- [x] T100 **[コードレビュー]** UI/UXチェック: 日本語テキストが正確で一貫していることを確認 - 全ページで日本語UI確認済み
- [x] T101 **[コードレビュー]** レスポンシブデザインチェック: モバイルファースト実装を確認 - sm:/md:/lg:ブレークポイント使用

### 機能テスト

- [ ] T102 パフォーマンステスト: Lighthouseを実行し、スコア90以上を確認（手動）
- [ ] T103 アクセシビリティテスト: 全ページでキーボードナビゲーションが動作することを確認（手動）
- [ ] T104 モバイルテスト: 320px、768px、1024px、1440pxでレイアウトを確認（手動）
- [ ] T105 ダークモードテスト: ライト/ダークモードで全要素を確認（手動）
- [ ] T106 エッジケーステスト: 無効ボタン、長いテキスト、空の状態をテスト（手動）

### ドキュメント

- [x] T107 `CLAUDE.md`をデザインシステム情報で更新 - コンポーネント使用ガイドと最近の変更を追加
- [x] T108 **[必須]** SPECIFICATION.md更新 - v2.6.0、変更履歴、コンポーネント情報を追加
  - [ ] バージョン番号の更新
  - [ ] 機能一覧に新機能を追加
  - [ ] UI/UX仕様に共通コンポーネントを追加
  - [ ] テスト仕様の統計を更新
  - [ ] 変更履歴に実装完了を記録

### 最終検証

- [x] T109 `npm run build`を実行し、ビルドが成功することを確認 - 全ページビルド成功
- [ ] T110 全ユーザーフローの手動エンドツーエンドテスト（手動）

---

## 依存関係と実行順序

### フェーズ依存関係

- **Setup（Phase 1）**: 依存関係なし - すぐに開始可能
- **Foundational（Phase 2）**: Setupに依存 - **全ユーザーストーリーをブロック**
- **US1-US5（Phase 3-7）**: 全てFoundational完了に依存
  - US1は独立して実行可能
  - US2-US4はUS1と並列実行可能（異なるファイル）
  - US5はUS1-US4完了後が推奨（UIが確定してからドキュメント更新）
- **Polish（Phase 8）**: 全ユーザーストーリーに依存

### ユーザーストーリー依存関係

- **US1（一貫したUI）**: 基盤 - 他のストーリーに依存しない
- **US2（ダークモード）**: US1と並列可能
- **US3（アクセシビリティ）**: US1と並列可能
- **US4（情報階層）**: US1と並列可能
- **US5（ドキュメント）**: US1-US4完了後が推奨

### 並列実行機会

**Foundationalフェーズ内**:
- 各コンポーネント（Button, Input, Card, Message, Heading）は順次TDDサイクルで実装
- 異なるコンポーネントは並列作業可能（異なるファイル）

**US1内**:
- 各ページの更新は並列実行可能（異なるファイル）

**US5内**:
- ガイドページ更新（T087-T088）は並列実行可能
- README更新（T090-T091）は並列実行可能

---

## 並列実行例: ユーザーストーリー1

```bash
# 以下のタスクは並列実行可能（異なるファイル）:

# グループ1: 管理画面
タスク: "T047-T050: app/[org]/admin/groups/page.tsxを更新"
タスク: "T051-T054: app/[org]/admin/events/page.tsxを更新"
タスク: "T055: app/[org]/admin/page.tsxを更新"

# グループ2: イベントページ
タスク: "T056: app/[org]/events/[id]/page.tsxを更新"
タスク: "T057: app/[org]/events/[id]/register/page.tsxを更新"
タスク: "T058: app/[org]/page.tsxを更新"

# グループ3: その他
タスク: "T059: app/page.tsxを更新"
タスク: "T060: app/[org]/my-register/page.tsxを更新"
```

---

## 実装戦略

### MVPファースト（ユーザーストーリー1のみ）

1. Phase 1: Setupを完了
2. Phase 2: Foundationalを完了（全5コンポーネント）
3. Phase 3: ユーザーストーリー1を完了（11ページ更新）
4. **停止して検証**: 全ページでUI統一を確認
5. 準備ができたらデプロイ/デモ

### インクリメンタルデリバリー

1. Setup + Foundational → 共通コンポーネント完成
2. US1追加 → UI統一 → デプロイ/デモ（MVP!）
3. US2追加 → ダークモード → デプロイ/デモ
4. US3追加 → アクセシビリティ → デプロイ/デモ
5. US4追加 → 情報階層 → デプロイ/デモ
6. US5追加 → ドキュメント → デプロイ/デモ
7. Polish → 最終検証 → リリース

### 推奨実行順序

1. T001-T002: Setup
2. T003-T046: Foundational（共通コンポーネントTDD）
3. T047-T061: US1（ページ更新）
4. T062-T077: US2（ダークモード）
5. T078-T084: US3（アクセシビリティ）
6. T085-T086: US4（情報階層）
7. T087-T091: US5（ドキュメント）
8. T092-T110: Polish

---

## 注意事項

**一般**:
- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベル = ユーザーストーリーへのマッピング
- 各ストーリーは独立してテスト可能
- タスクごと、または論理グループごとにコミット

**TDD固有**:
- **[Red]**, **[Green]**, **[Refactor]** ラベルは必須
- 一度に1つのテストケースに集中
- 実装前にテストが失敗することを確認
- 実装後にテストがパスすることを確認

**総タスク数**: 110
- Phase 1（Setup）: 2
- Phase 2（Foundational）: 44
- Phase 3（US1）: 15
- Phase 4（US2）: 16
- Phase 5（US3）: 7
- Phase 6（US4）: 2
- Phase 7（US5）: 5
- Phase 8（Polish）: 19
