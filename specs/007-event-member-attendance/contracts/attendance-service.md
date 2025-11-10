# API Contract: attendance-service

**フィーチャー**: 007-event-member-attendance
**作成日**: 2025-11-10
**ステータス**: Phase 1

## 概要

`lib/attendance-service.ts` に追加する新規関数のインターフェース定義。グループメンバーの個人別出欠状況を取得するサービス関数。

---

## 新規関数

### getGroupMemberAttendances

グループの全メンバーと各自の出欠状況を取得する。未登録メンバーも含めて返す。

#### シグネチャ

```typescript
export function getGroupMemberAttendances(
  organizationId: string,
  eventDateId: string,
  groupId: string
): MemberAttendanceDetail[]
```

#### パラメータ

| パラメータ | 型 | 説明 |
|-----------|----|----|
| `organizationId` | `string` | 団体ID |
| `eventDateId` | `string` | イベント日付ID |
| `groupId` | `string` | グループID |

#### 戻り値

| 型 | 説明 |
|----|----|
| `MemberAttendanceDetail[]` | グループメンバーの出欠詳細リスト。名前順（五十音順/アルファベット順）でソート済み |

#### 処理フロー

```typescript
function getGroupMemberAttendances(
  organizationId: string,
  eventDateId: string,
  groupId: string
): MemberAttendanceDetail[] {
  // 1. グループを取得
  const group = loadGroups(organizationId).find(g => g.id === groupId);
  if (!group) return [];

  // 2. グループの全メンバーを取得
  const allMembers = loadMembers(organizationId).filter(
    m => m.groupId === groupId
  );

  // 3. イベントの全出欠レコードを取得
  const attendances = getAttendancesByEventDateId(organizationId, eventDateId);

  // 4. メンバーIDから出欠レコードへのマップを作成
  const attendanceMap = new Map<string, Attendance>();
  for (const att of attendances) {
    attendanceMap.set(att.memberId, att);
  }

  // 5. メンバーと出欠レコードを結合
  const details: MemberAttendanceDetail[] = allMembers.map(member => {
    const attendance = attendanceMap.get(member.id);
    return {
      memberId: member.id,
      memberName: member.name,
      groupId: group.id,
      groupName: group.name,
      status: attendance?.status ?? null,
      hasRegistered: attendance !== undefined,
      memberCreatedAt: member.createdAt,
    };
  });

  // 6. 名前順でソート
  details.sort((a, b) =>
    a.memberName.localeCompare(b.memberName, 'ja')
  );

  return details;
}
```

#### 例

**入力**:
```typescript
const details = getGroupMemberAttendances(
  'org-123',
  'event-456',
  'group-789'
);
```

**出力**:
```typescript
[
  {
    memberId: 'member-001',
    memberName: '伊藤健太',
    groupId: 'group-789',
    groupName: '打',
    status: '✗',
    hasRegistered: true,
    memberCreatedAt: '2025-01-05T00:00:00Z',
  },
  {
    memberId: 'member-002',
    memberName: '佐藤次郎',
    groupId: 'group-789',
    groupName: '打',
    status: null, // 未登録
    hasRegistered: false,
    memberCreatedAt: '2025-01-03T00:00:00Z',
  },
  {
    memberId: 'member-003',
    memberName: '鈴木花子',
    groupId: 'group-789',
    groupName: '打',
    status: '◯',
    hasRegistered: true,
    memberCreatedAt: '2025-01-02T00:00:00Z',
  },
  // ... 名前の五十音順で続く
]
```

#### エラー処理

| ケース | 動作 |
|--------|------|
| グループが見つからない | 空配列 `[]` を返す |
| メンバーが0人 | 空配列 `[]` を返す |
| 出欠レコードが0件 | すべてのメンバーで `status: null, hasRegistered: false` |
| organizationId が不正 | 空配列 `[]` を返す |

#### パフォーマンス

- **計算量**: O(M + A) where M = メンバー数, A = 出欠レコード数
- **メモリ**: O(M + A)
- **想定**: M ≈ 10-50人/グループ、A ≈ 100-500レコード/イベント
- **目標**: 100人のグループで50ms以内

---

## 既存関数の利用

### loadMembers

```typescript
export function loadMembers(organizationId: string): Member[]
```

全メンバーを取得。`getGroupMemberAttendances()` 内でフィルタリング。

### loadGroups

```typescript
export function loadGroups(organizationId: string): Group[]
```

全グループを取得。グループ名を取得するために使用。

### getAttendancesByEventDateId

```typescript
export function getAttendancesByEventDateId(
  organizationId: string,
  eventDateId: string
): Attendance[]
```

特定のイベント日付の全出欠レコードを取得。

---

## テスト要件

### ユニットテスト（TDD）

#### テストケース1: 通常ケース（出欠登録済み + 未登録）

```typescript
test('出欠登録済みと未登録のメンバーを正しく返す', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  // メンバー2人を作成
  createMember(orgId, groupId, '山田太郎');
  const member2 = createMember(orgId, groupId, '鈴木花子');

  // 鈴木花子のみ出欠登録
  registerAttendance(orgId, eventId, member2.id, '◯');

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details).toHaveLength(2);
  expect(details[0].memberName).toBe('鈴木花子');
  expect(details[0].status).toBe('◯');
  expect(details[0].hasRegistered).toBe(true);
  expect(details[1].memberName).toBe('山田太郎');
  expect(details[1].status).toBe(null);
  expect(details[1].hasRegistered).toBe(false);
});
```

#### テストケース2: 全員登録済み

```typescript
test('全員が出欠登録済みの場合', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  const member1 = createMember(orgId, groupId, '山田太郎');
  const member2 = createMember(orgId, groupId, '鈴木花子');

  registerAttendance(orgId, eventId, member1.id, '◯');
  registerAttendance(orgId, eventId, member2.id, '△');

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details).toHaveLength(2);
  expect(details.every(d => d.hasRegistered)).toBe(true);
  expect(details[0].memberName).toBe('鈴木花子');
  expect(details[0].status).toBe('△');
  expect(details[1].memberName).toBe('山田太郎');
  expect(details[1].status).toBe('◯');
});
```

#### テストケース3: 全員未登録

```typescript
test('全員が未登録の場合', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  createMember(orgId, groupId, '山田太郎');
  createMember(orgId, groupId, '鈴木花子');

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details).toHaveLength(2);
  expect(details.every(d => !d.hasRegistered)).toBe(true);
  expect(details.every(d => d.status === null)).toBe(true);
});
```

#### テストケース4: メンバーが0人

```typescript
test('グループにメンバーがいない場合', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-empty';

  createGroup(orgId, 'Empty Group', groupId);

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details).toHaveLength(0);
});
```

#### テストケース5: グループが存在しない

```typescript
test('グループが存在しない場合は空配列を返す', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'nonexistent-group';

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details).toHaveLength(0);
});
```

#### テストケース6: 名前順ソート（日本語）

```typescript
test('メンバーが名前の五十音順でソートされる', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  createMember(orgId, groupId, '田中美咲');
  createMember(orgId, groupId, '伊藤健太');
  createMember(orgId, groupId, '佐藤次郎');

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details.map(d => d.memberName)).toEqual([
    '伊藤健太',
    '佐藤次郎',
    '田中美咲',
  ]);
});
```

#### テストケース7: 名前順ソート（アルファベット）

```typescript
test('メンバーが名前のアルファベット順でソートされる', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  createMember(orgId, groupId, 'Charlie');
  createMember(orgId, groupId, 'Alice');
  createMember(orgId, groupId, 'Bob');

  // Act
  const details = getGroupMemberAttendances(orgId, eventId, groupId);

  // Assert
  expect(details.map(d => d.memberName)).toEqual([
    'Alice',
    'Bob',
    'Charlie',
  ]);
});
```

#### テストケース8: 大量データ（パフォーマンステスト）

```typescript
test('100人のメンバーでもパフォーマンスが許容範囲内', () => {
  // Setup
  const orgId = 'org-1';
  const eventId = 'event-1';
  const groupId = 'group-1';

  // 100人のメンバーを作成
  for (let i = 0; i < 100; i++) {
    const member = createMember(orgId, groupId, `メンバー${i}`);
    // 半数は出欠登録済み
    if (i % 2 === 0) {
      registerAttendance(orgId, eventId, member.id, '◯');
    }
  }

  // Act
  const startTime = performance.now();
  const details = getGroupMemberAttendances(orgId, eventId, groupId);
  const endTime = performance.now();

  // Assert
  expect(details).toHaveLength(100);
  expect(endTime - startTime).toBeLessThan(50); // 50ms以内
});
```

---

## 型の追加

`types/index.ts` に以下を追加:

```typescript
// メンバー出欠詳細
export interface MemberAttendanceDetail {
  memberId: string;
  memberName: string;
  groupId: string;
  groupName: string;
  status: AttendanceStatus | null; // null = 未登録
  hasRegistered: boolean;
  memberCreatedAt: string;
}

// フィルタステータス
export type AttendanceFilterStatus =
  | 'all'
  | 'attending'
  | 'maybe'
  | 'notAttending'
  | 'unregistered';

// ソート種類
export type AttendanceSortBy = 'name' | 'status';
```

---

## 依存関係

### 既存の関数
- `loadMembers()`
- `loadGroups()`
- `getAttendancesByEventDateId()`

### 新規の型
- `MemberAttendanceDetail`
- `AttendanceFilterStatus`
- `AttendanceSortBy`

---

## まとめ

### 新規追加

- ✅ **getGroupMemberAttendances()**: グループメンバーの出欠詳細を取得
- ✅ **MemberAttendanceDetail**: 型定義
- ✅ **AttendanceFilterStatus**: 型定義
- ✅ **AttendanceSortBy**: 型定義

### TDD要件

- 8つのテストケース（通常、エッジケース、パフォーマンス）
- テストファーストで実装
- カバレッジ100%を目標

### 次のステップ

Phase 1の最後のドキュメント:
1. **quickstart.md**: 開発環境セットアップ手順
