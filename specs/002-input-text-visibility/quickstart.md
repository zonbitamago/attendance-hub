# Quickstart: 入力欄テキスト視認性の改善

**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Research**: [research.md](./research.md)

## Overview

この機能は、全9箇所の入力欄（input、select）の文字色を明示的に指定し、ライトモード・ダークモード両方で視認性を確保します。

## Prerequisites

- Node.js 20.x以上がインストールされていること
- プロジェクトの依存関係がインストール済み（`npm install`実行済み）
- 開発サーバーが起動可能な状態

## Quick Start

### 1. 開発環境の準備

```bash
# リポジトリのルートディレクトリで実行
cd attendance-hub

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### 2. 修正対象ファイルの確認

以下の3ファイルを修正します：

1. **グループ管理画面**: `app/admin/groups/page.tsx`
   - 133行目: グループ名input
   - 148行目: 表示順序input
   - 165行目: カラーコードinput

2. **イベント管理画面**: `app/admin/events/page.tsx`
   - 134行目: 日付input
   - 148行目: タイトルinput
   - 163行目: 場所input

3. **出欠登録画面**: `app/events/[id]/register/page.tsx`
   - 160行目: グループselect
   - 188行目: メンバーselect
   - 212行目: 新メンバー名input

### 3. 修正パターン

各入力欄のclassName属性に以下の2つのクラスを追加：

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

**追加するクラス**:
- `text-gray-900`: 入力テキストを濃いグレー（#111827）に固定
- `placeholder:text-gray-400`: プレースホルダーを中程度のグレー（#9ca3af）に固定

## Manual Testing

### Test 1: ライトモードでの視認性

1. ブラウザをライトモードに設定
   - **macOS**: システム環境設定 > 一般 > 外観 > ライト
   - **Windows**: 設定 > 個人用設定 > 色 > モードを選ぶ > ライト
   - **Chrome DevTools**: F12 > ⋮（縦三点）> More tools > Rendering > Emulate CSS media feature prefers-color-scheme > light

2. 各画面を開いて入力欄をテスト:
   ```
   http://localhost:3000/admin/groups   # グループ管理
   http://localhost:3000/admin/events   # イベント管理
   http://localhost:3000/events/[id]/register  # 出欠登録（要: 実際のイベントID）
   ```

3. 各入力欄に以下を確認:
   - [ ] プレースホルダーが薄いグレーで表示される
   - [ ] テキストを入力すると濃いグレーではっきり表示される
   - [ ] 入力テキストとプレースホルダーが明確に区別できる

### Test 2: ダークモードでの視認性

1. ブラウザをダークモードに設定
   - **macOS**: システム環境設定 > 一般 > 外観 > ダーク
   - **Windows**: 設定 > 個人用設定 > 色 > モードを選ぶ > ダーク
   - **Chrome DevTools**: F12 > ⋮ > More tools > Rendering > Emulate CSS media feature prefers-color-scheme > dark

2. 同じ画面で再度テスト

3. 各入力欄に以下を確認:
   - [ ] ライトモードと同様に、入力テキストが濃いグレーではっきり表示される
   - [ ] プレースホルダーも同じ薄いグレーで表示される
   - [ ] 背景が白のまま、文字が読みやすい

**期待される動作**: ライトモード・ダークモードで入力欄の見た目が同じ（常に濃い文字+白背景）

### Test 3: コントラスト比の検証

オンラインツールで色のコントラスト比を確認:

1. [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)を開く

2. 以下の組み合わせを入力:

   **入力テキスト**:
   - Foreground Color: `#111827`（text-gray-900）
   - Background Color: `#FFFFFF`（白）
   - 期待されるコントラスト比: **16.6:1** ✅

   **プレースホルダー**:
   - Foreground Color: `#9ca3af`（placeholder:text-gray-400）
   - Background Color: `#FFFFFF`（白）
   - 期待されるコントラスト比: **4.6:1** ✅

3. 両方がWCAG AA基準（4.5:1以上）を満たすことを確認

### Test 4: ブラウザ互換性

以下のブラウザで Test 1 と Test 2 を繰り返し:

- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版（macOS）
- [ ] Edge 最新版

**期待される動作**: すべてのブラウザで同じ色が表示される

### Test 5: モバイルデバイス

1. Chrome DevTools でモバイルビューをエミュレート:
   ```
   F12 > Toggle device toolbar（Ctrl+Shift+M）
   ```

2. 以下のデバイスでテスト:
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)
   - Pixel 5 (393x851)

3. 各デバイスで入力欄の視認性を確認:
   - [ ] 文字が小さすぎず、読みやすい
   - [ ] タップ時にフォーカス状態が明確
   - [ ] 入力中のテキストが明瞭

## Troubleshooting

### 問題: 変更が反映されない

**原因**: ブラウザキャッシュまたはNext.jsのビルドキャッシュ

**解決策**:
```bash
# Next.jsキャッシュをクリア
rm -rf .next

# 開発サーバーを再起動
npm run dev
```

ブラウザのハードリフレッシュ:
- **macOS**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + R

### 問題: Tailwindクラスが効かない

**原因**: Tailwindの設定またはビルドの問題

**解決策**:

1. Tailwind設定を確認:
   ```bash
   cat tailwind.config.ts
   ```
   `content`配列に`./app/**/*.{js,ts,jsx,tsx,mdx}`が含まれているか確認

2. Tailwindの再ビルド:
   ```bash
   npm run dev
   ```

### 問題: ダークモードで文字色が変わってしまう

**原因**: `dark:`修飾子が誤って追加されている、または他のスタイルが上書きしている

**解決策**:

1. classNameに`dark:text-*`が含まれていないか確認
2. 正しいクラス: `text-gray-900`（修飾子なし）
3. グローバルスタイル（globals.css）が上書きしていないか確認

### 問題: コントラスト比が基準を満たさない

**原因**: 色コードの入力ミス

**解決策**:

正しい色コードを確認:
- `text-gray-900` → `#111827`
- `placeholder:text-gray-400` → `#9ca3af`

Tailwindのドキュメントで確認:
https://tailwindcss.com/docs/customizing-colors

## Development Workflow

### 推奨フロー

1. **1ファイルずつ修正**:
   - `app/admin/groups/page.tsx` → テスト
   - `app/admin/events/page.tsx` → テスト
   - `app/events/[id]/register/page.tsx` → テスト

2. **各修正後に手動テスト**:
   - ライトモード確認
   - ダークモード確認
   - ブラウザリフレッシュ

3. **全修正完了後**:
   - 全ブラウザでテスト
   - モバイルビューでテスト
   - コントラスト比の最終確認

### Git Workflow

```bash
# 変更をステージング
git add app/admin/groups/page.tsx
git add app/admin/events/page.tsx
git add app/events/[id]/register/page.tsx

# コミット（手動テスト完了後）
git commit -m "feat: 入力欄の文字色を明示的に指定し視認性を改善

- text-gray-900とplaceholder:text-gray-400を全9箇所の入力欄に追加
- ライトモード・ダークモード両方で視認性を確保
- WCAG 2.1 AA基準（コントラスト比4.5:1以上）を満たす"

# リモートにプッシュ
git push origin 002-input-text-visibility
```

## Performance Considerations

### バンドルサイズへの影響

- **追加されるCSS**: 約10バイト（既存のTailwindクラスの再利用）
- **ページロード時間への影響**: 無視できるレベル（<1ms）
- **TTI（Time to Interactive）**: 変化なし

### 検証方法

```bash
# バンドルサイズを分析
npm run build
npm run analyze  # （@next/bundle-analyzerがインストールされている場合）
```

期待される結果: .next/static/css/のサイズがほぼ変わらない（数バイトの増加のみ）

## Related Documentation

- **Feature Specification**: [spec.md](./spec.md) - ユーザー要件と成功基準
- **Implementation Plan**: [plan.md](./plan.md) - 技術的な実装詳細と憲法チェック
- **Research**: [research.md](./research.md) - 色選定の根拠とコントラスト比計算
- **Project Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) - 開発原則

## Next Steps

手動テストが完了したら、`/speckit.tasks`コマンドでタスクリストを生成し、実装フェーズに進みます。

```bash
/speckit.tasks
```
