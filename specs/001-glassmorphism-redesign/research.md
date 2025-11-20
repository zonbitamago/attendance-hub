# Design Pattern Research: Sky Theme Light Mode

**Feature**: Glassmorphism Redesign - Sky Theme Light Mode
**Date**: 2025-11-20
**Purpose**: デザインパターンとTailwind CSSクラスの使用法を文書化

## 概要

このドキュメントは、全6ページに適用するSkyテーマのデザインパターンを定義します。すべてのパターンはモックアップファイル（`samples/landing-pages/final-*.html`）から抽出され、一貫性のあるユーザー体験を提供します。

## 1. Skyカラーパレット

### 背景

**グラデーション背景**（すべてのページの`<main>`要素に適用）:
```css
bg-gradient-to-br from-white via-sky-50 to-white
```

- **from-white**: 左上から開始（純白）
- **via-sky-50**: 中央を通過（非常に淡い青、#f0f9ff）
- **to-white**: 右下で終了（純白）

**効果**: 柔らかく洗練された背景で、コンテンツを引き立てる

### カード

**標準カードスタイル**:
```css
bg-white border border-sky-100 rounded-xl p-6 shadow-lg
```

- **bg-white**: 純白背景
- **border-sky-100**: 非常に淡い青のボーダー（#e0f2fe）
- **rounded-xl**: 大きめの角丸（12px）
- **shadow-lg**: 大きな影（深度感を演出）

**適用箇所**: 組織作成フォーム、イベント一覧カード、管理画面カードなど

### プライマリーボタン

**グラデーションボタン**:
```css
bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition shadow-md
```

- **from-sky-500**: 左から開始（#0ea5e9）
- **to-sky-600**: 右で終了（#0284c7）
- **hover:from-sky-600**: ホバー時に濃い青（#0284c7）
- **hover:to-sky-700**: ホバー時にさらに濃い青（#0369a1）

**適用箇所**: 「団体を作成」「登録」などのメインアクションボタン

### セカンダリーボタン

**ナビゲーションボタン**:
```css
bg-white border border-sky-200 hover:bg-sky-50 hover:border-sky-300
```

- **bg-white**: 白背景
- **border-sky-200**: 淡い青のボーダー（#bae6fd）
- **hover:bg-sky-50**: ホバー時に淡い青背景（#f0f9ff）
- **hover:border-sky-300**: ホバー時にやや濃い青ボーダー（#7dd3fc）

**適用箇所**: 「戻る」「一括出欠登録」「管理画面」などのナビゲーションリンク

### アイコン

**標準アイコンカラー**:
```css
text-sky-600
```

- **text-sky-600**: 濃い青（#0284c7）

**適用箇所**: すべてのSVGアイコン（ナビゲーションボタン、管理画面カードのアイコンなど）

## 2. ボタンスタイルナビゲーション

### 基本パターン

**完全なボタンスタイルナビゲーション**:
```html
<a href="#" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm">
  <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- アイコンパス -->
  </svg>
  リンクテキスト
</a>
```

**構成要素**:
- `inline-flex items-center gap-2`: フレックスボックスで、アイコンとテキストを横並び、間に8pxの隙間
- `px-4 py-2.5`: 左右16px、上下10pxのパディング
- `rounded-lg`: 中程度の角丸（8px）
- `text-sm font-medium`: 小さめのフォント、ミディアムウェイト
- `text-gray-700`: ダークグレーのテキスト（#374151）
- `transition-all`: すべてのプロパティにスムーズなトランジション
- `shadow-sm`: 小さな影

### ホバー効果

**3つの変化**:
1. **背景色**: `bg-white` → `hover:bg-sky-50`（淡い青）
2. **ボーダー色**: `border-sky-200` → `hover:border-sky-300`（やや濃い青）
3. **テキスト色**: `text-gray-700` → `hover:text-sky-700`（濃い青）

**トランジション**: `transition-all` により、すべての変化がスムーズ

### アイコンサイズとカラー

**SVGアイコン**:
```html
<svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..." />
</svg>
```

- **w-5 h-5**: 20x20pxのサイズ
- **text-sky-600**: 濃い青（#0284c7）
- **stroke-width="2"**: 線の太さ2px

### レイアウトパターン

**複数のナビゲーションボタン**:
```html
<div class="flex flex-wrap gap-3">
  <a href="#" class="...">一括出欠登録</a>
  <a href="#" class="...">管理画面</a>
  <a href="#" class="...">使い方ガイド</a>
</div>
```

- `flex flex-wrap`: フレックスボックスで、画面幅に応じて折り返し
- `gap-3`: ボタン間に12pxの隙間

**単一のナビゲーションボタン**:
```html
<a href="#" class="inline-flex items-center gap-2 ...">
  <svg class="...">...</svg>
  トップページに戻る
</a>
```

## 3. レスポンシブ対応

### モバイル（320px〜768px）

**ナビゲーションボタンの折り返し**:
- `flex-wrap` により、画面幅に応じて自動的に折り返す
- 各ボタンは最小44x44pxのタップターゲットサイズを維持（`px-4 py-2.5`で達成）

**カードレイアウト**:
- カードは全幅（`w-full`または`max-w-md`）で表示
- パディングは`px-4`で左右に16pxの余白

### タブレット（768px〜1024px）

**同じレイアウトを維持**:
- デスクトップと同じレイアウト（Tailwindのデフォルトがモバイルファースト）

### デスクトップ（1024px以上）

**最大幅の制約**:
- `max-w-4xl mx-auto`: 最大896pxの幅、中央揃え

## 4. 一貫性のあるスタイルパターン

### テキストカラー

- **見出し**: `text-gray-900`（#111827）
- **本文**: `text-gray-600`（#4b5563）、`text-gray-700`（#374151）
- **アイコン**: `text-sky-600`（#0284c7）
- **成功**: `text-green-600`（#16a34a）
- **警告**: `text-yellow-600`（#ca8a04）
- **エラー**: `text-red-600`（#dc2626）

### 入力フィールド

**標準入力スタイル**:
```css
w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-400
```

- **focus:ring-2 focus:ring-sky-500**: フォーカス時に青いリング

### ホバートランジション

**すべてのインタラクティブ要素**:
- `transition` または `transition-all` を使用
- ホバー時の変化をスムーズに演出

## 5. ダークモード削除

### 削除対象

**すべての`dark:`プレフィックスを削除**:
- `dark:bg-gray-900` → 削除
- `dark:text-gray-100` → 削除
- `dark:border-gray-600` → 削除

**削除対象ファイル**:
- `components/ui/theme-toggle.tsx`
- `__tests__/components/ui/theme-toggle.test.tsx`

**削除対象コンポーネント使用箇所**:
- すべてのページから`<ThemeToggle />`を削除
- すべてのページから`import { ThemeToggle } ...`を削除

## 6. 実装チェックリスト

各ページ更新時に以下を確認：

- [ ] 背景に`bg-gradient-to-br from-white via-sky-50 to-white`が適用されている
- [ ] カードに`bg-white border border-sky-100 rounded-xl shadow-lg`が適用されている
- [ ] プライマリーボタンに`bg-gradient-to-r from-sky-500 to-sky-600`が適用されている
- [ ] ナビゲーションボタンに完全なボタンスタイルクラスが適用されている
- [ ] すべてのアイコンに`w-5 h-5 text-sky-600`が適用されている
- [ ] `dark:`クラスが存在しない
- [ ] `<ThemeToggle />`が削除されている
- [ ] レスポンシブデザインが維持されている（320px、768px、1024px確認）

## 7. 参照モックアップ

すべてのパターンは以下のファイルから抽出：

- `samples/landing-pages/final-1-top.html`（組織作成ページ）
- `samples/landing-pages/final-2-events-list.html`（イベント一覧）
- `samples/landing-pages/final-3-admin-top.html`（管理画面トップ）
- `samples/landing-pages/final-4-admin-groups.html`（グループ管理）
- `samples/landing-pages/final-5-event-detail.html`（イベント詳細）
- `samples/landing-pages/final-6-bulk-register.html`（一括登録）

**使用方法**: 各ページのスタイルを確認したい場合は、対応するモックアップファイルをブラウザで開いて視覚的に確認してください。

---

**決定事項まとめ**:
- **カラーパレット**: Tailwind CSS 3.4のSkyカラー（sky-50〜sky-600）を使用
- **デザインアプローチ**: ライトモード専用、ダークモード完全削除
- **ナビゲーション**: すべてのリンクをアイコン付きボタンスタイルに統一
- **レスポンシブ**: Tailwindのモバイルファーストアプローチを維持

**代替案**: なし（モックアップに基づいた実装のため）
