-- Database Schema: Supabase PostgreSQL
-- Feature: 009-supabase-migration
-- Created: 2025-11-15
-- Description: PostgreSQLテーブル定義（5テーブル: organizations, event_dates, groups, members, attendances）

-- =============================================================================
-- ENUM Types
-- =============================================================================

-- 出欠ステータス（'◯': 参加、'△': 未定、'✗': 欠席）
CREATE TYPE attendance_status AS ENUM ('◯', '△', '✗');

-- =============================================================================
-- Table: organizations（団体）
-- =============================================================================

CREATE TABLE organizations (
  id TEXT PRIMARY KEY CHECK (LENGTH(id) = 10),
  name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 100),
  description TEXT CHECK (LENGTH(description) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS '団体テーブル：マルチテナントの基盤エンティティ';
COMMENT ON COLUMN organizations.id IS 'nanoid(10)で生成されるランダムID（10文字、英数字小文字）';
COMMENT ON COLUMN organizations.name IS '団体名（1-100文字）';
COMMENT ON COLUMN organizations.description IS '団体の説明（0-500文字、NULL可）';
COMMENT ON COLUMN organizations.created_at IS '作成日時';

-- =============================================================================
-- Table: event_dates（イベント）
-- =============================================================================

CREATE TABLE event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL CHECK (LENGTH(title) BETWEEN 1 AND 100),
  location TEXT CHECK (LENGTH(location) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE event_dates IS 'イベントテーブル：練習、本番、リハーサルなど';
COMMENT ON COLUMN event_dates.id IS 'UUID v4（PostgreSQL自動生成）';
COMMENT ON COLUMN event_dates.organization_id IS '所属する団体のID';
COMMENT ON COLUMN event_dates.date IS 'イベント日付（YYYY-MM-DD）';
COMMENT ON COLUMN event_dates.title IS 'イベント名（1-100文字）';
COMMENT ON COLUMN event_dates.location IS '開催場所（0-200文字、NULL可）';
COMMENT ON COLUMN event_dates.created_at IS '作成日時';

-- =============================================================================
-- Table: groups（グループ）
-- =============================================================================

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 50),
  "order" INTEGER NOT NULL CHECK ("order" >= 0),
  color TEXT CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE groups IS 'グループテーブル：パート、セクション、チームなど';
COMMENT ON COLUMN groups.id IS 'UUID v4';
COMMENT ON COLUMN groups.organization_id IS '所属する団体のID';
COMMENT ON COLUMN groups.name IS 'グループ名（1-50文字）';
COMMENT ON COLUMN groups."order" IS '表示順序（0以上の整数）';
COMMENT ON COLUMN groups.color IS '色コード（#RRGGBB形式、NULL可）';
COMMENT ON COLUMN groups.created_at IS '作成日時';

-- =============================================================================
-- Table: members（メンバー）
-- =============================================================================

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE members IS 'メンバーテーブル：グループに所属するメンバー';
COMMENT ON COLUMN members.id IS 'UUID v4';
COMMENT ON COLUMN members.organization_id IS '所属する団体のID';
COMMENT ON COLUMN members.group_id IS '所属するグループのID';
COMMENT ON COLUMN members.name IS 'メンバー名（1-50文字）';
COMMENT ON COLUMN members.created_at IS '作成日時';

-- =============================================================================
-- Table: attendances（出欠記録）
-- =============================================================================

CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_date_id UUID NOT NULL REFERENCES event_dates(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status attendance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_date_id, member_id)
);

COMMENT ON TABLE attendances IS '出欠記録テーブル：イベントとメンバーの組み合わせによる出欠状況';
COMMENT ON COLUMN attendances.id IS 'UUID v4';
COMMENT ON COLUMN attendances.organization_id IS '所属する団体のID';
COMMENT ON COLUMN attendances.event_date_id IS 'イベントID';
COMMENT ON COLUMN attendances.member_id IS 'メンバーID';
COMMENT ON COLUMN attendances.status IS '出欠ステータス（ENUM: ''◯'', ''△'', ''✗''）';
COMMENT ON COLUMN attendances.created_at IS '作成日時';
COMMENT ON CONSTRAINT attendances_event_date_id_member_id_key ON attendances IS '一意制約：同じイベント・メンバーの組み合わせは1件のみ';
