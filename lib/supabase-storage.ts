/**
 * Supabase Storage Layer
 * localStorage から Supabase PostgreSQL への移行
 *
 * このファイルは既存の lib/storage.ts と同じインターフェースを提供しますが、
 * Supabase を使用してデータを永続化します。
 */

import type { EventDate, Group, Member, Attendance, Organization } from '@/types';
import { supabase } from '@/lib/supabase/client';

/**
 * 組織データを取得
 * @param organizationId 組織ID
 * @returns 組織オブジェクト、または null
 */
export async function loadOrganizations(organizationId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Failed to load organization:', error);
    return null;
  }

  return data;
}

/**
 * 組織データを保存（upsert）
 * @param organization 組織オブジェクト
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function saveOrganizations(organization: Organization): Promise<boolean> {
  const { error } = await supabase
    .from('organizations')
    .upsert(organization);

  if (error) {
    console.error('Failed to save organization:', error);
    return false;
  }

  return true;
}

/**
 * イベント日付データを取得
 * @param organizationId 組織ID
 * @returns イベント日付の配列
 */
export async function loadEventDates(organizationId: string): Promise<EventDate[]> {
  const { data, error } = await supabase
    .from('event_dates')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load event dates:', error);
    return [];
  }

  return data || [];
}

/**
 * イベント日付データを保存（upsert）
 * @param eventDate イベント日付オブジェクト
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function saveEventDates(eventDate: EventDate): Promise<boolean> {
  const { error } = await supabase
    .from('event_dates')
    .upsert(eventDate);

  if (error) {
    console.error('Failed to save event date:', error);
    return false;
  }

  return true;
}

/**
 * グループデータを取得
 * @param organizationId 組織ID
 * @returns グループの配列
 */
export async function loadGroups(organizationId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load groups:', error);
    return [];
  }

  return data || [];
}

/**
 * グループデータを保存（upsert）
 * @param group グループオブジェクト
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function saveGroups(group: Group): Promise<boolean> {
  const { error } = await supabase
    .from('groups')
    .upsert(group);

  if (error) {
    console.error('Failed to save group:', error);
    return false;
  }

  return true;
}

/**
 * メンバーデータを取得
 * @param organizationId 組織ID
 * @returns メンバーの配列
 */
export async function loadMembers(organizationId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load members:', error);
    return [];
  }

  return data || [];
}

/**
 * メンバーデータを保存（upsert）
 * @param member メンバーオブジェクト
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function saveMembers(member: Member): Promise<boolean> {
  const { error } = await supabase
    .from('members')
    .upsert(member);

  if (error) {
    console.error('Failed to save member:', error);
    return false;
  }

  return true;
}

/**
 * 出欠データを取得
 * @param organizationId 組織ID
 * @returns 出欠の配列
 */
export async function loadAttendances(organizationId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendances')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to load attendances:', error);
    return [];
  }

  return data || [];
}

/**
 * 出欠データを保存（upsert）
 * @param attendance 出欠オブジェクト
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function saveAttendances(attendance: Attendance): Promise<boolean> {
  const { error } = await supabase
    .from('attendances')
    .upsert(attendance);

  if (error) {
    console.error('Failed to save attendance:', error);
    return false;
  }

  return true;
}

/**
 * 組織データを削除（カスケード削除により関連データも自動削除）
 * @param organizationId 組織ID
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function clearOrganizationData(organizationId: string): Promise<boolean> {
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

/**
 * 組織コンテキストを設定（RLS用）
 * @param organizationId 組織ID
 * @returns 成功した場合 true、失敗した場合 false
 */
export async function setOrganizationContext(organizationId: string): Promise<boolean> {
  const { error } = await supabase
    .rpc('set_current_organization', { org_id: organizationId });

  if (error) {
    console.error('Failed to set organization context:', error);
    return false;
  }

  return true;
}
