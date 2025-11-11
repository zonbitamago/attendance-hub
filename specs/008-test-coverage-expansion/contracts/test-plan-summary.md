# Test Plan Summary

**フィーチャー**: 008-test-coverage-expansion
**作成日**: 2025-11-11
**ステータス**: 設計フェーズ

## 概要

本ドキュメントでは、カバレッジ拡張のための7ファイルに対するテスト追加計画の概要を示します。

## テスト追加対象ファイル

### P0優先度（3ファイル）

| ファイル | 現在カバレッジ | 目標カバレッジ | 推定テスト数 | 理由 |
|---------|--------------|--------------|-------------|------|
| `lib/date-utils.ts` | 11.11% | 90%+ | 20-25 | 全ページで使用、影響範囲大 |
| `lib/error-utils.ts` | 8.88% | 90%+ | 15-20 | エラー処理の基盤、影響範囲大 |
| `app/[org]/events/[id]/register/page.tsx` | 0% | 80%+ | 20-25 | データ作成の入口、最重要画面 |

### P1優先度（4ファイル）

| ファイル | 現在カバレッジ | 目標カバレッジ | 推定テスト数 | 理由 |
|---------|--------------|--------------|-------------|------|
| `app/[org]/events/[id]/page.tsx` | 0% | 80%+ | 20-25 | 最頻閲覧画面、Feature 007の保護 |
| `app/[org]/admin/groups/page.tsx` | 0% | 80%+ | 15-20 | CRUD操作、データ管理基盤 |
| `app/[org]/admin/events/page.tsx` | 0% | 80%+ | 15-20 | CRUD操作、データ管理基盤 |
| `app/[org]/my-register/page.tsx` | 0% | 80%+ | 10-15 | Feature 004の主要機能 |

### 合計

- **対象ファイル数**: 7ファイル
- **推定テスト数**: 115-150テスト
- **既存テスト数**: 234テスト
- **完了後テスト数**: 349-384テスト（目標: 350-400）

## テスト戦略

### ユニットテスト（lib/）

**対象**: date-utils.ts、error-utils.ts

**アプローチ**:
- 純粋関数のテストに集中
- エッジケース（null、undefined、無効な入力）を網羅
- 境界値テスト（日付の境界、エラー型の境界）
- モックは最小限（jest.useFakeTimersのみ）

**期待カバレッジ**: 90%+

### 統合テスト（app/）

**対象**: 5つのページコンポーネント

**アプローチ**:
- React Testing Libraryを使用
- ユーザーインタラクションをシミュレート（render、fireEvent、waitFor）
- 外部依存をモック（useRouter、useParams、useOrganization、サービス層）
- 実際のユーザーフローに沿ったテスト

**期待カバレッジ**: 80%+

## モック戦略

### 共通モック

全てのページコンポーネントテストで使用：

```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));
```

### サービス層モック

各ページで必要なサービスをモック：

```typescript
jest.mock('@/lib/event-service');
jest.mock('@/lib/group-service');
jest.mock('@/lib/member-service');
jest.mock('@/lib/attendance-service');
```

### localStorage モック

既に`jest.setup.js`で設定済み。追加の設定は不要。

## テストケースの分類

### 正常系（Happy Path）

- ユーザーが期待通りに操作した場合の動作
- データが正常に表示される
- フォーム送信が成功する

### 異常系（Error Path）

- ユーザーが無効な入力をした場合
- サーバーからエラーが返った場合
- データが存在しない場合

### エッジケース（Edge Cases）

- 空のデータ（0件）
- null/undefined
- 境界値（日付の境界、文字数制限）
- 二重送信防止

## テスト名の命名規則

### 日本語で記述

既存のテストパターンに従い、全て日本語で記述：

```typescript
describe('出欠登録ページの基本表示', () => {
  test('イベント情報が表示される', () => {
    // ...
  });

  test('ローディング中はLoadingSpinnerが表示される', () => {
    // ...
  });
});
```

### 命名パターン

- **describeブロック**: 「<機能名>の<動作カテゴリ>」（例: 「出欠登録ページの基本表示」）
- **testブロック**: 「<条件>は<期待結果>」（例: 「イベント情報が表示される」）
- **Given-When-Then**: 複雑なシナリオでは「Given <前提> When <操作> Then <結果>」形式も可

## 実装順序

### Phase 1: P0 Unit Tests（2-3時間）

1. `lib/date-utils.test.ts` - 依存なし、独立して実装可能
2. `lib/error-utils.test.ts` - 依存なし、独立して実装可能

### Phase 2: P0 Page Tests（10-12時間）

3. `app/[org]/events/[id]/register/page.test.tsx` - 最重要、ユーザーフロー重要
4. `app/[org]/events/[id]/page.tsx` - メイン画面

### Phase 3: P1 Admin Tests（12-15時間）

5. `app/[org]/admin/groups/page.test.tsx` - 管理画面
6. `app/[org]/admin/events/page.test.tsx` - 管理画面
7. `app/[org]/my-register/page.test.tsx` - 一括登録

### Phase 4: Verification（1-2時間）

8. 全テスト実行とカバレッジ確認
9. CI/CD動作確認
10. README.md、SPECIFICATION.md更新

**合計推定工数**: 25-32時間

## 成功基準

### 定量的基準

- ✅ 全テスト数: 350-400（234 + 115-150）
- ✅ 全体カバレッジ: 70%以上
- ✅ ユーティリティ関数カバレッジ: 90%以上
- ✅ ページコンポーネントカバレッジ: 80%以上
- ✅ 既存234テスト: 全てpass
- ✅ CI/CD: 成功

### 定性的基準

- ✅ テストが保守しやすい（既存パターンに従う）
- ✅ テスト名が明確で理解しやすい（日本語）
- ✅ エッジケースが網羅されている
- ✅ モック戦略が一貫している

## リスクと軽減策

### R1: 既存テストへの影響（高）

- **軽減策**: 各テストファイル追加後に全テスト実行

### R2: カバレッジ目標未達（中）

- **軽減策**: HTMLレポートで未カバー行を特定し、追加テストケースを記述

### R3: テスト実行時間増加（中）

- **軽減策**: Jestの並列実行を活用、不要なモックを削減

## 関連ドキュメント

- [date-utils-test-plan.md](./date-utils-test-plan.md) - date-utils.tsの詳細テスト設計
- [page-test-plan.md](./page-test-plan.md) - ページコンポーネントの詳細テスト設計
- [quickstart.md](../quickstart.md) - テスト実行ガイド
- [spec.md](../spec.md) - フィーチャー仕様
- [plan.md](../plan.md) - 実装計画
