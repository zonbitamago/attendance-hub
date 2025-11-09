import type { Organization, EventDate, Group, Member, Attendance } from '@/types';
import { generateOrganizationId } from '@/lib/organization-service';
import { saveOrganizations } from '@/lib/storage';
import { saveEventDates, saveGroups, saveMembers, saveAttendances } from '@/lib/storage';

// マイグレーション結果
export interface MigrationResult {
  migrated: boolean;
  defaultOrgId?: string;
  error?: string;
}

// レガシーキー（v1.0）
const LEGACY_KEYS = {
  EVENT_DATES: 'attendance_event_dates',
  GROUPS: 'attendance_groups',
  MEMBERS: 'attendance_members',
  ATTENDANCES: 'attendance_attendances',
} as const;

const MIGRATION_FLAG_KEY = 'attendance_migration_completed';

// レガシーデータが存在するかチェック
export function hasLegacyData(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return Object.values(LEGACY_KEYS).some((key) => localStorage.getItem(key) !== null);
}

// マイグレーションが完了しているかチェック
export function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
}

// v1.0からv2.0へマイグレーション
export function migrateToMultiTenant(): MigrationResult {
  try {
    // マイグレーション完了済みかチェック
    if (isMigrationCompleted()) {
      return { migrated: false };
    }

    // レガシーデータが存在するかチェック
    if (!hasLegacyData()) {
      // レガシーデータなし → 完了としてマーク
      if (typeof window !== 'undefined') {
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      }
      return { migrated: false };
    }

    // デフォルト団体を作成
    const defaultOrgId = generateOrganizationId();
    const defaultOrg: Organization = {
      id: defaultOrgId,
      name: 'マイ団体',
      description: '既存データから自動作成された団体です',
      createdAt: new Date().toISOString(),
    };
    saveOrganizations([defaultOrg]);

    // EventDatesをマイグレーション
    const legacyEvents = JSON.parse(localStorage.getItem(LEGACY_KEYS.EVENT_DATES) || '[]');
    if (legacyEvents.length > 0) {
      const migratedEvents: EventDate[] = legacyEvents.map((event: any) => ({
        ...event,
        organizationId: defaultOrgId,
      }));
      saveEventDates(defaultOrgId, migratedEvents);
      localStorage.removeItem(LEGACY_KEYS.EVENT_DATES);
    }

    // Groupsをマイグレーション
    const legacyGroups = JSON.parse(localStorage.getItem(LEGACY_KEYS.GROUPS) || '[]');
    if (legacyGroups.length > 0) {
      const migratedGroups: Group[] = legacyGroups.map((group: any) => ({
        ...group,
        organizationId: defaultOrgId,
      }));
      saveGroups(defaultOrgId, migratedGroups);
      localStorage.removeItem(LEGACY_KEYS.GROUPS);
    }

    // Membersをマイグレーション
    const legacyMembers = JSON.parse(localStorage.getItem(LEGACY_KEYS.MEMBERS) || '[]');
    if (legacyMembers.length > 0) {
      const migratedMembers: Member[] = legacyMembers.map((member: any) => ({
        ...member,
        organizationId: defaultOrgId,
      }));
      saveMembers(defaultOrgId, migratedMembers);
      localStorage.removeItem(LEGACY_KEYS.MEMBERS);
    }

    // Attendancesをマイグレーション
    const legacyAttendances = JSON.parse(localStorage.getItem(LEGACY_KEYS.ATTENDANCES) || '[]');
    if (legacyAttendances.length > 0) {
      const migratedAttendances: Attendance[] = legacyAttendances.map((attendance: any) => ({
        ...attendance,
        organizationId: defaultOrgId,
      }));
      saveAttendances(defaultOrgId, migratedAttendances);
      localStorage.removeItem(LEGACY_KEYS.ATTENDANCES);
    }

    // マイグレーション完了フラグを設定
    if (typeof window !== 'undefined') {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    }

    return { migrated: true, defaultOrgId };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      migrated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
