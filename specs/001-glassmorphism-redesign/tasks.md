# Tasks: Glassmorphism Redesign - Sky Theme Light Mode

**Input**: Design documents from `/specs/001-glassmorphism-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: 新規テスト不要（デザインのみの変更のため、既存テストが通過することを確認）

**TDD Principles**: このフィーチャーはデザインのみの変更のため、TDDサイクルは適用しません。代わりに、既存のテストスイート（565テスト）がすべて通過することでリグレッションを検証します。

**Organization**: タスクはユーザーストーリーごとにグループ化されています。各ストーリーは独立して実装およびテスト可能です。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1, US2, US3）
- ファイルパスを含む明確な説明

## Path Conventions

- **Web app**: Next.js App Router構造（`app/`、`components/`、`__tests__/`）
- パスは絶対パスで記載

## Phase 1: Setup（共通インフラストラクチャ）

**目的**: プロジェクト初期化とダークモード機能の削除

- [x] T001 プロジェクト構造を確認（plan.md に基づき、6ページ + 2削除ファイルを特定）
- [x] T002 モックアップファイルを確認（samples/landing-pages/final-*.html をブラウザで開いて視覚的に理解）
- [x] T003 research.md を読んでデザインパターンを理解（Skyカラーパレット、ボタンスタイルナビゲーション）
- [x] T004 ThemeToggle コンポーネントファイルを削除（components/ui/theme-toggle.tsx）
- [x] T005 ThemeToggle テストファイルを削除（__tests__/components/ui/theme-toggle.test.tsx）

---

## Phase 2: Foundational（ブロッキング前提条件）

**目的**: このフィーチャーはUIのみの変更のため、Foundationalフェーズは該当しません。

**⚠️ スキップ**: Phase 1完了後、直接 User Story 1 の実装に進みます。

---

## Phase 3: User Story 1 - 統一されたSkyテーマのビジュアル体験 (Priority: P1) 🎯 MVP

**ゴール**: 全6ページに一貫したSkyカラーパレットとグラデーション背景を適用し、プロフェッショナルで洗練された印象を与える。

**独立テスト**: 全6ページ（トップ、イベント一覧、管理画面トップ、グループ管理、イベント詳細、一括登録）を順番に開き、すべてのページでSkyカラーパレット（sky-50〜sky-600）とグラデーション背景が適用されていることを目視で確認できます。

### User Story 1 実装

#### T006-T011: app/page.tsx（組織作成ページ）のSkyテーマ適用

- [x] T006 [US1] app/page.tsx を読み込み、ThemeToggle import を削除
- [x] T007 [US1] app/page.tsx の成功画面の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T008 [US1] app/page.tsx のメイン画面の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T009 [US1] app/page.tsx のプライマリーボタンを `bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700` に変更
- [x] T010 [US1] app/page.tsx のすべての`dark:`クラスを削除（例: `dark:bg-gray-900` → 削除）
- [x] T011 [US1] ブラウザで http://localhost:3000 を開き、モックアップ samples/landing-pages/final-1-top.html と比較

#### T012-T016: app/[org]/page.tsx（イベント一覧）のSkyテーマ適用

- [x] T012 [P] [US1] app/[org]/page.tsx を読み込み、ThemeToggle import と使用箇所を削除
- [x] T013 [P] [US1] app/[org]/page.tsx の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T014 [P] [US1] app/[org]/page.tsx のイベントカードに `hover:bg-sky-50 hover:border-sky-300` を適用
- [x] T015 [P] [US1] app/[org]/page.tsx のすべての`dark:`クラスを削除
- [x] T016 [P] [US1] ブラウザでイベント一覧ページを開き、モックアップ samples/landing-pages/final-2-events-list.html と比較

#### T017-T021: app/[org]/admin/page.tsx（管理画面トップ）のSkyテーマ適用

- [x] T017 [P] [US1] app/[org]/admin/page.tsx を読み込み、ThemeToggle import と使用箇所を削除
- [x] T018 [P] [US1] app/[org]/admin/page.tsx の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T019 [P] [US1] app/[org]/admin/page.tsx のアイコングラデーションを `bg-gradient-to-br from-sky-400 to-sky-600` に変更
- [x] T020 [P] [US1] app/[org]/admin/page.tsx のすべての`dark:`クラスを削除
- [x] T021 [P] [US1] ブラウザで管理画面トップを開き、モックアップ samples/landing-pages/final-3-admin-top.html と比較

#### T022-T026: app/[org]/admin/groups/page.tsx（グループ管理）のSkyテーマ適用

- [x] T022 [P] [US1] app/[org]/admin/groups/page.tsx を読み込み、ThemeToggle import と使用箇所を削除
- [x] T023 [P] [US1] app/[org]/admin/groups/page.tsx の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T024 [P] [US1] app/[org]/admin/groups/page.tsx の編集/削除ボタンを `text-sky-600 hover:bg-sky-50` に変更
- [x] T025 [P] [US1] app/[org]/admin/groups/page.tsx のすべての`dark:`クラスを削除
- [x] T026 [P] [US1] ブラウザでグループ管理ページを開き、モックアップ samples/landing-pages/final-4-admin-groups.html と比較

#### T027-T032: app/[org]/events/[id]/page.tsx（イベント詳細）のSkyテーマ適用

- [x] T027 [P] [US1] app/[org]/events/[id]/page.tsx を読み込み、ThemeToggle import と使用箇所を削除
- [x] T028 [P] [US1] app/[org]/events/[id]/page.tsx の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T029 [P] [US1] app/[org]/events/[id]/page.tsx のグループアコーディオン展開時を `bg-sky-50 border-sky-200` に変更
- [x] T030 [P] [US1] app/[org]/events/[id]/page.tsx のフィルター選択時を `bg-sky-500 text-white` に変更
- [x] T031 [P] [US1] app/[org]/events/[id]/page.tsx のすべての`dark:`クラスを削除
- [x] T032 [P] [US1] ブラウザでイベント詳細ページを開き、モックアップ samples/landing-pages/final-5-event-detail.html と比較

#### T033-T037: app/[org]/my-register/page.tsx（一括登録）のSkyテーマ適用

- [x] T033 [P] [US1] app/[org]/my-register/page.tsx を読み込み、ThemeToggle import と使用箇所を削除
- [x] T034 [P] [US1] app/[org]/my-register/page.tsx の`<main>`背景を `bg-gradient-to-br from-white via-sky-50 to-white` に変更
- [x] T035 [P] [US1] app/[org]/my-register/page.tsx の選択状態表示を `bg-sky-50 border-sky-200` に変更
- [x] T036 [P] [US1] app/[org]/my-register/page.tsx のすべての`dark:`クラスを削除
- [x] T037 [P] [US1] ブラウザで一括登録ページを開き、モックアップ samples/landing-pages/final-6-bulk-register.html と比較

#### T038: User Story 1 完了確認

- [x] T038 [US1] すべてのページ（6ページ）を順番にブラウザで開き、Skyカラーパレットとグラデーション背景が適用されていることを確認

**チェックポイント**: この時点で、User Story 1 は完全に機能し、独立してテスト可能です。すべてのページに統一されたSkyテーマが適用されています。

---

## Phase 4: User Story 2 - 直感的なボタンスタイルナビゲーション (Priority: P2)

**ゴール**: すべてのナビゲーションリンクをアイコン付きのボタンスタイルに変更し、クリック可能な要素を明確にして操作性を向上させる。

**独立テスト**: すべてのページでナビゲーションリンク（戻るボタン、管理画面、一括登録、ガイドなど）をクリックし、各リンクがアイコン付きのボタンスタイル（白背景、sky-200ボーダー、ホバー時sky-50背景）で表示されることを確認できます。

### User Story 2 実装

#### T039-T041: app/page.tsx のナビゲーションボタンスタイル適用

- [x] T039 [US2] app/page.tsx の成功画面の「使い方ガイド」リンクをボタンスタイルに変更（`inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg...` + 本アイコン）
- [x] T040 [US2] app/page.tsx のメイン画面の「使い方ガイド」リンクをボタンスタイルに変更（同様のスタイル + 本アイコン）
- [x] T041 [US2] ブラウザで確認し、ホバー時に背景色がsky-50に変わることを確認

#### T042-T044: app/[org]/page.tsx のナビゲーションボタンスタイル適用

- [x] T042 [P] [US2] app/[org]/page.tsx に3つのナビゲーションボタンを追加（一括出欠登録、管理画面、使い方ガイド）を `flex flex-wrap gap-3` コンテナ内に配置
- [x] T043 [P] [US2] 各ボタンに適切なアイコンを追加（クリップボード、設定、本）、すべて `w-5 h-5 text-sky-600`
- [x] T044 [P] [US2] ブラウザで確認し、3つのボタンが横並びで表示され、ホバー時に色が変わることを確認

#### T045-T047: app/[org]/admin/page.tsx のナビゲーションボタンスタイル適用

- [x] T045 [P] [US2] app/[org]/admin/page.tsx に3つのナビゲーションボタンを追加（トップページに戻る、一括出欠登録、使い方ガイド）
- [x] T046 [P] [US2] 「トップページに戻る」ボタンに左矢印アイコンを追加
- [x] T047 [P] [US2] ブラウザで確認し、ボタンスタイルとアイコンが正しく表示されることを確認

#### T048-T049: app/[org]/admin/groups/page.tsx のナビゲーションボタンスタイル適用

- [x] T048 [P] [US2] app/[org]/admin/groups/page.tsx の「管理画面に戻る」リンクをボタンスタイルに変更（左矢印アイコン付き）
- [x] T049 [P] [US2] ブラウザで確認し、ボタンスタイルが適用されていることを確認

#### T050-T051: app/[org]/events/[id]/page.tsx のナビゲーションボタンスタイル適用

- [x] T050 [P] [US2] app/[org]/events/[id]/page.tsx の「トップページに戻る」リンクをボタンスタイルに変更（左矢印アイコン付き）
- [x] T051 [P] [US2] ブラウザで確認し、ボタンスタイルが適用されていることを確認

#### T052-T053: app/[org]/my-register/page.tsx のナビゲーションボタンスタイル適用

- [x] T052 [P] [US2] app/[org]/my-register/page.tsx の「トップページに戻る」リンクをボタンスタイルに変更（左矢印アイコン付き）
- [x] T053 [P] [US2] ブラウザで確認し、ボタンスタイルが適用されていることを確認

#### T054: User Story 2 完了確認

- [x] T054 [US2] すべてのページのナビゲーションリンクがアイコン付きボタンスタイルになっていることを確認し、ホバーエフェクトが動作することを確認

**チェックポイント**: この時点で、User Stories 1 と 2 が両方とも独立して機能しています。すべてのナビゲーションがボタンスタイルで統一されています。

---

## Phase 5: User Story 3 - シンプルなライトモード体験 (Priority: P3)

**ゴール**: ダークモード切り替えボタンを削除し、すべての`dark:`クラスを削除して、ライトモード専用のクリーンなインターフェースを提供する。

**独立テスト**: すべてのページを開き、右上にダークモード切り替えボタン（月アイコン）が表示されないことを確認できます。また、開発者ツールでコードを確認し、`dark:` クラスが含まれていないことを検証できます。

### User Story 3 実装

#### T055-T056: dark:クラスの完全削除確認

- [x] T055 [US3] コマンドラインで `grep -r "dark:" app/ components/` を実行し、`dark:`クラスが残っていないことを確認
- [x] T056 [US3] もし`dark:`クラスが見つかった場合、該当ファイルを開いてすべての`dark:`クラスを削除

#### T057: User Story 3 完了確認

- [ ] T057 [US3] すべてのページをブラウザで開き、ダークモード切り替えボタンが表示されないことを確認（右上をチェック）

**チェックポイント**: この時点で、すべてのユーザーストーリーが独立して機能しています。ダークモード機能が完全に削除され、ライトモード専用のアプリケーションになっています。

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

### コード品質チェック

- [x] T058 完全なテストスイートを実行し、すべてのテスト（552テスト）が通過することを確認（`npm test`）
- [x] T059 TypeScript型チェックを実行し、エラーを修正（`npx tsc --noEmit`）
- [x] T060 ESLintを実行し、リンティング問題を修正（`npm run lint`）
- [x] T061 コードクリーンアップ: 未使用のimportとコメントアウトされたコードを削除

### コードレビュー（憲法準拠チェック）

- [x] T062 **[コードレビュー]** 型安全性チェック: `any`型の不適切な使用がないか確認
- [x] T063 **[コードレビュー]** セキュリティパターンチェック: XSS保護、入力検証が維持されているか確認
- [x] T064 **[コードレビュー]** パフォーマンスチェック: 最適化が適切に使用されているか確認（useMemo、キャッシングなど）
- [x] T065 **[コードレビュー]** アクセシビリティチェック: セマンティックHTML、ARIAラベルが維持されているか確認
- [x] T066 **[コードレビュー]** UI/UXチェック: 日本語UIテキストが正確か確認
- [x] T067 **[コードレビュー]** レスポンシブデザインチェック: モバイルファースト実装が維持されているか確認

### 機能テスト

- [ ] T068 パフォーマンステスト: Lighthouseスコア90以上を維持していることを確認
- [ ] T069 アクセシビリティテスト: キーボードナビゲーションとスクリーンリーダー互換性を確認
- [ ] T070 モバイルテスト: 異なるビューポートサイズでレイアウトを確認（320px、768px、1024px）
- [ ] T071 クロスブラウザテスト: Chrome、Firefox、Safariで確認
- [ ] T072 エッジケーステスト: spec.md のエッジケースが正しく動作することを確認

### ビジュアル最終確認

- [ ] T073 すべてのページ（6ページ）をブラウザで開き、対応するモックアップファイルと並べて比較
  - [ ] app/page.tsx ↔ samples/landing-pages/final-1-top.html
  - [ ] app/[org]/page.tsx ↔ samples/landing-pages/final-2-events-list.html
  - [ ] app/[org]/admin/page.tsx ↔ samples/landing-pages/final-3-admin-top.html
  - [ ] app/[org]/admin/groups/page.tsx ↔ samples/landing-pages/final-4-admin-groups.html
  - [ ] app/[org]/events/[id]/page.tsx ↔ samples/landing-pages/final-5-event-detail.html
  - [ ] app/[org]/my-register/page.tsx ↔ samples/landing-pages/final-6-bulk-register.html
- [ ] T074 色、レイアウト、ホバーエフェクトがモックアップと一致していることを確認

### ビルドとデプロイ準備

- [x] T075 本番ビルドを実行し、エラーなく完了することを確認（`npm run build`）
- [x] T076 ビルド成功後、ビルド出力を確認し、バンドルサイズが適切か確認

### ドキュメント

- [x] T077 [P] README.md を更新（最終更新日、テスト数）
- [x] T078 [P] CLAUDE.md を更新（Skyカラーパレット使用、ダークモード削除を記録）
- [x] T079 **[必須]** SPECIFICATION.md更新
  - [x] バージョン番号の更新（v2.7 - Glassmorphism Redesign）
  - [x] 機能一覧に新機能を追加（Skyテーマデザイン、ライトモード専用）
  - [x] UI/UX仕様に新デザインシステムを追加
  - [x] 変更履歴に実装完了を記録（2025-11-20）

### コードレビュー問題解決

- [ ] T080 **[修正]** コードレビューで特定された問題を修正（該当する場合）
- [ ] T081 **[グリーン]** 修正後にすべてのテストを再実行し、通過することを確認
- [ ] T082 **[手動]** 修正後に手動テストを実行し、機能を確認

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: スキップ（UIのみの変更）
- **User Stories (Phase 3-5)**: Setup完了後に開始可能
  - User Story 1、2、3は技術的には並行実行可能（異なるファイル）
  - ただし、優先順位順（P1 → P2 → P3）の逐次実行を推奨
- **Polish (Phase 6)**: すべてのUser Storiesが完了後に実行

### ユーザーストーリー依存関係

- **User Story 1 (P1)**: Setup完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P2)**: Setup完了後に開始可能 - US1と並行実行可能（ただし、US1完了後を推奨）
- **User Story 3 (P3)**: Setup完了後に開始可能 - US1、US2と並行実行可能（ただし、US1、US2完了後を推奨）

### 各ユーザーストーリー内

**User Story 1（Skyテーマ適用）**:
- T006-T011（app/page.tsx）→ 独立
- T012-T016（app/[org]/page.tsx）→ 独立 [P]
- T017-T021（app/[org]/admin/page.tsx）→ 独立 [P]
- T022-T026（app/[org]/admin/groups/page.tsx）→ 独立 [P]
- T027-T032（app/[org]/events/[id]/page.tsx）→ 独立 [P]
- T033-T037（app/[org]/my-register/page.tsx）→ 独立 [P]

**User Story 2（ボタンスタイルナビゲーション）**:
- T039-T041（app/page.tsx）→ 独立
- T042-T044（app/[org]/page.tsx）→ 独立 [P]
- T045-T047（app/[org]/admin/page.tsx）→ 独立 [P]
- T048-T049（app/[org]/admin/groups/page.tsx）→ 独立 [P]
- T050-T051（app/[org]/events/[id]/page.tsx）→ 独立 [P]
- T052-T053（app/[org]/my-register/page.tsx）→ 独立 [P]

**User Story 3（dark:クラス削除）**:
- T055-T056（全ファイル検索と削除）→ 逐次実行

### 並行実行の機会

**User Story 1内**:
- T012-T016、T017-T021、T022-T026、T027-T032、T033-T037は異なるファイルのため並行実行可能

**User Story 2内**:
- T042-T044、T045-T047、T048-T049、T050-T051、T052-T053は異なるファイルのため並行実行可能

**異なるUser Stories間**:
- チーム容量があれば、US1、US2、US3を異なるメンバーが並行実行可能

---

## Parallel Example: User Story 1

```bash
# User Story 1のすべてのページ更新を並行実行（異なるファイル）:
Task: "app/[org]/page.tsx にSkyテーマを適用（T012-T016）"
Task: "app/[org]/admin/page.tsx にSkyテーマを適用（T017-T021）"
Task: "app/[org]/admin/groups/page.tsx にSkyテーマを適用（T022-T026）"
Task: "app/[org]/events/[id]/page.tsx にSkyテーマを適用（T027-T032）"
Task: "app/[org]/my-register/page.tsx にSkyテーマを適用（T033-T037）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1完了: Setup
2. Phase 3完了: User Story 1（全6ページにSkyテーマ適用）
3. **停止して検証**: User Story 1を独立してテスト
4. 準備ができたらデプロイ/デモ

### Incremental Delivery

1. Setup完了 → 基盤準備完了
2. User Story 1追加 → 独立テスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立テスト → デプロイ/デモ
4. User Story 3追加 → 独立テスト → デプロイ/デモ
5. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetupを完了
2. Setup完了後:
   - 開発者A: User Story 1（T006-T038）
   - 開発者B: User Story 2（T039-T054）
   - 開発者C: User Story 3（T055-T057）
3. ストーリーは独立して完了し、統合される

---

## Notes

**一般**:
- [P] タスク = 異なるファイル、依存関係なし（並行実行可能）
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング（追跡可能性）
- 各ユーザーストーリーは独立して完了およびテスト可能
- タスクまたは論理的なグループごとにコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を壊す相互依存

**デザイン変更特有**:
- 新規テスト不要（既存の565テストがリグレッション検証を提供）
- モックアップファイル（samples/landing-pages/final-*.html）を常に参照
- ブラウザでの視覚的確認が必須（各ページ更新後）
- レスポンシブデザインを複数のビューポートで確認（320px、768px、1024px）
- ホバーエフェクトが正しく動作することを確認

**成功の定義**:
- ✅ すべてのページでSkyカラーパレットが適用されている
- ✅ すべてのナビゲーションリンクがボタンスタイルになっている
- ✅ `dark:`クラスが完全に削除されている
- ✅ 既存の565テストがすべて通過する
- ✅ `npm run build`が成功する
- ✅ モックアップとビジュアルが一致している
