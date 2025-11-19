# 開発コマンド一覧

## 基本コマンド

### 開発サーバー起動
```bash
npm run dev
```

### テスト実行
```bash
npm test
```

### テスト（ウォッチモード）
```bash
npm test -- --watch
# または
npm run test:watch
```

### リンティング
```bash
npm run lint
```

### ビルド
```bash
npm run build
```

### 本番サーバー起動
```bash
npm run start
```

### 型チェック
```bash
npx tsc --noEmit
```

## CI/CDチェック項目

プルリクエスト時に自動実行されるチェック：
1. `npx tsc --noEmit` - 型チェック
2. `npm run lint` - リント
3. `npm test` - テスト（カバレッジ測定付き）
4. `npm run build` - ビルド

## カバレッジ要件
- branches: 30%
- functions: 50%
- lines: 45%
- statements: 45%

## システムユーティリティ（macOS/Darwin）

```bash
# ファイル検索
find . -name "*.tsx" -type f

# テキスト検索
grep -r "pattern" --include="*.ts"

# ディレクトリ一覧
ls -la

# Git操作
git status
git diff
git log --oneline -10
```
