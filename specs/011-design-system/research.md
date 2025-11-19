# Research: デザインシステム改善

**Date**: 2025-11-19
**Feature**: 011-design-system

## 調査項目

### 1. Tailwind CSSでの共通コンポーネント実装パターン

**Decision**: `cva`（class-variance-authority）を使用せず、シンプルなオブジェクトマッピングで実装

**Rationale**:
- 追加依存関係なしでプロジェクトの軽量性を維持
- TypeScriptの型推論で十分なバリアント型安全性を確保
- チームの学習コストを最小化

**Alternatives considered**:
- `cva`（class-variance-authority）: 強力だが追加依存関係
- `clsx` + 手動管理: 柔軟だが冗長
- Tailwind `@apply`: 再利用性に限界

**Implementation**:
```typescript
const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  ghost: 'text-blue-600 hover:bg-blue-50',
} as const;
```

---

### 2. ダークモード実装アプローチ

**Decision**: Tailwindの`dark:`プレフィックスとCSS変数の組み合わせ

**Rationale**:
- システム設定（prefers-color-scheme）に自動追従
- 既存のglobals.cssにダークモード変数が一部定義済み
- 将来的な手動切り替え対応も容易

**Alternatives considered**:
- next-themes: 手動切り替えには便利だが、現時点では過剰
- CSS変数のみ: Tailwindとの統合が複雑
- JavaScript状態管理: SSRとの相性が悪い

**Implementation**:
```typescript
// ボタンの例
className={`
  ${buttonVariants[variant]}
  dark:bg-blue-500 dark:hover:bg-blue-600
`}
```

---

### 3. アクセシビリティ実装パターン

**Decision**: セマンティックHTML + ARIA属性 + フォーカス管理

**Rationale**:
- WCAG 2.1 AA準拠を目標
- 既存のセマンティックHTML（button、input等）を活用
- aria-labelとrole属性で補完

**Alternatives considered**:
- Radix UI: 高品質だが大きな依存関係
- Headless UI: 同上
- 手動実装: 学習機会として最適、プロジェクト規模に適合

**Implementation**:
```typescript
// Messageコンポーネント
<div role="alert" aria-live="polite" className={...}>
  {icon}
  <p>{message}</p>
</div>

// Inputコンポーネント
<input
  aria-label={ariaLabel}
  aria-invalid={error ? 'true' : undefined}
  aria-describedby={error ? `${id}-error` : undefined}
  ...
/>
```

---

### 4. コンポーネントテスト戦略

**Decision**: React Testing Library + Jestでユニットテスト

**Rationale**:
- 既存のテストインフラを活用
- ユーザー視点のテスト（アクセシビリティクエリ使用）
- スナップショットテストで視覚的退行を検出

**Alternatives considered**:
- Storybook + Chromatic: 視覚テストには強いが追加コスト
- Cypress Component Testing: E2Eツールでの単体テストは過剰
- Vitest: 高速だが既存Jestからの移行コスト

**Implementation**:
```typescript
// button.test.tsx
describe('Button', () => {
  it('renders primary variant correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('bg-blue-600');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

### 5. 見出しサイズ統一戦略

**Decision**: Headingコンポーネントで6レベル（h1-h6）をサポート

**Rationale**:
- セマンティックな見出し階層を維持
- レスポンシブサイズを自動適用
- 既存の不統一を解消

**Alternatives considered**:
- Typography scale全体の定義: 見出し以外も含むと複雑
- CSS変数のみ: コンポーネント化の利点が得られない

**Implementation**:
```typescript
const headingSizes = {
  h1: 'text-3xl sm:text-4xl font-bold',
  h2: 'text-xl sm:text-2xl font-bold',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  h5: 'text-sm font-semibold',
  h6: 'text-xs font-semibold',
} as const;
```

---

### 6. Messageコンポーネントのアイコン実装

**Decision**: インラインSVGアイコンを各タイプごとに定義

**Rationale**:
- 追加依存関係なし
- バンドルサイズ最小化
- タイプごとに最適なアイコンを選択可能

**Alternatives considered**:
- Heroicons: 高品質だが追加依存関係
- Lucide React: 同上
- アイコンフォント: SSRとの相性が悪い

**Implementation**:
```typescript
const messageIcons = {
  error: (
    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293..." />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293..." />
    </svg>
  ),
  // ...
};
```

## 未解決事項

なし - 全ての技術的決定が完了
