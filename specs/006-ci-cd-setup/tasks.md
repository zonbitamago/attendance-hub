# Tasks: CI/CDパイプライン設定

**Input**: Design documents from `/specs/006-ci-cd-setup/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: この機能は既存の187テストを活用し、新規テスト作成は不要です。CIワークフロー自体が品質ゲートとして機能します。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーの独立した実装とテストを可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（US1, US2, US3, US4）
- 説明に正確なファイルパスを含める

---

## Phase 1: Setup（共有インフラストラクチャ）

**Purpose**: プロジェクト初期化と基本構造

- [x] T001 `.github/workflows/`ディレクトリを作成

---

## Phase 2: Foundational（前提条件のブロック）

**Purpose**: すべてのユーザーストーリーの実装前に完了する必要があるコアインフラストラクチャ

このCI/CD機能には基盤タスクは不要です。すべてのユーザーストーリーは独立して実装可能です。

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を並列で開始可能

---

## Phase 3: User Story 1 - プルリクエスト時の自動品質チェック (Priority: P1) 🎯 MVP

**Goal**: すべてのPRで自動的に型チェック、リント、テスト、ビルド検証を実行し、コード品質を保証

**Independent Test**: 意図的にテスト失敗、リントエラー、型エラーを含むテストPRを作成し、CIパイプラインがこれらの問題を検出・報告し、マージをブロックすることを検証

### User Story 1 Implementation

#### CI ワークフローファイルの作成

- [x] T002 [US1] `.github/workflows/ci.yml`を作成し、基本ワークフロー構造を定義
  - ワークフロー名: "CI"
  - トリガー: pull_request と push（branches: [main, develop]）
  - ジョブ: test（runs-on: ubuntu-latest）

- [x] T003 [US1] Node.jsマトリックス戦略を`.github/workflows/ci.yml`に追加
  - strategy.matrix.node-version: [20.x, 22.x]
  - 2バージョンの並列実行を設定

- [x] T004 [US1] Node.jsセットアップステップを`.github/workflows/ci.yml`に追加
  - actions/checkout@v4
  - actions/setup-node@v4（node-version: ${{ matrix.node-version }}、cache: 'npm'）
  - npm ci実行

- [x] T005 [US1] 品質チェックステップを`.github/workflows/ci.yml`に追加
  - 型チェック: `npx tsc --noEmit`
  - リント: `npm run lint`
  - テスト: `npm test`
  - ビルド検証: `npm run build`

#### ワークフロー検証

- [x] T006 [US1] 変更をコミットし、006-ci-cd-setupブランチにプッシュ

- [ ] T007 [US1] テストPRを作成してCIワークフローが実行されることを確認
  - GitHub ActionsのActionsタブでワークフロー実行を確認
  - すべてのチェック（型チェック、リント、テスト、ビルド）が実行されることを確認
  - Node.js 20.xと22.x両方でジョブが並列実行されることを確認

- [ ] T008 [US1] CI失敗シナリオをテスト
  - 意図的にテストを失敗させるコミットを作成
  - CIが失敗ステータスを報告することを確認
  - PRステータスチェックでマージがブロックされることを確認

- [ ] T009 [US1] CI成功シナリオをテスト
  - テスト失敗を修正
  - CIが成功ステータスを報告することを確認
  - PRステータスチェックでマージが可能になることを確認

**Checkpoint**: この時点で、User Story 1は完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - テストカバレッジ監視 (Priority: P2)

**Goal**: すべてのPRでテストカバレッジメトリクスを自動生成・報告し、80%閾値を強制

**Independent Test**: カバレッジ閾値を設定し、閾値を下回るPRを作成し、CIが明確なカバレッジレポートとともに失敗することを検証

### User Story 2 Implementation

#### Jestカバレッジ設定

- [x] T010 [US2] `jest.config.mjs`にカバレッジ収集設定を追加
  - collectCoverage: true
  - collectCoverageFrom: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}', 'lib/**/*.{js,jsx,ts,tsx}']
  - 除外パターン: '!**/*.d.ts', '!**/*.config.{js,ts}', '!**/node_modules/**'

- [x] T011 [US2] `jest.config.mjs`にカバレッジ閾値を追加
  - coverageThreshold.global.branches: 80
  - coverageThreshold.global.functions: 80
  - coverageThreshold.global.lines: 80
  - coverageThreshold.global.statements: 80

- [x] T012 [US2] `jest.config.mjs`にカバレッジレポーター設定を追加
  - coverageReporters: ['text', 'lcov', 'html']
  - text: CI出力で即座に確認
  - lcov: 将来的な外部ツール連携用
  - html: ローカル詳細確認用

#### CI ワークフロー更新

- [x] T013 [US2] `.github/workflows/ci.yml`のテストステップを更新
  - `npm test`を`npm test -- --coverage`に変更
  - カバレッジ測定付きでテスト実行

#### カバレッジ検証

- [x] T014 [US2] ローカルでカバレッジ測定をテスト
  - `npm test -- --coverage`を実行
  - カバレッジレポートが生成されることを確認
  - 現在のカバレッジが80%閾値を満たすか確認

- [x] T015 [US2] カバレッジ閾値が80%未満の場合、段階的に調整
  - 必要に応じて一時的に閾値を引き下げ（60% → 70% → 80%）
  - または、カバレッジを向上させるためにテストを追加
  - 最終的に80%閾値を達成

- [ ] T016 [US2] PRでカバレッジ強制をテスト
  - カバレッジ設定をコミット
  - CIでカバレッジが測定・報告されることを確認
  - カバレッジ閾値未達時にビルドが失敗することを確認（該当する場合）

**Checkpoint**: この時点で、User Story 1とUser Story 2の両方が独立して機能

---

## Phase 5: User Story 3 - マルチ環境互換性検証 (Priority: P3)

**Goal**: 複数のNode.jsバージョン（20.x、22.x）でコードをテストし、異なるランタイム環境間での互換性を保証

**Independent Test**: 複数のNode.jsバージョンでマトリックスビルドが設定され、CIが互換性問題を検出することを検証

### User Story 3 Implementation

この機能はUser Story 1（T003）で既に実装済みです（Node.jsマトリックス戦略）。以下の検証タスクのみ必要です。

#### マルチバージョン検証

- [ ] T017 [US3] GitHub ActionsのActionsタブでマトリックスビルドを確認
  - Node.js 20.xと22.x両方のジョブが並列実行されていることを確認
  - 各バージョンですべてのチェック（型チェック、リント、テスト、ビルド）が実行されることを確認

- [ ] T018 [US3] 両方のNode.jsバージョンでビルドが成功することを確認
  - 各バージョンのジョブログを確認
  - すべてのステップが成功していることを確認

**Checkpoint**: すべてのユーザーストーリー（US1、US2、US3）が独立して機能

---

## Phase 6: User Story 4 - ドキュメントと可視性 (Priority: P3)

**Goal**: プロジェクトドキュメントにCIステータスバッジとガイドラインを表示し、貢献者が品質基準と現在のビルドステータスを理解できるようにする

**Independent Test**: README.mdに現在のステータスを示すCIバッジが表示され、CLAUDE.mdにCIパイプラインの使い方に関する明確なガイドラインが含まれていることを検証

### User Story 4 Implementation

#### README.md 更新

- [x] T019 [P] [US4] `README.md`にCIステータスバッジを追加
  - バッジURL: `[![CI](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml)`
  - ファイルの先頭（プロジェクトタイトルの下）に配置

- [x] T020 [P] [US4] `README.md`のテスト数を修正
  - 199テスト → 187テストに修正
  - テストセクションにカバレッジ情報を追加（80%以上）
  - CI自動実行の説明を追加

#### CLAUDE.md 更新

- [x] T021 [P] [US4] `CLAUDE.md`にCI/CDセクションを追加
  - 自動チェックの説明（型チェック、リント、テスト、ビルド）
  - CI失敗時の対応手順（Actionsタブ確認、ローカル再現、修正・再プッシュ）
  - カバレッジ要件（最小閾値: 80%、閾値未達時: ビルド失敗、マージ不可）

#### ドキュメント検証

- [ ] T022 [US4] 更新したドキュメントの内容を確認
  - README.mdのCIバッジが正しく表示されることを確認
  - README.mdのテスト数が187であることを確認
  - CLAUDE.mdのCI/CDセクションが明確で理解しやすいことを確認

- [ ] T023 [US4] CIバッジのステータスを確認
  - mainブランチにマージ後、バッジが最新のビルドステータスを表示することを確認
  - バッジをクリックしてGitHub Actionsページに遷移することを確認

**Checkpoint**: すべてのユーザーストーリー（US1、US2、US3、US4）が完了し、独立して機能

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

### Code Quality Checks

- [x] T024 すべてのテストスイートを実行し、すべてのテストが通過することを確認
  - `npm test`を実行
  - 187テストすべてが成功することを確認

- [x] T025 TypeScript型チェックを実行し、エラーを修正
  - `npx tsc --noEmit`を実行
  - 型エラーがないことを確認

- [x] T026 ESLintを実行し、リンティング問題を修正
  - `npm run lint`を実行
  - リントエラーがないことを確認

- [x] T027 Next.jsビルドを実行し、ビルドエラーを修正
  - `npm run build`を実行
  - ビルドが成功することを確認

### Code Review (Constitution Compliance Check)

- [x] T028 **[Code Review]** 型安全性チェック: `any`型の不適切な使用がないことを確認

- [x] T029 **[Code Review]** セキュリティパターンチェック: CI設定にセキュリティリスクがないことを確認
  - シークレット情報がワークフローファイルにハードコードされていないことを確認
  - GitHub Actionsのセキュリティベストプラクティスに従っていることを確認

- [x] T030 **[Code Review]** パフォーマンスチェック: CI実行時間が10分以内であることを確認
  - npmキャッシュが適切に設定されていることを確認
  - マトリックステストが並列実行されていることを確認

### Functional Testing

- [ ] T031 エッジケーステスト: spec.mdのエッジケースが正しく動作することを確認
  - ワークフロー誤設定時のエラー表示を確認
  - 依存関係インストール失敗時のエラーメッセージを確認
  - CIタイムアウト動作を確認（該当する場合）

- [ ] T032 成功基準の検証: spec.mdのすべての成功基準（SC-001〜SC-010）が満たされていることを確認
  - SC-001: PRが30秒以内にCIをトリガー
  - SC-002: CIが10分以内に完了
  - SC-003: 失敗したPRがマージを防止
  - SC-004: カバレッジが100%測定・報告
  - SC-005: カバレッジが80%以上維持
  - SC-006: 失敗原因を10秒以内に特定可能
  - SC-007: 2つのNode.jsバージョンで検証
  - SC-008: ドキュメントが1日以内に更新
  - SC-009: CIバッジが5分以内に更新
  - SC-010: 誤検知ゼロ

### Documentation

- [ ] T033 [P] `quickstart.md`の検証: セットアップ手順が正しく動作することを確認
  - ローカルCI同等チェック実行方法が正確であることを確認
  - トラブルシューティング手順が有効であることを確認

- [x] T034 **[Required]** SPECIFICATION.md更新
  - [x] バージョン番号の更新
  - [x] 機能一覧にCI/CD機能を追加
  - [x] GitHub Actionsワークフロー設定を記載
  - [x] Jestカバレッジ設定（80%閾値）を記載
  - [x] テスト仕様の統計を更新（187テスト）
  - [x] 変更履歴にCI/CD実装完了を記録

### Code Review Issue Resolution

- [ ] T035 **[Fix]** コードレビューで特定された問題を修正（該当する場合）

- [ ] T036 **[Green]** 修正後、すべてのテストを再実行して通過することを確認

- [ ] T037 **[Manual]** 修正後、手動テストで機能を検証

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: なし - このCI/CD機能には基盤タスクなし
- **User Stories (Phase 3-6)**: 独立して実行可能
  - User Story 1 (P1): 最優先 - すぐに開始可能
  - User Story 2 (P2): US1完了後に開始（CIワークフローに依存）
  - User Story 3 (P3): US1完了後に開始（マトリックス戦略の検証）
  - User Story 4 (P3): US1-3完了後に開始（ドキュメント更新）
- **Polish (Phase 7)**: すべてのユーザーストーリー完了後

### User Story Dependencies

- **User Story 1 (P1)**: 依存関係なし - すぐに開始可能
- **User Story 2 (P2)**: US1に依存（CIワークフローが存在する必要がある）
- **User Story 3 (P3)**: US1に依存（マトリックス戦略が既に実装済み）
- **User Story 4 (P3)**: US1-3に依存（すべての機能が動作している必要がある）

### Within Each User Story

**User Story 1**:
1. T002: ワークフロー構造作成
2. T003: マトリックス戦略追加（T002に依存）
3. T004: Node.jsセットアップ追加（T002に依存）
4. T005: 品質チェック追加（T004に依存）
5. T006-T009: 検証（T005に依存）

**User Story 2**:
1. T010-T012: Jestカバレッジ設定（並列可能）
2. T013: CIワークフロー更新（T005に依存）
3. T014-T016: 検証（T013に依存）

**User Story 3**:
1. T017-T018: 検証のみ（T003に依存）

**User Story 4**:
1. T019-T021: ドキュメント更新（並列可能、[P]マーク）
2. T022-T023: 検証（T019-T021に依存）

### Parallel Opportunities

**Phase 1**: T001のみ - 並列実行なし

**Phase 3 (US1)**: 順次実行（各タスクが前のタスクに依存）

**Phase 4 (US2)**:
- T010、T011、T012は並列実行可能（すべて同じファイルを編集するため、実際には順次推奨）

**Phase 5 (US3)**: 順次実行（検証タスクのみ）

**Phase 6 (US4)**:
- T019、T020、T021は並列実行可能（異なるファイル、[P]マーク）

**Phase 7 (Polish)**:
- T024-T027: 順次実行（各チェックが前のチェックの成功に依存）
- T028-T030: 並列実行可能（異なるレビュー項目）
- T033、T034: 並列実行可能（異なるドキュメント）

---

## Parallel Example: User Story 4

```bash
# User Story 4のドキュメント更新を並列実行:
Task: "T019 - README.mdにCIステータスバッジを追加"
Task: "T020 - README.mdのテスト数を修正"
Task: "T021 - CLAUDE.mdにCI/CDセクションを追加"

# ただし、T020はT019と同じファイルを編集するため、実際には順次推奨
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002-T009)
3. **STOP and VALIDATE**: User Story 1を独立してテスト
4. デプロイ/デモ準備完了

この時点で、基本的なCI/CDパイプライン（型チェック、リント、テスト、ビルド検証）が動作します。

### Incremental Delivery

1. Setup完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP！）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ（カバレッジ監視追加）
4. User Story 3追加 → 独立してテスト → デプロイ/デモ（マルチバージョン検証）
5. User Story 4追加 → 独立してテスト → デプロイ/デモ（ドキュメント完成）
6. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Sequential Strategy

単一開発者の場合:

1. Phase 1完了（T001）
2. Phase 3完了（T002-T009）→ US1検証
3. Phase 4完了（T010-T016）→ US2検証
4. Phase 5完了（T017-T018）→ US3検証
5. Phase 6完了（T019-T023）→ US4検証
6. Phase 7完了（T024-T037）→ 最終検証

---

## Notes

**General**:
- [P] タスク = 異なるファイル、依存関係なし（並列実行可能）
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理グループ後にコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリー間の依存関係

**CI/CD Specific**:
- 既存の187テストを活用、新規テスト作成は不要
- CIワークフロー自体が品質ゲートとして機能
- ローカルで各コマンドをテストしてからCIに追加
- CIワークフローの変更は慎重に行い、必ずテストPRで検証
- カバレッジ閾値は段階的に引き上げ可能（60% → 70% → 80%）
- ドキュメント更新は機能実装後に実施（最新情報を反映）
