# クイックスタート: 統合ストレージ層

**フィーチャー**: 010-unified-storage
**日付**: 2025-11-19

## 概要

このフィーチャーは、環境に応じてlocalStorageとSupabaseを自動的に切り替える統合ストレージ層を実装します。

## 使用方法

### ローカル開発（localStorageモード）

```bash
npm run dev
```

デフォルトでlocalStorageを使用します。Supabaseの設定は不要です。

### ローカル開発（Supabaseモード）

```bash
npm run dev:supabase
```

Supabase接続をテストする場合に使用します。事前に`.env.local`にSupabase認証情報が必要です。

### 本番環境

本番環境では自動的にSupabaseが使用されます。Vercelの環境変数に以下を設定してください:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 環境変数

### .env.local（ローカル開発用）

```bash
# Supabase接続情報（dev:supabaseモードで必要）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ストレージモード（通常は設定不要、npm run dev:supabaseで自動設定）
# NEXT_PUBLIC_USE_SUPABASE=true
```

### Vercel環境変数（本番用）

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 開発者向け情報

### サービスファイルの変更

サービスファイルは`lib/unified-storage.ts`からインポートします:

```typescript
// Before
import { loadGroups, saveGroups } from './storage';

// After
import { loadGroups, saveGroups } from './unified-storage';
```

### ストレージモードの確認

```typescript
import { getStorageMode } from '@/lib/unified-storage';

const mode = getStorageMode();
console.log(`Current storage mode: ${mode}`);
// 出力: "localStorage" または "supabase"
```

### テストでの使用

テストでは自動的にlocalStorageモードが使用されます。Supabase操作をテストする場合はモックを使用してください:

```typescript
jest.mock('@/lib/unified-storage', () => ({
  loadGroups: jest.fn().mockResolvedValue([]),
  saveGroups: jest.fn().mockResolvedValue(true),
  getStorageMode: jest.fn().mockReturnValue('localStorage'),
}));
```

## トラブルシューティング

### Supabaseモードでエラーが発生する

1. `.env.local`にSupabase認証情報が設定されているか確認
2. Supabaseダッシュボードでプロジェクトがアクティブか確認
3. RLSポリシーが正しく設定されているか確認

### localStorageのデータがクリアされた

ブラウザのlocalStorageは手動でクリアできます。開発中にデータをリセットしたい場合:

1. ブラウザの開発者ツールを開く
2. Application → Local Storage → localhost:3000
3. 該当するキーを削除

### 本番環境でデータが保存されない

1. Vercelの環境変数が正しく設定されているか確認
2. Supabaseのテーブルとカラムが存在するか確認
3. RLSポリシーが正しく設定されているか確認

## 関連ドキュメント

- [仕様書](./spec.md)
- [データモデル](./data-model.md)
- [リサーチ](./research.md)
