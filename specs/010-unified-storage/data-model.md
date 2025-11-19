# データモデル: 統合ストレージ層

**フィーチャー**: 010-unified-storage
**日付**: 2025-11-19

## エンティティ

### StorageMode

ストレージの種類を示す設定値。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| mode | `'localStorage' \| 'supabase'` | 使用するストレージバックエンド |

### StorageConfig

ストレージの設定を管理。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| useSupabase | boolean | Supabaseを使用するかどうか |
| isProduction | boolean | 本番環境かどうか |

## 既存エンティティ（変更なし）

以下のエンティティはストレージ層の変更による影響を受けません:

- **Organization**: 団体
- **Group**: グループ
- **Member**: メンバー
- **EventDate**: イベント日付
- **Attendance**: 出欠登録

## ストレージ操作インターフェース

### Organization操作

```typescript
// 団体を読み込む
loadOrganization(organizationId: string): Promise<Organization | null>

// 団体を保存する
saveOrganization(organization: Organization): Promise<boolean>

// 全団体を読み込む
loadAllOrganizations(): Promise<Organization[]>
```

### Group操作

```typescript
// グループ一覧を読み込む
loadGroups(organizationId: string): Promise<Group[]>

// グループを保存する
saveGroups(organizationId: string, groups: Group[]): Promise<boolean>
```

### Member操作

```typescript
// メンバー一覧を読み込む
loadMembers(organizationId: string): Promise<Member[]>

// メンバーを保存する
saveMembers(organizationId: string, members: Member[]): Promise<boolean>
```

### EventDate操作

```typescript
// イベント日付一覧を読み込む
loadEventDates(organizationId: string): Promise<EventDate[]>

// イベント日付を保存する
saveEventDates(organizationId: string, eventDates: EventDate[]): Promise<boolean>
```

### Attendance操作

```typescript
// 出欠一覧を読み込む
loadAttendances(organizationId: string): Promise<Attendance[]>

// 出欠を保存する
saveAttendances(organizationId: string, attendances: Attendance[]): Promise<boolean>
```

## 状態遷移

### ストレージモード決定フロー

```
[アプリ起動]
    ↓
[NODE_ENV === 'production'?]
    ├─ Yes → [Supabaseモード]
    └─ No → [NEXT_PUBLIC_USE_SUPABASE === 'true'?]
              ├─ Yes → [Supabaseモード]
              └─ No → [localStorageモード]
```

## 検証ルール

### 環境変数検証

- `NEXT_PUBLIC_USE_SUPABASE`が`true`の場合:
  - `NEXT_PUBLIC_SUPABASE_URL`が設定されていること
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されていること
  - 未設定の場合はエラーを表示

### データ整合性

- すべての操作は非同期で行う
- エラー発生時は適切なエラーメッセージを返す
- データの読み込み失敗時はnullまたは空配列を返す
