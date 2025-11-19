# Data Model: デザインシステム改善

**Date**: 2025-11-19
**Feature**: 011-design-system

## 概要

本フィーチャーではデータベースの変更はなく、ReactコンポーネントのPropsインターフェースを定義する。

## コンポーネントProps定義

### ButtonProps

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| variant | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | No | `'primary'` | ボタンのスタイルバリアント |
| size | `'sm' \| 'md' \| 'lg'` | No | `'md'` | ボタンのサイズ |
| disabled | `boolean` | No | `false` | 無効状態 |
| type | `'button' \| 'submit' \| 'reset'` | No | `'button'` | HTMLボタンタイプ |
| onClick | `() => void` | No | - | クリックハンドラ |
| children | `ReactNode` | Yes | - | ボタンの内容 |
| className | `string` | No | - | 追加のCSSクラス |

### InputProps

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| id | `string` | Yes | - | 入力要素のID |
| name | `string` | Yes | - | 入力要素の名前 |
| type | `'text' \| 'email' \| 'password' \| 'number' \| 'tel'` | No | `'text'` | 入力タイプ |
| value | `string` | No | - | 入力値 |
| onChange | `(e: ChangeEvent<HTMLInputElement>) => void` | No | - | 変更ハンドラ |
| placeholder | `string` | No | - | プレースホルダー |
| disabled | `boolean` | No | `false` | 無効状態 |
| required | `boolean` | No | `false` | 必須フィールド |
| error | `string` | No | - | エラーメッセージ |
| ariaLabel | `string` | No | - | アクセシビリティラベル |
| className | `string` | No | - | 追加のCSSクラス |

### CardProps

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| children | `ReactNode` | Yes | - | カードの内容 |
| hover | `boolean` | No | `true` | ホバーエフェクトの有無 |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` | 内部パディング |
| className | `string` | No | - | 追加のCSSクラス |

### MessageProps

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| type | `'error' \| 'success' \| 'warning' \| 'info'` | Yes | - | メッセージタイプ |
| children | `ReactNode` | Yes | - | メッセージ内容 |
| onClose | `() => void` | No | - | 閉じるハンドラ |
| className | `string` | No | - | 追加のCSSクラス |

### HeadingProps

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| level | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | Yes | - | 見出しレベル（h1-h6） |
| children | `ReactNode` | Yes | - | 見出しテキスト |
| className | `string` | No | - | 追加のCSSクラス |

## スタイルバリアント定義

### Button Variants

```typescript
const buttonVariants = {
  primary: {
    base: 'bg-blue-600 text-white hover:bg-blue-700',
    dark: 'dark:bg-blue-500 dark:hover:bg-blue-600',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
    dark: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600',
  },
  danger: {
    base: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    dark: 'dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30',
  },
  ghost: {
    base: 'text-blue-600 hover:bg-blue-50',
    dark: 'dark:text-blue-400 dark:hover:bg-blue-900/20',
  },
};

const buttonSizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
```

### Message Types

```typescript
const messageTypes = {
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    icon: 'ExclamationCircle',
  },
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    icon: 'CheckCircle',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: 'ExclamationTriangle',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'InformationCircle',
  },
};
```

### Heading Sizes

```typescript
const headingSizes = {
  1: 'text-3xl sm:text-4xl font-bold',
  2: 'text-xl sm:text-2xl font-bold',
  3: 'text-lg font-semibold',
  4: 'text-base font-semibold',
  5: 'text-sm font-semibold',
  6: 'text-xs font-semibold',
};
```

## 共通スタイル定数

```typescript
// フォーカスリング
const focusRing = 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900';

// トランジション
const transition = 'transition-colors duration-200';

// 無効状態
const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed';

// 入力フィールド共通
const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500';
```

## 関連性

- **UIComponent ↔ Page**: 各ページは複数のUIComponentをインポートして使用
- **UIComponent ↔ Theme**: 全てのUIComponentはライト/ダークモードのスタイルを持つ
- **Button ↔ Form**: フォーム内のsubmitボタンはButtonコンポーネントを使用
- **Input ↔ Form**: フォーム内の入力はInputコンポーネントを使用
- **Message ↔ Page**: エラー/成功通知はMessageコンポーネントを使用
- **Heading ↔ Page**: ページタイトル/セクションタイトルはHeadingコンポーネントを使用
- **Card ↔ Page**: コンテンツの視覚的グループ化にCardコンポーネントを使用
