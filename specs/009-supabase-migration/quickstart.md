# Quickstart: Supabase Migration Setup

**Feature**: 009-supabase-migration
**Created**: 2025-11-15
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

## 概要

このガイドでは、localStorage から Supabase PostgreSQL への移行に必要なセットアップ手順を説明します。Supabaseプロジェクトの作成、データベーススキーマの適用、ローカル開発環境の設定を行います。

---

## 前提条件

- Node.js 20.x以上がインストールされていること
- npm または yarn がインストールされていること
- Supabaseアカウント（無料）を作成済みであること

---

## Step 1: Supabaseプロジェクトの作成

### 1.1 Supabaseにサインアップ

1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. GitHub、Google、またはメールアドレスでサインアップ

### 1.2 新しいプロジェクトを作成

1. Supabase Dashboardで「New project」をクリック
2. プロジェクト設定を入力：
   - **Name**: `attendance-hub`（または任意の名前）
   - **Database Password**: 強力なパスワードを生成（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨（日本からのアクセスが速い）
   - **Pricing Plan**: `Free` を選択
3. 「Create new project」をクリック
4. プロジェクトの初期化が完了するまで待機（約2分）

### 1.3 API認証情報の取得

1. プロジェクトが作成されたら、「Settings」→「API」に移動
2. 以下の情報をコピーして保存：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

---

## Step 2: 環境変数の設定

### 2.1 `.env.local` ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述：

```bash
# Supabase接続情報
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: `xxxxxxxxxxxxx` と `eyJh...` の部分を、Step 1.3で取得した実際の値に置き換えてください。

### 2.2 `.env.example` ファイルの作成

チーム共有用のテンプレートファイルを作成：

```bash
# Supabase接続情報（実際の値は .env.local に記載）
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 `.gitignore` の確認

`.env.local` がgitignoreに含まれていることを確認：

```bash
# .gitignore
.env*.local
```

---

## Step 3: データベーススキーマの適用

### 3.1 SQL Editorを使用（推奨）

1. Supabase Dashboardで「SQL Editor」に移動
2. 以下の順序でSQLファイルの内容を実行：

#### 3.1.1 データベーススキーマの作成

`contracts/database-schema.sql` の内容をコピーして、SQL Editorに貼り付け、「RUN」をクリック：

```sql
-- ENUM型、5テーブル（organizations, event_dates, groups, members, attendances）を作成
-- 詳細は contracts/database-schema.sql を参照
```

#### 3.1.2 RLSポリシーの設定

`contracts/rls-policies.sql` の内容をコピーして実行：

```sql
-- 全テーブルにRLSを有効化し、ポリシーを設定
-- 詳細は contracts/rls-policies.sql を参照
```

#### 3.1.3 インデックスの作成

`contracts/indexes.sql` の内容をコピーして実行：

```sql
-- パフォーマンス最適化用インデックス（約20個）を作成
-- 詳細は contracts/indexes.sql を参照
```

### 3.2 Supabase CLIを使用（オプション）

Supabase CLIをインストールして、マイグレーションファイルを適用する方法：

```bash
# Supabase CLIのインストール
npm install -D supabase

# Supabaseプロジェクトとリンク
npx supabase link --project-ref xxxxxxxxxxxxx

# マイグレーションファイルの作成（contracts/配下のSQLを使用）
# ... 詳細はSupabase公式ドキュメント参照
```

---

## Step 4: 依存関係のインストール

### 4.1 Supabase クライアントライブラリのインストール

```bash
npm install @supabase/supabase-js
```

### 4.2 package.json の確認

インストール後、`package.json` に以下が追加されていることを確認：

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

---

## Step 5: 動作確認

### 5.1 Supabase Clientの初期化テスト

`lib/supabase/client.ts` が正しく動作するか確認：

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5.2 テストクエリの実行

開発サーバーを起動し、ブラウザのコンソールで以下を実行：

```javascript
// ブラウザコンソールで実行
const { data, error } = await supabase.from('organizations').select('*');
console.log('Organizations:', data);
console.log('Error:', error);
```

- **成功**: `data: []` （空の配列）が返される
- **失敗**: `error` オブジェクトにエラー詳細が表示される

---

## Step 6: テストデータの投入（オプション）

開発用のサンプルデータを投入する：

### 6.1 団体の作成

```sql
-- SQL Editorで実行
INSERT INTO organizations (id, name, description)
VALUES ('testorg001', 'テスト吹奏楽団', 'ローカル開発用のテストデータ');
```

### 6.2 グループの作成

```sql
INSERT INTO groups (organization_id, name, "order", color)
VALUES
  ('testorg001', '木管', 0, '#FF6B6B'),
  ('testorg001', '金管', 1, '#4ECDC4'),
  ('testorg001', '打楽器', 2, '#FFD93D');
```

### 6.3 メンバーの作成

```sql
INSERT INTO members (organization_id, group_id, name)
SELECT
  'testorg001',
  g.id,
  '佐藤' || i || '郎'
FROM groups g
CROSS JOIN generate_series(1, 10) i
WHERE g.organization_id = 'testorg001';
```

### 6.4 イベントの作成

```sql
INSERT INTO event_dates (organization_id, date, title, location)
VALUES
  ('testorg001', '2025-11-20', '定期演奏会リハーサル', '市民会館'),
  ('testorg001', '2025-11-21', '定期演奏会本番', '市民会館大ホール');
```

---

## トラブルシューティング

### 問題1: 環境変数が読み込まれない

**症状**: `process.env.NEXT_PUBLIC_SUPABASE_URL` が `undefined`

**解決策**:
1. `.env.local` ファイルがプロジェクトルートにあることを確認
2. 開発サーバーを再起動（`npm run dev`）
3. 環境変数名が `NEXT_PUBLIC_` で始まっていることを確認

---

### 問題2: RLSポリシーでアクセス拒否

**症状**: クエリ実行時に空の結果セットが返される

**解決策**:
1. クライアントサイドで団体コンテキストを設定：
   ```typescript
   await supabase.rpc('set_config', {
     config_key: 'app.current_organization_id',
     config_value: 'testorg001'
   });
   ```
2. または、Supabase DashboardでRLSを一時的に無効化して動作確認

---

### 問題3: マイグレーションエラー

**症状**: SQL実行時にエラーが発生

**解決策**:
1. SQLファイルを順番に実行（database-schema.sql → rls-policies.sql → indexes.sql）
2. Supabase Dashboardの「Logs」でエラー詳細を確認
3. 既存のテーブルを削除してから再実行：
   ```sql
   DROP TABLE IF EXISTS attendances CASCADE;
   DROP TABLE IF EXISTS members CASCADE;
   DROP TABLE IF EXISTS groups CASCADE;
   DROP TABLE IF EXISTS event_dates CASCADE;
   DROP TABLE IF EXISTS organizations CASCADE;
   DROP TYPE IF EXISTS attendance_status;
   ```

---

## 次のステップ

1. ✅ Supabaseプロジェクト作成完了
2. ✅ データベーススキーマ適用完了
3. ✅ 環境変数設定完了
4. ✅ 動作確認完了
5. 次: `/speckit.tasks` を実行してタスクリストを生成
6. 次: `/speckit.implement` を実行して実装を開始

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase統合ガイド](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
