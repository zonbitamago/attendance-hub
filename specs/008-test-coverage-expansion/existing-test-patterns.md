# 既存テストパターン分析

**分析日**: 2025-11-12
**参照テストファイル**:
- `__tests__/app/page.test.tsx` - ページコンポーネント
- `__tests__/components/event-detail/member-attendance-list.test.tsx` - 複雑なコンポーネント
- `__tests__/lib/attendance-service.test.ts` - サービス層

## 1. モック戦略

### 1.1 モジュール全体のモック

```typescript
// サービス層やライブラリをモック
jest.mock('@/lib/storage');
jest.mock('@/lib/organization-service');
jest.mock('@/lib/migration');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));
```

### 1.2 型安全なモック関数

```typescript
// jest.MockedFunction を使用して型安全に
const mockLoadAttendances = loadAttendances as jest.MockedFunction<typeof loadAttendances>;
const mockSaveAttendances = saveAttendances as jest.MockedFunction<typeof saveAttendances>;
const mockCreateOrganization = organizationService.createOrganization as jest.MockedFunction<
  typeof organizationService.createOrganization
>;
```

### 1.3 beforeEach でのクリーンアップ

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // localStorageをクリア
  localStorage.clear();
  // デフォルトのモック戻り値を設定
  mockLoadAttendances.mockReturnValue([]);
  mockSaveAttendances.mockReturnValue(true);
});
```

### 1.4 モックの戻り値設定

```typescript
// 基本的な戻り値
mockLoadAttendances.mockReturnValue([]);

// 1回だけの戻り値
mockMigrateToMultiTenant.mockReturnValueOnce({
  migrated: true,
  defaultOrgId: 'default-org-123',
});

// Promise を返すモック
mockCreateAttendance.mockResolvedValue(attendance);
```

### 1.5 jest.spyOn の使用

```typescript
// 特定の関数のみをモック
const mockGetAllOrganizations = jest.spyOn(organizationService, 'getAllOrganizations');
mockGetAllOrganizations.mockReturnValue(mockOrganizations);

// 使用後はリストア
mockGetAllOrganizations.mockRestore();
```

## 2. React Testing Library の使用パターン

### 2.1 コンポーネントのレンダリング

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// 基本的なレンダリング
render(<Home />);
render(<MemberAttendanceList members={mockDetails} />);

// containerを取得（DOM構造を直接確認する場合）
const { container } = render(<MemberAttendanceList members={mockDetails} />);
```

### 2.2 要素のクエリ

```typescript
// テキストで検索
screen.getByText('Attendance Hub');
screen.getByText(/新しい団体を作成/); // 正規表現も使用可能

// ロールで検索（アクセシビリティ推奨）
screen.getByRole('button', { name: /団体を作成/ });
screen.getByRole('link', { name: /アクセスする/ });

// ラベルで検索（フォーム要素）
screen.getByLabelText('団体名');
screen.getByLabelText(/説明/);

// 存在しない要素を確認（queryBy）
screen.queryByText('団体1'); // null を返す
expect(screen.queryByText('団体1')).not.toBeInTheDocument();
```

### 2.3 ユーザーインタラクション

```typescript
// 入力フィールドへの入力
const nameInput = screen.getByLabelText('団体名');
fireEvent.change(nameInput, { target: { value: 'テスト団体' } });

// ボタンのクリック
const createButton = screen.getByRole('button', { name: /団体を作成/ });
fireEvent.click(createButton);
```

### 2.4 非同期処理の待機

```typescript
// waitFor で非同期処理の完了を待つ
await waitFor(() => {
  expect(mockMigrateToMultiTenant).toHaveBeenCalledTimes(1);
});

await waitFor(() => {
  expect(mockPush).toHaveBeenCalledWith('/default-org-123');
});

await waitFor(() => {
  expect(screen.getByText(/マイグレーションに失敗しました/)).toBeInTheDocument();
});
```

## 3. テストの構造

### 3.1 describe によるグループ化

```typescript
// トップレベル: コンポーネント/サービス名
describe('Home (Landing) Page', () => {
  // 機能ごとにネスト
  describe('Migration Integration', () => {
    it('should call migrateToMultiTenant on mount', async () => {
      // ...
    });
  });

  describe('Privacy Protection', () => {
    it('should not display list of organizations for privacy', () => {
      // ...
    });
  });
});

// または Test Case 形式
describe('MemberAttendanceList', () => {
  describe('Test Case 1: メンバー名とステータスの表示', () => {
    it('登録済みメンバーのリストを名前とステータス記号で表示する', () => {
      // ...
    });
  });

  describe('Test Case 2: 未登録メンバーの表示', () => {
    it('未登録メンバーが「-」と表示される', () => {
      // ...
    });
  });
});
```

### 3.2 beforeEach/afterEach の使用

```typescript
describe('Attendance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAttendances.mockReturnValue([]);
    mockSaveAttendances.mockReturnValue(true);
  });

  // テストケース...
});
```

## 4. アサーションスタイル

### 4.1 要素の存在確認

```typescript
// 要素が存在する
expect(screen.getByText('Attendance Hub')).toBeInTheDocument();

// 要素が存在しない
expect(screen.queryByText('団体1')).not.toBeInTheDocument();

// 複数の要素を確認
const memberNames = screen.getAllByText(/いとうけんた|さとうじろう|たなかゆい/);
expect(memberNames).toHaveLength(3);
expect(memberNames[0]).toHaveTextContent('いとうけんた');
```

### 4.2 モック呼び出しの確認

```typescript
// 呼ばれたことを確認
expect(mockCreateOrganization).toHaveBeenCalled();
expect(mockMigrateToMultiTenant).toHaveBeenCalledTimes(1);

// 引数を確認
expect(mockCreateOrganization).toHaveBeenCalledWith({
  name: 'テスト団体',
  description: 'テスト説明',
});

// 呼ばれていないことを確認
expect(mockPush).not.toHaveBeenCalled();
```

### 4.3 オブジェクトの確認

```typescript
// 部分一致（一部のプロパティのみ確認）
expect(attendance).toMatchObject({
  eventDateId: '00000000-0000-0000-0000-000000000001',
  memberId: '00000000-0000-0000-0000-000000000002',
  status: '◯',
});

// 完全一致
expect(summaries).toEqual([
  { groupId: 'group1', groupName: '打', attending: 1, maybe: 1, notAttending: 0, total: 2 },
]);

// プロパティの存在確認
expect(attendance.id).toBeDefined();
expect(attendance.createdAt).toBeDefined();
```

### 4.4 配列の確認

```typescript
// 長さの確認
expect(attendances).toHaveLength(2);

// 空配列
expect(summaries).toEqual([]);

// 全要素が条件を満たすか
expect(details.every((d) => d.hasRegistered)).toBe(true);
expect(details.every((d) => !d.hasRegistered)).toBe(true);
```

### 4.5 エラーの確認

```typescript
// エラーがスローされることを確認
expect(() => createAttendance('test-org-id', input)).toThrow();

// 戻り値の確認
expect(result).toBe(true);
expect(result).toBe(false);
```

### 4.6 属性の確認

```typescript
// href 属性の確認
expect(screen.getByRole('link', { name: /アクセスする/ })).toHaveAttribute(
  'href',
  '/test-org-456'
);
```

## 5. 日本語テスト名の命名規則

### 5.1 describe ブロック

- **パターン1**: コンポーネント/サービス名
  ```typescript
  describe('Home (Landing) Page', () => {});
  describe('MemberAttendanceList', () => {});
  describe('Attendance Service', () => {});
  ```

- **パターン2**: Test Case 形式
  ```typescript
  describe('Test Case 1: メンバー名とステータスの表示', () => {});
  describe('Test Case 2: 未登録メンバーの表示', () => {});
  ```

- **パターン3**: 機能の説明
  ```typescript
  describe('Migration Integration', () => {});
  describe('Privacy Protection', () => {});
  describe('基本シナリオの集計', () => {});
  ```

### 5.2 it/test ブロック

- **パターン1**: 「〜できる」形式
  ```typescript
  it('有効な入力で新しい出欠情報を作成できる', () => {});
  it('特定のイベント日付の出欠情報を取得できる', () => {});
  ```

- **パターン2**: 「〜する」形式
  ```typescript
  it('登録済みメンバーのリストを名前とステータス記号で表示する', () => {});
  it('未登録メンバーが「-」と表示される', () => {});
  ```

- **パターン3**: 「〜の場合は〜」形式
  ```typescript
  it('イベントに出欠情報が存在しない場合は空配列を返す', () => {});
  it('出欠情報が見つからない場合はエラーをスローする', () => {});
  ```

- **パターン4**: 英語形式（既存の一部で使用）
  ```typescript
  it('should display landing content with description and create button', () => {});
  it('should create organization on form submission', () => {});
  ```

### 5.3 推奨スタイル

**本プロジェクトでは日本語形式を推奨**（既存のほとんどのテストが日本語）

```typescript
describe('date-utils', () => {
  describe('formatDate', () => {
    it('文字列の日付を指定フォーマットで変換できる', () => {});
    it('無効な日付の場合は「日付不明」を返す', () => {});
  });

  describe('formatShortDate', () => {
    it('yyyy/MM/dd形式で出力される', () => {});
  });
});
```

## 6. 特殊パターン

### 6.1 window.location のモック

```typescript
// window.location.origin をモック
delete (window as any).location;
(window as any).location = { origin: 'http://localhost:3000' };
```

### 6.2 パフォーマンステスト

```typescript
const startTime = performance.now();
const details = getGroupMemberAttendances(orgId, eventDateId, groupId);
const endTime = performance.now();

expect(details).toHaveLength(100);
expect(endTime - startTime).toBeLessThan(50); // 50ms以内
```

### 6.3 DOM 構造の直接確認

```typescript
const { container } = render(<MemberAttendanceList members={mockDetails} />);

// querySelector で DOM を直接確認
expect(container.querySelector('ul')).not.toBeInTheDocument();
```

## 7. まとめ

### 新規テスト作成時のチェックリスト

- [ ] `jest.mock()` でモジュールをモック
- [ ] `jest.MockedFunction` で型安全なモック関数
- [ ] `beforeEach()` で `jest.clearAllMocks()`
- [ ] `render()` でコンポーネントをレンダリング
- [ ] `screen.getByRole()` などでアクセシビリティ重視のクエリ
- [ ] `fireEvent` でユーザーインタラクション
- [ ] `waitFor()` で非同期処理を待機
- [ ] `describe()` で機能ごとにグループ化
- [ ] 日本語でテスト名を記述
- [ ] `expect().toBeInTheDocument()` などで明確なアサーション

### 避けるべきパターン

- ❌ モックのクリーンアップを忘れる（テスト間で影響）
- ❌ `getByText()` で見つからない要素を検索（エラーになる、`queryByText()` を使う）
- ❌ 非同期処理を `waitFor()` なしで確認
- ❌ モック関数の呼び出しを確認せずにテストを終える
- ❌ テスト名が曖昧で何をテストしているか不明
