# データモデル: マルチテナント団体対応

**フィーチャー**: 005-multi-tenant
**日付**: 2025-11-09
**ステータス**: 設計フェーズ

## 概要

このドキュメントは、マルチテナント団体対応のためのデータモデルを定義します。コアとなる変更は、`Organization`エンティティの導入と、既存の全エンティティへの`organizationId`外部キーの追加により、異なる団体間の完全なデータ分離を実現することです。

## エンティティ関係図

```
┌──────────────────┐
│  Organization    │
├──────────────────┤
│ id (PK)          │ ← ランダムID (10文字、nanoid)
│ name             │
│ description      │
│ createdAt        │
└──────────────────┘
       │
       │ 1
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       │ N            │ N            │ N            │ N
       ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  EventDate   │ │    Group     │ │   Member     │ │  Attendance  │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ orgId (FK)   │ │ orgId (FK)   │ │ orgId (FK)   │ │ orgId (FK)   │
│ date         │ │ name         │ │ groupId (FK) │ │ eventDateId  │
│ title        │ │ order        │ │ name         │ │ memberId     │
│ location     │ │ color        │ │ createdAt    │ │ status       │
│ createdAt    │ │ createdAt    │ └──────────────┘ │ createdAt    │
└──────────────┘ └──────────────┘                  └──────────────┘
                        │ 1                               │ N
                        │                                 │
                        └─────────────────────────────────┘
```

**主要な関係性**:
- 1 Organization → N EventDates, Groups, Members, Attendances
- 1 Group → N Members
- 1 Member → N Attendances
- 1 EventDate → N Attendances
- Attendance は Member と EventDate を結ぶ中間テーブル

## エンティティ定義

### Organization (新規)

**目的**: 出欠管理システムを利用する独立した団体を表します。すべてのデータは正確に1つの団体に属します。

**フィールド**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-------|------|----------|-------------|-------------|
| `id` | `string` | Yes | Primary Key, 10文字、nanoid生成 | 団体の一意識別子（URLパスに使用） |
| `name` | `string` | Yes | 1-100文字 | 団体名（例: "吹奏楽団A"） |
| `description` | `string` | No | 0-500文字 | 団体の説明（オプション） |
| `createdAt` | `string` | Yes | ISO 8601形式 | 作成日時 |

**TypeScript型**:
```typescript
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

**Zodスキーマ**:
```typescript
export const OrganizationSchema = z.object({
  id: z.string().length(10), // nanoid生成
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});

export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
```

**バリデーションルール**:
- `id`: 正確に10文字、nanoidで生成、小文字英数字
- `name`: 必須、1-100文字、空白のみは不可
- `description`: オプション、最大500文字
- `createdAt`: ISO 8601形式、自動生成

**localStorageキー**: `attendance_organizations` (グローバル、全団体のリスト)

---

### EventDate (変更)

**目的**: 特定の団体の練習セッションまたはパフォーマンスイベントを表します。

**v1.0からの変更点**:
- ✅ `organizationId`外部キーを追加

**フィールド**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-------|------|----------|-------------|-------------|
| `id` | `string` | Yes | Primary Key, UUID v4 | イベントの一意識別子 |
| `organizationId` | `string` | Yes | Foreign Key → Organization.id | **新規**: 所属団体 |
| `date` | `string` | Yes | YYYY-MM-DD形式 | イベント日付 |
| `title` | `string` | Yes | 1-100文字 | イベントタイトル |
| `location` | `string` | No | 0-200文字 | 開催場所（オプション） |
| `createdAt` | `string` | Yes | ISO 8601形式 | 作成日時 |

**TypeScript型**:
```typescript
export interface EventDate {
  id: string;
  organizationId: string; // NEW
  date: string;
  title: string;
  location?: string;
  createdAt: string;
}
```

**Zodスキーマ**:
```typescript
export const EventDateSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10), // NEW
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  createdAt: z.string().datetime(),
});

export const CreateEventDateInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
});
```

**localStorageキー**: `attendance_${orgId}_event_dates`

---

### Group (変更)

**目的**: 団体内のセクション/パートを表します（例: 金管、木管）。

**v1.0からの変更点**:
- ✅ `organizationId`外部キーを追加

**フィールド**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-------|------|----------|-------------|-------------|
| `id` | `string` | Yes | Primary Key, UUID v4 | グループの一意識別子 |
| `organizationId` | `string` | Yes | Foreign Key → Organization.id | **新規**: 所属団体 |
| `name` | `string` | Yes | 1-50文字 | グループ名 |
| `order` | `number` | Yes | 整数、≥0 | 表示順序 |
| `color` | `string` | No | Tailwind colorクラス | 表示色（オプション） |
| `createdAt` | `string` | Yes | ISO 8601形式 | 作成日時 |

**TypeScript型**:
```typescript
export interface Group {
  id: string;
  organizationId: string; // NEW
  name: string;
  order: number;
  color?: string;
  createdAt: string;
}
```

**Zodスキーマ**:
```typescript
export const GroupSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10), // NEW
  name: z.string().min(1).max(50),
  order: z.number().int().min(0),
  color: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const CreateGroupInputSchema = z.object({
  name: z.string().min(1).max(50),
  order: z.number().int().min(0),
  color: z.string().optional(),
});
```

**localStorageキー**: `attendance_${orgId}_groups`

---

### Member (変更)

**目的**: 団体内のグループに所属する個々のメンバーを表します。

**v1.0からの変更点**:
- ✅ `organizationId`外部キーを追加

**フィールド**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-------|------|----------|-------------|-------------|
| `id` | `string` | Yes | Primary Key, UUID v4 | メンバーの一意識別子 |
| `organizationId` | `string` | Yes | Foreign Key → Organization.id | **新規**: 所属団体 |
| `groupId` | `string` | Yes | Foreign Key → Group.id | 所属グループ |
| `name` | `string` | Yes | 1-50文字 | メンバー名 |
| `createdAt` | `string` | Yes | ISO 8601形式 | 作成日時 |

**TypeScript型**:
```typescript
export interface Member {
  id: string;
  organizationId: string; // NEW
  groupId: string;
  name: string;
  createdAt: string;
}
```

**Zodスキーマ**:
```typescript
export const MemberSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10), // NEW
  groupId: z.string().uuid(),
  name: z.string().min(1).max(50),
  createdAt: z.string().datetime(),
});

export const CreateMemberInputSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1).max(50),
});
```

**localStorageキー**: `attendance_${orgId}_members`

---

### Attendance (変更)

**目的**: 特定のイベントにおけるメンバーの出欠ステータスを記録します。

**v1.0からの変更点**:
- ✅ `organizationId`外部キーを追加

**フィールド**:

| フィールド | 型 | 必須 | 制約 | 説明 |
|-------|------|----------|-------------|-------------|
| `id` | `string` | Yes | Primary Key, UUID v4 | 出欠記録の一意識別子 |
| `organizationId` | `string` | Yes | Foreign Key → Organization.id | **新規**: 所属団体 |
| `eventDateId` | `string` | Yes | Foreign Key → EventDate.id | イベントID |
| `memberId` | `string` | Yes | Foreign Key → Member.id | メンバーID |
| `status` | `AttendanceStatus` | Yes | '◯' \| '△' \| '✗' | 出欠ステータス |
| `createdAt` | `string` | Yes | ISO 8601形式 | 作成日時 |

**TypeScript型**:
```typescript
export type AttendanceStatus = '◯' | '△' | '✗';

export interface Attendance {
  id: string;
  organizationId: string; // NEW
  eventDateId: string;
  memberId: string;
  status: AttendanceStatus;
  createdAt: string;
}
```

**Zodスキーマ**:
```typescript
export const AttendanceStatusSchema = z.enum(['◯', '△', '✗']);

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().length(10), // NEW
  eventDateId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime(),
});

export const CreateAttendanceInputSchema = z.object({
  eventDateId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: AttendanceStatusSchema,
});
```

**一意制約**: `(eventDateId, memberId)` の組み合わせは一意（同一イベント・同一メンバーの重複登録を防止）

**localStorageキー**: `attendance_${orgId}_attendances`

---

## データ整合性ルール

### 外部キー制約

| 子エンティティ | フィールド | 参照先 | 削除時 |
|-------------|-------|------------|-----------|
| `EventDate` | `organizationId` | `Organization.id` | CASCADE |
| `Group` | `organizationId` | `Organization.id` | CASCADE |
| `Member` | `organizationId` | `Organization.id` | CASCADE |
| `Member` | `groupId` | `Group.id` | CASCADE |
| `Attendance` | `organizationId` | `Organization.id` | CASCADE |
| `Attendance` | `eventDateId` | `EventDate.id` | CASCADE |
| `Attendance` | `memberId` | `Member.id` | CASCADE |

**注意**: localStorageは参照整合性を強制しません。サービス層関数がこれらの制約を手動で強制する必要があります。

### バリデーションルール

1. **団体の一意性**:
   - `Organization.id`は全団体で一意である必要があります
   - nanoidで生成、衝突確率は〜0%

2. **データ分離**:
   - すべてのクエリは`organizationId`でフィルタする必要があります
   - 団体間のデータアクセスは禁止されています
   - サービス層関数は`organizationId`パラメータを検証する必要があります

3. **カスケード削除**:
   - 団体を削除すると、関連するすべてのEventDates、Groups、Members、Attendancesが削除されます
   - グループを削除すると、関連するすべてのメンバーとその出欠記録が削除されます
   - イベントを削除すると、関連するすべての出欠記録が削除されます
   - メンバーを削除すると、関連するすべての出欠記録が削除されます

4. **出欠記録の一意性**:
   - `(eventDateId, memberId)`の組み合わせごとに1つの出欠記録のみ
   - 更新にはupsertパターンを使用

---

## v1.0からv2.0へのマイグレーション

### 変更概要

| エンティティ | 変更 | マイグレーション戦略 |
|--------|--------|--------------------|
| `Organization` | **新規** | デフォルト団体を作成し、既存データすべてに割り当て |
| `EventDate` | `organizationId`追加 | デフォルト団体IDでフィールド追加 |
| `Group` | `organizationId`追加 | デフォルト団体IDでフィールド追加 |
| `Member` | `organizationId`追加 | デフォルト団体IDでフィールド追加 |
| `Attendance` | `organizationId`追加 | デフォルト団体IDでフィールド追加 |

### マイグレーションスクリプト

実装については`lib/migration.ts`を参照してください。

**手順**:
1. レガシーlocalStorageキー（`attendance_event_dates`など）を検出
2. nanoidでデフォルト団体を作成
3. レガシーデータを読み込み、各アイテムに`organizationId: defaultOrgId`を追加
4. 新しいキー（`attendance_${defaultOrgId}_event_dates`など）に保存
5. レガシーキーを削除
6. マイグレーション完了フラグを設定

**ロールバック**: マイグレーションが失敗した場合、レガシーキーはそのまま残ります。ユーザーはリトライまたは新規開始できます。

---

## localStorageスキーマ

### キー構造

```
attendance_organizations                     → Organization[]（グローバル）
attendance_migration_completed               → "true"（マイグレーションフラグ）

attendance_${orgId}_event_dates              → EventDate[]
attendance_${orgId}_groups                   → Group[]
attendance_${orgId}_members                  → Member[]
attendance_${orgId}_attendances              → Attendance[]
```

### データ例

```json
// localStorage.getItem('attendance_organizations')
[
  {
    "id": "abc123def4",
    "name": "吹奏楽団A",
    "description": "地域の吹奏楽団です",
    "createdAt": "2025-11-09T10:00:00.000Z"
  },
  {
    "id": "xyz789ghi6",
    "name": "サッカー部B",
    "createdAt": "2025-11-09T11:00:00.000Z"
  }
]

// localStorage.getItem('attendance_abc123def4_event_dates')
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "abc123def4",
    "date": "2025-12-01",
    "title": "定期演奏会",
    "location": "市民ホール",
    "createdAt": "2025-11-09T10:05:00.000Z"
  }
]

// localStorage.getItem('attendance_abc123def4_groups')
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "organizationId": "abc123def4",
    "name": "金管",
    "order": 1,
    "color": "bg-yellow-200",
    "createdAt": "2025-11-09T10:10:00.000Z"
  }
]
```

---

## 将来の検討事項（Supabaseマイグレーション）

Supabase PostgreSQLへ移行する際の考慮事項:

1. **テーブル構造**: 各エンティティが`organization_id`カラムを持つテーブルになります
2. **RLSポリシー**: データ分離を強制するためにRow Level Securityを実装します
3. **インデックス**: クエリパフォーマンスのために`organization_id`にインデックスを追加します
4. **外部キー**: データベースレベルの制約がサービス層バリデーションに置き換わります
5. **認証**: Supabase AuthがRLSポリシーと統合されます
6. **マイグレーションスクリプト**: localStorage JSON → Supabaseへのエクスポート・挿入

**SQL例（将来）**:
```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,  -- nanoid (10文字)
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_dates_org ON event_dates(organization_id);

-- RLS Policy
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization events"
  ON event_dates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid()
  ));
```

---

## データモデルバージョン

**バージョン**: 2.0（マルチテナント）
**前バージョン**: 1.0（シングルテナント）
**マイグレーション必須**: Yes（初回ロード時に自動実行）
**破壊的変更**: Yes（全エンティティで新しい`organizationId`フィールドが必須）

**互換性**:
- v1.0データ: 初回ロード時に自動的にv2.0へマイグレーション
- v2.0データ: v1.0との後方互換性なし（サービス層が`organizationId`を期待）

---

**最終更新**: 2025-11-09
**レビュー**: AI Agent (speckit.plan)
