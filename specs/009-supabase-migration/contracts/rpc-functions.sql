-- RPC Functions for Supabase Client
-- Feature: 009-supabase-migration
-- Created: 2025-11-16
-- Description: PostgreSQL functions that can be called via supabase.rpc()

-- =============================================================================
-- Function: set_current_organization
-- =============================================================================
-- 現在の組織コンテキストを設定する関数
-- RLSポリシーで current_setting('app.current_organization_id', true) を使用するために必要
--
-- Usage from TypeScript:
--   await supabase.rpc('set_current_organization', { org_id: 'abc123def' })
--
-- Note: SET LOCAL は現在のトランザクション内でのみ有効
--       Supabase Clientの各リクエストは独立したトランザクションなので、
--       クエリ実行前に毎回この関数を呼び出す必要がある
-- =============================================================================

CREATE OR REPLACE FUNCTION set_current_organization(org_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- トランザクションローカルな設定パラメータを設定
  -- 第3引数 true = local to current transaction
  PERFORM set_config('app.current_organization_id', org_id, true);
END;
$$;

COMMENT ON FUNCTION set_current_organization(TEXT) IS
'現在の組織コンテキストを設定。RLSポリシーで使用される app.current_organization_id を設定する。';

-- =============================================================================
-- Function: get_current_organization (デバッグ用)
-- =============================================================================
-- 現在設定されている組織IDを取得する関数（デバッグ・テスト用）
--
-- Usage from TypeScript:
--   const { data } = await supabase.rpc('get_current_organization')
-- =============================================================================

CREATE OR REPLACE FUNCTION get_current_organization()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN current_setting('app.current_organization_id', true);
EXCEPTION
  WHEN undefined_object THEN
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION get_current_organization() IS
'現在設定されている組織IDを取得（デバッグ・テスト用）。設定されていない場合はNULLを返す。';
