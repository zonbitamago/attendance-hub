# Attendance Hub

グループの出欠確認を簡単に管理できるWebアプリケーションです。

## 機能

### ✨ 主な機能

- **グループ管理**: イベントやミーティング用のグループを作成・管理
- **出欠登録**: ユーザー名と出欠状況（◯/△/✗）を簡単に登録
- **集計表示**: 出席/未定/欠席の人数をリアルタイムで集計
- **編集・削除**: 登録済みの出欠情報を編集・削除可能
- **履歴表示**: グループごとの出欠履歴を時系列で表示
- **データ永続化**: ブラウザのlocalStorageを使用してデータを保存

### 📱 対応環境

- モバイルファースト設計 (320px〜1920px対応)
- モダンブラウザ (Chrome, Firefox, Safari, Edge)
- レスポンシブデザイン

## 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **言語**: [TypeScript 5.3](https://www.typescriptlang.org/)
- **UIライブラリ**: [React 19](https://react.dev/)
- **スタイリング**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **バリデーション**: [Zod 3.23](https://zod.dev/)
- **日付処理**: [date-fns 4.1](https://date-fns.org/)
- **テスト**: [Jest 29](https://jestjs.io/) + [Testing Library](https://testing-library.com/)

## セットアップ

### 前提条件

- Node.js 18.x以降
- npm 9.x以降

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd attendance-hub

# 依存パッケージをインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

### ビルド

```bash
npm run build
```

### テストの実行

```bash
# 全テストを実行
npm test

# ウォッチモードで実行
npm run test:watch
```

## プロジェクト構造

```
attendance-hub/
├── app/                    # Next.js App Router ページ
│   ├── groups/            # グループ関連ページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── components/            # Reactコンポーネント
│   ├── attendance-form.tsx
│   ├── attendance-list.tsx
│   ├── group-form.tsx
│   ├── group-list.tsx
│   ├── history-list.tsx
│   ├── summary-card.tsx
│   ├── loading-spinner.tsx
│   └── skeleton.tsx
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── attendance-service.ts  # 出欠登録サービス
│   ├── group-service.ts       # グループサービス
│   ├── storage.ts             # localStorage操作
│   ├── validation.ts          # Zodスキーマ
│   ├── date-utils.ts          # 日付フォーマット
│   └── error-utils.ts         # エラーハンドリング
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テストファイル
│   └── lib/
└── specs/                # 仕様書・設計ドキュメント
    └── 001-attendance-prototype/
```

## 使い方

### 1. グループを作成

1. トップページの「+ 新しいグループを作成」ボタンをクリック
2. グループ名（必須）と説明（任意）を入力
3. 「グループを作成」ボタンをクリック

### 2. 出欠を登録

1. グループ一覧から対象のグループをクリック
2. 「+ 出欠を登録する」ボタンをクリック
3. 名前と出欠状況（◯/△/✗）を選択
4. 「出欠を登録」ボタンをクリック

### 3. 出欠状況を確認

- グループ詳細ページで集計結果と出欠一覧を確認
- 「履歴を表示」リンクから時系列の履歴を確認

### 4. 出欠情報を編集・削除

1. グループ詳細ページの出欠一覧で「編集」または「削除」ボタンをクリック
2. 編集の場合: 名前や出欠状況を変更して「保存」
3. 削除の場合: 確認ダイアログで「削除」をクリック

## テスト

全39テストが実装されています:

- **ストレージ**: localStorage操作のテスト
- **グループサービス**: グループCRUD操作のテスト
- **出欠登録サービス**: 出欠登録・集計・履歴のテスト

```bash
# テストを実行
npm test

# カバレッジレポートを生成
npm test -- --coverage
```

## ライセンス

MIT

## 開発

### コーディング規約

- ESLint + Prettierによるコードフォーマット
- TypeScript strictモード有効
- 日本語のコメントとUI

### コミット前の確認

```bash
# リンターを実行
npm run lint

# テストを実行
npm test

# ビルドを確認
npm run build
```
