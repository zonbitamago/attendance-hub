/**
 * 統合ストレージ層
 *
 * 環境変数に基づいてlocalStorageとSupabaseを切り替える統一インターフェース。
 * - 本番環境（NODE_ENV=production）: Supabase強制使用
 * - NEXT_PUBLIC_USE_SUPABASE=true: Supabase使用
 * - それ以外: localStorage使用
 */

import type { EventDate, Group, Member, Attendance, Organization } from '@/types';
import * as localStorageOps from '@/lib/storage';
import { supabase } from '@/lib/supabase/client';

// ストレージモード型
export type StorageMode = 'localStorage' | 'supabase';

// =============================================================================
// snake_case / camelCase 変換ユーティリティ
// =============================================================================

// Supabase DB用の型定義（snake_case）
interface OrganizationRow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface GroupRow {
  id: string;
  organization_id: string;
  name: string;
  order: number;
  color?: string;
  created_at: string;
}

interface MemberRow {
  id: string;
  organization_id: string;
  group_id: string;
  name: string;
  created_at: string;
}

interface EventDateRow {
  id: string;
  organization_id: string;
  date: string;
  title: string;
  location?: string;
  created_at: string;
}

interface AttendanceRow {
  id: string;
  organization_id: string;
  event_date_id: string;
  member_id: string;
  status: string;
  created_at: string;
}

// Organization変換
function toOrganizationRow(org: Organization): OrganizationRow {
  return {
    id: org.id,
    name: org.name,
    description: org.description,
    created_at: org.createdAt,
  };
}

function fromOrganizationRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

// Group変換
function toGroupRow(group: Group): GroupRow {
  return {
    id: group.id,
    organization_id: group.organizationId,
    name: group.name,
    order: group.order,
    color: group.color,
    created_at: group.createdAt,
  };
}

function fromGroupRow(row: GroupRow): Group {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    order: row.order,
    color: row.color,
    createdAt: row.created_at,
  };
}

// Member変換
function toMemberRow(member: Member): MemberRow {
  return {
    id: member.id,
    organization_id: member.organizationId,
    group_id: member.groupId,
    name: member.name,
    created_at: member.createdAt,
  };
}

function fromMemberRow(row: MemberRow): Member {
  return {
    id: row.id,
    organizationId: row.organization_id,
    groupId: row.group_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

// EventDate変換
function toEventDateRow(eventDate: EventDate): EventDateRow {
  return {
    id: eventDate.id,
    organization_id: eventDate.organizationId,
    date: eventDate.date,
    title: eventDate.title,
    location: eventDate.location,
    created_at: eventDate.createdAt,
  };
}

function fromEventDateRow(row: EventDateRow): EventDate {
  return {
    id: row.id,
    organizationId: row.organization_id,
    date: row.date,
    title: row.title,
    location: row.location,
    createdAt: row.created_at,
  };
}

// Attendance変換
function toAttendanceRow(attendance: Attendance): AttendanceRow {
  return {
    id: attendance.id,
    organization_id: attendance.organizationId,
    event_date_id: attendance.eventDateId,
    member_id: attendance.memberId,
    status: attendance.status,
    created_at: attendance.createdAt,
  };
}

function fromAttendanceRow(row: AttendanceRow): Attendance {
  return {
    id: row.id,
    organizationId: row.organization_id,
    eventDateId: row.event_date_id,
    memberId: row.member_id,
    status: row.status as Attendance['status'],
    createdAt: row.created_at,
  };
}

/**
 * 現在のストレージモードを取得
 */
export function getStorageMode(): StorageMode {
  // 本番環境ではSupabaseを強制使用
  if (process.env.NODE_ENV === 'production') {
    return 'supabase';
  }

  // 環境変数でSupabaseを明示的に有効化
  if (process.env.NEXT_PUBLIC_USE_SUPABASE === 'true') {
    return 'supabase';
  }

  // デフォルトはlocalStorage
  return 'localStorage';
}

// =============================================================================
// Organization操作
// =============================================================================

/**
 * 団体を読み込む
 */
export async function loadOrganization(organizationId: string): Promise<Organization | null> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    const organizations = localStorageOps.loadOrganizations();
    return organizations.find((org) => org.id === organizationId) || null;
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Failed to load organization:', error);
    return null;
  }

  return fromOrganizationRow(data as OrganizationRow);
}

/**
 * 全団体を読み込む
 */
export async function loadAllOrganizations(): Promise<Organization[]> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.loadOrganizations();
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('organizations')
    .select('*');

  if (error) {
    console.error('Failed to load organizations:', error);
    return [];
  }

  return (data || []).map((row) => fromOrganizationRow(row as OrganizationRow));
}

/**
 * 団体を保存する
 */
export async function saveOrganization(organization: Organization): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    const organizations = localStorageOps.loadOrganizations();
    const index = organizations.findIndex((org) => org.id === organization.id);

    if (index >= 0) {
      organizations[index] = organization;
    } else {
      organizations.push(organization);
    }

    return localStorageOps.saveOrganizations(organizations);
  }

  // Supabaseモード
  const { error } = await supabase
    .from('organizations')
    .upsert(toOrganizationRow(organization));

  if (error) {
    console.error('Failed to save organization:', error);
    return false;
  }

  return true;
}

/**
 * 団体を削除する
 */
export async function deleteOrganization(organizationId: string): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    const organizations = localStorageOps.loadOrganizations();
    const filtered = organizations.filter((org) => org.id !== organizationId);
    return localStorageOps.saveOrganizations(filtered);
  }

  // Supabaseモード
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to delete organization:', error);
    return false;
  }

  return true;
}

// =============================================================================
// Group操作
// =============================================================================

/**
 * グループ一覧を読み込む
 */
export async function loadGroups(organizationId: string): Promise<Group[]> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.loadGroups(organizationId);
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load groups:', error);
    return [];
  }

  return (data || []).map((row) => fromGroupRow(row as GroupRow));
}

/**
 * グループを保存する
 */
export async function saveGroups(organizationId: string, groups: Group[]): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.saveGroups(organizationId, groups);
  }

  // Supabaseモード - 全削除して再挿入
  const { error: deleteError } = await supabase
    .from('groups')
    .delete()
    .eq('organization_id', organizationId);

  if (deleteError) {
    console.error('Failed to delete groups:', deleteError);
    return false;
  }

  if (groups.length === 0) {
    return true;
  }

  const { error: insertError } = await supabase
    .from('groups')
    .insert(groups.map(toGroupRow));

  if (insertError) {
    console.error('Failed to save groups:', insertError);
    return false;
  }

  return true;
}

// =============================================================================
// Member操作
// =============================================================================

/**
 * メンバー一覧を読み込む
 */
export async function loadMembers(organizationId: string): Promise<Member[]> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.loadMembers(organizationId);
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load members:', error);
    return [];
  }

  return (data || []).map((row) => fromMemberRow(row as MemberRow));
}

/**
 * メンバーを保存する
 */
export async function saveMembers(organizationId: string, members: Member[]): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.saveMembers(organizationId, members);
  }

  // Supabaseモード - 全削除して再挿入
  const { error: deleteError } = await supabase
    .from('members')
    .delete()
    .eq('organization_id', organizationId);

  if (deleteError) {
    console.error('Failed to delete members:', deleteError);
    return false;
  }

  if (members.length === 0) {
    return true;
  }

  const { error: insertError } = await supabase
    .from('members')
    .insert(members.map(toMemberRow));

  if (insertError) {
    console.error('Failed to save members:', insertError);
    return false;
  }

  return true;
}

// =============================================================================
// EventDate操作
// =============================================================================

/**
 * イベント日付一覧を読み込む
 */
export async function loadEventDates(organizationId: string): Promise<EventDate[]> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.loadEventDates(organizationId);
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('event_dates')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load event dates:', error);
    return [];
  }

  return (data || []).map((row) => fromEventDateRow(row as EventDateRow));
}

/**
 * イベント日付を保存する
 */
export async function saveEventDates(organizationId: string, eventDates: EventDate[]): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.saveEventDates(organizationId, eventDates);
  }

  // Supabaseモード - 全削除して再挿入
  const { error: deleteError } = await supabase
    .from('event_dates')
    .delete()
    .eq('organization_id', organizationId);

  if (deleteError) {
    console.error('Failed to delete event dates:', deleteError);
    return false;
  }

  if (eventDates.length === 0) {
    return true;
  }

  const { error: insertError } = await supabase
    .from('event_dates')
    .insert(eventDates.map(toEventDateRow));

  if (insertError) {
    console.error('Failed to save event dates:', insertError);
    return false;
  }

  return true;
}

// =============================================================================
// Attendance操作
// =============================================================================

/**
 * 出欠一覧を読み込む
 */
export async function loadAttendances(organizationId: string): Promise<Attendance[]> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.loadAttendances(organizationId);
  }

  // Supabaseモード
  const { data, error } = await supabase
    .from('attendances')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load attendances:', error);
    return [];
  }

  return (data || []).map((row) => fromAttendanceRow(row as AttendanceRow));
}

/**
 * 出欠を保存する
 */
export async function saveAttendances(organizationId: string, attendances: Attendance[]): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    return localStorageOps.saveAttendances(organizationId, attendances);
  }

  // Supabaseモード - 全削除して再挿入
  const { error: deleteError } = await supabase
    .from('attendances')
    .delete()
    .eq('organization_id', organizationId);

  if (deleteError) {
    console.error('Failed to delete attendances:', deleteError);
    return false;
  }

  if (attendances.length === 0) {
    return true;
  }

  const { error: insertError } = await supabase
    .from('attendances')
    .insert(attendances.map(toAttendanceRow));

  if (insertError) {
    console.error('Failed to save attendances:', insertError);
    return false;
  }

  return true;
}

// =============================================================================
// ユーティリティ
// =============================================================================

/**
 * 団体の全データを削除する
 */
export async function clearOrganizationData(organizationId: string): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'localStorage') {
    localStorageOps.clearOrganizationData(organizationId);
    return true;
  }

  // Supabaseモード - カスケード削除により自動的に関連データも削除される
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to clear organization data:', error);
    return false;
  }

  return true;
}
