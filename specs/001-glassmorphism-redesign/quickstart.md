# クイックスタート: Glassmorphism Redesign - Sky Theme Light Mode

**Feature**: 001-glassmorphism-redesign
**Last Updated**: 2025-11-20

## 概要

このガイドは、Skyテーマデザインリニューアルの開発を開始するための手順を説明します。このフィーチャーは、全6ページにSkyカラーパレットを適用し、ダークモード機能を削除し、ナビゲーションをボタンスタイルに統一します。

## 前提条件

- Node.js 20.x以上がインストールされている
- プロジェクトがクローンされ、依存関係がインストールされている
- フィーチャーブランチ`001-glassmorphism-redesign`にチェックアウトしている

## 開発環境のセットアップ

### 1. ブランチの確認

```bash
# 現在のブランチを確認
git branch

# フィーチャーブランチにいることを確認（*がついている）
# * 001-glassmorphism-redesign
```

### 2. 依存関係のインストール

```bash
# すでにインストール済みの場合はスキップ可
npm install
```

### 3. 開発サーバーの起動

```bash
# 開発サーバーを起動（ポート3000）
npm run dev
```

ブラウザで `http://localhost:3000` を開いて、アプリケーションが正常に起動することを確認します。

## モックアップファイルの参照

デザインの参考として、以下のモックアップファイルを使用します：

### モックアップファイルの場所

```
samples/landing-pages/
├── final-1-top.html              # 組織作成ページ
├── final-2-events-list.html      # イベント一覧
├── final-3-admin-top.html        # 管理画面トップ
├── final-4-admin-groups.html     # グループ管理
├── final-5-event-detail.html     # イベント詳細
└── final-6-bulk-register.html    # 一括登録
```

### モックアップの開き方

#### 方法1: ブラウザで直接開く

```bash
# macOS
open samples/landing-pages/final-1-top.html

# Linux
xdg-open samples/landing-pages/final-1-top.html

# Windows
start samples/landing-pages/final-1-top.html
```

#### 方法2: エディタから開く

VS Codeなどのエディタで、ファイルを右クリック → 「Open with Live Server」または「ブラウザで開く」を選択します。

### モックアップの確認ポイント

各モックアップファイルで以下を確認：

1. **背景グラデーション**: 白 → 淡い青 → 白
2. **カードスタイル**: 白背景、淡い青のボーダー、大きな影
3. **ボタンスタイルナビゲーション**: アイコン付き、白背景、ホバー時に青く変化
4. **プライマリーボタン**: 青のグラデーション
5. **アイコンカラー**: すべて青（sky-600）

## 実装対象ファイル

### 更新するページ（6ファイル）

| ファイル | ページ名 | モックアップ |
|---------|---------|-------------|
| `app/page.tsx` | 組織作成ページ | `final-1-top.html` |
| `app/[org]/page.tsx` | イベント一覧 | `final-2-events-list.html` |
| `app/[org]/admin/page.tsx` | 管理画面トップ | `final-3-admin-top.html` |
| `app/[org]/admin/groups/page.tsx` | グループ管理 | `final-4-admin-groups.html` |
| `app/[org]/events/[id]/page.tsx` | イベント詳細 | `final-5-event-detail.html` |
| `app/[org]/my-register/page.tsx` | 一括登録 | `final-6-bulk-register.html` |

### 削除するファイル（2ファイル）

- `components/ui/theme-toggle.tsx`
- `__tests__/components/ui/theme-toggle.test.tsx`

## 開発ワークフロー

### 1. デザインパターンの確認

実装前に、`research.md` を読んで以下のパターンを理解します：

- Skyカラーパレットの使用法
- ボタンスタイルナビゲーションのHTMLとクラス
- レスポンシブ対応の方法

```bash
# research.mdを確認
cat specs/001-glassmorphism-redesign/research.md
```

### 2. ページごとの実装

各ページについて、以下の手順で実装します：

#### 手順1: モックアップを開く

```bash
# 例: イベント一覧ページのモックアップを開く
open samples/landing-pages/final-2-events-list.html
```

#### 手順2: ファイルを編集

```bash
# VS Codeで該当ファイルを開く
code app/[org]/page.tsx
```

#### 手順3: Tailwind CSSクラスを更新

- **ThemeToggleの削除**: `<ThemeToggle />`コンポーネントとimport文を削除
- **背景**: `<main>`要素に`bg-gradient-to-br from-white via-sky-50 to-white`を適用
- **カード**: `bg-white border border-sky-100 rounded-xl shadow-lg`を適用
- **ナビゲーションボタン**: `research.md`のボタンスタイルパターンを適用
- **dark:クラスの削除**: すべての`dark:`プレフィックスを削除

#### 手順4: ローカルで確認

```bash
# 開発サーバーが起動している状態で、ブラウザで確認
# http://localhost:3000 にアクセス
```

#### 手順5: モックアップと比較

- ブラウザで実装したページとモックアップファイルを並べて表示
- 色、レイアウト、ホバーエフェクトが一致しているか確認

### 3. レスポンシブ確認

開発者ツールのレスポンシブモードで、以下の3つのビューポートを確認：

```
- 320px（モバイル）
- 768px（タブレット）
- 1024px（デスクトップ）
```

**確認ポイント**:
- ナビゲーションボタンが適切に折り返しているか
- カードが全幅または最大幅で表示されているか
- タップターゲットサイズが44x44px以上か

### 4. テストの実行

各ページ更新後に、テストを実行してリグレッションがないか確認：

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルのみ実行（例: app/page.tsx のテスト）
npm test -- app/page.test.tsx
```

**期待される結果**: すべてのテスト（565テスト）が通過する

### 5. dark:クラスの削除確認

すべてのページ更新後、`dark:`クラスが残っていないか確認：

```bash
# appとcomponentsディレクトリ内を検索
grep -r "dark:" app/ components/

# 結果が空（何も表示されない）であればOK
```

## トラブルシューティング

### テストが失敗する

**症状**: 既存テストが失敗する

**解決策**:
1. テストエラーメッセージを確認
2. 削除したThemeToggleコンポーネントへの参照が残っていないか確認
3. スナップショットテストの場合は、`npm test -- -u`でスナップショットを更新

### レイアウトが崩れる

**症状**: レスポンシブデザインが正しく機能しない

**解決策**:
1. `flex-wrap`クラスがナビゲーションボタンのコンテナに適用されているか確認
2. `max-w-4xl mx-auto`がメインコンテナに適用されているか確認
3. モックアップファイルのHTMLと比較

### 色が一致しない

**症状**: モックアップと色が異なる

**解決策**:
1. `research.md`のカラーパレットセクションを確認
2. Tailwind CSSのクラス名が正確か確認（例: `sky-50` vs `sky-500`）
3. ブラウザの開発者ツールで、実際に適用されているカラーコードを確認

## 次のステップ

1. **全6ページの更新完了**: すべてのページでSkyテーマが適用される
2. **ビルド確認**: `npm run build`が成功することを確認
3. **ビジュアル最終確認**: すべてのページをブラウザで開いて、モックアップと一致しているか確認
4. **コミット**: 変更をコミットし、プルリクエストを作成

```bash
# ビルド確認
npm run build

# テスト確認
npm test

# すべて成功したら、次のフェーズに進む
```

## 参考リンク

- [Feature Spec](./spec.md) - フィーチャー仕様書
- [Implementation Plan](./plan.md) - 実装計画
- [Design Research](./research.md) - デザインパターン調査結果
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Tailwind CSS公式ドキュメント

---

**質問や問題がある場合**: フィーチャーブランチのプルリクエストでコメントしてください。
