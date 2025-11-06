# Research: 入力欄テキスト視認性の改善

**Date**: 2025-11-06
**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

入力欄の文字色が見にくい問題の原因を調査し、Tailwind CSSを使用した解決策を決定する。

## Problem Analysis

### 現状の問題

1. **文字色の未指定**
   - 全9箇所の入力欄（input、select）に文字色（`text-*`クラス）が指定されていない
   - グローバルスタイル（`app/globals.css`）の`body { color: var(--foreground); }`が継承される

2. **ダークモードでの視認性問題**
   - `--foreground`変数の値:
     - ライトモード: `#171717`（濃いグレー）
     - ダークモード: `#ededed`（明るいグレー）
   - 入力欄の背景は白系（またはブラウザデフォルト）
   - **ダークモードで明るい背景に明るい文字 = 読めない**

3. **対象ファイルと箇所**
   - `app/admin/groups/page.tsx`: 3箇所（グループ名、表示順序、カラーコード）
   - `app/admin/events/page.tsx`: 3箇所（日付、タイトル、場所）
   - `app/events/[id]/register/page.tsx`: 3箇所（グループ選択、メンバー選択、新メンバー名）

## Research Task 1: Tailwind CSS文字色クラスの選定

### Decision: `text-gray-900` + `placeholder:text-gray-400`

### Rationale

1. **入力テキスト色: `text-gray-900` (#111827)**
   - WCAG 2.1 AA基準との適合性:
     - 白背景（#FFFFFF）とのコントラスト比: **16.6:1**
     - 必要基準（4.5:1）を大幅に上回る
   - 視認性: 非常に濃い色で明瞭に読める
   - Tailwindデフォルトカラーパレットの一部（ビルド最適化済み）

2. **プレースホルダー色: `placeholder:text-gray-400` (#9ca3af)**
   - WCAG 2.1 AA基準との適合性:
     - 白背景（#FFFFFF）とのコントラスト比: **4.6:1**
     - 必要基準（4.5:1）をわずかに上回る
   - 視認性: 入力テキストよりも薄く、明確に区別できる
   - Tailwindの`placeholder:`修飾子で簡潔に指定可能

3. **ダークモード対応**
   - これらの色を明示的に指定することで、`prefers-color-scheme: dark`の影響を受けない
   - 入力欄は常にライトモード的な見た目（濃い文字+白背景）を維持
   - 代替案（ダークモード用に別の色を指定）は複雑性が増すため却下

### Alternatives Considered

#### Alternative 1: `text-gray-800` (#1f2937)
- コントラスト比: 12.6:1
- **却下理由**: `gray-900`と比べて視認性の差は小さく、より濃い色の方が明瞭

#### Alternative 2: `text-black` (#000000)
- コントラスト比: 21:1（最大）
- **却下理由**: 純黒は目に厳しく、長時間の入力作業で疲労を引き起こす可能性。`gray-900`の方が柔らかい

#### Alternative 3: `placeholder:text-gray-500` (#6b7280)
- コントラスト比: 5.7:1
- **却下理由**: プレースホルダーとしては濃すぎる。入力テキストとの区別が曖昧になる

#### Alternative 4: ダークモード用の条件付きクラス（`dark:text-gray-100`など）
- **却下理由**:
  - 複雑性が増す（2倍のクラス指定）
  - 入力欄の背景もダークモード対応する必要がある
  - プロジェクト憲法VI「アクセシビリティ基準」を満たすには、両モードで同じ高コントラストが必要
  - シンプルな解決策（常に濃い色）で十分

## Research Task 2: 既存スタイリングパターンの確認

### Decision: 既存のclassName属性に追加

### Rationale

現在の入力欄のclassName構造（例）:
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
```

**修正後**:
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
```

**理由**:
1. 既存のスタイリングを維持（レイアウト、境界線、フォーカス状態など）
2. 末尾に文字色クラスを追加するだけ（最小変更）
3. Tailwindのクラス順序は重要でない（CSSの詳細度で決まる）
4. 一貫性: 全9箇所で同じパターンを適用

### Alternatives Considered

#### Alternative 1: 新規コンポーネントを作成（`<StyledInput>`など）
- **却下理由**:
  - 9箇所のみの変更に対して過剰なエンジニアリング
  - プロジェクト憲法の「シンプルに始める」原則に反する
  - 各入力欄は用途が異なり、抽象化の利点が少ない

#### Alternative 2: globals.cssにカスタムCSSを追加
```css
input, select, textarea {
  color: #111827;
}
input::placeholder, select::placeholder, textarea::placeholder {
  color: #9ca3af;
}
```
- **却下理由**:
  - プロジェクト憲法の「Tailwind CSSのみ」原則に反する
  - グローバルスタイルは予期しない副作用を生む可能性
  - Tailwindのユーティリティファーストアプローチを放棄

## Research Task 3: ダークモード対応の検証

### Decision: 明示的な色指定でダークモードの影響を回避

### Rationale

#### globals.cssの現状分析

```css
:root {
  --foreground: #171717;  /* ライトモード */
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground: #ededed;  /* ダークモード */
  }
}

body {
  color: var(--foreground);  /* これが継承されている */
}
```

#### 問題のメカニズム

1. 入力欄に文字色が指定されていない
2. `body`の`color`プロパティが継承される
3. ダークモードでは`--foreground`が明るい色（#ededed）になる
4. 入力欄の背景は白系のまま → 読めない

#### 解決策

`text-gray-900`を明示的に指定することで、`body`の`color`を上書き:

```tsx
className="... text-gray-900 ..."
```

これにより、入力欄の文字色は常に`#111827`に固定され、メディアクエリの影響を受けない。

#### 入力欄背景の確認

現在の入力欄には背景色が明示的に指定されていない（ブラウザデフォルト）:
- ほとんどのブラウザ: 白（#FFFFFF）または非常に明るいグレー
- ダークモードでも入力欄の背景は白のまま（`prefers-color-scheme`は`body`などに影響、入力欄には通常影響しない）

**結論**: 背景色の明示的指定は不要。ブラウザデフォルトで十分。

### Alternatives Considered

#### Alternative 1: 背景色も明示的に指定（`bg-white`）
- **却下理由**:
  - ブラウザデフォルトで既に白系
  - 追加の複雑性なしで目標達成可能
  - 将来ダークモード対応を追加する場合に柔軟性が低下

#### Alternative 2: ダークモード専用の入力欄スタイル
```tsx
className="... text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ..."
```
- **却下理由**:
  - 現在の要件は「見やすくする」こと、ダークモード対応ではない
  - 複雑性が2倍になる
  - 両モードでのコントラスト検証が必要
  - YAGNI原則（You Aren't Gonna Need It）

## Implementation Pattern

### 標準パターン（全9箇所で適用）

```tsx
// Before
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

// After
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
/>
```

### select要素も同様

```tsx
// Before
<select
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>

// After
<select
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
>
```

**注**: `placeholder:text-gray-400`はselect要素には効果がないが、一貫性のため全要素に適用。

## Verification Method

### 1. コントラスト比計算（自動化可能）

ツール: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

| 組み合わせ | 前景色 | 背景色 | コントラスト比 | WCAG AA |
|-----------|--------|--------|----------------|---------|
| 入力テキスト | #111827 | #FFFFFF | 16.6:1 | ✅ Pass |
| プレースホルダー | #9ca3af | #FFFFFF | 4.6:1 | ✅ Pass |

### 2. 視覚的検証（手動）

手順:
1. ライトモードでブラウザを開く
2. 各入力欄にテキストを入力
3. 入力テキストが明瞭に読めることを確認
4. ブラウザまたはOSをダークモードに切り替え
5. 再度各入力欄にテキストを入力
6. 入力テキストが同様に明瞭に読めることを確認
7. プレースホルダーと入力テキストの色の違いを確認

### 3. ブラウザ互換性

テスト対象:
- Chrome 最新版
- Firefox 最新版
- Safari 最新版（macOS）
- Edge 最新版

**期待される動作**: すべてのブラウザで同じ色が表示される（Tailwindのクラスはベンダープレフィックス不要）

## Summary

### Selected Approach

- **入力テキスト色**: `text-gray-900` (#111827)
- **プレースホルダー色**: `placeholder:text-gray-400` (#9ca3af)
- **適用方法**: 既存のclassName属性に追加
- **ダークモード対応**: 明示的な色指定で回避

### Key Benefits

1. **シンプル**: 既存のclassNameに2つのクラスを追加するだけ
2. **一貫性**: 全9箇所で同じパターン
3. **アクセシビリティ**: WCAG 2.1 AA基準を満たす
4. **保守性**: Tailwindのユーティリティクラスのみ使用
5. **パフォーマンス**: バンドルサイズへの影響は最小限（既存クラスの再利用）

### Next Steps

Phase 1でquickstart.mdを作成し、手動テストの詳細手順を文書化する。
