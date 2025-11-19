# リサーチ: 統合ストレージ層

**フィーチャー**: 010-unified-storage
**日付**: 2025-11-19

## リサーチ項目

### 1. 環境変数による切り替えパターン

**決定**: `NEXT_PUBLIC_USE_SUPABASE`環境変数を使用し、`true`の場合はSupabase、それ以外はlocalStorageを使用

**根拠**:
- Next.jsの`NEXT_PUBLIC_`プレフィックスはクライアントサイドで利用可能
- シンプルなboolean判定で実装が容易
- Vercelの環境変数設定と親和性が高い

**代替案**:
- `NODE_ENV`による切り替え → 開発環境でもSupabaseテストが必要なため却下
- 複数の環境変数 → 複雑性が増すため却下

### 2. 統合ストレージ層の設計パターン

**決定**: ファサードパターンを採用し、`lib/unified-storage.ts`で両方のストレージバックエンドを抽象化

**根拠**:
- サービス層のコード変更を最小限に抑えられる
- 既存の`storage.ts`と`supabase-storage.ts`の関数シグネチャを統一
- テスト時のモック差し替えが容易

**代替案**:
- 依存性注入（DI）コンテナ → 小規模プロジェクトには過剰
- 各サービスで直接切り替え → 重複コードが多くなる

### 3. 非同期処理の統一

**決定**: すべてのストレージ操作を非同期（async/await）で統一

**根拠**:
- Supabase操作は本質的に非同期
- localStorageをPromiseでラップすることで統一インターフェースを実現
- 将来的な拡張性（他のストレージバックエンド追加）を確保

**代替案**:
- 同期/非同期を分ける → インターフェースの複雑化、サービス層の条件分岐増加

### 4. 本番環境でのSupabase強制使用

**決定**: `NODE_ENV === 'production'`の場合は`NEXT_PUBLIC_USE_SUPABASE`の値に関わらずSupabaseを使用

**根拠**:
- 本番環境でのデータ永続性を保証
- 設定ミスによるデータ損失を防止
- セキュリティ（localStorageは誰でも編集可能）

**代替案**:
- 環境変数のみで制御 → 設定漏れのリスク

### 5. テスト戦略

**決定**: テスト環境ではlocalStorageモードを使用し、Supabaseはモックでテスト

**根拠**:
- CI環境でのSupabase接続が不要
- テスト実行速度の維持
- 既存のテストとの互換性

**代替案**:
- テスト用Supabaseプロジェクト → コストと複雑性

## 技術調査結果

### Next.jsでの環境変数の挙動

- `NEXT_PUBLIC_`プレフィックス付きはビルド時に埋め込まれる
- サーバーサイドとクライアントサイドの両方で利用可能
- Vercelでは環境ごとに設定可能（Production、Preview、Development）

### npm scriptでの環境変数設定

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:supabase": "NEXT_PUBLIC_USE_SUPABASE=true next dev"
  }
}
```

**注意**: Windowsでは`cross-env`パッケージが必要な場合がある

### 既存コードの互換性

- `lib/storage.ts`: 同期関数（loadXxx、saveXxx）
- `lib/supabase-storage.ts`: 非同期関数（loadXxx、saveXxx）
- 両者の関数名は同じだが、シグネチャが異なる
  - localStorage版: 配列を返す/保存
  - Supabase版: 単一オブジェクトを返す/保存

### 必要な修正

1. `lib/unified-storage.ts`を新規作成
2. 全サービスファイル（4ファイル）のimport先を変更
3. 関数シグネチャの統一（非同期化）
4. テストのモック設定更新
