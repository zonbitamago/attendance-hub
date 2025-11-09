# Implementation Plan: CI/CDパイプライン設定

**Branch**: `006-ci-cd-setup` | **Date**: 2025-11-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-ci-cd-setup/spec.md`

**Note**: このドキュメントは `/speckit.plan` コマンドによって生成されました。

## Summary

GitHub Actionsを使用した継続的インテグレーション（CI）パイプラインの構築。すべてのプルリクエストに対して自動的にテスト、リント、型チェック、ビルド検証、テストカバレッジ測定を実行し、コード品質を保証する。主な技術的アプローチは、GitHub Actions YAML設定ファイルの作成、Jestカバレッジ設定の追加、Node.js 20.xと22.xのマトリックステスト、プロジェクトドキュメントの更新。

## Technical Context

**Language/Version**: TypeScript 5.9 + Node.js 20.x, 22.x (マトリックステスト)
**Primary Dependencies**:

- GitHub Actions (ワークフローランタイム)
- Jest 29+ (テスト実行とカバレッジ生成)
- ESLint 9+ (リンティング)
- TypeScript 5.9+ (型チェック)
- Next.js 16 (ビルド検証)

**Storage**: N/A (設定ファイルのみ)
**Testing**: 既存のJest 187テストを活用、新規テスト不要
**Target Platform**: GitHub Actions (Ubuntu latest runner)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**:

- CI完了時間: 10分以内（通常のPR）
- CI起動: PR作成から30秒以内
- CIステータスバッジ更新: ビルド完了から5分以内

**Constraints**:

- GitHub Actions無料枠内での実行（月2,000分）
- Node.js依存関係キャッシュでビルド時間短縮
- 並列実行によるマトリックステストの効率化

**Scale/Scope**:

- テストスイート: 187テスト
- Node.jsバージョン: 2バージョン（20.x, 22.x）
- カバレッジ閾値: 80%（branches, functions, lines, statements）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ 適合項目

- **VIII. テスト駆動開発（TDD）**: 既存の187テストを活用、CIで自動実行を強制
- **III. 型安全性**: TypeScript strict modeの型チェックを必須化
- **IX. パフォーマンス基準**: CI完了時間10分以内の目標設定
- **II. 無料枠最適化**: GitHub Actions無料枠内での実行を前提
- **VII. 日本語対応**: ドキュメント更新は日本語で記載

### ⚠️ 注意項目

- **VI. アクセシビリティ基準**: N/A（CI/CDパイプラインはインフラ機能）
- **IV. レスポンシブ・モバイルファースト設計**: N/A（CI/CDパイプラインはインフラ機能）
- **V. サーバーレスアーキテクチャ**: N/A（GitHub Actionsはサーバーレス実行環境）

### ❌ 違反項目

なし

**Gate Status**: ✅ **PASS** - すべての関連するconstitution原則に適合

## Project Structure

### Documentation (this feature)

```text
specs/006-ci-cd-setup/
├── spec.md              # 機能仕様書
├── plan.md              # このファイル（実装計画）
├── research.md          # Phase 0 調査結果
├── quickstart.md        # Phase 1 セットアップガイド
└── tasks.md             # Phase 2 タスク一覧（/speckit.tasksで生成）
```

### Source Code (repository root)

この機能は既存のプロジェクト構造を変更せず、以下のファイルを追加・更新します：

```text
attendance-hub/
├── .github/
│   └── workflows/
│       └── ci.yml           # 新規: GitHub Actions CI ワークフロー
├── jest.config.mjs          # 更新: カバレッジ設定追加
├── README.md                # 更新: CIバッジ、テスト数修正
├── CLAUDE.md                # 更新: CI運用ガイドライン追加
└── [既存のプロジェクト構造]
```

**Structure Decision**:
CI/CDは既存プロジェクトのインフラ層として機能し、ソースコード構造には影響しません。GitHub Actionsの標準的な`.github/workflows/`ディレクトリにワークフロー定義を配置し、既存の設定ファイルとドキュメントを更新します。

## Complexity Tracking

該当なし - Constitution Check に違反項目なし

## Phase 0: Research & Investigation

### 調査タスク

#### R1: GitHub Actions ベストプラクティス

**目的**: Node.js/Next.jsプロジェクトに最適なGitHub Actions設定パターンの調査

**調査項目**:

- 公式GitHub Actions Node.jsワークフローテンプレート
- Next.js公式推奨のCI設定
- Node.jsマトリックステスト設定（複数バージョン並列実行）
- npm依存関係キャッシュ戦略（`actions/setup-node`のキャッシュ機能）
- ワークフロートリガー設定（pull_request, pushイベント）

**期待される成果**:

- 最適なワークフローYAML構造
- Node.jsセットアップアクション設定
- 効率的なキャッシュ戦略

#### R2: Jestカバレッジ設定

**目的**: Jestのカバレッジ生成と閾値強制の設定方法

**調査項目**:

- Jest coverageThreshold設定オプション
- カバレッジレポート形式（text, lcov, html）
- CI環境でのカバレッジ失敗時の動作
- カバレッジ除外パターン（node_modules, test files）

**期待される成果**:

- jest.config.mjsのカバレッジ設定例
- 80%閾値の適切な設定方法

#### R3: CI/CDドキュメント標準

**目的**: プロジェクトドキュメントへのCI情報追記のベストプラクティス

**調査項目**:

- GitHub Actions ステータスバッジの生成方法
- CLAUDE.mdへのCI運用ガイドライン追記内容
- README.mdへのCI情報統合方法

**期待される成果**:

- ステータスバッジMarkdown記法
- CI運用ガイドラインのテンプレート

### 調査結果の統合

すべての調査結果は `research.md` に統合し、以下の形式で記載します：

- **Decision**: 選択した技術・アプローチ
- **Rationale**: 選択理由
- **Alternatives considered**: 検討した代替案

## Phase 1: Design & Contracts

### D1: GitHub Actions ワークフローファイル設計

**ファイル**: `.github/workflows/ci.yml`

**設計内容**:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit # 型チェック
      - run: npm run lint # リント
      - run: npm test -- --coverage # テスト + カバレッジ
      - run: npm run build # ビルド検証
```

**設計決定**:

- **トリガー**: pull_requestとpush（main/develop）
- **マトリックステスト**: Node.js 20.x, 22.x
- **キャッシュ**: `actions/setup-node`のnpmキャッシュ機能
- **実行順序**: 型チェック → リント → テスト → ビルド
- **並列化**: マトリックスで2バージョン並列実行

### D2: Jestカバレッジ設定設計

**ファイル**: `jest.config.mjs` (既存ファイルに追記)

**設計内容**:

```javascript
export default {
  // 既存設定...
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

**設計決定**:

- **カバレッジ対象**: app/, components/, lib/
- **除外パターン**: 型定義、設定ファイル、node_modules
- **閾値**: 80%（全メトリクス）
- **レポート形式**: text（CI出力）、lcov（ツール連携）、html（ローカル確認）

### D3: ドキュメント更新設計

#### README.md 更新

**追加内容**:

```markdown
# attendance-hub

[![CI](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml)

## テスト

- **テストスイート**: 187テスト
- **カバレッジ**: 80%以上（branches, functions, lines, statements）
- **CI**: すべてのPRで自動実行
```

**変更内容**:

- CIステータスバッジ追加（トップ）
- テスト数を199→187に修正
- カバレッジ情報追加

#### CLAUDE.md 更新

**追加内容**:

```markdown
## CI/CD

### 自動チェック

すべてのプルリクエストで以下が自動実行されます：

- **型チェック**: `npx tsc --noEmit`
- **リント**: `npm run lint`
- **テスト**: `npm test`（カバレッジ測定付き）
- **ビルド**: `npm run build`

### CI失敗時の対応

1. GitHub ActionsのActionsタブでエラー詳細を確認
2. ローカルで該当するコマンドを実行して再現
3. 修正後、再度プッシュして自動再実行

### カバレッジ要件

- **最小閾値**: 80%（branches, functions, lines, statements）
- **閾値未達時**: ビルドが失敗し、マージ不可
```

### quickstart.md 生成

**ファイル**: `specs/006-ci-cd-setup/quickstart.md`

**内容**:
CI/CD機能のセットアップは不要です。PR作成時に自動的に実行されます。

ローカルでCIと同じチェックを実行する方法：

```bash
# 型チェック
npx tsc --noEmit

# リント
npm run lint

# テスト（カバレッジ付き）
npm test -- --coverage

# ビルド
npm run build
```

### Agent Context 更新

**実行**: `.specify/scripts/bash/update-agent-context.sh claude`

**追加内容**:

- GitHub Actions CI/CD設定
- Jestカバレッジ測定
- Node.js 20.x, 22.x マトリックステスト

## Post-Phase 1 Constitution Re-check

**Re-check Result**: ✅ **PASS**

Phase 1 設計完了後も、すべてのconstitution原則に適合しています：

- テスト自動実行の強制（TDD原則）
- 型チェック必須化（型安全性原則）
- 無料枠内での実行（無料枠最適化原則）
- 日本語ドキュメント（日本語対応原則）

## Implementation Notes

### 既存プロジェクトへの影響

**最小限の変更**:

- 新規ファイル: `.github/workflows/ci.yml` のみ
- 既存ファイル更新: `jest.config.mjs`, `README.md`, `CLAUDE.md`
- ソースコード変更: なし

**後方互換性**:

- 既存のテストスイートをそのまま活用
- 既存の開発ワークフローに影響なし
- ローカル開発環境の変更不要

### 段階的ロールアウト

Phase 2（tasks.md）では、以下の順序で実装：

1. `.github/workflows/ci.yml` 作成（基本チェックのみ）
2. ワークフロー動作確認（実際のPRで検証）
3. `jest.config.mjs` カバレッジ設定追加
4. カバレッジ閾値調整（必要に応じて）
5. ドキュメント更新（README.md, CLAUDE.md）

### リスクと軽減策

**リスク1**: カバレッジ80%達成が困難

- **軽減策**: 段階的に閾値を引き上げ（初期60% → 最終80%）

**リスク2**: CI実行時間が10分を超える

- **軽減策**: npmキャッシュ、並列実行の最適化

**リスク3**: GitHub Actions無料枠の超過

- **軽減策**: ワークフロー実行時間の監視、不要な実行の削減

## Next Steps

Phase 1 完了後、次のコマンドを実行：

```bash
/speckit.tasks
```

これにより、`tasks.md` が生成され、実装タスクが優先度順に並びます。

---

**Phase 1 Status**: ✅ **COMPLETE**
