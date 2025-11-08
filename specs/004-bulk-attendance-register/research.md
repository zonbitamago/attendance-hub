# Research: 複数イベント一括出欠登録

**Feature**: 004-bulk-attendance-register
**Date**: 2025-11-08
**Purpose**: 設計上の技術的決定事項を文書化

## Overview

本フィーチャーでは既存技術スタック（Next.js 16, React 19.2, TypeScript 5.9, Tailwind CSS 3.4, localStorage）を使用するため、新規技術調査は不要。本ドキュメントでは、実装に必要な設計パターンと技術的決定を記載する。

---

## 1. Upsert実装パターン

### Decision: `eventDateId + memberId`の複合キーによるupsert

**Rationale**:
- 既存の`Attendance`型には`id`（UUID）が存在するが、これは内部的な識別子
- ビジネスロジック上、「同じメンバーが同じイベントに複数の出欠を持つ」ことは意味をなさない
- したがって、`eventDateId + memberId`の組み合わせを**自然キー**として扱い、重複を検出する

**Implementation Strategy**:

```typescript
export function upsertAttendance(input: AttendanceInput): Attendance {
  const attendances = loadAttendances();

  // 既存レコード検索
  const existingIndex = attendances.findIndex(
    (a) => a.eventDateId === input.eventDateId && a.memberId === input.memberId
  );

  if (existingIndex >= 0) {
    // 更新: 既存レコードのIDを保持し、ステータスのみ更新
    const updated: Attendance = {
      ...attendances[existingIndex],
      status: input.status,
      // createdAtは変更しない（初回登録日時を保持）
    };
    attendances[existingIndex] = updated;
    saveAttendances(attendances);
    return updated;
  } else {
    // 新規作成
    const newAttendance: Attendance = {
      id: crypto.randomUUID(),
      eventDateId: input.eventDateId,
      memberId: input.memberId,
      status: input.status,
      createdAt: getCurrentTimestamp(),
    };
    attendances.push(newAttendance);
    saveAttendances(attendances);
    return newAttendance;
  }
}
```

**重複レコードのクリーンアップ戦略**:
- 既存システムに同一`eventDateId + memberId`の重複レコードが存在する可能性がある（バグにより作成済み）
- upsert実行時に重複を検出した場合、以下のルールで統合:
  1. 最新の`createdAt`を持つレコードを優先
  2. 古いレコードは削除
  3. ユーザーには「重複を解消しました」とフィードバック

```typescript
// 重複解消ロジック（upsert内で実行）
const duplicates = attendances.filter(
  (a) => a.eventDateId === input.eventDateId && a.memberId === input.memberId
);

if (duplicates.length > 1) {
  // 最新のレコードを特定
  const latest = duplicates.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  // 古いレコードを削除
  const cleaned = attendances.filter(
    (a) => !(a.eventDateId === input.eventDateId && a.memberId === input.memberId && a.id !== latest.id)
  );

  saveAttendances(cleaned);
}
```

**Alternatives Considered**:
- **代替案A**: `id`のみで検索し、重複を許容
  - **却下理由**: データ整合性が損なわれ、集計時に誤カウントが発生
- **代替案B**: データベースレベルでUNIQUE制約（Supabase移行時）
  - **採用予定**: 将来的にPostgreSQLへ移行時に実装（現在のlocalStorageでは制約なし）

---

## 2. 一括登録UIパターン

### Decision: イベント縦並び×ステータス横並びの「カードリスト」形式

**Rationale**:
- モバイルファーストの原則に従い、横スクロールを避ける
- 各イベントを1つのカードとして縦に並べ、カード内にステータス選択ボタンを配置
- タップターゲットは最小44x44px（iOS Human Interface Guidelines準拠）

**UI Structure**:

```
┌─────────────────────────────────────┐
│ イベントを選択してステータスを設定  │
├─────────────────────────────────────┤
│ ☑ 2025-01-15 (月) 練習              │
│   場所: 音楽室                       │
│   ステータス: [◯] [△] [✗]          │
│   （既存: ◯）                       │
├─────────────────────────────────────┤
│ ☑ 2025-01-22 (月) 練習              │
│   場所: 音楽室                       │
│   ステータス: [◯] [△] [✗]          │
│   （未登録）                         │
├─────────────────────────────────────┤
│ ☐ 2025-01-29 (月) 練習              │
│   場所: 音楽室                       │
│   ステータス: [◯] [△] [✗]          │
│   （未登録）                         │
└─────────────────────────────────────┘
```

**Component Design**:

```typescript
// components/bulk-register/event-card.tsx
interface EventCardProps {
  event: EventDate;
  selected: boolean;
  currentStatus?: AttendanceStatus; // 既存登録がある場合
  selectedStatus: AttendanceStatus;
  onToggleSelect: () => void;
  onStatusChange: (status: AttendanceStatus) => void;
}

// カード内の要素:
// 1. チェックボックス（イベント選択）
// 2. イベント情報（日付、タイトル、場所）
// 3. 既存ステータス表示（あれば）
// 4. ステータス選択ボタン×3（◯/△/✗）
```

**モバイル対応**:
- 320px幅でも正常に表示
- ステータスボタンは横並びでも十分なタップ領域確保（各80px幅）
- スクロール可能（イベントが10件以上でも対応）

**デスクトップ対応**:
- 768px以上では2カラムレイアウト
- 1024px以上では3カラムレイアウト
- Tailwind CSSの`md:`、`lg:`ブレークポイントを活用

**Accessibility**:
- チェックボックスに`<label>`を適切に関連付け
- ステータスボタンは`<button>`要素（`role="radio"`）
- キーボードナビゲーション: Tab/Shift+Tab/Space/Enter
- スクリーンリーダー対応: `aria-label`、`aria-checked`

**Alternatives Considered**:
- **代替案A**: 表形式（イベント×ステータスのマトリックス）
  - **却下理由**: モバイルで横スクロールが必要、アクセシビリティ低下
- **代替案B**: 全イベント一括選択 + 全イベント同一ステータス
  - **却下理由**: ユーザー要件（Q2-B）でイベントごとの個別設定が必要と明確化

---

## 3. エラーハンドリング戦略

### Decision: 部分的な成功を許容し、詳細なフィードバックを提供

**Rationale**:
- 50イベントの一括登録で1件失敗した場合、全体を失敗とするのはユーザーエクスペリエンスが悪い
- 成功した分は保存し、失敗した項目のみユーザーに通知する

**Implementation Strategy**:

```typescript
export function upsertBulkAttendances(
  inputs: BulkAttendanceInput[]
): BulkAttendanceResult {
  const success: Attendance[] = [];
  const updated: Attendance[] = [];
  const failed: Array<{ input: BulkAttendanceInput; error: string }> = [];

  for (const input of inputs) {
    try {
      // バリデーション
      const validated = CreateAttendanceInputSchema.parse(input);

      // upsert実行
      const attendances = loadAttendances();
      const existingIndex = attendances.findIndex(
        (a) => a.eventDateId === validated.eventDateId && a.memberId === validated.memberId
      );

      if (existingIndex >= 0) {
        // 更新
        const result = upsertAttendance(validated);
        updated.push(result);
      } else {
        // 新規作成
        const result = upsertAttendance(validated);
        success.push(result);
      }
    } catch (error) {
      // エラーをキャッチし、失敗リストに追加
      failed.push({
        input,
        error: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  return { success, updated, failed };
}
```

**ユーザーフィードバック形式**:

- **全件成功**: 「5件登録しました」
- **一部更新**: 「5件登録（うち2件更新）」
- **一部失敗**: 「3件登録、2件失敗しました。失敗した項目: [イベント名1], [イベント名2]」
- **全件失敗**: 「登録に失敗しました。エラー: [詳細]」

**UI実装**:

```typescript
// app/my-register/page.tsx
const handleSubmit = async () => {
  const result = upsertBulkAttendances(selectedEvents);

  if (result.failed.length === 0) {
    // 全件成功
    const updatedCount = result.updated.length;
    const message = updatedCount > 0
      ? `${result.success.length + updatedCount}件登録（うち${updatedCount}件更新）`
      : `${result.success.length}件登録しました`;
    toast.success(message);
  } else if (result.success.length > 0 || result.updated.length > 0) {
    // 一部成功
    const totalSuccess = result.success.length + result.updated.length;
    const failedEvents = result.failed.map(f => f.input.eventDateId).join(', ');
    toast.warning(`${totalSuccess}件登録、${result.failed.length}件失敗。失敗: ${failedEvents}`);
  } else {
    // 全件失敗
    toast.error('登録に失敗しました');
  }
};
```

**Alternatives Considered**:
- **代替案A**: トランザクション方式（全件成功 or 全件失敗）
  - **却下理由**: localStorageにトランザクション機能なし、ユーザーエクスペリエンスが悪い
- **代替案B**: 失敗時に即座に処理停止
  - **却下理由**: 部分的な成功も有益、ユーザーは再試行時に失敗分のみ対応可能

---

## 4. パフォーマンス最適化

### Decision: バッチ処理（一度read → 複数操作 → 一度write）

**Rationale**:
- localStorageの`getItem`/`setItem`は同期的で、呼び出し回数が多いとパフォーマンス低下
- 50イベントの一括登録で50回のread/writeは避けるべき
- メモリ上で配列操作を完結させ、最後に1回だけlocalStorageに書き込む

**Implementation Strategy**:

```typescript
export function upsertBulkAttendances(
  inputs: BulkAttendanceInput[]
): BulkAttendanceResult {
  // 1回だけ読み込み
  let attendances = loadAttendances();

  const success: Attendance[] = [];
  const updated: Attendance[] = [];
  const failed: Array<{ input: BulkAttendanceInput; error: string }> = [];

  for (const input of inputs) {
    try {
      const validated = CreateAttendanceInputSchema.parse(input);

      // メモリ上で操作
      const existingIndex = attendances.findIndex(
        (a) => a.eventDateId === validated.eventDateId && a.memberId === validated.memberId
      );

      if (existingIndex >= 0) {
        // 更新
        attendances[existingIndex].status = validated.status;
        updated.push(attendances[existingIndex]);
      } else {
        // 新規作成
        const newAttendance: Attendance = {
          id: crypto.randomUUID(),
          eventDateId: validated.eventDateId,
          memberId: validated.memberId,
          status: validated.status,
          createdAt: getCurrentTimestamp(),
        };
        attendances.push(newAttendance);
        success.push(newAttendance);
      }
    } catch (error) {
      failed.push({
        input,
        error: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  // 1回だけ書き込み
  saveAttendances(attendances);

  return { success, updated, failed };
}
```

**パフォーマンス目標**:
- 50イベント×1メンバーの一括登録: 5秒以内
- localStorage read/write: 各1回のみ
- 処理中のローディング表示（ユーザーフィードバック）

**測定方法**:
```typescript
const start = performance.now();
const result = upsertBulkAttendances(inputs);
const end = performance.now();
console.log(`一括登録処理時間: ${end - start}ms`);
```

**Alternatives Considered**:
- **代替案A**: 各upsert関数呼び出しごとにread/write
  - **却下理由**: 50イベントで100回のlocalStorage操作、パフォーマンス低下
- **代替案B**: Web Workerでバックグラウンド処理
  - **却下理由**: localStorageはメインスレッドのみアクセス可能、オーバーエンジニアリング

---

## Summary

| 決定事項 | 選択した手法 | 主な理由 |
|---------|------------|---------|
| Upsert実装 | `eventDateId + memberId`複合キー | データ整合性、重複防止 |
| UI パターン | カードリスト形式（縦積み） | モバイルファースト、アクセシビリティ |
| エラーハンドリング | 部分的な成功を許容 | ユーザーエクスペリエンス |
| パフォーマンス | バッチ処理（1回read/write） | localStorage操作回数削減 |

**Next Phase**: データモデル設計（data-model.md）、API契約（contracts/）、開発手順書（quickstart.md）の作成
