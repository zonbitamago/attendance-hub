# Data Model: 出欠確認プロトタイプ

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Date**: 2025-11-05
**Updated**: 2025-11-06（EventDate中心の設計に刷新）

## Overview

プロトタイプの出欠確認アプリケーションのデータモデル設計。localStorageを使用した永続化を前提とし、将来的にSupabase PostgreSQLへの移行を想定した構造。

**設計方針**:
- **EventDate（イベント日付）**を中心としたデータモデル
- **Group（グループ）**は楽器パート、部署、クラスなどのメンバー所属を表す
- **Member（メンバー）**はグループに所属する参加者
- **Attendance（出欠登録）**はイベント日付とメンバーの組み合わせで管理

## Core Entities

### EventDate（イベント日付）

練習日や本番などの具体的な日付を表すエンティティ。

```typescript
interface EventDate {
  id: string;         // UUID v4 (crypto.randomUUID())
  date: string;       // YYYY-MM-DD形式
  title: string;      // "練習", "本番"等（必須、最大100文字）
  location?: string;  // 場所（任意、最大200文字）
  createdAt: string;  // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `date`: 必須、YYYY-MM-DD形式（例: "2025-12-20"）
- `title`: 必須、1〜100文字、空白のみは不可
- `location`: 任意、0〜200文字
- `createdAt`: ISO 8601形式

**localStorage Key**: `attendance-hub:eventDates`

**Example**:
```json
{
  "id": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "date": "2025-12-20",
  "title": "練習",
  "location": "音楽室",
  "createdAt": "2025-11-06T10:00:00.000Z"
}
```

---

### Group（グループ）

楽器パート、部署、クラスなど、メンバーの所属を表すエンティティ。

```typescript
interface Group {
  id: string;       // UUID v4 (crypto.randomUUID())
  name: string;     // グループ名（必須、最大50文字）例: "打", "Cla", "営業部"
  order: number;    // 表示順（0から開始）
  color?: string;   // UI表示用の色（任意、Hex形式）
  createdAt: string; // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `name`: 必須、1〜50文字、空白のみは不可
- `order`: 必須、0以上の整数
- `color`: 任意、Hex形式（例: "#FF5733"）
- `createdAt`: ISO 8601形式

**localStorage Key**: `attendance-hub:groups`

**Example**:
```json
{
  "id": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "打",
  "order": 0,
  "color": "#FF5733",
  "createdAt": "2025-11-06T10:30:00.000Z"
}
```

---

### Member（メンバー）

グループに所属する参加者を表すエンティティ。

```typescript
interface Member {
  id: string;        // UUID v4 (crypto.randomUUID())
  groupId: string;   // 所属するグループのID（外部キー）
  name: string;      // メンバー名（必須、最大50文字）
  createdAt: string; // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `groupId`: 必須、存在するグループのIDでなければならない
- `name`: 必須、1〜50文字、空白のみは不可
- `createdAt`: ISO 8601形式

**localStorage Key**: `attendance-hub:members`

**Example**:
```json
{
  "id": "m1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
  "groupId": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "田中太郎",
  "createdAt": "2025-11-06T11:00:00.000Z"
}
```

---

### Attendance（出欠登録）

特定のイベント日付に対するメンバーの出欠状況を表すエンティティ。

```typescript
type AttendanceStatus = '◯' | '△' | '✗';

interface Attendance {
  id: string;                // UUID v4 (crypto.randomUUID())
  eventDateId: string;       // 対象イベント日付のID（外部キー）
  memberId: string;          // 出欠を登録するメンバーのID（外部キー）
  status: AttendanceStatus;  // 出欠状況: ◯（出席）、△（未定）、✗（欠席）
  createdAt: string;         // ISO 8601形式の日時文字列
}
```

**Validation Rules**:
- `id`: UUID v4形式、自動生成
- `eventDateId`: 必須、存在するイベント日付のIDでなければならない
- `memberId`: 必須、存在するメンバーのIDでなければならない
- `status`: 必須、'◯' | '△' | '✗' のいずれか
- `createdAt`: ISO 8601形式

**localStorage Key**: `attendance-hub:attendances`

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "eventDateId": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "memberId": "m1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
  "status": "◯",
  "createdAt": "2025-11-06T12:00:00.000Z"
}
```

---

### GroupSummary（グループ別集計結果）

イベント日付ごとのグループ別出欠集計を表す。エンティティとしては保存せず、Attendanceデータから動的に算出する。

```typescript
interface GroupSummary {
  groupId: string;        // 対象グループのID
  groupName: string;      // グループ名
  attending: number;      // ◯の人数
  maybe: number;          // △の人数
  notAttending: number;   // ✗の人数
  total: number;          // 合計人数（グループの全メンバー数）
}
```

**Example**:
```json
{
  "groupId": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "groupName": "打",
  "attending": 2,
  "maybe": 1,
  "notAttending": 0,
  "total": 3
}
```

---

### EventSummary（イベント集計結果）

イベント日付全体の出欠集計を表す。エンティティとしては保存せず、Attendanceデータから動的に算出する。

```typescript
interface EventSummary {
  eventDateId: string;         // 対象イベント日付のID
  totalAttending: number;      // 全体の◯の人数
  totalMaybe: number;          // 全体の△の人数
  totalNotAttending: number;   // 全体の✗の人数
  totalResponded: number;      // 出欠回答済みの人数
  groupSummaries: GroupSummary[]; // グループ別集計
}
```

**算出ロジック**:
```typescript
function calculateEventSummary(
  eventDateId: string,
  attendances: Attendance[],
  groups: Group[],
  members: Member[]
): EventSummary {
  const eventAttendances = attendances.filter(a => a.eventDateId === eventDateId);

  const groupSummaries = groups.map(group => {
    const groupMembers = members.filter(m => m.groupId === group.id);
    const groupAttendances = eventAttendances.filter(a =>
      groupMembers.some(m => m.id === a.memberId)
    );

    return {
      groupId: group.id,
      groupName: group.name,
      attending: groupAttendances.filter(a => a.status === '◯').length,
      maybe: groupAttendances.filter(a => a.status === '△').length,
      notAttending: groupAttendances.filter(a => a.status === '✗').length,
      total: groupMembers.length
    };
  });

  return {
    eventDateId,
    totalAttending: groupSummaries.reduce((sum, g) => sum + g.attending, 0),
    totalMaybe: groupSummaries.reduce((sum, g) => sum + g.maybe, 0),
    totalNotAttending: groupSummaries.reduce((sum, g) => sum + g.notAttending, 0),
    totalResponded: eventAttendances.length,
    groupSummaries
  };
}
```

**Example**:
```json
{
  "eventDateId": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "totalAttending": 5,
  "totalMaybe": 2,
  "totalNotAttending": 1,
  "totalResponded": 8,
  "groupSummaries": [
    {
      "groupId": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "groupName": "打",
      "attending": 2,
      "maybe": 1,
      "notAttending": 0,
      "total": 3
    },
    {
      "groupId": "g2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
      "groupName": "Cla",
      "attending": 3,
      "maybe": 1,
      "notAttending": 1,
      "total": 5
    }
  ]
}
```

## Data Relationships

```
EventDate (1) ----< (N) Attendance
     |
     +-- id → Attendance.eventDateId (外部キー)

Group (1) ----< (N) Member
  |
  +-- id → Member.groupId (外部キー)

Member (1) ----< (N) Attendance
   |
   +-- id → Attendance.memberId (外部キー)
```

**リレーションシップの説明**:
- 1つの**EventDate**は複数の**Attendance**を持つ（1対多）
- 1つの**Group**は複数の**Member**を持つ（1対多）
- 1つの**Member**は複数の**Attendance**を持つ（1対多、異なるイベント日付に対して）
- **Attendance**は**EventDate**と**Member**の組み合わせで一意に識別される

**削除時の動作**（将来実装時）:
- EventDateが削除される場合、関連するAttendanceも削除すべき（CASCADE）
- Groupが削除される場合、関連するMemberとそのAttendanceも削除すべき（CASCADE）
- Memberが削除される場合、関連するAttendanceも削除すべき（CASCADE）

## localStorage Structure

### データの保存形式

```typescript
// localStorage.getItem('attendance-hub:eventDates')
{
  "eventDates": [
    {
      "id": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "date": "2025-12-20",
      "title": "練習",
      "location": "音楽室",
      "createdAt": "2025-11-06T10:00:00.000Z"
    }
    // ... more event dates
  ]
}

// localStorage.getItem('attendance-hub:groups')
{
  "groups": [
    {
      "id": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "打",
      "order": 0,
      "color": "#FF5733",
      "createdAt": "2025-11-06T10:30:00.000Z"
    }
    // ... more groups
  ]
}

// localStorage.getItem('attendance-hub:members')
{
  "members": [
    {
      "id": "m1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
      "groupId": "g1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "田中太郎",
      "createdAt": "2025-11-06T11:00:00.000Z"
    }
    // ... more members
  ]
}

// localStorage.getItem('attendance-hub:attendances')
{
  "attendances": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "eventDateId": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "memberId": "m1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
      "status": "◯",
      "createdAt": "2025-11-06T12:00:00.000Z"
    }
    // ... more attendances
  ]
}
```

### Storage Operations

```typescript
// 読み込み
function loadEventDates(): EventDate[] {
  const data = localStorage.getItem('attendance-hub:eventDates');
  return data ? JSON.parse(data).eventDates : [];
}

function loadGroups(): Group[] {
  const data = localStorage.getItem('attendance-hub:groups');
  return data ? JSON.parse(data).groups : [];
}

function loadMembers(): Member[] {
  const data = localStorage.getItem('attendance-hub:members');
  return data ? JSON.parse(data).members : [];
}

function loadAttendances(): Attendance[] {
  const data = localStorage.getItem('attendance-hub:attendances');
  return data ? JSON.parse(data).attendances : [];
}

// 保存
function saveEventDates(eventDates: EventDate[]): void {
  localStorage.setItem('attendance-hub:eventDates', JSON.stringify({ eventDates }));
}

function saveGroups(groups: Group[]): void {
  localStorage.setItem('attendance-hub:groups', JSON.stringify({ groups }));
}

function saveMembers(members: Member[]): void {
  localStorage.setItem('attendance-hub:members', JSON.stringify({ members }));
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

// EventDate
export const EventDateSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD形式で入力してください'),
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください').trim(),
  location: z.string().max(200, '場所は200文字以内で入力してください').optional(),
  createdAt: z.string().datetime(),
});

export const CreateEventDateInputSchema = EventDateSchema.omit({ id: true, createdAt: true });

// Group
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'グループ名を入力してください').max(50, 'グループ名は50文字以内で入力してください').trim(),
  order: z.number().int().min(0, '表示順は0以上の整数で入力してください'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Hex形式で入力してください').optional(),
  createdAt: z.string().datetime(),
});

export const CreateGroupInputSchema = GroupSchema.omit({ id: true, createdAt: true });

// Member
export const MemberSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください').trim(),
  createdAt: z.string().datetime(),
});

export const CreateMemberInputSchema = MemberSchema.omit({ id: true, createdAt: true });

// Attendance
export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  eventDateId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime(),
});

export const CreateAttendanceInputSchema = AttendanceSchema.omit({ id: true, createdAt: true });

// 型推論
export type EventDate = z.infer<typeof EventDateSchema>;
export type CreateEventDateInput = z.infer<typeof CreateEventDateInputSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;
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
