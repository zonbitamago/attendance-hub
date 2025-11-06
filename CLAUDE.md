# attendance-hub 開発ガイドライン

全機能の実装計画から自動生成。最終更新: 2025-11-05

## アクティブな技術スタック

- **TypeScript 5.3以上**（strict mode）
- **Next.js 15**（App Router）
- **React 19**
- **Tailwind CSS 3.4**
- **localStorage**（プロトタイプ用、将来的にSupabase PostgreSQLへ移行）

*フィーチャー: 001-attendance-prototype*

## プロジェクト構造

```text
attendance-hub/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（グループ一覧）
│   ├── groups/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # グループ詳細
│   │   │   ├── register/page.tsx # 出欠登録
│   │   │   └── history/page.tsx  # 履歴表示
│   │   └── new/page.tsx  # グループ作成
│   └── globals.css        # Tailwind CSS
├── components/            # 再利用可能なコンポーネント
│   ├── group-list.tsx
│   ├── group-form.tsx
│   ├── attendance-form.tsx
│   ├── attendance-list.tsx
│   ├── summary-card.tsx
│   └── history-list.tsx
├── lib/                   # ビジネスロジック・ユーティリティ
│   ├── storage.ts        # localStorage操作
│   ├── group-service.ts  # グループ関連ロジック
│   ├── attendance-service.ts  # 出欠登録関連ロジック
│   ├── validation.ts     # Zodスキーマ
│   └── date-utils.ts     # 日付フォーマット
├── types/                 # TypeScript型定義
│   └── index.ts
├── __tests__/            # テスト
│   ├── lib/
│   │   ├── storage.test.ts
│   │   ├── group-service.test.ts
│   │   └── attendance-service.test.ts
│   └── components/
│       └── summary-card.test.tsx
└── specs/                # 機能仕様・設計ドキュメント
    └── 001-attendance-prototype/
        ├── spec.md
        ├── plan.md
        ├── data-model.md
        └── quickstart.md
```

## 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テスト（ウォッチモード）
npm test -- --watch

# リンティング
npm run lint

# ビルド
npm run build

# 型チェック
npx tsc --noEmit
```

## コーディング規約

### TypeScript

- **Strict mode必須**: すべての型チェックオプションを有効化
- **`any`の禁止**: 正当な理由がない限り使用しない
- **型推論の活用**: Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- **明示的な戻り値の型**: 関数の戻り値の型は明示的に指定

### React

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: useState、useEffect、useContextなどを活用
- **クライアントコンポーネント**: `'use client'`ディレクティブを使用
- **Props型定義**: インターフェースで明示的に定義

### Tailwind CSS

- **ユーティリティファースト**: カスタムCSSは最小限に
- **モバイルファースト**: 基本スタイルはモバイル、レスポンシブは`sm:`、`md:`、`lg:`で
- **アクセシビリティ**: 適切なコントラスト比、フォーカス表示

### テスト（TDD）

- **Red-Green-Refactor**: t-wadaのTDD原則に従う
  1. Red: まず失敗するテストを書く
  2. Green: テストを通す最小限の実装
  3. Refactor: 動作を保ちながらコードを改善
- **テストファースト**: 実装前にテストを書く
- **独立性**: 各テストは他のテストに依存しない

## 最近の変更

- **2025-11-05**: 001-attendance-prototype フィーチャーを追加
  - TypeScript 5.3以上（strict mode）
  - Next.js 15 + React 19
  - Tailwind CSS 3.4
  - localStorageによるデータ永続化

## 参考ドキュメント

- [プロジェクト憲法](.specify/memory/constitution.md) - 開発原則とガバナンス
- [仕様書](specs/001-attendance-prototype/spec.md) - 機能要件
- [実装計画](specs/001-attendance-prototype/plan.md) - 技術的な実装詳細
- [データモデル](specs/001-attendance-prototype/data-model.md) - エンティティ設計
- [クイックスタート](specs/001-attendance-prototype/quickstart.md) - 開発環境セットアップ

## 開発フロー

1. **仕様確認**: `specs/001-attendance-prototype/spec.md`で要件を理解
2. **テスト作成**: `__tests__/`にテストを先に書く（Red）
3. **実装**: テストを通す最小限のコードを書く（Green）
4. **リファクタリング**: コードを整理・改善（Refactor）
5. **動作確認**: ブラウザで実際の動作を確認
6. **コミット**: 日本語または英語で明確なメッセージを付けてコミット

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies
- TypeScript 5.3以上（strict mode） + Next.js 15 (App Router)、React 19、Tailwind CSS 3.4 (002-input-text-visibility)
- N/A（UIスタイリングのみ） (002-input-text-visibility)

## Recent Changes
- 002-input-text-visibility: Added TypeScript 5.3以上（strict mode） + Next.js 15 (App Router)、React 19、Tailwind CSS 3.4
