# CI/CD調査結果

**機能**: CI/CDパイプライン設定
**調査日**: 2025-11-09
**ステータス**: 完了

## R1: GitHub Actions ベストプラクティス

### Decision

**採用**: GitHub Actions公式Node.jsワークフローテンプレート + Next.js推奨設定

**ワークフロー構成**:
```yaml
- アクション: actions/checkout@v4 (最新安定版)
- Node.js セットアップ: actions/setup-node@v4
- パッケージマネージャー: npm ci（確実性重視）
- キャッシュ: npm（actions/setup-nodeの組み込み機能）
- マトリックステスト: Node.js 20.x, 22.x
```

### Rationale

1. **公式テンプレート採用**:
   - GitHub公式のNode.jsワークフローテンプレートは実績あり
   - コミュニティによる継続的なメンテナンス
   - セキュリティアップデートの恩恵

2. **npm ciの使用**:
   - `package-lock.json`からの確実なインストール
   - `npm install`より高速で予測可能
   - CI環境に最適

3. **組み込みキャッシュ**:
   - `actions/setup-node`のcacheパラメータでnpm自動キャッシュ
   - 別途`actions/cache`を使うより簡潔
   - Node.jsバージョンごとにキャッシュが独立

4. **マトリックステスト**:
   - 複数Node.jsバージョンで並列実行
   - LTS（20.x）と最新（22.x）の両方をサポート
   - 互換性問題の早期発見

### Alternatives Considered

**代替案1: CircleCI**
- **却下理由**: GitHub Actionsとの統合度でGitHub Actionsが優位
- プロジェクトが既にGitHub上にあるため、追加サービス不要

**代替案2: npm installの使用**
- **却下理由**: `npm ci`の方がCI環境に適している
- `npm ci`は`package-lock.json`を厳密に尊重
- クリーンインストールで再現性が高い

**代替案3: actions/cacheの明示的使用**
- **却下理由**: `actions/setup-node`の組み込みキャッシュで十分
- 設定がシンプルになる
- 同等の性能

## R2: Jestカバレッジ設定

### Decision

**カバレッジ設定**:
```javascript
{
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
}
```

### Rationale

1. **カバレッジ対象**:
   - `app/`, `components/`, `lib/`: アプリケーションコードのみ
   - テストファイル、設定ファイルは除外
   - Next.jsプロジェクト構造に最適化

2. **80%閾値**:
   - 業界標準の推奨値
   - 高品質を保ちつつ、現実的な目標
   - プロジェクトconstitution（VIII. TDD）に準拠

3. **レポート形式**:
   - **text**: CI出力で即座に確認
   - **lcov**: 将来的な外部ツール連携用
   - **html**: ローカル詳細確認用

4. **CI実行時のカバレッジ**:
   - `npm test -- --coverage`でカバレッジ付きテスト実行
   - 閾値未達時はJestが非ゼロ終了コード返却
   - GitHub Actionsが自動的にビルド失敗として検出

### Alternatives Considered

**代替案1: カバレッジ閾値90%**
- **却下理由**: 現実的でない可能性
- 80%から段階的に引き上げる方が実用的

**代替案2: ファイルごとの個別閾値**
- **却下理由**: 初期実装では複雑すぎる
- グローバル閾値でシンプルに開始

**代替案3: coverageReportersにjson追加**
- **却下理由**: 現時点で外部ツール連携の予定なし
- 必要になったら追加可能

## R3: CI/CDドキュメント標準

### Decision

**README.md更新**:
```markdown
[![CI](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/zonbitamago/attendance-hub/actions/workflows/ci.yml)

## テスト
- **テストスイート**: 187テスト
- **カバレッジ**: 80%以上
- **CI**: すべてのPRで自動実行
```

**CLAUDE.md更新**:
```markdown
## CI/CD

### 自動チェック
- 型チェック: `npx tsc --noEmit`
- リント: `npm run lint`
- テスト: `npm test`（カバレッジ測定付き）
- ビルド: `npm run build`

### CI失敗時の対応
1. Actionsタブでエラー確認
2. ローカルで再現
3. 修正後、再プッシュ

### カバレッジ要件
- 最小閾値: 80%
- 閾値未達時: ビルド失敗、マージ不可
```

### Rationale

1. **CIステータスバッジ**:
   - GitHub Actions標準のバッジURL
   - リアルタイムでビルド状態を表示
   - クリックでActionsページへ遷移

2. **テスト情報の明示**:
   - 187テスト（199から修正）
   - カバレッジ要件の明示
   - CI自動実行の周知

3. **CI運用ガイドライン**:
   - CLAUDE.mdに開発者向け情報集約
   - 失敗時の対応手順を明記
   - ローカル検証方法の提供

### Alternatives Considered

**代替案1: カバレッジバッジの追加**
- **却下理由**: 現時点で外部サービス（Codecov等）未導入
- 将来的な追加は可能

**代替案2: 詳細なトラブルシューティングガイド**
- **却下理由**: quickstart.mdに記載
- CLAUDE.mdは簡潔に保つ

## 統合結論

すべての調査結果を統合し、以下の実装方針を確定：

### 実装優先度

**Phase 1（必須）**:
1. `.github/workflows/ci.yml`作成（基本チェック）
2. ワークフロー動作確認

**Phase 2（推奨）**:
3. `jest.config.mjs`カバレッジ設定追加
4. カバレッジ閾値調整

**Phase 3（ドキュメント）**:
5. `README.md`更新（CIバッジ、テスト数）
6. `CLAUDE.md`更新（CI運用ガイドライン）

### リスク評価

**低リスク**:
- GitHub Actions設定はテンプレートベースで実績あり
- 既存テストスイートの活用でテスト作成不要
- ドキュメント更新のみで開発環境に影響なし

**中リスク**:
- カバレッジ80%達成（現状未測定）
  - 軽減策: 段階的閾値引き上げ

**対策済み**:
- npmキャッシュで実行時間短縮
- マトリックステストの並列実行で効率化

---

**調査完了**: ✅ すべての技術選択確定、実装準備完了
