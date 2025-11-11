# date-utils.ts Test Plan

**ファイル**: `lib/date-utils.ts`
**現在カバレッジ**: 11.11%
**目標カバレッジ**: 90%+
**推定テスト数**: 20-25

## テスト対象関数

### 1. formatDate(date, formatStr)

カスタムフォーマット文字列を使用して日付をフォーマットする

**テストケース**:
1. ✅ 文字列の日付を指定フォーマットで変換できる
2. ✅ Dateオブジェクトを指定フォーマットで変換できる
3. ✅ カスタムフォーマット文字列（yyyy/MM/dd、yyyy年MM月dd日など）が正しく適用される
4. ⚠️ 無効な日付の場合は「日付不明」を返す
5. ⚠️ nullの場合は「日付不明」を返す

### 2. formatShortDate(date)

yyyy/MM/dd形式で日付をフォーマットする

**テストケース**:
1. ✅ 文字列の日付をyyyy/MM/dd形式に変換できる
2. ✅ "2025-11-15"が「2025/11/15」になる
3. ✅ "2025-01-01"が「2025/01/01」になる（ゼロパディング確認）
4. ⚠️ 無効な日付の場合は「日付不明」を返す

### 3. formatLongDate(date)

yyyy年MM月dd日(E) HH:mm形式で日付をフォーマットする

**テストケース**:
1. ✅ 文字列の日付をyyyy年MM月dd日(E) HH:mm形式に変換できる
2. ✅ 曜日が日本語で表示される（(月)、(火)など）
3. ✅ "2025-11-15T14:30:00Z"が正しい日本語形式になる
4. ✅ 時刻が24時間形式で表示される
5. ⚠️ 無効な日付の場合は「日付不明」を返す

### 4. formatTime(date)

HH:mm形式で時刻のみフォーマットする

**テストケース**:
1. ✅ 文字列の日付からHH:mm形式の時刻を抽出できる
2. ✅ "2025-11-15T14:30:00Z"が「14:30」になる
3. ✅ "2025-11-15T09:05:00Z"が「09:05」になる（ゼロパディング確認）
4. ⚠️ 無効な日付の場合は「日付不明」を返す

### 5. getCurrentTimestamp()

現在時刻のISO 8601形式の文字列を返す

**テストケース**:
1. ✅ ISO 8601形式の文字列を返す
2. ✅ 返り値がnew Date()でパース可能
3. ✅ タイムゾーン情報（Z）が含まれる
4. ✅ 呼び出すたびに異なるタイムスタンプが返る（時刻の進行）

**モック戦略**:
- `jest.useFakeTimers()`で時刻を固定してテスト
- `jest.setSystemTime(new Date('2025-11-15T12:00:00Z'))`

### 6. formatRelativeTime(date)

相対時刻を日本語で返す（例: 「たった今」「5分前」「3日前」）

**テストケース**:
1. ✅ 30秒前は「たった今」と表示される
2. ✅ 45分前は「45分前」と表示される
3. ✅ 5時間前は「5時間前」と表示される
4. ✅ 3日前は「3日前」と表示される
5. ✅ 8日前は短い日付形式（yyyy/MM/dd）で表示される
6. ⚠️ 無効な日付の場合は「日付不明」を返す
7. ⚠️ 未来の日付（負の差分）でもエラーにならない

**モック戦略**:
- `jest.useFakeTimers()`で現在時刻を固定
- `jest.setSystemTime(new Date('2025-11-15T12:00:00Z'))`
- テスト対象の日付を過去の時刻に設定（例: 2025-11-15T11:15:00Z for 45分前）

## テスト構造

```typescript
describe('date-utils', () => {
  describe('formatDate', () => {
    test('文字列の日付を指定フォーマットで変換できる', () => {
      // ...
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      // ...
    });
  });

  describe('formatShortDate', () => {
    test('yyyy/MM/dd形式で出力される', () => {
      // ...
    });
  });

  describe('formatLongDate', () => {
    test('yyyy年MM月dd日(E) HH:mm形式で出力される', () => {
      // ...
    });

    test('曜日が日本語で表示される', () => {
      // ...
    });
  });

  describe('formatTime', () => {
    test('HH:mm形式で時刻のみ出力される', () => {
      // ...
    });
  });

  describe('getCurrentTimestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('ISO 8601形式の文字列を返す', () => {
      // ...
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('30秒前は「たった今」と表示される', () => {
      const date = new Date('2025-11-15T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    test('45分前は「45分前」と表示される', () => {
      const date = new Date('2025-11-15T11:15:00Z');
      expect(formatRelativeTime(date)).toBe('45分前');
    });

    // ... 他のテストケース
  });
});
```

## エッジケースの網羅

### 無効な入力

- `null`
- `undefined`
- 無効な日付文字列（"invalid-date"）
- 空文字列（""）

### 境界値

- 1970-01-01（Unixエポック）
- 未来の日付（2099年など）
- 月の境界（月末、月初）
- 年の境界（12月31日、1月1日）
- 夏時間の境界（該当する場合）

### 特殊ケース

- タイムゾーン付き日付
- ミリ秒を含む日付
- UTCとローカルタイムの差異

## 期待されるカバレッジ

### 関数別カバレッジ

| 関数 | 目標Stmts | 目標Branch | 目標Funcs | 目標Lines |
|------|-----------|-----------|-----------|-----------|
| formatDate | 100% | 100% | 100% | 100% |
| formatShortDate | 100% | 100% | 100% | 100% |
| formatLongDate | 100% | 100% | 100% | 100% |
| formatTime | 100% | 100% | 100% | 100% |
| getCurrentTimestamp | 100% | N/A | 100% | 100% |
| formatRelativeTime | 90%+ | 90%+ | 100% | 90%+ |

### 全体目標

- **Statements**: 95%以上
- **Branches**: 90%以上
- **Functions**: 100%
- **Lines**: 95%以上

## 実装チェックリスト

- [ ] テストファイル作成: `__tests__/lib/date-utils.test.ts`
- [ ] 各関数にdescribeブロックを作成
- [ ] 正常系テストケースを実装
- [ ] 異常系テストケース（null、undefined、無効な日付）を実装
- [ ] エッジケース（境界値、特殊ケース）を実装
- [ ] `jest.useFakeTimers()`を使用した時刻固定テストを実装
- [ ] カバレッジを測定（`npm test date-utils -- --coverage`）
- [ ] 未カバー行を確認し、追加テストケースを実装
- [ ] 全テストがpassすることを確認
- [ ] 既存の234テストがpassすることを確認

## 所要時間見積もり

- **テストファイル作成**: 30分
- **正常系テスト実装**: 60分
- **異常系・エッジケース実装**: 45分
- **カバレッジ確認と追加テスト**: 30分
- **リファクタリングとレビュー**: 15分

**合計**: 約3時間
