# タスク完了時チェックリスト

## 必須チェック項目

### 1. コード品質
```bash
# 型チェック
npx tsc --noEmit

# リント
npm run lint

# テスト
npm test

# ビルド
npm run build
```

### 2. 入力欄スタイル確認
新規入力欄を作成した場合：
- [ ] `text-gray-900 placeholder:text-gray-400` が含まれているか
- [ ] 既存の入力欄スタイルと一貫性があるか

### 3. ドキュメント更新（機能追加・変更時）

#### README.md
- [ ] 技術スタック（バージョン情報）
- [ ] 機能一覧（新機能の追加）
- [ ] プロジェクト構造（新ディレクトリ・ファイルの追加）
- [ ] 使い方（新機能の使用手順）
- [ ] テスト数
- [ ] 最終更新日

#### SPECIFICATION.md
- [ ] 実装済み機能の記録
- [ ] 技術的な詳細

### 4. テストカバレッジ確認
最小閾値を満たしているか：
- branches: 30%
- functions: 50%
- lines: 45%
- statements: 45%

### 5. セキュリティ確認
- [ ] コマンドインジェクション
- [ ] XSS
- [ ] SQLインジェクション
- [ ] その他OWASP Top 10脆弱性

### 6. 後方互換性
- [ ] 不要なコード（unused vars、re-exports）は完全削除
- [ ] `// removed` コメントなどの互換性ハックは避ける

## コミット前の最終確認

```bash
# 全チェックを一括実行
npx tsc --noEmit && npm run lint && npm test && npm run build
```
