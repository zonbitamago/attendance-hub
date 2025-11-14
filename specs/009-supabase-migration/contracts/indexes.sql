-- Performance Indexes
-- Feature: 009-supabase-migration
-- Created: 2025-11-15
-- Description: パフォーマンス最適化用インデックス（約20インデックス）

-- =============================================================================
-- Indexes: event_dates（イベント）
-- =============================================================================

-- RLS最適化、団体別イベント取得最適化
CREATE INDEX idx_event_dates_org ON event_dates(organization_id);

-- 日付順ソート最適化
CREATE INDEX idx_event_dates_date ON event_dates(date);

-- 団体別 + 日付範囲検索最適化（複合インデックス）
CREATE INDEX idx_event_dates_org_date ON event_dates(organization_id, date);

COMMENT ON INDEX idx_event_dates_org IS 'RLSポリシーとorganization_idでのフィルタリングを最適化';
COMMENT ON INDEX idx_event_dates_date IS '日付順ソートを最適化';
COMMENT ON INDEX idx_event_dates_org_date IS '団体別の日付範囲検索を最適化';

-- =============================================================================
-- Indexes: groups（グループ）
-- =============================================================================

-- RLS最適化、団体別グループ取得最適化
CREATE INDEX idx_groups_org ON groups(organization_id);

-- 団体内の表示順ソート最適化（複合インデックス）
CREATE INDEX idx_groups_order ON groups(organization_id, "order");

COMMENT ON INDEX idx_groups_org IS 'RLSポリシーとorganization_idでのフィルタリングを最適化';
COMMENT ON INDEX idx_groups_order IS '団体内のグループ表示順ソートを最適化';

-- =============================================================================
-- Indexes: members（メンバー）
-- =============================================================================

-- RLS最適化、団体別メンバー取得最適化
CREATE INDEX idx_members_org ON members(organization_id);

-- グループ別メンバー取得最適化
CREATE INDEX idx_members_group ON members(group_id);

-- 団体別 + グループ別メンバー取得最適化（複合インデックス）
CREATE INDEX idx_members_org_group ON members(organization_id, group_id);

-- メンバー名での検索最適化（部分一致検索）
CREATE INDEX idx_members_name ON members USING gin (name gin_trgm_ops);

COMMENT ON INDEX idx_members_org IS 'RLSポリシーとorganization_idでのフィルタリングを最適化';
COMMENT ON INDEX idx_members_group IS 'グループ別メンバー取得を最適化';
COMMENT ON INDEX idx_members_org_group IS '団体別・グループ別メンバー取得を最適化';
COMMENT ON INDEX idx_members_name IS 'メンバー名の部分一致検索を最適化（pg_trgm拡張使用）';

-- pg_trgm拡張を有効化（部分一致検索用）
-- 注意: これはマイグレーション時に一度だけ実行すればよい
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- Indexes: attendances（出欠記録）
-- =============================================================================

-- RLS最適化、団体別出欠記録取得最適化
CREATE INDEX idx_attendances_org ON attendances(organization_id);

-- イベント別出欠取得最適化
CREATE INDEX idx_attendances_event ON attendances(event_date_id);

-- メンバー別出欠履歴取得最適化
CREATE INDEX idx_attendances_member ON attendances(member_id);

-- 団体別 + イベント別出欠取得最適化（複合インデックス）
CREATE INDEX idx_attendances_org_event ON attendances(organization_id, event_date_id);

-- 団体別 + メンバー別出欠履歴取得最適化（複合インデックス）
CREATE INDEX idx_attendances_org_member ON attendances(organization_id, member_id);

-- ステータス別集計最適化（部分インデックス）
CREATE INDEX idx_attendances_attending ON attendances(event_date_id) WHERE status = '◯';
CREATE INDEX idx_attendances_maybe ON attendances(event_date_id) WHERE status = '△';
CREATE INDEX idx_attendances_not_attending ON attendances(event_date_id) WHERE status = '✗';

COMMENT ON INDEX idx_attendances_org IS 'RLSポリシーとorganization_idでのフィルタリングを最適化';
COMMENT ON INDEX idx_attendances_event IS 'イベント別出欠取得を最適化';
COMMENT ON INDEX idx_attendances_member IS 'メンバー別出欠履歴取得を最適化';
COMMENT ON INDEX idx_attendances_org_event IS '団体別・イベント別出欠取得を最適化';
COMMENT ON INDEX idx_attendances_org_member IS '団体別・メンバー別出欠履歴取得を最適化';
COMMENT ON INDEX idx_attendances_attending IS '参加者のみの集計を最適化';
COMMENT ON INDEX idx_attendances_maybe IS '未定者のみの集計を最適化';
COMMENT ON INDEX idx_attendances_not_attending IS '欠席者のみの集計を最適化';

-- =============================================================================
-- インデックスの使用状況確認
-- =============================================================================

-- インデックスの使用頻度を確認するクエリ（開発・チューニング用）:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
--
-- 未使用インデックスを特定するクエリ:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public' AND idx_scan = 0
-- ORDER BY tablename, indexname;

-- =============================================================================
-- パフォーマンステスト用クエリ例
-- =============================================================================

-- グループ別出欠集計（100メンバー、200ms以内を目標）:
--
-- SELECT
--   g.id as group_id,
--   g.name as group_name,
--   COUNT(CASE WHEN a.status = '◯' THEN 1 END) as attending,
--   COUNT(CASE WHEN a.status = '△' THEN 1 END) as maybe,
--   COUNT(CASE WHEN a.status = '✗' THEN 1 END) as not_attending
-- FROM groups g
-- LEFT JOIN members m ON m.group_id = g.id
-- LEFT JOIN attendances a ON a.member_id = m.id AND a.event_date_id = $1
-- WHERE g.organization_id = $2
-- GROUP BY g.id, g.name
-- ORDER BY g."order";
--
-- EXPLAIN ANALYZEで実行計画を確認:
-- EXPLAIN ANALYZE [上記のクエリ];
