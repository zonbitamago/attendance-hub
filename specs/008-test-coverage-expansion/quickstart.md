# Test Coverage Expansion - Quickstart Guide

**フィーチャー**: 008-test-coverage-expansion
**作成日**: 2025-11-11
**対象**: 開発者（テスト実行・デバッグを行う方）

## 概要

このガイドでは、008フィーチャーで追加されたテストの実行方法、カバレッジの確認方法、トラブルシューティングについて説明します。

## テスト実行コマンド

### 全テストを実行

```bash
npm test
```

- 全234+新規テストを実行
- 既存のJest設定（jest.config.js）に従って実行
- デフォルトで並列実行され、高速

### ウォッチモードで実行（開発時推奨）

```bash
npm test -- --watch
```

- ファイル変更を監視し、関連テストを自動再実行
- `p`キーでファイル名フィルター
- `t`キーでテスト名フィルター
- `a`キーで全テスト再実行
- `q`キーで終了

### カバレッジレポート付きで実行

```bash
npm test -- --coverage
```

- テスト実行後にカバレッジレポートを表示
- `coverage/`ディレクトリにHTML形式のレポートを生成
- ブラウザで`coverage/lcov-report/index.html`を開いて詳細確認

### 特定ファイルのテストのみ実行

```bash
# 日付ユーティリティのテストのみ
npm test date-utils

# エラーユーティリティのテストのみ
npm test error-utils

# 出欠登録ページのテストのみ
npm test register/page

# イベント詳細ページのテストのみ
npm test events/\\[id\\]/page

# 複数ファイルを実行（パターンマッチ）
npm test "admin.*page"
```

**ヒント**: ファイル名の一部を指定すると、マッチする全テストが実行されます。

### 特定のテストケースのみ実行

```bash
# テスト名でフィルター
npm test -- -t "イベント情報が表示される"

# describe名でフィルター
npm test -- -t "出欠登録ページの基本表示"
```

## カバレッジレポートの見方

### ターミナル出力

テスト実行後、以下のような表が表示されます：

```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   70.12 |    45.23 |   62.45 |   69.87 |
 lib/                |   85.34 |    72.15 |   88.92 |   84.76 |
  date-utils.ts      |   92.45 |    85.71 |   100   |   91.23 | 42-45
  error-utils.ts     |   91.11 |    80.00 |   90.00 |   90.43 | 78,92-95
 app/[org]/...       |   82.15 |    65.34 |   75.23 |   81.67 |
---------------------|---------|----------|---------|---------|-------------------
```

**指標の意味**:
- **% Stmts** (Statements): ステートメント（文）のカバレッジ
- **% Branch**: 分岐（if/else、三項演算子など）のカバレッジ
- **% Funcs** (Functions): 関数のカバレッジ
- **% Lines**: 行のカバレッジ
- **Uncovered Line #s**: カバーされていない行番号

### HTMLレポート

詳細なカバレッジを確認するには：

```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

HTMLレポートでは：
- ファイルごとのカバレッジを視覚的に確認
- 各ファイルをクリックすると、行ごとのカバレッジが色分け表示
  - **緑**: カバーされている行
  - **赤**: カバーされていない行
  - **黄**: 部分的にカバーされている分岐
- 未カバーの行を特定し、追加テストケースを検討

## CI/CDでのテスト実行

### GitHub Actions

プッシュ/プルリクエスト時に自動実行されます：

1. GitHubの「Actions」タブを開く
2. 最新のワークフロー実行を確認
3. 「Test」ステップをクリックして詳細ログを表示

**確認項目**:
- ✅ 全テストがpass
- ✅ カバレッジ閾値をクリア（branches: 30%、functions: 50%、lines: 45%、statements: 45%）
- ✅ ビルドが成功

### CI失敗時の対応

CI が失敗した場合：

1. **ログを確認**: どのテストが失敗したか、エラーメッセージを読む
2. **ローカルで再現**: `npm test <失敗したテスト名>`を実行
3. **修正**: テストまたは実装コードを修正
4. **再確認**: ローカルで`npm test`を実行し、全テストがpassすることを確認
5. **プッシュ**: 修正をコミット&プッシュし、CIが再実行される

## トラブルシューティング

### 問題1: モックが動作しない

**症状**: `useRouter`、`useParams`、`useOrganization`などのモックが期待通りに動作しない

**原因**: モックの設定が不足している

**解決策**:
```typescript
// テストファイルの先頭に追加
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// テストケース内でモックの戻り値を設定
const mockPush = jest.fn();
(useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
  push: mockPush,
  // ... 他の必要なプロパティ
});
```

**参考**: 既存の`__tests__/app/page.test.tsx`を参照

### 問題2: 非同期テストがタイムアウトする

**症状**: `Timeout - Async callback was not invoked within the 5000 ms timeout`

**原因**: 非同期処理が完了していない、または`waitFor`が不足

**解決策**:
```typescript
// waitForを使用して非同期処理の完了を待つ
import { waitFor } from '@testing-library/react';

test('非同期データが表示される', async () => {
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('データ')).toBeInTheDocument();
  });
});

// またはタイムアウトを延長（推奨しない）
test('時間がかかるテスト', async () => {
  // ...
}, 10000); // 10秒
```

**参考**: React Testing Libraryの[Async Methods](https://testing-library.com/docs/dom-testing-library/api-async/)

### 問題3: localStorageのモックエラー

**症状**: `localStorage is not defined`

**原因**: Jest環境ではlocalStorageがデフォルトで利用できない

**解決策**: 既に`jest.setup.js`で設定済み。追加の設定は不要。
```javascript
// jest.setup.js（既存）
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});
```

テストケース内でスパイを設定：
```typescript
beforeEach(() => {
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mocked value');
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### 問題4: 既存テストが失敗する

**症状**: 新規テスト追加後、既存の234テストの一部が失敗する

**原因**: グローバルモックの影響、テストの独立性不足

**解決策**:
```typescript
// 各テストの前後でモックをクリア
beforeEach(() => {
  jest.clearAllMocks(); // モック呼び出し履歴をクリア
});

afterEach(() => {
  jest.restoreAllMocks(); // モックを元の実装に戻す
});
```

**確認**: 新規テストファイルを一時的に削除し、既存テストのみで実行して問題を切り分け

### 問題5: カバレッジが上がらない

**症状**: テストを追加したが、カバレッジが期待ほど上がらない

**原因**: エッジケースや分岐がカバーされていない

**解決策**:
1. HTMLカバレッジレポートで未カバーの行を確認
   ```bash
   npm test -- --coverage
   open coverage/lcov-report/index.html
   ```
2. 赤く表示されている行を確認
3. その行を実行するテストケースを追加
   - エラーケース（try-catchのcatchブロック）
   - 条件分岐の両パターン（if/else）
   - 境界値（nullチェック、空配列など）

**例**:
```typescript
// 未カバー: errorケース
test('エラー時にエラーメッセージが表示される', () => {
  // サービス層のモックをエラーを返すように設定
  (someService.someMethod as jest.Mock).mockRejectedValueOnce(new Error('エラー'));

  // ... テスト実行

  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
});
```

## テスト実行時間の最適化

テストが遅い場合：

### 並列実行の確認

Jestはデフォルトで並列実行しますが、設定を確認：

```bash
# 最大ワーカー数を指定（CPUコア数-1が推奨）
npm test -- --maxWorkers=4
```

### 不要なモックの削減

過剰なモックはオーバーヘッドになります。必要最小限のモックを使用してください。

### テストの分割

大きなテストファイルは複数の小さなファイルに分割することで、並列実行の効率が上がります。

## 追加リソース

- **Jest公式ドキュメント**: https://jestjs.io/docs/getting-started
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **プロジェクト憲法**: `.specify/memory/constitution.md`（TDD原則VIII参照）
- **既存テストの例**: `__tests__/app/page.test.tsx`、`__tests__/components/event-detail/member-attendance-list.test.tsx`

## サポート

問題が解決しない場合：
1. 既存のテストファイルを参照してパターンを確認
2. GitHubのIssuesで質問
3. プロジェクト憲法のTDD原則を再確認
