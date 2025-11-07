# Data Model: イベント人数表示機能

**Feature**: 003-event-attendance-count
**Date**: 2025-11-08

## Overview

この機能は既存のデータモデル（EventDate, Attendance）を活用し、新しいエンティティの追加は不要です。代わりに、既存データから集計結果を表す新しい型（EventTotalSummary）を定義します。

## Existing Entities (No Changes)

### EventDate

イベント日付を表すエンティティ。人数集計の基準単位。

```typescript
interface EventDate {
  id: string; // UUID
  date: string; // YYYY-MM-DD形式
  title: string; // "練習", "本番"等
  location?: string; // 場所（任意）
  createdAt: string; // ISO8601形式のタイムスタンプ
}
```

**Relationships**:

- 1つの EventDate は 0個以上の Attendance を持つ（1対多）

### Attendance

出欠登録を表すエンティティ。

```typescript
type AttendanceStatus = '◯' | '△' | '✗';

interface Attendance {
  id: string; // UUID
  eventDateId: string; // 外部キー: EventDate.id
  memberId: string; // 外部キー: Member.id
  status: AttendanceStatus; // 出欠ステータス
  createdAt: string; // ISO8601形式のタイムスタンプ
}
```

**Relationships**:

- 1つの Attendance は 1つの EventDate に属する（多対1）
- 1つの Attendance は 1つの Member に属する（多対1）

**Constraints**:

- (eventDateId, memberId) の組み合わせは一意（同じメンバーが同じイベントに複数の出欠登録を持たない）

## New Type Definition

### EventTotalSummary

イベント全体の人数集計結果を表す型。データベースには保存されず、計算時に生成される。

```typescript
interface EventTotalSummary {
  totalAttending: number; // 参加者数（◯）
  totalMaybe: number; // 未定者数（△）
  totalNotAttending: number; // 欠席者数（✗）
  totalResponded: number; // 合計回答者数（totalAttending + totalMaybe + totalNotAttending）
}
```

**Source**: この型は既存の `EventSummary` 型から派生しています。

```typescript
// 既存の EventSummary 型（types/index.ts）
interface EventSummary {
  eventDateId: string;
  totalAttending: number;
  totalMaybe: number;
  totalNotAttending: number;
  totalResponded: number;
  groupSummaries: GroupSummary[];
}
```

**型の関係**:

```typescript
// EventTotalSummary は EventSummary から eventDateId と groupSummaries を除いたもの
type EventTotalSummary = Omit<EventSummary, 'eventDateId' | 'groupSummaries'>;
```

## Calculation Logic

### calculateEventTotalSummary

イベント全体の人数を集計する関数。

```typescript
function calculateEventTotalSummary(eventDateId: string): EventTotalSummary;
```

**Algorithm**:

1. **入力**: `eventDateId` (string)
2. **データ取得**:
   - `getAttendancesByEventDateId(eventDateId)` で該当イベントのすべての Attendance を取得
3. **重複排除** (FR-007対応):
   - `memberId` の `Set` を作成して重複をチェック
   - 同じメンバーが複数のグループに所属している場合でも1回のみカウント
4. **ステータス別集計**:
   - `status === '◯'` の件数 → `totalAttending`
   - `status === '△'` の件数 → `totalMaybe`
   - `status === '✗'` の件数 → `totalNotAttending`
5. **合計計算**:
   - `totalResponded = totalAttending + totalMaybe + totalNotAttending`
6. **戻り値**: `EventTotalSummary` オブジェクト

**Pseudocode**:

```typescript
export function calculateEventTotalSummary(eventDateId: string): EventTotalSummary {
  // 該当イベントの出欠登録を取得
  const attendances = getAttendancesByEventDateId(eventDateId);

  // 重複カウント防止: memberIdのSetを作成
  const uniqueMemberIds = new Set<string>();
  const uniqueAttendances: Attendance[] = [];

  for (const attendance of attendances) {
    if (!uniqueMemberIds.has(attendance.memberId)) {
      uniqueMemberIds.add(attendance.memberId);
      uniqueAttendances.push(attendance);
    }
  }

  // ステータス別に集計
  const totalAttending = uniqueAttendances.filter((a) => a.status === '◯').length;
  const totalMaybe = uniqueAttendances.filter((a) => a.status === '△').length;
  const totalNotAttending = uniqueAttendances.filter((a) => a.status === '✗').length;
  const totalResponded = uniqueAttendances.length;

  return {
    totalAttending,
    totalMaybe,
    totalNotAttending,
    totalResponded,
  };
}
```

**Time Complexity**: O(n) where n = number of attendances for the event
**Space Complexity**: O(m) where m = number of unique members

**Edge Cases**:

- 出欠登録が0件の場合 → すべて0を返す
- 同じメンバーが複数の出欠登録を持つ場合 → 最初の登録のみカウント（Setで排除）
- 不正なeventDateIdの場合 → 空の配列が返され、すべて0を返す

## Validation Rules

この機能は表示のみのため、新しい検証ルールは不要です。既存の Attendance の検証ルール（Zod スキーマ）をそのまま使用します。

## Data Flow

### イベント一覧画面 (app/page.tsx)

```
EventDate[] (localStorage)
  ↓
for each EventDate
  ↓
calculateEventTotalSummary(eventDate.id)
  ↓
EventTotalSummary
  ↓
UI表示: "◯ X人 △ Y人 ✗ Z人（計W人）"
```

### イベント詳細画面 (app/events/[id]/page.tsx)

```
EventDate (params.id)
  ↓
calculateEventTotalSummary(eventDate.id)
  ↓
EventTotalSummary
  ↓
UI表示: "参加: X人 / 未定: Y人 / 欠席: Z人（計W人）"
```

### イベント管理画面 (app/admin/events/page.tsx)

```
EventDate[] (localStorage)
  ↓
for each EventDate
  ↓
calculateEventTotalSummary(eventDate.id)
  ↓
EventTotalSummary
  ↓
UI表示: "◯ X人 △ Y人 ✗ Z人（計W人）"
```

## Performance Considerations

### メモ化戦略

各画面で `useMemo` を使用して、EventDate が変更されない限り再計算を防ぎます。

```typescript
const totalSummary = useMemo(() => calculateEventTotalSummary(eventDate.id), [eventDate.id]);
```

### 大量データ対応

SC-005（100件以上のイベントで2秒以内）を満たすため：

1. **クライアントサイド集計**: すでに localStorage からデータを読み込んでいるため、追加のネットワークリクエスト不要
2. **効率的なフィルタリング**: `filter` は O(n) で効率的
3. **メモ化**: 同じイベントの再計算を防ぐ

### 将来の最適化（必要に応じて）

- Web Worker での集計（100件以上で遅い場合）
- IndexedDB への移行（localStorage の容量制限対応）
- サーバーサイド集計（Supabase 移行後）

## Migration Notes

### Phase 1: localStorage (Current)

- クライアントサイドで集計
- 型定義のみ追加、データベーススキーマ変更なし

### Phase 2: Supabase移行（将来）

Supabase PostgreSQL に移行する際の検討事項：

1. **計算列またはビュー**:

   ```sql
   CREATE VIEW event_total_summaries AS
   SELECT
     event_date_id,
     COUNT(*) FILTER (WHERE status = '◯') as total_attending,
     COUNT(*) FILTER (WHERE status = '△') as total_maybe,
     COUNT(*) FILTER (WHERE status = '✗') as total_not_attending,
     COUNT(*) as total_responded
   FROM attendances
   GROUP BY event_date_id;
   ```

2. **RLSポリシー**: ビューにも適切なRLSを設定
3. **インデックス**: `event_date_id` と `status` にインデックスを追加してクエリを高速化

## Summary

- **新規エンティティ**: なし
- **新規型定義**: `EventTotalSummary` (既存の `EventSummary` から派生)
- **新規関数**: `calculateEventTotalSummary(eventDateId: string): EventTotalSummary`
- **データベーススキーマ変更**: なし（localStorage使用、計算時に集計）
- **パフォーマンス**: O(n) 集計、useMemo によるメモ化
- **将来の拡張性**: Supabase移行時はビューまたは計算列で最適化可能
