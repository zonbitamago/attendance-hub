# Data Model: イベント画面 個人別出欠状況表示機能

**フィーチャー**: 007-event-member-attendance
**作成日**: 2025-11-10
**ステータス**: Phase 1

## 概要

このドキュメントでは、個人別出欠状況表示機能で使用するデータ構造と型定義を記述する。既存の型（Member, Attendance, Group）を活用しつつ、新規の型を追加する。

---

## 新規型定義

### 1. MemberAttendanceDetail

メンバー情報と出欠ステータスを結合したビュー型。グループメンバーの個人別出欠状況を表示するために使用する。

```typescript
export interface MemberAttendanceDetail {
  // メンバー情報
  memberId: string;
  memberName: string;

  // グループ情報
  groupId: string;
  groupName: string;

  // 出欠情報
  status: AttendanceStatus | null; // null = 未登録
  hasRegistered: boolean;          // 出欠を登録済みか

  // ソート用（内部使用）
  memberCreatedAt: string;
}
```

**フィールド詳細**:

| フィールド | 型 | 説明 |
|-----------|----|----|
| `memberId` | `string` | メンバーのID（UUID） |
| `memberName` | `string` | メンバーの名前 |
| `groupId` | `string` | 所属グループのID |
| `groupName` | `string` | 所属グループの名前 |
| `status` | `AttendanceStatus \| null` | 出欠ステータス。未登録の場合は`null` |
| `hasRegistered` | `boolean` | 出欠を登録済みかどうか。未登録の場合は`false` |
| `memberCreatedAt` | `string` | メンバーの作成日時（ソート用） |

**使用例**:
```typescript
const detail: MemberAttendanceDetail = {
  memberId: 'member-123',
  memberName: '山田太郎',
  groupId: 'group-456',
  groupName: '打',
  status: '◯',
  hasRegistered: true,
  memberCreatedAt: '2025-01-01T00:00:00Z',
};
```

---

### 2. AttendanceFilterStatus

フィルタの選択状態を表す型。ドロップダウンで選択可能なフィルタオプション。

```typescript
export type AttendanceFilterStatus =
  | 'all'           // すべて
  | 'attending'     // 参加のみ（◯）
  | 'maybe'         // 未定のみ（△）
  | 'notAttending'  // 欠席のみ（✗）
  | 'unregistered'; // 未登録のみ（-）
```

**使用例**:
```typescript
const [filterStatus, setFilterStatus] = useState<AttendanceFilterStatus>('all');
```

---

### 3. AttendanceSortBy

ソートの種類を表す型。名前順またはステータス順。

```typescript
export type AttendanceSortBy =
  | 'name'   // 名前順（五十音順/アルファベット順）
  | 'status'; // ステータス順（◯→△→✗→-）
```

**使用例**:
```typescript
const [sortBy, setSortBy] = useState<AttendanceSortBy>('name');
```

---

## 既存型の利用

以下の既存型を再利用する（`types/index.ts`）:

### AttendanceStatus
```typescript
export type AttendanceStatus = '◯' | '△' | '✗';
```

### Member
```typescript
export interface Member {
  id: string;
  organizationId: string;
  groupId: string;
  name: string;
  createdAt: string;
}
```

### Attendance
```typescript
export interface Attendance {
  id: string;
  organizationId: string;
  eventDateId: string;
  memberId: string;
  status: AttendanceStatus;
  createdAt: string;
}
```

### Group
```typescript
export interface Group {
  id: string;
  organizationId: string;
  name: string;
  order: number;
  color?: string;
  createdAt: string;
}
```

### GroupSummary
```typescript
export interface GroupSummary {
  groupId: string;
  groupName: string;
  attending: number;    // ◯の人数
  maybe: number;        // △の人数
  notAttending: number; // ✗の人数
  total: number;        // 合計人数
}
```

---

## データフロー

### 1. データ取得フロー

```
1. イベント詳細ページ読み込み
   ↓
2. getGroupMemberAttendances(organizationId, eventDateId, groupId) を呼び出し
   ↓
3. グループの全メンバーを取得（loadMembers）
   ↓
4. イベントの全出欠レコードを取得（getAttendancesByEventDateId）
   ↓
5. メンバーと出欠レコードを結合
   ↓
6. MemberAttendanceDetail[] を生成
   - 出欠登録済み → status = ◯/△/✗, hasRegistered = true
   - 出欠未登録 → status = null, hasRegistered = false
   ↓
7. 名前順でソート
   ↓
8. コンポーネントに渡す
```

### 2. フィルタ・ソート・検索フロー

```
MemberAttendanceDetail[]（元データ）
   ↓
1. 検索フィルタ適用（searchQuery）
   → memberName.includes(searchQuery)
   ↓
2. ステータスフィルタ適用（filterStatus）
   → status === filterStatus または filterStatus === 'all'
   ↓
3. ソート適用（sortBy）
   → 'name': localeCompare('ja')
   → 'status': statusOrder（◯→△→✗→-）
   ↓
フィルタ・ソート済みの MemberAttendanceDetail[]
   ↓
UIにレンダリング
```

---

## 状態管理

### コンポーネント内の状態

```typescript
// アコーディオンの展開状態（Set<groupId>）
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

// フィルタ状態
const [filterStatus, setFilterStatus] = useState<AttendanceFilterStatus>('all');

// ソート状態
const [sortBy, setSortBy] = useState<AttendanceSortBy>('name');

// 検索クエリ
const [searchQuery, setSearchQuery] = useState<string>('');

// グループごとのメンバー出欠詳細データ
const [memberDetails, setMemberDetails] = useState<Map<string, MemberAttendanceDetail[]>>(
  new Map()
);
```

---

## バリデーションルール

### 1. MemberAttendanceDetail

| フィールド | バリデーション |
|-----------|--------------|
| `memberId` | 必須、UUID形式 |
| `memberName` | 必須、1文字以上 |
| `groupId` | 必須、UUID形式 |
| `groupName` | 必須、1文字以上 |
| `status` | `AttendanceStatus` または `null` |
| `hasRegistered` | 必須、boolean |
| `memberCreatedAt` | 必須、ISO 8601形式 |

### 2. AttendanceFilterStatus

- 有効な値: `'all'`, `'attending'`, `'maybe'`, `'notAttending'`, `'unregistered'`

### 3. AttendanceSortBy

- 有効な値: `'name'`, `'status'`

---

## パフォーマンス最適化

### 1. useMemoでメモ化

```typescript
const filteredAndSortedMembers = useMemo(() => {
  // フィルタ・ソート・検索のロジック
}, [members, filterStatus, sortBy, searchQuery]);
```

### 2. 展開済みグループのみレンダリング

```typescript
{expandedGroups.has(groupId) && (
  <MemberAttendanceList
    members={filteredAndSortedMembers}
    filterStatus={filterStatus}
    sortBy={sortBy}
    searchQuery={searchQuery}
  />
)}
```

---

## データのライフサイクル

### 1. マウント時
- イベント詳細データ取得
- グループ別集計データ取得
- 初期状態: すべてのグループは折りたたみ

### 2. アコーディオン展開時
- `getGroupMemberAttendances()` でそのグループのメンバー詳細を取得
- キャッシュに保存（`Map<groupId, MemberAttendanceDetail[]>`）

### 3. フィルタ/ソート/検索変更時
- useMemo で再計算
- UIを再レンダリング

### 4. アンマウント時
- 状態をクリーンアップ（Reactが自動処理）

---

## エッジケース

### 1. グループにメンバーが0人
```typescript
{members.length === 0 && (
  <p className="text-gray-500">メンバーがいません</p>
)}
```

### 2. 全メンバーが未登録
```typescript
// すべてのMemberAttendanceDetailで hasRegistered = false, status = null
```

### 3. 検索結果が0件
```typescript
{filteredMembers.length === 0 && searchQuery && (
  <p className="text-gray-500">
    「{searchQuery}」に該当するメンバーが見つかりません
  </p>
)}
```

### 4. フィルタ適用で0件
```typescript
{filteredMembers.length === 0 && filterStatus !== 'all' && (
  <p className="text-gray-500">
    条件に該当するメンバーがいません
  </p>
)}
```

---

## まとめ

### 新規追加の型

1. ✅ **MemberAttendanceDetail**: メンバーと出欠情報を結合
2. ✅ **AttendanceFilterStatus**: フィルタオプション
3. ✅ **AttendanceSortBy**: ソート種類

### 既存型の活用

- **AttendanceStatus**: 出欠ステータス（◯/△/✗）
- **Member**: メンバー情報
- **Attendance**: 出欠レコード
- **Group**: グループ情報
- **GroupSummary**: グループ別集計

### 次のステップ

Phase 1の残りのドキュメントを作成:
1. **contracts/attendance-service.md**: サービス関数のインターフェース
2. **quickstart.md**: 開発環境セットアップ手順
