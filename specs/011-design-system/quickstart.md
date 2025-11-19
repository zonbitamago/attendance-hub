# Quickstart: デザインシステム改善

**Date**: 2025-11-19
**Feature**: 011-design-system

## 概要

このフィーチャーでは、アプリケーション全体のUI一貫性を向上させるために共通UIコンポーネントを作成し、全ページに適用する。

## 前提条件

- Node.js 20.x以上
- npm 10.x以上
- 既存のattendance-hub開発環境

## セットアップ

### 1. ブランチの確認

```bash
git checkout 011-design-system
```

### 2. 依存関係の確認

追加の依存関係は不要。既存のTailwind CSS 3.4を使用する。

## 開発ワークフロー

### 1. 共通コンポーネントの作成

```bash
# コンポーネントディレクトリの作成
mkdir -p components/ui

# テストディレクトリの作成
mkdir -p __tests__/components/ui
```

### 2. TDDで開発

各コンポーネントについて、以下の順序で開発する：

1. **テストを先に書く**（Red）
   ```bash
   # 例: Buttonコンポーネント
   touch __tests__/components/ui/button.test.tsx
   ```

2. **コンポーネントを実装**（Green）
   ```bash
   touch components/ui/button.tsx
   ```

3. **リファクタリング**（Refactor）

### 3. テスト実行

```bash
# 全テスト実行
npm test

# 特定のテストのみ
npm test -- button.test.tsx

# ウォッチモード
npm test -- --watch
```

### 4. ビルド確認

```bash
# 型チェック
npx tsc --noEmit

# リント
npm run lint

# ビルド
npm run build
```

## ファイル構成

### 新規作成ファイル

```text
components/ui/
├── button.tsx
├── input.tsx
├── card.tsx
├── message.tsx
└── heading.tsx

__tests__/components/ui/
├── button.test.tsx
├── input.test.tsx
├── card.test.tsx
├── message.test.tsx
└── heading.test.tsx
```

### 更新対象ファイル

```text
app/
├── globals.css              # ダークモード変数追加
├── page.tsx                 # 共通コンポーネント適用
├── guide/page.tsx
└── [org]/
    ├── page.tsx
    ├── guide/page.tsx
    ├── my-register/page.tsx
    ├── admin/page.tsx
    ├── admin/groups/page.tsx
    ├── admin/events/page.tsx
    ├── events/[id]/page.tsx
    └── events/[id]/register/page.tsx

README.md
specs/001-*/quickstart.md (10ファイル)
```

## 実装の進め方

### Phase 1: 共通コンポーネント作成

1. Button → Input → Card → Message → Heading の順で作成
2. 各コンポーネントでテスト → 実装 → リファクタリング
3. ダークモード対応を含める

### Phase 2: ページへの適用

1. globals.cssにダークモード変数を追加
2. 管理画面（admin/groups, admin/events）から開始
3. イベント関連ページ
4. トップページ、ガイドページ

### Phase 3: ドキュメント更新

1. README.mdにデザインシステムの説明を追加
2. 使い方ガイドページを更新
3. quickstart.mdを更新

## 検証チェックリスト

### 機能テスト

- [ ] 全てのボタンバリアント（primary/secondary/danger/ghost）が正しく表示される
- [ ] 全ての入力フィールドがスタイル統一されている
- [ ] エラー/成功メッセージにアイコンが表示される
- [ ] 見出しサイズが全ページで統一されている

### ダークモード

- [ ] システム設定に応じてダークモードが適用される
- [ ] 全てのコンポーネントがダークモードで正しく表示される
- [ ] テキストコントラストが十分（4.5:1以上）

### アクセシビリティ

- [ ] 全ての入力要素にaria-labelが設定されている
- [ ] エラーメッセージにrole="alert"が設定されている
- [ ] フォーカスリングが表示される
- [ ] キーボード操作が可能

### レスポンシブ

- [ ] 320px幅で正しく表示される
- [ ] 768px幅で正しく表示される
- [ ] 1024px幅で正しく表示される
- [ ] 1440px幅で正しく表示される

### テスト

- [ ] 既存の485テストが全てパス
- [ ] 新規コンポーネントテストが全てパス
- [ ] ビルドが成功

## トラブルシューティング

### ダークモードが反映されない

1. `tailwind.config.js`で`darkMode: 'media'`が設定されているか確認
2. ブラウザ/OSのダークモード設定を確認
3. `dark:`プレフィックスが正しく適用されているか確認

### 型エラーが発生する

1. `npx tsc --noEmit`で詳細なエラーを確認
2. コンポーネントのProps型定義を確認
3. `React.forwardRef`を使用している場合、ref型を確認

### テストが失敗する

1. `npm test -- --verbose`で詳細を確認
2. `@testing-library/jest-dom`のマッチャーが正しくインポートされているか確認
3. モックが正しく設定されているか確認

## 参考リンク

- [Tailwind CSS ダークモード](https://tailwindcss.com/docs/dark-mode)
- [WCAG 2.1 AA ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
