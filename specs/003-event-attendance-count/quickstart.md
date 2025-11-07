# Quickstart: イベント人数表示機能

**Feature**: 003-event-attendance-count
**Branch**: `003-event-attendance-count`
**Date**: 2025-11-08

## 概要

このガイドでは、イベント人数表示機能の開発環境をセットアップし、実装を開始するための手順を説明します。

## 前提条件

- Node.js 20.x以上がインストールされている
- npm または yarn がインストールされている
- Git がインストールされている
- エディタ（VS Code推奨）がインストールされている

## セットアップ手順

### 1. ブランチの確認

このフィーチャーブランチは既に作成されています：

```bash
# 現在のブランチを確認
git branch

# 003-event-attendance-count ブランチにいることを確認
# もし違うブランチにいる場合は切り替え
git checkout 003-event-attendance-count
```

### 2. 依存関係のインストール

```bash
# プロジェクトルートで実行
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 4. テストの実行

```bash
# すべてのテストを実行
npm test

# ウォッチモードでテストを実行（開発中推奨）
npm test -- --watch

# 特定のファイルのテストを実行
npm test -- attendance-service.test.ts
```

## 開発フロー（TDD）

この機能は **Test-Driven Development (TDD)** アプローチで実装します。

### Red-Green-Refactor サイクル

1. **Red** - 失敗するテストを書く
2. **Green** - テストを通す最小限の実装
3. **Refactor** - コードを整理・改善

### 実装順序

#### Step 1: calculateEventTotalSummary 関数のテスト作成（Red）

```bash
# テストファイルを開く
code __tests__/lib/attendance-service.test.ts
```

`describe('calculateEventTotalSummary', () => { ... })` ブロックを追加し、以下のテストケースを作成：

1. イベント全体の出欠を正確に集計する
2. 出欠登録がない場合、すべて0を返す
3. 複数のグループにまたがる集計
4. 存在しないイベントIDの場合、すべて0を返す

```bash
# テストを実行して失敗を確認（Red）
npm test -- attendance-service.test.ts
```

#### Step 2: calculateEventTotalSummary 関数の実装（Green）

```bash
# サービスファイルを開く
code lib/attendance-service.ts
```

`calculateEventTotalSummary` 関数を実装：

```typescript
export function calculateEventTotalSummary(eventDateId: string): EventTotalSummary {
  // 実装コード
}
```

```bash
# テストを実行してパスすることを確認（Green）
npm test -- attendance-service.test.ts
```

#### Step 3: 型定義の追加（必要に応じて）

```bash
# 型定義ファイルを開く
code types/index.ts
```

`EventTotalSummary` 型が必要な場合は追加します（既存の `EventSummary` から派生可能）。

#### Step 4: UI コンポーネントの更新

各画面を順番に更新します：

##### 4a. イベント一覧画面（P1）

```bash
code app/page.tsx
```

- `calculateEventTotalSummary` をインポート
- 各イベントカードに人数表示を追加
- `useMemo` でメモ化

##### 4b. イベント詳細画面（P2）

```bash
code app/events/[id]/page.tsx
```

- グループ別集計の上部に全体集計セクションを追加

##### 4c. イベント管理画面（P3）

```bash
code app/admin/events/page.tsx
```

- 各イベント行に人数表示を追加

### Step 5: 動作確認

```bash
# 開発サーバーが起動していることを確認
npm run dev
```

ブラウザで以下を確認：

1. http://localhost:3000 - イベント一覧画面
2. http://localhost:3000/events/[id] - イベント詳細画面
3. http://localhost:3000/admin/events - イベント管理画面

### Step 6: リファクタリング（Refactor）

すべてのテストがパスし、動作確認が完了したら：

- コードの重複を削除
- 必要に応じてコンポーネント分割
- パフォーマンス最適化（useMemo追加）
- コードフォーマット

```bash
# リンティング
npm run lint

# 型チェック
npx tsc --noEmit
```

## ファイル構成

この機能で変更するファイル：

```
attendance-hub/
├── lib/
│   └── attendance-service.ts        # [UPDATE] calculateEventTotalSummary追加
├── types/
│   └── index.ts                     # [REVIEW] EventTotalSummary型の確認
├── __tests__/
│   └── lib/
│       └── attendance-service.test.ts  # [UPDATE] 新関数のテスト追加
├── app/
│   ├── page.tsx                     # [UPDATE] イベント一覧画面
│   ├── admin/
│   │   └── events/page.tsx          # [UPDATE] イベント管理画面
│   └── events/
│       └── [id]/page.tsx            # [UPDATE] イベント詳細画面
└── specs/
    └── 003-event-attendance-count/
        ├── spec.md                  # 機能仕様
        ├── plan.md                  # 実装計画
        ├── research.md              # 技術調査
        ├── data-model.md            # データモデル
        ├── quickstart.md            # このファイル
        └── tasks.md                 # タスクリスト（/speckit.tasksで生成）
```

## テストデータの準備

開発中にテストデータを追加するには：

1. ブラウザで http://localhost:3000/admin/groups を開く
2. グループを作成（例: グループA、グループB）
3. 各グループにメンバーを追加
4. http://localhost:3000/admin/events を開く
5. イベントを作成
6. 各イベントで出欠登録を行う

または、localStorage に直接テストデータを投入：

```bash
# ブラウザのコンソールで実行
localStorage.setItem('attendance-hub-groups', JSON.stringify([...]));
localStorage.setItem('attendance-hub-members', JSON.stringify([...]));
localStorage.setItem('attendance-hub-event-dates', JSON.stringify([...]));
localStorage.setItem('attendance-hub-attendances', JSON.stringify([...]));
```

## トラブルシューティング

### テストが失敗する

```bash
# テストの詳細を表示
npm test -- --verbose

# 特定のテストのみ実行
npm test -- -t "calculateEventTotalSummary"
```

### 型エラーが出る

```bash
# 型チェックを実行
npx tsc --noEmit

# エラーの詳細を確認
npx tsc --noEmit --pretty
```

### 開発サーバーが起動しない

```bash
# ポート3000が使用中の場合、別のポートで起動
PORT=3001 npm run dev

# node_modules を再インストール
rm -rf node_modules package-lock.json
npm install
```

### localStorage がクリアされた

```bash
# ブラウザの開発者ツールで確認
# Application > Local Storage > http://localhost:3000

# データを再作成するか、バックアップから復元
```

## 次のステップ

1. `/speckit.tasks` を実行してタスクリストを生成
2. `/speckit.implement` を実行して実装を開始
3. 各タスクをTDDアプローチで実装
4. すべてのテストがパスすることを確認
5. ブラウザで動作確認
6. コミットしてプルリクエストを作成

## 参考資料

- [仕様書](./spec.md) - 機能要件とユーザーストーリー
- [実装計画](./plan.md) - 技術的な実装詳細
- [データモデル](./data-model.md) - データ構造と集計ロジック
- [プロジェクト憲法](../../.specify/memory/constitution.md) - 開発原則とガイドライン
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体のガイドライン

## ヘルプ

質問や問題がある場合は：

1. [仕様書](./spec.md) と [実装計画](./plan.md) を再確認
2. 既存のテストコード（`__tests__/lib/attendance-service.test.ts`）を参考にする
3. 既存の実装（`lib/attendance-service.ts` の `calculateEventSummary`）を参考にする
4. プロジェクト憲法の TDD セクションを確認
