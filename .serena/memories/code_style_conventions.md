# コードスタイル・規約

## TypeScript

### 必須ルール
- **Strict mode**: 有効（tsconfig.jsonで設定済み）
- **`any`の禁止**: 正当な理由がない限り使用しない
- **型推論の活用**: Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- **明示的な戻り値の型**: 関数の戻り値は明示的に指定

### パス解決
- `@/*` エイリアスでルートからインポート可能

## React

- **関数コンポーネントのみ**: クラスコンポーネント禁止
- **Hooks使用**: useState、useEffect、useContext等
- **クライアントコンポーネント**: `'use client'`ディレクティブ使用
- **Props型定義**: インターフェースで明示的に定義

## Tailwind CSS

### 基本方針
- **ユーティリティファースト**: カスタムCSSは最小限
- **モバイルファースト**: 基本はモバイル、`sm:`、`md:`、`lg:`でレスポンシブ

### 入力欄の必須スタイル（重要）
すべての`<input>`、`<select>`、`<textarea>`に以下を含める：
```
text-gray-900 placeholder:text-gray-400
```

完全な例：
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
```

## テスト（TDD）

### t-wada式TDD原則
1. **Red**: まず失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: 動作を保ちながらコードを改善

### テストファイル配置
- `__tests__/` ディレクトリに配置
- ファイル名: `*.test.ts` または `*.test.tsx`

## ドキュメント言語

### 日本語必須
- 機能仕様書（`specs/*/spec.md`）
- 実装計画（`specs/*/plan.md`）
- タスク一覧（`specs/*/tasks.md`）
- チェックリスト
- README.md、SPECIFICATION.md、CLAUDE.md
- コミットメッセージ（日本語または英語）

### 英語必須
- 変数名・関数名・クラス名
- npm scripts
- 設定ファイル
