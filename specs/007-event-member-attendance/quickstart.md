# Quickstart: イベント画面 個人別出欠状況表示機能

**フィーチャー**: 007-event-member-attendance
**作成日**: 2025-11-10
**ステータス**: Phase 1

## 概要

このドキュメントでは、個人別出欠状況表示機能の開発を開始するための手順を説明する。TDD（テスト駆動開発）に従い、テストファーストで実装を進める。

---

## 前提条件

- Node.js 20.x以上がインストールされている
- このプロジェクトのリポジトリをクローン済み
- ブランチ `007-event-member-attendance` にチェックアウト済み

---

## 開発環境セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

**確認**:
```bash
npm list typescript next react
```

期待される出力:
```
attendance-hub@0.1.0
├── typescript@5.9.3
├── next@16.0.1
└── react@19.2.0
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開き、アプリケーションが正常に動作することを確認。

### 3. テストの実行

```bash
npm test
```

**期待**: 既存のテストがすべてパスする。

---

## TDD開発フロー

このフィーチャーは**テスト駆動開発（TDD）**で実装する。以下のRed-Green-Refactorサイクルを厳守する。

### Red-Green-Refactorサイクル

```
1. [Red] 失敗するテストを書く
   ↓
2. [Green] テストを通す最小限の実装
   ↓
3. [Refactor] コードを整理・改善
   ↓
繰り返し
```

---

## 実装手順（優先順位付き）

### Phase 1: サービス層（lib/attendance-service.ts）

#### ステップ1.1: 新規型定義を追加

**ファイル**: `types/index.ts`

**作業内容**:
1. `MemberAttendanceDetail` インターフェースを追加
2. `AttendanceFilterStatus` 型を追加
3. `AttendanceSortBy` 型を追加

**参考**: [data-model.md](./data-model.md)

#### ステップ1.2: getGroupMemberAttendances() のテストを作成（Red）

**ファイル**: `__tests__/lib/attendance-service.test.ts`

**作業内容**:
1. テストケース1: 通常ケース（出欠登録済み + 未登録）を追加
2. テストを実行 → 失敗することを確認（Red）

**コマンド**:
```bash
npm test __tests__/lib/attendance-service.test.ts
```

**参考**: [contracts/attendance-service.md](./contracts/attendance-service.md) のテストケース1

#### ステップ1.3: getGroupMemberAttendances() を実装（Green）

**ファイル**: `lib/attendance-service.ts`

**作業内容**:
1. `getGroupMemberAttendances()` 関数を実装
2. テストを実行 → パスすることを確認（Green）

**参考**: [contracts/attendance-service.md](./contracts/attendance-service.md) の処理フロー

#### ステップ1.4: リファクタリング（Refactor）

**作業内容**:
1. コードの重複を除去
2. 変数名を改善
3. コメントを追加
4. テストを再実行 → パスすることを確認

#### ステップ1.5: 残りのテストケースを追加（繰り返し）

**作業内容**:
1. テストケース2～8を順次追加
2. 各テストケースごとにRed-Green-Refactorサイクルを実行

**参考**: [contracts/attendance-service.md](./contracts/attendance-service.md) のテストケース2～8

---

### Phase 2: コンポーネント層

#### ステップ2.1: GroupAttendanceAccordion コンポーネント

**ファイル**:
- `components/event-detail/group-attendance-accordion.tsx`
- `__tests__/components/event-detail/group-attendance-accordion.test.tsx`

**作業内容**:
1. テストを先に作成（Red）
   - アコーディオンの展開/折りたたみ
   - ARIA属性の確認
   - キーボード操作（Enter/Space）
2. コンポーネントを実装（Green）
3. リファクタリング（Refactor）

**テスト例**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GroupAttendanceAccordion from '@/components/event-detail/group-attendance-accordion';

test('グループ名をクリックするとメンバーリストが表示される', () => {
  // Arrange
  const members = [
    { memberId: '1', memberName: '山田太郎', status: '◯', ... },
    { memberId: '2', memberName: '鈴木花子', status: '△', ... },
  ];

  // Act
  render(
    <GroupAttendanceAccordion
      groupId="group-1"
      groupName="打"
      groupSummary={{ attending: 1, maybe: 1, notAttending: 0, total: 2 }}
      members={members}
      isExpanded={false}
      onToggle={() => {}}
    />
  );

  const button = screen.getByRole('button', { name: /打/ });
  fireEvent.click(button);

  // Assert
  expect(screen.getByText('山田太郎')).toBeInTheDocument();
  expect(screen.getByText('鈴木花子')).toBeInTheDocument();
});
```

#### ステップ2.2: MemberAttendanceList コンポーネント

**ファイル**:
- `components/event-detail/member-attendance-list.tsx`
- `__tests__/components/event-detail/member-attendance-list.test.tsx`

**作業内容**:
1. テストを先に作成（Red）
   - メンバー名とステータスの表示
   - 未登録メンバーの表示（"-"）
   - 空の状態メッセージ
2. コンポーネントを実装（Green）
3. リファクタリング（Refactor）

#### ステップ2.3: AttendanceFilters コンポーネント

**ファイル**:
- `components/event-detail/attendance-filters.tsx`
- `__tests__/components/event-detail/attendance-filters.test.tsx`

**作業内容**:
1. テストを先に作成（Red）
   - 検索ボックスの入力
   - フィルタドロップダウンの選択
   - ソートボタンのクリック
2. コンポーネントを実装（Green）
3. リファクタリング（Refactor）

---

### Phase 3: 統合（イベント詳細ページ）

#### ステップ3.1: イベント詳細ページの拡張

**ファイル**: `app/[org]/events/[id]/page.tsx`

**作業内容**:
1. 既存のグループ別集計セクションをアコーディオンに置き換え
2. `getGroupMemberAttendances()` を呼び出してデータを取得
3. フィルタ/ソート/検索の状態管理を追加
4. 手動テスト: ブラウザで動作確認

**テスト**:
```bash
npm run dev
```

ブラウザで以下を確認:
- アコーディオンの展開/折りたたみ
- メンバー名とステータスの表示
- フィルタの動作
- ソートの動作
- 検索の動作

---

## 開発時のコマンド

### テストの実行

```bash
# すべてのテストを実行
npm test

# 特定のファイルのテストを実行
npm test __tests__/lib/attendance-service.test.ts

# ウォッチモードでテストを実行
npm test -- --watch

# カバレッジレポートを生成
npm test -- --coverage
```

### リンティング

```bash
# ESLintを実行
npm run lint

# ESLintの自動修正
npm run lint -- --fix
```

### 型チェック

```bash
# TypeScriptの型チェック
npx tsc --noEmit
```

### ビルド

```bash
# プロダクションビルド
npm run build
```

---

## デバッグ

### React Developer Toolsの使用

1. Chrome拡張機能「React Developer Tools」をインストール
2. ブラウザで開発サーバーを開く
3. DevToolsの「Components」タブで状態を確認

### console.log デバッグ

```typescript
// コンポーネント内
console.log('expandedGroups:', expandedGroups);
console.log('filteredMembers:', filteredMembers);

// サービス関数内
console.log('getGroupMemberAttendances called with:', {
  organizationId,
  eventDateId,
  groupId,
});
```

### Jest デバッグ

```typescript
// テスト内
console.log('members:', members);
console.log('details:', details);
```

---

## トラブルシューティング

### Q: テストが失敗する

**A**: エラーメッセージを確認し、以下を試す:
1. `npm test -- --verbose` で詳細を確認
2. テストファイルのimportパスが正しいか確認
3. モックデータが正しくセットアップされているか確認

### Q: 型エラーが出る

**A**: 以下を確認:
1. `types/index.ts` に新規型定義を追加したか
2. `tsconfig.json` の設定が正しいか
3. `npx tsc --noEmit` で詳細なエラーメッセージを確認

### Q: アコーディオンが動作しない

**A**: 以下を確認:
1. `expandedGroups` の状態が正しく管理されているか
2. `toggleGroup()` 関数が正しく実装されているか
3. ブラウザのコンソールでエラーが出ていないか

### Q: 検索/フィルタ/ソートが動作しない

**A**: 以下を確認:
1. `useMemo` の依存配列が正しいか
2. フィルタ/ソートのロジックが正しく実装されているか
3. 状態の更新が正しく行われているか

---

## 参考ドキュメント

### このフィーチャーのドキュメント

- [spec.md](./spec.md) - 機能仕様書
- [plan.md](./plan.md) - 実装計画
- [research.md](./research.md) - 技術調査
- [data-model.md](./data-model.md) - データモデル
- [contracts/attendance-service.md](./contracts/attendance-service.md) - API契約

### プロジェクト全体のドキュメント

- [README.md](../../README.md) - プロジェクト概要
- [CLAUDE.md](../../CLAUDE.md) - 開発ガイドライン
- [constitution.md](../../.specify/memory/constitution.md) - プロジェクト憲法

### 外部リソース

- [Next.js 16 ドキュメント](https://nextjs.org/docs)
- [React 19 ドキュメント](https://react.dev/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Jest ドキュメント](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WAI-ARIA Authoring Practices - Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)

---

## 次のステップ

Phase 1のドキュメント作成が完了したので、次は:

1. **Agent contextを更新**: `.specify/scripts/bash/update-agent-context.sh claude` を実行
2. **/speckit.tasks を実行**: tasks.mdを生成し、実装タスクを明確化
3. **実装開始**: TDDサイクルに従って実装

---

## まとめ

このQuickstartガイドでは、以下をカバーした:

- ✅ 開発環境のセットアップ
- ✅ TDD開発フロー（Red-Green-Refactor）
- ✅ 実装手順（Phase 1～3）
- ✅ 開発時のコマンド
- ✅ デバッグ方法
- ✅ トラブルシューティング
- ✅ 参考ドキュメント

このガイドに従って、テストファーストで安全かつ確実に実装を進めること。
