# RLS手動テスト手順書

**Feature**: 009-supabase-migration
**Phase**: Phase 4 Cycle 3-10
**対象**: Row Level Security (RLS) ポリシーの検証

## 背景

JestとSupabase JavaScriptクライアントの互換性問題により、RLS統合テストを自動化できないため、手動検証手順を提供します。

**確認済み事項**:
- ✅ Supabaseクライアントは通常のNode.js環境で正常動作
- ✅ データベース、RLSポリシー、Service Role Keyは正しく設定済み
- ❌ Jest環境でのみSupabaseクライアントがINSERT操作を実行できない

---

## 前提条件

1. Supabaseプロジェクトに接続済み
2. `.env.local` に以下の環境変数が設定されている：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. データベーススキーマ、RLSポリシー、RPC関数が適用済み

---

## ⚠️ 重要: RLSテスト実行時の注意事項

SQL Editorはデフォルトで **postgres** ロール（スーパーユーザー）で接続するため、**RLSがバイパスされます**。

**すべてのRLSテストは、以下のコマンドで `anon` ロールに切り替えてから実行してください**：

```sql
-- RLSテスト開始前に必ず実行
SET ROLE anon;
```

テスト終了後、元に戻す：

```sql
-- RLSテスト終了後に実行
RESET ROLE;
```

---

## Cycle 3: organizations テーブル RLS検証

### テスト準備

Supabase Dashboard → **SQL Editor** で以下を実行：

```sql
-- ⚠️ データ準備は管理者ロールで実行（RLSをバイパス）
-- このセクションでは SET ROLE anon を実行しないこと

-- テスト用団体を作成（Service Role権限で実行）
INSERT INTO organizations (id, name, description)
VALUES
  ('test_org_a', 'Test Organization A', 'RLS test data A'),
  ('test_org_b', 'Test Organization B', 'RLS test data B');

-- 確認
SELECT * FROM organizations WHERE id IN ('test_org_a', 'test_org_b');
```

### T076: 団体A/Bでorganizationsデータ分離のテスト

**⚠️ テスト実行前に必ず `SET ROLE anon;` を実行してください**

#### ケース1: 団体Aのコンテキストで団体Aのデータを取得できる

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 団体Aのコンテキストを設定
SELECT set_current_organization('test_org_a');

-- 団体Aのデータを取得
SELECT * FROM organizations WHERE id = 'test_org_a';

-- テスト後、ロールをリセット
RESET ROLE;
```

**期待結果**: 1行返される（id='test_org_a'のデータ）

---

#### ケース2: 団体Aのコンテキストで団体Bのデータを取得できない

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 団体Aのコンテキストを設定
SELECT set_current_organization('test_org_a');

-- 団体Bのデータを取得試行
SELECT * FROM organizations WHERE id = 'test_org_b';

-- テスト後、ロールをリセット
RESET ROLE;
```

**期待結果**: 0行返される（RLSによりアクセス拒否）

---

#### ケース3: 団体Bのコンテキストで団体Bのデータを取得できる

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 団体Bのコンテキストを設定
SELECT set_current_organization('test_org_b');

-- 団体Bのデータを取得
SELECT * FROM organizations WHERE id = 'test_org_b';

-- テスト後、ロールをリセット
RESET ROLE;
```

**期待結果**: 1行返される（id='test_org_b'のデータ）

---

#### ケース4: 団体Bのコンテキストで団体Aのデータを取得できない

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 団体Bのコンテキストを設定
SELECT set_current_organization('test_org_b');

-- 団体Aのデータを取得試行
SELECT * FROM organizations WHERE id = 'test_org_a';

-- テスト後、ロールをリセット
RESET ROLE;
```

**期待結果**: 0行返される（RLSによりアクセス拒否）

---

### テストクリーンアップ

```sql
-- テストデータを削除
DELETE FROM organizations WHERE id IN ('test_org_a', 'test_org_b');
```

---

## Cycle 4: event_dates テーブル RLS検証

### テスト準備

```sql
-- テスト用イベントを作成（uuid型のため固定UUIDを使用）
INSERT INTO event_dates (id, organization_id, date, title, location)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'test_org_a', '2025-12-01', 'Event A1', 'Location A1'),
  ('11111111-0000-0000-0000-000000000002', 'test_org_a', '2025-12-02', 'Event A2', 'Location A2'),
  ('11111111-0000-0000-0000-000000000003', 'test_org_b', '2025-12-01', 'Event B1', 'Location B1'),
  ('11111111-0000-0000-0000-000000000004', 'test_org_b', '2025-12-02', 'Event B2', 'Location B2');

-- 確認
SELECT * FROM event_dates WHERE organization_id IN ('test_org_a', 'test_org_b');
```

### T079: 団体A/Bでevent_datesデータ分離のテスト

#### ケース1: 団体Aのコンテキストで団体Aのイベントのみ取得

```sql
SELECT set_current_organization('test_org_a');
SELECT * FROM event_dates;
```

**期待結果**: 2行返される（organization_id='test_org_a'のイベントのみ）

---

#### ケース2: 団体Bのコンテキストで団体Bのイベントのみ取得

```sql
SELECT set_current_organization('test_org_b');
SELECT * FROM event_dates;
```

**期待結果**: 2行返される（organization_id='test_org_b'のイベントのみ）

---

### テストクリーンアップ

```sql
DELETE FROM event_dates WHERE organization_id IN ('test_org_a', 'test_org_b');
```

---

## Cycle 5: groups テーブル RLS検証

### テスト準備

```sql
-- テスト用グループを作成（uuid型のため固定UUIDを使用）
INSERT INTO groups (id, organization_id, name, "order", color)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'test_org_a', 'Group A1', 0, '#FF0000'),
  ('22222222-0000-0000-0000-000000000002', 'test_org_a', 'Group A2', 1, '#00FF00'),
  ('22222222-0000-0000-0000-000000000003', 'test_org_b', 'Group B1', 0, '#0000FF'),
  ('22222222-0000-0000-0000-000000000004', 'test_org_b', 'Group B2', 1, '#FFFF00');

SELECT * FROM groups WHERE organization_id IN ('test_org_a', 'test_org_b');
```

### T082: 団体A/Bでgroupsデータ分離のテスト

```sql
-- 団体Aのコンテキスト
SELECT set_current_organization('test_org_a');
SELECT * FROM groups;
-- 期待: 2行（Group A1, A2）

-- 団体Bのコンテキスト
SELECT set_current_organization('test_org_b');
SELECT * FROM groups;
-- 期待: 2行（Group B1, B2）
```

### テストクリーンアップ

```sql
DELETE FROM groups WHERE organization_id IN ('test_org_a', 'test_org_b');
```

---

## Cycle 6: members テーブル RLS検証

### テスト準備

```sql
-- まずグループを作成（uuid型のため固定UUIDを使用）
INSERT INTO groups (id, organization_id, name, "order")
VALUES
  ('33333333-0000-0000-0000-000000000001', 'test_org_a', 'Group A1', 0),
  ('33333333-0000-0000-0000-000000000002', 'test_org_b', 'Group B1', 0);

-- メンバーを作成（uuid型のため固定UUIDを使用）
INSERT INTO members (id, organization_id, group_id, name)
VALUES
  ('44444444-0000-0000-0000-000000000001', 'test_org_a', '33333333-0000-0000-0000-000000000001', 'Member A1'),
  ('44444444-0000-0000-0000-000000000002', 'test_org_a', '33333333-0000-0000-0000-000000000001', 'Member A2'),
  ('44444444-0000-0000-0000-000000000003', 'test_org_b', '33333333-0000-0000-0000-000000000002', 'Member B1'),
  ('44444444-0000-0000-0000-000000000004', 'test_org_b', '33333333-0000-0000-0000-000000000002', 'Member B2');

SELECT * FROM members WHERE organization_id IN ('test_org_a', 'test_org_b');
```

### T085: 団体A/Bでmembersデータ分離のテスト

```sql
-- 団体Aのコンテキスト
SELECT set_current_organization('test_org_a');
SELECT * FROM members;
-- 期待: 2行（Member A1, A2）

-- 団体Bのコンテキスト
SELECT set_current_organization('test_org_b');
SELECT * FROM members;
-- 期待: 2行（Member B1, B2）
```

### テストクリーンアップ

```sql
DELETE FROM members WHERE organization_id IN ('test_org_a', 'test_org_b');
DELETE FROM groups WHERE id IN ('33333333-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002');
```

---

## Cycle 7: attendances テーブル RLS検証

### テスト準備

```sql
-- 必要なデータを作成（uuid型のため固定UUIDを使用）
INSERT INTO groups (id, organization_id, name, "order")
VALUES
  ('55555555-0000-0000-0000-000000000001', 'test_org_a', 'Group A1', 0),
  ('55555555-0000-0000-0000-000000000002', 'test_org_b', 'Group B1', 0);

INSERT INTO members (id, organization_id, group_id, name)
VALUES
  ('66666666-0000-0000-0000-000000000001', 'test_org_a', '55555555-0000-0000-0000-000000000001', 'Member A1'),
  ('66666666-0000-0000-0000-000000000002', 'test_org_b', '55555555-0000-0000-0000-000000000002', 'Member B1');

INSERT INTO event_dates (id, organization_id, date, title)
VALUES
  ('77777777-0000-0000-0000-000000000001', 'test_org_a', '2025-12-01', 'Event A1'),
  ('77777777-0000-0000-0000-000000000002', 'test_org_b', '2025-12-01', 'Event B1');

-- 出欠記録を作成（uuid型のため固定UUIDを使用）
INSERT INTO attendances (id, organization_id, event_date_id, member_id, status)
VALUES
  ('88888888-0000-0000-0000-000000000001', 'test_org_a', '77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', '◯'),
  ('88888888-0000-0000-0000-000000000002', 'test_org_b', '77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000002', '△');

SELECT * FROM attendances WHERE organization_id IN ('test_org_a', 'test_org_b');
```

### T088: 団体A/Bでattendancesデータ分離のテスト

```sql
-- 団体Aのコンテキスト
SELECT set_current_organization('test_org_a');
SELECT * FROM attendances;
-- 期待: 1行（organization_id='test_org_a'）

-- 団体Bのコンテキスト
SELECT set_current_organization('test_org_b');
SELECT * FROM attendances;
-- 期待: 1行（organization_id='test_org_b'）
```

### テストクリーンアップ

```sql
DELETE FROM attendances WHERE organization_id IN ('test_org_a', 'test_org_b');
DELETE FROM event_dates WHERE id IN ('77777777-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000002');
DELETE FROM members WHERE id IN ('66666666-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002');
DELETE FROM groups WHERE id IN ('55555555-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000002');
```

---

## Cycle 8: アクセス拒否テスト

**目的**: 団体Aのコンテキストで、団体BのデータをIDで直接取得しようとしても、RLSによりアクセスが拒否されることを確認

### テスト準備

**⚠️ テストデータ作成は管理者ロール（デフォルト）で実行してください**

```sql
-- 1. 団体を作成
INSERT INTO organizations (id, name, description)
VALUES
  ('test_org_a', 'Test Organization A', 'RLS test data A'),
  ('test_org_b', 'Test Organization B', 'RLS test data B');

-- 2. イベントを作成
INSERT INTO event_dates (id, organization_id, date, title, location)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'test_org_a', '2025-12-01', 'Event A1', 'Location A1'),
  ('11111111-0000-0000-0000-000000000002', 'test_org_b', '2025-12-01', 'Event B1', 'Location B1');

-- 3. グループを作成
INSERT INTO groups (id, organization_id, name, "order")
VALUES
  ('22222222-0000-0000-0000-000000000001', 'test_org_a', 'Group A1', 0),
  ('22222222-0000-0000-0000-000000000002', 'test_org_b', 'Group B1', 0);

-- 4. メンバーを作成
INSERT INTO members (id, organization_id, group_id, name)
VALUES
  ('44444444-0000-0000-0000-000000000001', 'test_org_a', '22222222-0000-0000-0000-000000000001', 'Member A1'),
  ('44444444-0000-0000-0000-000000000002', 'test_org_b', '22222222-0000-0000-0000-000000000002', 'Member B1');

-- 5. 出欠記録を作成
INSERT INTO attendances (id, organization_id, event_date_id, member_id, status)
VALUES
  ('88888888-0000-0000-0000-000000000001', 'test_org_a', '11111111-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '◯'),
  ('88888888-0000-0000-0000-000000000002', 'test_org_b', '11111111-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002', '△');

-- 確認
SELECT 'Organizations' AS table_name, COUNT(*) AS count FROM organizations WHERE id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Event Dates', COUNT(*) FROM event_dates WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Groups', COUNT(*) FROM groups WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Members', COUNT(*) FROM members WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Attendances', COUNT(*) FROM attendances WHERE organization_id IN ('test_org_a', 'test_org_b');
-- 期待: 各テーブル2行ずつ
```

---

### T091-T093: 直接ID指定でのアクセス拒否テスト

**⚠️ テスト実行前に必ず `SET ROLE anon;` を実行してください**

#### テストケース: 団体Aコンテキストで団体Bの各テーブルデータに直接アクセス

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 団体Aのコンテキストを設定
SELECT set_current_organization('test_org_a');

-- 団体Bのorganizationsを直接ID指定で取得試行
SELECT * FROM organizations WHERE id = 'test_org_b';
-- 期待: 0行（RLSによりアクセス拒否）

-- 団体Bのevent_datesを直接ID指定で取得試行
SELECT * FROM event_dates WHERE id = '11111111-0000-0000-0000-000000000002';
-- 期待: 0行（RLSによりアクセス拒否）

-- 団体Bのgroupsを直接ID指定で取得試行
SELECT * FROM groups WHERE id = '22222222-0000-0000-0000-000000000002';
-- 期待: 0行（RLSによりアクセス拒否）

-- 団体Bのmembersを直接ID指定で取得試行
SELECT * FROM members WHERE id = '44444444-0000-0000-0000-000000000002';
-- 期待: 0行（RLSによりアクセス拒否）

-- 団体Bのattendancesを直接ID指定で取得試行
SELECT * FROM attendances WHERE id = '88888888-0000-0000-0000-000000000002';
-- 期待: 0行（RLSによりアクセス拒否）

-- テスト後、ロールをリセット
RESET ROLE;
```

**検証ポイント**: 全てのクエリで0行が返されること。RLSポリシーにより、他の団体のデータにはIDを直接指定してもアクセスできない。

---

### テストクリーンアップ

```sql
-- テストデータを削除（カスケード削除により関連データも自動削除）
DELETE FROM organizations WHERE id IN ('test_org_a', 'test_org_b');

-- 削除確認
SELECT 'Organizations' AS table_name, COUNT(*) AS count FROM organizations WHERE id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Event Dates', COUNT(*) FROM event_dates WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Groups', COUNT(*) FROM groups WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Members', COUNT(*) FROM members WHERE organization_id IN ('test_org_a', 'test_org_b')
UNION ALL
SELECT 'Attendances', COUNT(*) FROM attendances WHERE organization_id IN ('test_org_a', 'test_org_b');
-- 期待: 全て0行（カスケード削除により全データ削除）
```

---

## Cycle 9: 存在しない団体IDテスト

**目的**: 存在しない団体IDでコンテキストを設定した場合、空の結果セットが返されることを確認

### T094-T096: 存在しない団体IDでのクエリテスト

**⚠️ テスト実行前に必ず `SET ROLE anon;` を実行してください**

#### テストケース: 存在しない団体IDでの各テーブルクエリ

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 存在しない団体IDでコンテキストを設定
SELECT set_current_organization('nonexistent');

-- 各テーブルをクエリ
SELECT * FROM organizations;
-- 期待: 0行

SELECT * FROM event_dates;
-- 期待: 0行

SELECT * FROM groups;
-- 期待: 0行

SELECT * FROM members;
-- 期待: 0行

SELECT * FROM attendances;
-- 期待: 0行

-- テスト後、ロールをリセット
RESET ROLE;
```

**検証ポイント**: 全てのクエリで0行が返されること。存在しない団体IDでは、どのテーブルからもデータが取得できない。

---

## Cycle 10: 削除済み団体のRLSテスト

**目的**: 団体を削除した後、その団体のコンテキストでクエリすると空の結果が返されることを確認

### T097-T099: 団体削除後のRLSテスト

**⚠️ テスト実行前に必ず `SET ROLE anon;` を実行してください**

#### テスト準備: 削除用の団体を作成

```sql
-- 削除テスト用の団体を作成（管理者ロールで実行）
-- 注意: organizations.id は10文字必須
INSERT INTO organizations (id, name, description)
VALUES ('test_del01', 'To Be Deleted', 'Test data for deletion');

-- 関連データを作成
INSERT INTO groups (id, organization_id, name, "order")
VALUES ('99999999-0000-0000-0000-000000000001', 'test_del01', 'Group Del', 0);

INSERT INTO members (id, organization_id, group_id, name)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'test_del01', '99999999-0000-0000-0000-000000000001', 'Member Del');

-- 確認
SELECT * FROM organizations WHERE id = 'test_del01';
SELECT * FROM groups WHERE organization_id = 'test_del01';
SELECT * FROM members WHERE organization_id = 'test_del01';
```

#### テストケース: 削除前のアクセス確認

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 削除前: データが取得できることを確認
SELECT set_current_organization('test_del01');
SELECT * FROM organizations;
-- 期待: 1行

SELECT * FROM groups;
-- 期待: 1行

SELECT * FROM members;
-- 期待: 1行

-- テスト後、ロールをリセット
RESET ROLE;
```

#### テストケース: 削除後のアクセス確認

```sql
-- 団体を削除（管理者ロールで実行、カスケード削除により関連データも削除）
DELETE FROM organizations WHERE id = 'test_del01';

-- 削除確認
SELECT * FROM organizations WHERE id = 'test_del01';
-- 期待: 0行（削除済み）

SELECT * FROM groups WHERE organization_id = 'test_del01';
-- 期待: 0行（カスケード削除）

SELECT * FROM members WHERE organization_id = 'test_del01';
-- 期待: 0行（カスケード削除）
```

```sql
-- RLSを有効にするためanonロールに切り替え
SET ROLE anon;

-- 削除後: 削除済み団体のコンテキストでクエリ
SELECT set_current_organization('test_del01');
SELECT * FROM organizations;
-- 期待: 0行（団体が存在しないため）

SELECT * FROM groups;
-- 期待: 0行

SELECT * FROM members;
-- 期待: 0行

-- テスト後、ロールをリセット
RESET ROLE;
```

**検証ポイント**:
- 削除前はデータが取得できる
- 削除後は全てのクエリで0行が返される
- カスケード削除により関連データも削除される
- 削除済み団体のコンテキストではデータが取得できない

---

## 検証完了チェックリスト

- [X] Cycle 3: organizations テーブル RLS (T076-T078)
- [X] Cycle 4: event_dates テーブル RLS (T079-T081)
- [X] Cycle 5: groups テーブル RLS (T082-T084)
- [X] Cycle 6: members テーブル RLS (T085-T087)
- [X] Cycle 7: attendances テーブル RLS (T088-T090)
- [X] Cycle 8: アクセス拒否テスト (T091-T093)
- [X] Cycle 9: 存在しない団体IDテスト (T094-T096)
- [X] Cycle 10: 削除済み団体のRLSテスト (T097-T099)
- [X] すべてのテストクリーンアップ完了

---

## 既知の制限事項

**Jest統合テストの問題**: JestとSupabase JavaScriptクライアント（`@supabase/supabase-js` v2.81.1）の互換性問題により、Jest環境でINSERT操作が正常に動作しません。通常のNode.js環境では正常に動作することを確認済みです。

**代替アプローチ**: 上記の手動SQLテストにより、RLSポリシーが正しく機能していることを確認できます。

---

**作成日**: 2025-11-16
**最終更新**: 2025-11-16
