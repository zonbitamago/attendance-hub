# サービス契約: Storage Service (マルチテナント対応版)

**モジュール**: `lib/storage.ts`
**目的**: 団体スコープのキーを持つlocalStorage抽象化レイヤー
**依存関係**: なし (バニラlocalStorage API)

## v1.0からの変更点

| 変更 | 説明 |
|--------|-------------|
| ✅ `STORAGE_KEYS` | `orgId`パラメータを受け取る関数に変更 |
| ✅ `loadOrganizations` | 新規 - すべての団体を読み込み（グローバル） |
| ✅ `saveOrganizations` | 新規 - すべての団体を保存（グローバル） |
| ✅ `loadEventDates` | `orgId`パラメータを追加 |
| ✅ `saveEventDates` | `orgId`パラメータを追加 |
| ✅ `loadGroups` | `orgId`パラメータを追加 |
| ✅ `saveGroups` | `orgId`パラメータを追加 |
| ✅ `loadMembers` | `orgId`パラメータを追加 |
| ✅ `saveMembers` | `orgId`パラメータを追加 |
| ✅ `loadAttendances` | `orgId`パラメータを追加 |
| ✅ `saveAttendances` | `orgId`パラメータを追加 |
| ✅ `clearAllData` | 団体固有のデータをクリアするように更新 |
| ✅ `clearOrganizationData` | 新規 - 特定団体のデータをクリア |

## ストレージキー

### v2.0キー構造（マルチテナント）

```typescript
const STORAGE_KEYS = {
  // グローバルキー（全団体）
  ORGANIZATIONS: 'attendance_organizations',

  // 団体スコープのキー（関数）
  EVENT_DATES: (orgId: string) => `attendance_${orgId}_event_dates`,
  GROUPS: (orgId: string) => `attendance_${orgId}_groups`,
  MEMBERS: (orgId: string) => `attendance_${orgId}_members`,
  ATTENDANCES: (orgId: string) => `attendance_${orgId}_attendances`,

  // マイグレーションフラグ
  MIGRATION_COMPLETED: 'attendance_migration_completed',
} as const;
```

### v1.0キー構造（レガシー - マイグレーション専用）

```typescript
const LEGACY_STORAGE_KEYS = {
  EVENT_DATES: 'attendance_event_dates',
  GROUPS: 'attendance_groups',
  MEMBERS: 'attendance_members',
  ATTENDANCES: 'attendance_attendances',
} as const;
```

## 関数

### `loadOrganizations` (新規)

グローバルlocalStorageからすべての団体を読み込みます。

**シグネチャ**:
```typescript
function loadOrganizations(): Organization[]
```

**パラメータ**: なし

**戻り値**: `Organization[]` - すべての団体の配列（存在しない場合は空配列）

**動作**:
1. `localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS)`から値を取得
2. nullの場合、`[]`を返す
3. JSONをパース
4. 配列を返す

**エラー**: JSONパースエラー時は`[]`を返す（防御的）

**例**:
```typescript
const orgs = loadOrganizations();
// [{ id: "abc...", name: "Org A", ... }]
```

---

### `saveOrganizations` (新規)

すべての団体をグローバルlocalStorageに保存します。

**シグネチャ**:
```typescript
function saveOrganizations(organizations: Organization[]): void
```

**パラメータ**:
- `organizations: Organization[]` (必須)

**戻り値**: `void`

**動作**:
1. 団体配列をJSONに文字列化
2. `localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, json)`に保存

**エラー**:
- `QuotaExceededError`: localStorageが満杯の場合

**例**:
```typescript
const orgs = [{ id: "abc...", name: "Org A", createdAt: "..." }];
saveOrganizations(orgs);
```

---

### `loadEventDates` (更新)

特定の団体のイベント日付を読み込みます。

**シグネチャ**:
```typescript
function loadEventDates(organizationId: string): EventDate[]
```

**パラメータ**:
- `organizationId: string` (必須, 10文字)

**戻り値**: `EventDate[]` - 団体のイベント日付の配列

**動作**:
1. キーを生成: `STORAGE_KEYS.EVENT_DATES(organizationId)`
2. localStorageから値を取得
3. nullの場合、`[]`を返す
4. JSONをパース
5. 配列を返す

**エラー**: JSONパースエラー時は`[]`を返す（防御的）

**例**:
```typescript
const events = loadEventDates('abc123def4');
// [{ id: "...", organizationId: "abc123def4", date: "2025-12-01", ... }]
```

---

### `saveEventDates` (更新)

特定の団体のイベント日付を保存します。

**シグネチャ**:
```typescript
function saveEventDates(organizationId: string, eventDates: EventDate[]): void
```

**パラメータ**:
- `organizationId: string` (必須, 10文字)
- `eventDates: EventDate[]` (必須)

**戻り値**: `void`

**動作**:
1. キーを生成: `STORAGE_KEYS.EVENT_DATES(organizationId)`
2. eventDates配列をJSONに文字列化
3. localStorageに保存

**エラー**:
- `QuotaExceededError`: localStorageが満杯の場合

**例**:
```typescript
const events = [{ id: "...", organizationId: "abc123def4", ... }];
saveEventDates('abc123def4', events);
```

---

### `loadGroups`, `saveGroups`, `loadMembers`, `saveMembers`, `loadAttendances`, `saveAttendances` (更新)

すべて`loadEventDates`/`saveEventDates`と同じパターンに従います。

**シグネチャ**:
```typescript
function loadGroups(organizationId: string): Group[]
function saveGroups(organizationId: string, groups: Group[]): void

function loadMembers(organizationId: string): Member[]
function saveMembers(organizationId: string, members: Member[]): void

function loadAttendances(organizationId: string): Attendance[]
function saveAttendances(organizationId: string, attendances: Attendance[]): void
```

---

### `clearOrganizationData` (新規)

特定の団体のすべてのデータを削除します。

**シグネチャ**:
```typescript
function clearOrganizationData(organizationId: string): void
```

**パラメータ**:
- `organizationId: string` (必須, 10文字)

**戻り値**: `void`

**動作**:
1. すべてのデータ型のキーを生成
2. 各キーに対して`localStorage.removeItem(key)`を呼び出し:
   - `attendance_${orgId}_event_dates`
   - `attendance_${orgId}_groups`
   - `attendance_${orgId}_members`
   - `attendance_${orgId}_attendances`

**エラー**: なし（キーが存在しない場合でも成功）

**副作用**: **破壊的** - 団体のすべてのデータを永久に削除

**例**:
```typescript
clearOrganizationData('abc123def4');
// All data for organization "abc123def4" is now gone
```

---

### `clearAllData` (更新)

attendance-hubのすべてのlocalStorageデータをクリア（団体を含む）します。

**シグネチャ**:
```typescript
function clearAllData(): void
```

**パラメータ**: なし

**戻り値**: `void`

**動作**:
1. すべてのattendance-hubキーを検索（プレフィックス: `attendance_`）
2. 各キーに対して`localStorage.removeItem(key)`を呼び出し
3. 団体、すべての団体固有データ、マイグレーションフラグを含む

**エラー**: なし

**副作用**: **破壊的** - すべてのデータを永久に削除

**例**:
```typescript
clearAllData();
// すべてが削除され、新規開始
```

---

## マイグレーションサポート

### レガシーキー検出

```typescript
function hasLegacyData(): boolean {
  const legacyKeys = ['attendance_event_dates', 'attendance_groups', 'attendance_members', 'attendance_attendances'];
  return legacyKeys.some(key => localStorage.getItem(key) !== null);
}
```

### レガシーデータ読み込み（マイグレーション専用）

```typescript
function loadLegacyEventDates(): any[] {
  const data = localStorage.getItem('attendance_event_dates');
  return data ? JSON.parse(data) : [];
}

// groups, members, attendancesも同様
```

---

## テスト要件

### ユニットテスト (`__tests__/lib/storage.test.ts`)

**必須テストケース**:
1. ✅ `loadOrganizations`がデータがない場合に空配列を返す
2. ✅ `saveOrganizations`がlocalStorageにデータを永続化
3. ✅ `loadEventDates`がorgIdで正しいデータを読み込み
4. ✅ `loadEventDates`が異なるorgIdで異なるデータを返す
5. ✅ `saveEventDates`がorgIdで正しいキーに保存
6. ✅ `clearOrganizationData`が団体のすべてのキーを削除
7. ✅ `clearOrganizationData`が他の団体に影響しない
8. ✅ `clearAllData`がすべてのattendance-hubキーを削除
9. ✅ データ分離: 団体Aのデータが団体Bで読み込まれない
10. ✅ QuotaExceededErrorハンドリング（大きなデータでシミュレート）

**カバレッジ目標**: 90%以上

---

## 使用例

### 団体データの作成と読み込み

```typescript
// 団体を保存
const orgs = [{ id: "abc...", name: "Org A", createdAt: "..." }];
saveOrganizations(orgs);

// 団体データを読み込み
const events = loadEventDates('abc123def4');
const groups = loadGroups('abc123def4');
```

### データ分離の検証

```typescript
// 団体Aのデータを保存
saveEventDates('org-a', [{ id: "1", organizationId: "org-a", title: "Event A" }]);

// 団体Bのデータを保存
saveEventDates('org-b', [{ id: "2", organizationId: "org-b", title: "Event B" }]);

// 団体Aのデータを読み込み
const eventsA = loadEventDates('org-a');
// eventsA = [{ id: "1", organizationId: "org-a", title: "Event A" }]

// 団体Bのデータを読み込み
const eventsB = loadEventDates('org-b');
// eventsB = [{ id: "2", organizationId: "org-b", title: "Event B" }]

// データ漏洩なし！
```

### 団体データの削除

```typescript
// 団体のすべてのデータを削除
clearOrganizationData('abc123def4');

// データが削除されたことを確認
const events = loadEventDates('abc123def4');
// events = []
```

---

## エラーハンドリング

### QuotaExceededError

```typescript
try {
  saveEventDates(orgId, largeEventArray);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('ストレージ容量が不足しています。古いデータを削除してください。');
  }
}
```

---

**契約バージョン**: 2.0（マルチテナント）
**前バージョン**: 1.0（シングルテナント）
**最終更新**: 2025-11-09
