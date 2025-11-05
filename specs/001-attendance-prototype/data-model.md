# Data Model: 出欠確認プロトタイプ

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-11-05

## Overview

プロトタイプの出欠確認アプリケーションのデータモデル設計。localStorageを使用した永続化を前提とし、将来的にSupabase PostgreSQLへの移行を想定したシンプルな構造。

## Core Entities

### Group（グループ）

イベントやミーティングを表すエンティティ。

```typescript
interface Group {
  id: string;              // UUID v4 (crypto.randomUUID())
  name: string;            // グループ名（必須、最大100文字）
  description?: string;    // 説明（任意、最大500文字）
  createdAt: string;       // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `name`: 必須、1〜100文字、空白のみは不可
- `description`: 任意、0〜500文字
- `createdAt`: ISO 8601形式 (例: "2025-11-05T10:30:00.000Z")

**localStorage Key**: `attendance-hub:groups`

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "12月の忘年会",
  "description": "12月20日開催",
  "createdAt": "2025-11-05T10:30:00.000Z"
}
```

---

### Attendance（出欠登録）

ユーザーの出欠状況を表すエンティティ。

```typescript
type AttendanceStatus = '◯' | '△' | '✗';

interface Attendance {
  id: string;                // UUID v4 (crypto.randomUUID())
  groupId: string;           // 所属するグループのID（外部キー）
  userName: string;          // 登録者名（必須、最大50文字）
  status: AttendanceStatus;  // 出欠状況: ◯（出席）、△（未定）、✗（欠席）
  createdAt: string;         // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `groupId`: 必須、存在するグループのIDでなければならない
- `userName`: 必須、1〜50文字、空白のみは不可
- `status`: 必須、'◯' | '△' | '✗' のいずれか
- `createdAt`: ISO 8601形式

**localStorage Key**: `attendance-hub:attendances`

**Example**:
```json
{
  "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
  "groupId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "userName": "田中太郎",
  "status": "◯",
  "createdAt": "2025-11-05T11:45:00.000Z"
}
```

---

### Summary（集計結果）

グループごとの出欠状況の集計結果を表す。エンティティとしては保存せず、Attendanceデータから動的に算出する。

```typescript
interface Summary {
  groupId: string;        // 対象グループのID
  attending: number;      // ◯の人数
  maybe: number;          // △の人数
  notAttending: number;   // ✗の人数
  total: number;          // 合計人数
}
```

**算出ロジック**:
```typescript
function calculateSummary(groupId: string, attendances: Attendance[]): Summary {
  const groupAttendances = attendances.filter(a => a.groupId === groupId);

  return {
    groupId,
    attending: groupAttendances.filter(a => a.status === '◯').length,
    maybe: groupAttendances.filter(a => a.status === '△').length,
    notAttending: groupAttendances.filter(a => a.status === '✗').length,
    total: groupAttendances.length
  };
}
```

**Example**:
```json
{
  "groupId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "attending": 2,
  "maybe": 1,
  "notAttending": 1,
  "total": 4
}
```

## Data Relationships

```
Group (1) ----< (N) Attendance
  |
  +-- id → Attendance.groupId (外部キー)
```

- 1つのGroupは複数のAttendanceを持つ（1対多）
- AttendanceはgroupIdによってGroupに関連付けられる
- Groupが削除される場合、関連するAttendanceも削除すべき（将来実装）

## localStorage Structure

### データの保存形式

```typescript
// localStorage.getItem('attendance-hub:groups')
{
  "groups": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "12月の忘年会",
      "description": "12月20日開催",
      "createdAt": "2025-11-05T10:30:00.000Z"
    },
    // ... more groups
  ]
}

// localStorage.getItem('attendance-hub:attendances')
{
  "attendances": [
    {
      "id": "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      "groupId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "userName": "田中太郎",
      "status": "◯",
      "createdAt": "2025-11-05T11:45:00.000Z"
    },
    // ... more attendances
  ]
}
```

### Storage Operations

```typescript
// 読み込み
function loadGroups(): Group[] {
  const data = localStorage.getItem('attendance-hub:groups');
  return data ? JSON.parse(data).groups : [];
}

function loadAttendances(): Attendance[] {
  const data = localStorage.getItem('attendance-hub:attendances');
  return data ? JSON.parse(data).attendances : [];
}

// 保存
function saveGroups(groups: Group[]): void {
  localStorage.setItem('attendance-hub:groups', JSON.stringify({ groups }));
}

function saveAttendances(attendances: Attendance[]): void {
  localStorage.setItem('attendance-hub:attendances', JSON.stringify({ attendances }));
}
```

## Validation Schema (Zod)

```typescript
import { z } from 'zod';

// AttendanceStatus
export const AttendanceStatusSchema = z.enum(['◯', '△', '✗']);

// Group
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください').trim(),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  createdAt: z.string().datetime(),
});

// Group作成時の入力（idとcreatedAtは自動生成）
export const CreateGroupInputSchema = GroupSchema.omit({ id: true, createdAt: true });

// Attendance
export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  userName: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください').trim(),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime(),
});

// Attendance作成時の入力（idとcreatedAtは自動生成）
export const CreateAttendanceInputSchema = AttendanceSchema.omit({ id: true, createdAt: true });

// 型推論
export type Group = z.infer<typeof GroupSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type CreateAttendanceInput = z.infer<typeof CreateAttendanceInputSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;
```

## Migration Path to Supabase

将来的にSupabase PostgreSQLへ移行する際のテーブル設計案：

### groups テーブル

```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 500),
  created_at timestamp with time zone default now() not null
);

-- RLS (Row Level Security) ポリシー
alter table groups enable row level security;

-- 全員が読み取り可能（プロトタイプ互換）
create policy "Anyone can read groups"
  on groups for select
  using (true);

-- 全員が作成可能（プロトタイプ互換、将来的に制限）
create policy "Anyone can create groups"
  on groups for insert
  with check (true);
```

### attendances テーブル

```sql
create table attendances (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_name text not null check (char_length(user_name) between 1 and 50),
  status text not null check (status in ('◯', '△', '✗')),
  created_at timestamp with time zone default now() not null
);

-- インデックス
create index attendances_group_id_idx on attendances(group_id);
create index attendances_created_at_idx on attendances(created_at);

-- RLS ポリシー
alter table attendances enable row level security;

create policy "Anyone can read attendances"
  on attendances for select
  using (true);

create policy "Anyone can create attendances"
  on attendances for insert
  with check (true);

create policy "Anyone can update attendances"
  on attendances for update
  using (true);

create policy "Anyone can delete attendances"
  on attendances for delete
  using (true);
```

## Data Constraints

### Size Limits

- **Group name**: 1〜100文字
- **Group description**: 0〜500文字
- **Attendance userName**: 1〜50文字
- **localStorage total size**: 5-10MB（ブラウザ依存）

### Business Rules

1. **重複登録**: 同じ名前で同じグループに複数回登録可能（プロトタイプ仕様）
2. **削除**: Attendanceの削除は可能だが、Groupの削除はプロトタイプでは未実装
3. **編集**: Attendanceのstatusのみ編集可能（userName、groupIdは編集不可）
4. **履歴**: createdAtは変更不可（編集時も元の作成日時を保持）

## Performance Considerations

### localStorage最適化

- データ取得は必要最小限に（不要な全件取得を避ける）
- 書き込みは操作ごとに行う（データ整合性優先）
- 100グループ + 各50件の出欠登録（約5000件）でも3秒以内に表示できるよう最適化

### 将来の最適化ポイント

- グループIDによるAttendanceのインデックス化
- 集計結果のメモ化（useMemo）
- 仮想スクロール（大量データ表示時）

## Error Handling

### データ破損時の対応

```typescript
function safeLoadData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    // データが破損している場合は初期化
    localStorage.removeItem(key);
    return fallback;
  }
}
```

### 容量超過時の対応

```typescript
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('データの保存に失敗しました。ストレージの容量が不足しています。');
    }
    return false;
  }
}
```

## Testing Data

### テスト用のサンプルデータ

```typescript
export const mockGroups: Group[] = [
  {
    id: 'test-group-1',
    name: '12月の忘年会',
    description: '12月20日開催',
    createdAt: '2025-11-05T10:00:00.000Z'
  },
  {
    id: 'test-group-2',
    name: 'プロジェクト定例会',
    createdAt: '2025-11-05T11:00:00.000Z'
  }
];

export const mockAttendances: Attendance[] = [
  {
    id: 'test-attendance-1',
    groupId: 'test-group-1',
    userName: '田中太郎',
    status: '◯',
    createdAt: '2025-11-05T11:30:00.000Z'
  },
  {
    id: 'test-attendance-2',
    groupId: 'test-group-1',
    userName: '佐藤花子',
    status: '△',
    createdAt: '2025-11-05T12:00:00.000Z'
  },
  {
    id: 'test-attendance-3',
    groupId: 'test-group-1',
    userName: '鈴木一郎',
    status: '✗',
    createdAt: '2025-11-05T12:30:00.000Z'
  }
];
```

## Notes

- プロトタイプのため、データの正規化は最小限（Supabase移行時に最適化）
- localStorageは同期APIのため、パフォーマンスに注意
- 日付はISO 8601形式で統一（date-fnsでフォーマット）
- UUIDはブラウザ標準の`crypto.randomUUID()`を使用
