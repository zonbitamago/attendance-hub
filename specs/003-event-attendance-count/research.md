# Research: イベント人数表示機能

**Feature**: 003-event-attendance-count
**Date**: 2025-11-08

## Overview

この機能は既存のデータモデルとサービス層を活用して、3つの画面にイベントごとの人数表示を追加します。主な技術的課題は、パフォーマンス最適化と重複カウント防止です。

## Research Items

### 1. 既存の集計ロジックの分析

**Decision**: `calculateEventSummary` 関数をベースに、新しい `calculateEventTotalSummary` 関数を実装する

**Rationale**:

- 既存の `calculateEventSummary` は既にグループ別の集計を実装しており、動作が保証されている
- 同じパターンを踏襲することで、コードの一貫性と保守性が向上する
- 既存のテストパターンも参考にできる

**Alternatives Considered**:

- `calculateEventSummary` を拡張して全体集計も返す → 既存の関数のシグネチャを変更すると既存コードに影響するため却下
- UIコンポーネント内で集計する → ビジネスロジックとプレゼンテーション層を分離するTDD原則に反するため却下

### 2. 重複カウント防止の実装方法

**Decision**: `Set<string>` を使用して `memberId` の重複を排除する

**Rationale**:

- FR-007（重複カウント防止）の要件を満たす
- JavaScript/TypeScript の標準 `Set` は重複を自動的に排除する
- パフォーマンスも O(n) で効率的

**Alternatives Considered**:

- 配列の `filter` と `includes` で重複チェック → O(n²) で非効率なため却下
- データベースレベルでユニーク制約 → localStorage では実装困難、将来のSupabase移行時に検討

**Implementation**:

```typescript
const uniqueMemberIds = new Set(attendances.map((a) => a.memberId));
const totalAttending = attendances.filter(
  (a) => a.status === '◯' && uniqueMemberIds.has(a.memberId)
).length;
```

ただし、現在のデータモデルでは1つのメンバーは1つの出欠しか持たないため、実質的に重複は発生しない。将来的に同じメンバーが複数グループに所属する場合に備えての実装。

### 3. パフォーマンス最適化戦略

**Decision**: React の `useMemo` を使用してコンポーネントレベルで集計結果をメモ化する

**Rationale**:

- SC-005（100件以上のイベントで2秒以内）の要件を満たす
- イベントデータが変更されない限り、再計算を防ぐ
- Next.js のクライアントコンポーネントで `useMemo` が利用可能

**Alternatives Considered**:

- サーバーサイドで事前計算 → localStorage はクライアントサイドのみなので不可
- Web Worker で計算 → 100件程度では過剰な複雑性、必要になったら検討

**Implementation**:

```typescript
const totalSummary = useMemo(() => calculateEventTotalSummary(eventDate.id), [eventDate.id]);
```

### 4. UI表示形式の統一

**Decision**: 3つの画面で統一された表示形式を使用する

**Rationale**:

- イベント一覧画面: `◯ X人 △ Y人 ✗ Z人（計W人）` - ユーザーフィードバックに基づき詳細表示に変更
- イベント詳細画面: `参加: X人 / 未定: Y人 / 欠席: Z人（計W人）` - より詳細な日本語表記
- イベント管理画面: `◯ X人 △ Y人 ✗ Z人（計W人）` - イベント一覧と同じ形式

**Alternatives Considered**:

- すべての画面で同じ記号形式 → イベント詳細は詳細な説明が必要なため却下
- グラフやチャート表示 → MVP では過剰、将来の拡張として検討

### 5. 既存型定義の活用

**Decision**: 既存の `EventSummary` 型を確認し、必要に応じて `EventTotalSummary` 型を定義する

**Rationale**:

- [types/index.ts](../../types/index.ts) には既に `EventSummary` 型が定義されている
- `EventSummary` には `totalAttending`, `totalMaybe`, `totalNotAttending`, `totalResponded` が含まれる
- この型をそのまま利用できるか、または部分型を定義するか検討が必要

**Implementation**:
既存の `EventSummary` 型から必要なフィールドのみを抽出した型を定義:

```typescript
export interface EventTotalSummary {
  totalAttending: number;
  totalMaybe: number;
  totalNotAttending: number;
  totalResponded: number;
}
```

または、既存の `EventSummary` から `Omit` を使用:

```typescript
type EventTotalSummary = Omit<EventSummary, 'eventDateId' | 'groupSummaries'>;
```

## Best Practices

### TypeScript Best Practices

1. **厳密な型定義**: 戻り値の型を明示的に指定
2. **Readonly 配列**: 副作用を防ぐため、適切に `readonly` を使用
3. **型推論の活用**: Zod スキーマがある場合は `z.infer` を使用

### React Best Practices

1. **メモ化**: `useMemo` で不要な再計算を防ぐ
2. **コンポーネント分離**: 人数表示を再利用可能なコンポーネントに分離することも検討
3. **アクセシビリティ**: 数値には適切な `aria-label` を付与

### TDD Best Practices

1. **テストファースト**: 実装前にテストケースを作成
2. **エッジケースのカバー**: 出欠登録が0件の場合、100件以上の場合
3. **独立性**: 各テストは他のテストに依存しない

## Conclusion

この調査により、以下が明確になりました：

1. 新規関数 `calculateEventTotalSummary` を `lib/attendance-service.ts` に追加
2. `Set` を使用した重複カウント防止（将来の拡張性を考慮）
3. `useMemo` によるパフォーマンス最適化
4. 既存の型定義を活用した型安全性の維持
5. TDD アプローチでテストファーストの実装

すべての技術的な不明点が解決され、Phase 1（設計とコントラクト）に進む準備が整いました。
