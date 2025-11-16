-- Row Level Security (RLS) Policies
-- Feature: 009-supabase-migration
-- Created: 2025-11-15
-- Description: 全テーブルにRLSポリシーを設定し、団体IDベースのアクセス制御を実装

-- =============================================================================
-- RLS Policy: organizations（団体）
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 認証なしの現段階では、クライアントサイドで設定した organization_id でフィルタ
-- 将来的には auth.uid() と紐付けて、ユーザーが所属する団体のみアクセス可能にする
CREATE POLICY "Users can access their organization"
ON organizations
FOR ALL
USING (id = current_setting('app.current_organization_id', true))
WITH CHECK (id = current_setting('app.current_organization_id', true));

COMMENT ON POLICY "Users can access their organization" ON organizations IS
'現在の団体コンテキストでアクセス制御。将来的には認証ユーザーIDと紐付け。';

-- =============================================================================
-- RLS Policy: event_dates（イベント）
-- =============================================================================

ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization''s events"
ON event_dates
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true))
WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

COMMENT ON POLICY "Users can access their organization''s events" ON event_dates IS
'団体IDベースのアクセス制御。該当する団体のイベントのみアクセス可能。';

-- =============================================================================
-- RLS Policy: groups（グループ）
-- =============================================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization''s groups"
ON groups
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true))
WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

COMMENT ON POLICY "Users can access their organization''s groups" ON groups IS
'団体IDベースのアクセス制御。該当する団体のグループのみアクセス可能。';

-- =============================================================================
-- RLS Policy: members（メンバー）
-- =============================================================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization''s members"
ON members
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true))
WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

COMMENT ON POLICY "Users can access their organization''s members" ON members IS
'団体IDベースのアクセス制御。該当する団体のメンバーのみアクセス可能。';

-- =============================================================================
-- RLS Policy: attendances（出欠記録）
-- =============================================================================

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization''s attendances"
ON attendances
FOR ALL
USING (organization_id = current_setting('app.current_organization_id', true))
WITH CHECK (organization_id = current_setting('app.current_organization_id', true));

COMMENT ON POLICY "Users can access their organization''s attendances" ON attendances IS
'団体IDベースのアクセス制御。該当する団体の出欠記録のみアクセス可能。';

-- =============================================================================
-- クライアントサイドでの使用方法
-- =============================================================================

-- 団体コンテキストの設定（クライアントサイドで実行）:
-- await supabase.rpc('set_current_organization', { org_id: 'abc123def' });
--
-- または、直接SQL実行:
-- SET app.current_organization_id = 'abc123def';
--
-- 注意: 現在は認証機能がないため、クライアントサイドで団体IDを設定する。
-- 将来的にSupabase Authを統合した際は、auth.uid()とorganizationsの紐付けテーブルを作成し、
-- ポリシーを以下のように変更する：
--
-- CREATE POLICY "Authenticated users can access their organizations"
-- ON organizations
-- FOR ALL
-- USING (
--   id IN (
--     SELECT organization_id
--     FROM user_organizations
--     WHERE user_id = auth.uid()
--   )
-- );
