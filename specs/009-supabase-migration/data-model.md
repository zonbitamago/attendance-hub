# Data Model: Supabase PostgreSQL Schema

**Feature**: 009-supabase-migration
**Created**: 2025-11-15
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md)

## 概要

localStorage から Supabase PostgreSQL への移行に伴い、全エンティティ（Organization, EventDate, Group, Member, Attendance）をPostgreSQLテーブルとして実装する。マルチテナント機能（005-multi-tenant）を Row Level Security (RLS) で統合し、各団体のデータをデータベースレベルで完全に分離する。

## エンティティ関係図 (ERD)

```
┌────────────────────────┐
│   organizations        │
│  (団体)                │
├────────────────────────┤
│ id (PK)               │──┐
│ name                   │  │
│ description            │  │
│ created_at             │  │
└────────────────────────┘  │
                            │
          ┌─────────────────┴──────────────────┬──────────────────┐
          │                                    │                  │
          ▼                                    ▼                  ▼
┌────────────────────────┐         ┌────────────────────────┐  ┌────────────────────────┐
│   event_dates          │         │   groups               │  │   members              │
│  (イベント)            │         │  (グループ)           │  │  (メンバー)           │
├────────────────────────┤         ├────────────────────────┤  ├────────────────────────┤
│ id (PK)               │──┐       │ id (PK)               │──┤ id (PK)               │
│ organization_id (FK)   │  │       │ organization_id (FK)   │  │ organization_id (FK)   │
│ date                   │  │       │ name                   │  │ group_id (FK)          │
│ title                  │  │       │ order                  │  │ name                   │
│ location               │  │       │ color                  │  │ created_at             │
│ created_at             │  │       │ created_at             │  └────────────────────────┘
└────────────────────────┘  │       └────────────────────────┘           │
                            │                                            │
                            └────────────────┬───────────────────────────┘
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │   attendances          │
                                 │  (出欠記録)           │
                                 ├────────────────────────┤
                                 │ id (PK)               │
                                 │ organization_id (FK)   │
                                 │ event_date_id (FK)     │
                                 │ member_id (FK)         │
                                 │ status                 │
                                 │ created_at             │
                                 │                        │
                                 │ UNIQUE(event_date_id,  │
                                 │        member_id)      │
                                 └────────────────────────┘
```

## テーブル定義

### 1. organizations（団体）

**目的**: マルチテナントアーキテクチャの基盤となる団体エンティティ。全ての他のエンティティはいずれかの団体に所属する。

**カラム**:

| カラム名 | 型 | 制約 | 説明 |
|----------|------|------|------|
| `id` | TEXT | PRIMARY KEY, CHECK(LENGTH(id) = 10) | nanoid(10)で生成されるランダムID（10文字、英数字小文字） |
| `name` | TEXT | NOT NULL, CHECK(LENGTH(name) BETWEEN 1 AND 100) | 団体名（1-100文字） |
| `description` | TEXT | CHECK(LENGTH(description) <= 500) | 団体の説明（0-500文字、NULL可） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時（タイムゾーン付き） |

**インデックス**:
- PRIMARY KEY: `id` （自動作成）

**RLS Policy**:
- 認証なしの現段階では、クライアントサイドで `SET app.current_organization_id = '{id}'` を実行して、該当する団体のみアクセス可能にする
- 将来的には Supabase Auth の `auth.uid()` と紐付けて、ユーザーが所属する団体のみアクセス可能にする

**TypeScript型**:
```typescript
export interface Organization {
  id: string;                    // nanoid(10)
  name: string;                  // 1-100文字
  description?: string;          // 0-500文字、オプション
  createdAt: string;            // ISO 8601形式
}
```

---

### 2. event_dates（イベント）

**目的**: 特定の団体に紐づく練習、本番、リハーサルなどのイベント。日付、タイトル、場所を含む。

**カラム**:

| カラム名 | 型 | 制約 | 説明 |
|----------|------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | UUID v4（PostgreSQL自動生成） |
| `organization_id` | TEXT | NOT NULL, REFERENCES organizations(id) ON DELETE CASCADE | 所属する団体のID |
| `date` | DATE | NOT NULL | イベント日付（YYYY-MM-DD） |
| `title` | TEXT | NOT NULL, CHECK(LENGTH(title) BETWEEN 1 AND 100) | イベント名（1-100文字） |
| `location` | TEXT | CHECK(LENGTH(location) <= 200) | 開催場所（0-200文字、NULL可） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス**:
- PRIMARY KEY: `id`
- `idx_event_dates_org`: `organization_id` （RLS最適化、検索最適化）
- `idx_event_dates_date`: `date` （日付順ソート最適化）

**外部キー制約**:
- `organization_id` → `organizations(id)` ON DELETE CASCADE

**RLS Policy**:
```sql
CREATE POLICY "Users can access their organization's events"
ON event_dates
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true));
```

**TypeScript型**:
```typescript
export interface EventDate {
  id: string;                    // UUID v4
  organizationId: string;        // Foreign Key
  date: string;                  // YYYY-MM-DD形式
  title: string;                 // 1-100文字
  location?: string;             // 0-200文字、オプション
  createdAt: string;            // ISO 8601形式
}
```

---

### 3. groups（グループ）

**目的**: 特定の団体内のパート、セクション、チームなど。表示順序と色を持つ。

**カラム**:

| カラム名 | 型 | 制約 | 説明 |
|----------|------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | UUID v4 |
| `organization_id` | TEXT | NOT NULL, REFERENCES organizations(id) ON DELETE CASCADE | 所属する団体のID |
| `name` | TEXT | NOT NULL, CHECK(LENGTH(name) BETWEEN 1 AND 50) | グループ名（1-50文字） |
| `order` | INTEGER | NOT NULL, CHECK("order" >= 0) | 表示順序（0以上の整数） |
| `color` | TEXT | CHECK(color ~ '^#[0-9A-Fa-f]{6}$') | 色コード（#RRGGBB形式、NULL可） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス**:
- PRIMARY KEY: `id`
- `idx_groups_org`: `organization_id`
- `idx_groups_order`: `(organization_id, "order")` （団体内の表示順ソート最適化）

**外部キー制約**:
- `organization_id` → `organizations(id)` ON DELETE CASCADE

**RLS Policy**:
```sql
CREATE POLICY "Users can access their organization's groups"
ON groups
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true));
```

**TypeScript型**:
```typescript
export interface Group {
  id: string;                    // UUID v4
  organizationId: string;        // Foreign Key
  name: string;                  // 1-50文字
  order: number;                 // ≥0
  color?: string;                // #RRGGBB形式、オプション
  createdAt: string;            // ISO 8601形式
}
```

---

### 4. members（メンバー）

**目的**: 特定の団体内のグループに所属するメンバー。

**カラム**:

| カラム名 | 型 | 制約 | 説明 |
|----------|------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | UUID v4 |
| `organization_id` | TEXT | NOT NULL, REFERENCES organizations(id) ON DELETE CASCADE | 所属する団体のID |
| `group_id` | UUID | NOT NULL, REFERENCES groups(id) ON DELETE CASCADE | 所属するグループのID |
| `name` | TEXT | NOT NULL, CHECK(LENGTH(name) BETWEEN 1 AND 50) | メンバー名（1-50文字） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス**:
- PRIMARY KEY: `id`
- `idx_members_org`: `organization_id`
- `idx_members_group`: `group_id` （グループ別メンバー取得最適化）

**外部キー制約**:
- `organization_id` → `organizations(id)` ON DELETE CASCADE
- `group_id` → `groups(id)` ON DELETE CASCADE

**RLS Policy**:
```sql
CREATE POLICY "Users can access their organization's members"
ON members
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true));
```

**TypeScript型**:
```typescript
export interface Member {
  id: string;                    // UUID v4
  organizationId: string;        // Foreign Key
  groupId: string;               // Foreign Key
  name: string;                  // 1-50文字
  createdAt: string;            // ISO 8601形式
}
```

---

### 5. attendances（出欠記録）

**目的**: 特定の団体内のメンバーとイベントの組み合わせによる出欠状況。'◯'（参加）、'△'（未定）、'✗'（欠席）のいずれかのステータスを持つ。

**カラム**:

| カラム名 | 型 | 制約 | 説明 |
|----------|------|------|------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | UUID v4 |
| `organization_id` | TEXT | NOT NULL, REFERENCES organizations(id) ON DELETE CASCADE | 所属する団体のID |
| `event_date_id` | UUID | NOT NULL, REFERENCES event_dates(id) ON DELETE CASCADE | イベントID |
| `member_id` | UUID | NOT NULL, REFERENCES members(id) ON DELETE CASCADE | メンバーID |
| `status` | attendance_status | NOT NULL | 出欠ステータス（ENUM: '◯', '△', '✗'） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| | | UNIQUE (event_date_id, member_id) | 一意制約：同じイベント・メンバーの組み合わせは1件のみ |

**ENUM型定義**:
```sql
CREATE TYPE attendance_status AS ENUM ('◯', '△', '✗');
```

**インデックス**:
- PRIMARY KEY: `id`
- `idx_attendances_org`: `organization_id`
- `idx_attendances_event`: `event_date_id` （イベント別出欠取得最適化）
- `idx_attendances_member`: `member_id` （メンバー別出欠取得最適化）
- UNIQUE INDEX: `(event_date_id, member_id)` （一意制約）

**外部キー制約**:
- `organization_id` → `organizations(id)` ON DELETE CASCADE
- `event_date_id` → `event_dates(id)` ON DELETE CASCADE
- `member_id` → `members(id)` ON DELETE CASCADE

**RLS Policy**:
```sql
CREATE POLICY "Users can access their organization's attendances"
ON attendances
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true));
```

**TypeScript型**:
```typescript
export type AttendanceStatus = '◯' | '△' | '✗';

export interface Attendance {
  id: string;                    // UUID v4
  organizationId: string;        // Foreign Key
  eventDateId: string;           // Foreign Key
  memberId: string;              // Foreign Key
  status: AttendanceStatus;      // '◯' | '△' | '✗'
  createdAt: string;            // ISO 8601形式
}
```

---

## カスケード削除の動作

**Organization削除時**:
- 関連する全ての event_dates, groups, members, attendances が自動的に削除される（ON DELETE CASCADE）

**Event削除時**:
- 関連する全ての attendances が自動的に削除される

**Group削除時**:
- 関連する全ての members が自動的に削除される
- さらに、それらのmembersに紐づく attendances も削除される（連鎖）

**Member削除時**:
- 関連する全ての attendances が自動的に削除される

---

## パフォーマンス最適化

### インデックス戦略

1. **organization_id インデックス（全テーブル）**:
   - RLSポリシーの最適化
   - 団体別データ取得の高速化

2. **日付インデックス（event_dates.date）**:
   - 日付順ソートの最適化
   - 日付範囲検索の最適化

3. **表示順インデックス（groups: organization_id + order）**:
   - 団体内のグループ表示順ソートの最適化

4. **グループIDインデックス（members.group_id）**:
   - グループ別メンバー取得の最適化

5. **イベント・メンバーインデックス（attendances）**:
   - イベント別出欠取得の最適化
   - メンバー別出欠履歴取得の最適化
   - 一意制約の強制

### クエリパフォーマンス目標

- **100メンバーの集計処理**: 200ms以内
- **1000+レコードのクエリ**: 500ms以内
- **単純なCRUD操作**: 50ms以内

---

## マイグレーションの順序

1. `001_create_organizations.sql` - organizations テーブル作成
2. `002_create_event_dates.sql` - event_dates テーブル作成（organizationsに依存）
3. `003_create_groups.sql` - groups テーブル作成（organizationsに依存）
4. `004_create_members.sql` - members テーブル作成（organizations, groupsに依存）
5. `005_create_attendances.sql` - attendances テーブル作成（全テーブルに依存）
6. `006_enable_rls.sql` - 全テーブルにRLSポリシーを設定
7. `007_create_indexes.sql` - パフォーマンス最適化用インデックスを作成

---

## Supabase型定義の生成

Supabase CLIを使用して、データベーススキーマからTypeScript型定義を自動生成：

```bash
npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
```

生成された型定義は、Supabase Clientとの型安全な統合に使用される。
