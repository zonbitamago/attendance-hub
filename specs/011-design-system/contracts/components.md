# Component Contracts: デザインシステム改善

**Date**: 2025-11-19
**Feature**: 011-design-system

## 概要

本ドキュメントでは、共通UIコンポーネントのパブリックAPIを定義する。

## Button Component

### インポート

```typescript
import { Button } from '@/components/ui/button';
```

### 基本使用法

```tsx
<Button>クリック</Button>
<Button variant="primary">プライマリ</Button>
<Button variant="secondary">セカンダリ</Button>
<Button variant="danger">削除</Button>
<Button variant="ghost">ゴースト</Button>
```

### サイズ

```tsx
<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>
```

### フォーム送信

```tsx
<Button type="submit">送信</Button>
```

### 無効状態

```tsx
<Button disabled>無効</Button>
```

### TypeScript Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

---

## Input Component

### インポート

```typescript
import { Input } from '@/components/ui/input';
```

### 基本使用法

```tsx
<Input
  id="name"
  name="name"
  placeholder="名前を入力"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### エラー表示

```tsx
<Input
  id="email"
  name="email"
  type="email"
  error="有効なメールアドレスを入力してください"
/>
```

### アクセシビリティラベル

```tsx
<Input
  id="search"
  name="search"
  ariaLabel="検索キーワード"
  placeholder="検索..."
/>
```

### TypeScript Interface

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
  ariaLabel?: string;
}
```

---

## Card Component

### インポート

```typescript
import { Card } from '@/components/ui/card';
```

### 基本使用法

```tsx
<Card>
  <h3>カードタイトル</h3>
  <p>カードの内容</p>
</Card>
```

### ホバーエフェクトなし

```tsx
<Card hover={false}>
  静的なカード
</Card>
```

### パディング調整

```tsx
<Card padding="none">パディングなし</Card>
<Card padding="sm">小さいパディング</Card>
<Card padding="md">通常パディング</Card>
<Card padding="lg">大きいパディング</Card>
```

### TypeScript Interface

```typescript
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}
```

---

## Message Component

### インポート

```typescript
import { Message } from '@/components/ui/message';
```

### 基本使用法

```tsx
<Message type="error">エラーが発生しました</Message>
<Message type="success">保存しました</Message>
<Message type="warning">注意が必要です</Message>
<Message type="info">お知らせ</Message>
```

### 閉じるボタン付き

```tsx
<Message type="success" onClose={() => setShowMessage(false)}>
  保存しました
</Message>
```

### TypeScript Interface

```typescript
interface MessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}
```

---

## Heading Component

### インポート

```typescript
import { Heading } from '@/components/ui/heading';
```

### 基本使用法

```tsx
<Heading level={1}>ページタイトル</Heading>
<Heading level={2}>セクションタイトル</Heading>
<Heading level={3}>サブセクションタイトル</Heading>
```

### TypeScript Interface

```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}
```

---

## 使用ガイドライン

### Do's

- ✅ 一貫性のためにvariantとsizeを使用する
- ✅ アクセシビリティのためにariaLabelを提供する
- ✅ フォームではtype="submit"を使用する
- ✅ エラー状態を適切に表示する
- ✅ セマンティックな見出しレベルを使用する

### Don'ts

- ❌ インラインスタイルでvariantを上書きしない
- ❌ div要素をbutton代わりに使用しない
- ❌ エラーメッセージなしでerror状態を使用しない
- ❌ 見出しレベルを視覚的なサイズのためだけにスキップしない

### 既存コードからの移行

```tsx
// Before
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  保存
</button>

// After
<Button variant="primary">保存</Button>
```

```tsx
// Before
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
  ...
/>

// After
<Input id="name" name="name" ... />
```

```tsx
// Before
<h1 className="text-2xl sm:text-3xl font-bold">タイトル</h1>

// After
<Heading level={1}>タイトル</Heading>
```
