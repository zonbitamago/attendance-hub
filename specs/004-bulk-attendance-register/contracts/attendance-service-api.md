# API Contract: Attendance Service（一括登録拡張）

**Feature**: 004-bulk-attendance-register
**Date**: 2025-11-08
**Module**: `lib/attendance-service.ts`
**Purpose**: 一括出欠登録のための新規API関数定義

---

## Overview

本ドキュメントでは、`lib/attendance-service.ts`に追加する2つの新規関数のAPI契約を定義する:

1. **`upsertAttendance`**: 単一の出欠をupsert（既存なら更新、なければ新規作成）
2. **`upsertBulkAttendances`**: 複数の出欠を一括upsert

既存の`createAttendance`および`updateAttendance`関数は維持し、新機能と並行して使用可能とする。

---

## Function 1: upsertAttendance

### Signature

```typescript
export function upsertAttendance(
  input: AttendanceInput
): Attendance
```

### Purpose

指定されたメンバーとイベントの組み合わせで出欠レコードをupsert（既存レコードがあれば更新、なければ新規作成）する。重複登録バグを防ぐため、`(eventDateId, memberId)`の一意性を保証する。

### Parameters

#### `input: AttendanceInput`

```typescript
type AttendanceInput = {
  eventDateId: string;  // イベント日程ID（UUID）
  memberId: string;     // メンバーID（UUID）
  status: AttendanceStatus; // 出欠ステータス（'◯' | '△' | '✗'）
};
```

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `eventDateId` | `string` | ✅ Yes | イベント日程ID | UUID v4、既存EventDateの`id` |
| `memberId` | `string` | ✅ Yes | メンバーID | UUID v4、既存Memberの`id` |
| `status` | `AttendanceStatus` | ✅ Yes | 出欠ステータス | `'◯'` \| `'△'` \| `'✗'` |

**Validation Schema** (Zod):
```typescript
export const CreateAttendanceInputSchema = z.object({
  eventDateId: z.string().uuid('イベントIDが無効です'),
  memberId: z.string().uuid('メンバーIDが無効です'),
  status: z.enum(['◯', '△', '✗'], {
    errorMap: () => ({ message: 'ステータスは◯、△、✗のいずれかを指定してください' }),
  }),
});
```

### Return Value

```typescript
Attendance
```

upsertされた出欠レコード（新規作成または更新後のレコード）。

```typescript
interface Attendance {
  id: string;                // UUID（既存レコードならそのID、新規なら新しいUUID）
  eventDateId: string;       // イベント日程ID
  memberId: string;          // メンバーID
  status: AttendanceStatus;  // 出欠ステータス（更新後の値）
  createdAt: string;         // ISO 8601形式（既存レコードなら元の値を保持）
}
```

### Behavior

1. **既存レコード検索**:
   - `(eventDateId, memberId)`の組み合わせで既存のAttendanceレコードを検索
   - `findIndex`を使用してlocalStorage内の配列をスキャン

2. **重複チェックとクリーンアップ**:
   - 同じ`(eventDateId, memberId)`のレコードが複数存在する場合（バグにより作成済み）
   - 最新の`createdAt`を持つレコードを優先
   - 古いレコードは削除（データ整合性を保つため）

3. **Update（既存レコードあり）**:
   - 既存レコードの`status`を新しい値に更新
   - `id`と`createdAt`は変更しない（履歴情報を保持）
   - localStorage に保存

4. **Create（既存レコードなし）**:
   - 新しいUUIDを生成して`id`を割り当て
   - 現在時刻をISO 8601形式で`createdAt`に設定
   - localStorageに追加

### Errors

| Error Type | Condition | Message (日本語) |
|------------|-----------|------------------|
| `ZodError` | バリデーション失敗 | スキーマのエラーメッセージ（例: "イベントIDが無効です"） |
| `Error` | localStorage操作失敗 | "データの保存に失敗しました" |

**Error Handling**:
```typescript
try {
  const attendance = upsertAttendance(input);
  console.log('Upsert成功:', attendance);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('バリデーションエラー:', error.errors);
  } else {
    console.error('保存エラー:', error.message);
  }
}
```

### Example Usage

```typescript
import { upsertAttendance } from '@/lib/attendance-service';

// 例1: 新規登録（該当するレコードがない場合）
const newAttendance = upsertAttendance({
  eventDateId: 'event-123',
  memberId: 'member-456',
  status: '◯',
});
// 結果: { id: 'att-789', eventDateId: 'event-123', memberId: 'member-456', status: '◯', createdAt: '2025-01-08T12:00:00Z' }

// 例2: 既存レコード更新（同じeventDateIdとmemberIdのレコードがある場合）
const updatedAttendance = upsertAttendance({
  eventDateId: 'event-123',
  memberId: 'member-456',
  status: '✗', // ステータスを変更
});
// 結果: { id: 'att-789', eventDateId: 'event-123', memberId: 'member-456', status: '✗', createdAt: '2025-01-08T12:00:00Z' }
//       ↑ IDとcreatedAtは元のまま、statusのみ更新
```

---

## Function 2: upsertBulkAttendances

### Signature

```typescript
export function upsertBulkAttendances(
  inputs: BulkAttendanceInput[]
): BulkAttendanceResult
```

### Purpose

複数の出欠レコードを一括でupsertする。部分的な失敗を許容し、成功・更新・失敗の内訳を返す。パフォーマンス最適化のため、localStorageの読み書きは各1回のみ実行（バッチ処理）。

### Parameters

#### `inputs: BulkAttendanceInput[]`

```typescript
type BulkAttendanceInput = AttendanceInput; // 同一の型定義

interface BulkAttendanceInput {
  eventDateId: string;
  memberId: string;
  status: AttendanceStatus;
}
```

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `inputs` | `BulkAttendanceInput[]` | ✅ Yes | 一括登録する出欠データの配列 | 各要素は`AttendanceInput`のバリデーションルールに従う |

**Constraints**:
- 配列の長さ: 1〜50件を推奨（パフォーマンス考慮）
- 空配列の場合: エラーではなく、成功0件として処理

### Return Value

```typescript
BulkAttendanceResult
```

```typescript
interface BulkAttendanceResult {
  success: Attendance[];      // 新規作成に成功した出欠レコード
  updated: Attendance[];      // 既存レコードの更新に成功した出欠レコード
  failed: Array<{             // 失敗した項目とエラー情報
    input: BulkAttendanceInput;
    error: string;            // 日本語のエラーメッセージ
  }>;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `Attendance[]` | 新規作成されたAttendanceレコードの配列 |
| `updated` | `Attendance[]` | 更新されたAttendanceレコードの配列 |
| `failed` | `Array<{ input, error }>` | バリデーションエラーやその他の理由で失敗した項目 |

**Success Criteria**:
- `success.length + updated.length + failed.length === inputs.length`（全入力が分類される）
- `failed`が空配列なら全件成功

### Behavior

1. **初期化**:
   - localStorageから全Attendanceレコードを一度だけ読み込み（`loadAttendances()`）
   - `success`, `updated`, `failed`の各配列を初期化

2. **バッチ処理**:
   - `inputs`配列をループ
   - 各入力に対してバリデーション実行（`CreateAttendanceInputSchema.parse`）
   - バリデーション成功なら、メモリ上の配列でupsert処理
   - バリデーション失敗またはその他のエラーは`failed`に追加

3. **Upsertロジック**（メモリ上）:
   - 既存レコード検索: `(eventDateId, memberId)`で検索
   - 既存あり→ `status`を更新 → `updated`に追加
   - 既存なし→ 新規作成 → `success`に追加

4. **永続化**:
   - ループ完了後、localStorageに一度だけ書き込み（`saveAttendances()`）
   - エラー発生時も、成功分は保存される（部分的な成功を許容）

5. **結果返却**:
   - `{ success, updated, failed }`を返す

### Errors

エラーは`BulkAttendanceResult.failed`配列に含まれる。関数自体は例外をスローしない（部分的な成功を保証するため）。

**個別エラーの例**:

| Error Type | Condition | `error` Message |
|------------|-----------|-----------------|
| バリデーションエラー | `eventDateId`が無効 | "イベントIDが無効です" |
| バリデーションエラー | `memberId`が無効 | "メンバーIDが無効です" |
| バリデーションエラー | `status`が不正 | "ステータスは◯、△、✗のいずれかを指定してください" |
| 参照整合性エラー | イベントが存在しない | "指定されたイベントが見つかりません" |
| 参照整合性エラー | メンバーが存在しない | "指定されたメンバーが見つかりません" |

### Example Usage

```typescript
import { upsertBulkAttendances } from '@/lib/attendance-service';

const inputs = [
  { eventDateId: 'event-1', memberId: 'member-1', status: '◯' },
  { eventDateId: 'event-2', memberId: 'member-1', status: '△' },
  { eventDateId: 'event-3', memberId: 'member-1', status: '✗' },
  { eventDateId: 'invalid-id', memberId: 'member-1', status: '◯' }, // これは失敗
];

const result = upsertBulkAttendances(inputs);

console.log(`成功: ${result.success.length}件`);
console.log(`更新: ${result.updated.length}件`);
console.log(`失敗: ${result.failed.length}件`);

if (result.failed.length > 0) {
  console.error('失敗した項目:', result.failed);
  // 出力例:
  // [
  //   {
  //     input: { eventDateId: 'invalid-id', memberId: 'member-1', status: '◯' },
  //     error: 'イベントIDが無効です'
  //   }
  // ]
}
```

### UI Feedback Example

```typescript
const result = upsertBulkAttendances(selectedEvents);

let message = '';
const totalSuccess = result.success.length + result.updated.length;

if (result.failed.length === 0) {
  // 全件成功
  if (result.updated.length > 0) {
    message = `${totalSuccess}件登録（うち${result.updated.length}件更新）`;
  } else {
    message = `${totalSuccess}件登録しました`;
  }
  toast.success(message);
} else if (totalSuccess > 0) {
  // 一部成功
  message = `${totalSuccess}件登録、${result.failed.length}件失敗しました`;
  toast.warning(message);
} else {
  // 全件失敗
  message = '登録に失敗しました';
  toast.error(message);
}
```

---

## Performance Considerations

### Optimization 1: Batch Read/Write

```typescript
// ❌ 非効率（50イベントで100回のlocalStorage操作）
for (const input of inputs) {
  upsertAttendance(input); // 各呼び出しでread/write
}

// ✅ 効率的（1回のread、1回のwrite）
upsertBulkAttendances(inputs);
```

**測定結果（想定）**:
- 50イベント×個別upsert: 約2000ms
- 50イベント×一括upsert: 約200ms
- **パフォーマンス改善: 10倍**

### Optimization 2: Early Validation

バリデーションは各入力に対して個別に実行し、失敗した入力は早期にスキップ。localStorage操作は最後にまとめて実行。

```typescript
for (const input of inputs) {
  try {
    const validated = CreateAttendanceInputSchema.parse(input);
    // メモリ上で処理（localStorage未アクセス）
  } catch (error) {
    failed.push({ input, error: error.message });
    continue; // 次の入力へ
  }
}
// ループ完了後、1回だけlocalStorageに書き込み
saveAttendances(attendances);
```

---

## Testing Recommendations

### Unit Tests

```typescript
describe('upsertAttendance', () => {
  test('新規レコードを作成', () => {
    const result = upsertAttendance({
      eventDateId: 'event-1',
      memberId: 'member-1',
      status: '◯',
    });
    expect(result.status).toBe('◯');
    expect(result.id).toBeDefined();
  });

  test('既存レコードを更新', () => {
    // 1回目: 新規作成
    const first = upsertAttendance({
      eventDateId: 'event-1',
      memberId: 'member-1',
      status: '◯',
    });

    // 2回目: 同じeventDateIdとmemberIdで更新
    const second = upsertAttendance({
      eventDateId: 'event-1',
      memberId: 'member-1',
      status: '✗',
    });

    expect(second.id).toBe(first.id); // IDは同じ
    expect(second.status).toBe('✗'); // ステータスは更新
    expect(second.createdAt).toBe(first.createdAt); // createdAtは変わらない
  });

  test('重複レコードをクリーンアップ', () => {
    // 意図的に重複を作成（テストデータ）
    // ...
    // upsert実行後、重複が解消されることを確認
  });
});

describe('upsertBulkAttendances', () => {
  test('全件成功', () => {
    const inputs = [
      { eventDateId: 'event-1', memberId: 'member-1', status: '◯' },
      { eventDateId: 'event-2', memberId: 'member-1', status: '△' },
    ];
    const result = upsertBulkAttendances(inputs);

    expect(result.success.length + result.updated.length).toBe(2);
    expect(result.failed.length).toBe(0);
  });

  test('一部失敗', () => {
    const inputs = [
      { eventDateId: 'event-1', memberId: 'member-1', status: '◯' }, // 成功
      { eventDateId: 'invalid', memberId: 'member-1', status: '◯' }, // 失敗
    ];
    const result = upsertBulkAttendances(inputs);

    expect(result.success.length + result.updated.length).toBe(1);
    expect(result.failed.length).toBe(1);
    expect(result.failed[0].error).toContain('イベントID');
  });

  test('空配列', () => {
    const result = upsertBulkAttendances([]);
    expect(result.success.length).toBe(0);
    expect(result.updated.length).toBe(0);
    expect(result.failed.length).toBe(0);
  });
});
```

---

## Migration Path (Supabase PostgreSQL)

将来的にSupabase PostgreSQLへ移行する際、以下のSQL関数を作成して同等の機能を実現:

```sql
-- Upsert関数（PostgreSQL）
CREATE OR REPLACE FUNCTION upsert_attendance(
  p_event_date_id UUID,
  p_member_id UUID,
  p_status VARCHAR(1)
) RETURNS attendances AS $$
DECLARE
  v_attendance attendances;
BEGIN
  -- Upsert（ON CONFLICT句を使用）
  INSERT INTO attendances (event_date_id, member_id, status)
  VALUES (p_event_date_id, p_member_id, p_status)
  ON CONFLICT (event_date_id, member_id)
  DO UPDATE SET status = EXCLUDED.status
  RETURNING * INTO v_attendance;

  RETURN v_attendance;
END;
$$ LANGUAGE plpgsql;
```

TypeScript側は、Supabase RPCで上記関数を呼び出す形に変更:

```typescript
const { data, error } = await supabase.rpc('upsert_attendance', {
  p_event_date_id: input.eventDateId,
  p_member_id: input.memberId,
  p_status: input.status,
});
```

---

## Summary

| Function | Purpose | Performance | Error Handling |
|----------|---------|-------------|----------------|
| `upsertAttendance` | 単一レコードのupsert | 標準（read 1回、write 1回） | 例外スロー（ZodError, Error） |
| `upsertBulkAttendances` | 複数レコードの一括upsert | 最適化（read 1回、write 1回、50件処理可能） | 部分的な失敗を許容（failedリストに記録） |

**Next Phase**: 開発手順書（quickstart.md）の作成、エージェントコンテキスト更新
