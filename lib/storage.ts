import type { EventDate, Group, Member, Attendance, Organization } from '@/types';

// localStorageのキー
const STORAGE_KEYS = {
  ORGANIZATIONS: 'attendance_organizations',
  MIGRATION_COMPLETED: 'attendance_migration_completed',
  EVENT_DATES: (orgId: string) => `attendance_${orgId}_event_dates`,
  GROUPS: (orgId: string) => `attendance_${orgId}_groups`,
  MEMBERS: (orgId: string) => `attendance_${orgId}_members`,
  ATTENDANCES: (orgId: string) => `attendance_${orgId}_attendances`,
} as const;

// SSR対応: windowが存在するかチェック
function safeLoadData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    // データが破損している場合は削除
    localStorage.removeItem(key);
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}

// Organization（団体）操作
export function loadOrganizations(): Organization[] {
  return safeLoadData<Organization[]>(STORAGE_KEYS.ORGANIZATIONS, []);
}

export function saveOrganizations(organizations: Organization[]): boolean {
  return safeSetItem(STORAGE_KEYS.ORGANIZATIONS, organizations);
}

// EventDate（イベント日付）操作
export function loadEventDates(organizationId: string): EventDate[] {
  return safeLoadData<EventDate[]>(STORAGE_KEYS.EVENT_DATES(organizationId), []);
}

export function saveEventDates(organizationId: string, eventDates: EventDate[]): boolean {
  return safeSetItem(STORAGE_KEYS.EVENT_DATES(organizationId), eventDates);
}

// Group（グループ）操作
export function loadGroups(organizationId: string): Group[] {
  return safeLoadData<Group[]>(STORAGE_KEYS.GROUPS(organizationId), []);
}

export function saveGroups(organizationId: string, groups: Group[]): boolean {
  return safeSetItem(STORAGE_KEYS.GROUPS(organizationId), groups);
}

// Member（メンバー）操作
export function loadMembers(organizationId: string): Member[] {
  return safeLoadData<Member[]>(STORAGE_KEYS.MEMBERS(organizationId), []);
}

export function saveMembers(organizationId: string, members: Member[]): boolean {
  return safeSetItem(STORAGE_KEYS.MEMBERS(organizationId), members);
}

// Attendance（出欠登録）操作
export function loadAttendances(organizationId: string): Attendance[] {
  return safeLoadData<Attendance[]>(STORAGE_KEYS.ATTENDANCES(organizationId), []);
}

export function saveAttendances(organizationId: string, attendances: Attendance[]): boolean {
  return safeSetItem(STORAGE_KEYS.ATTENDANCES(organizationId), attendances);
}

// 団体のすべてのデータを削除（カスケード削除）
export function clearOrganizationData(organizationId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.EVENT_DATES(organizationId));
  localStorage.removeItem(STORAGE_KEYS.GROUPS(organizationId));
  localStorage.removeItem(STORAGE_KEYS.MEMBERS(organizationId));
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCES(organizationId));
}

// すべてのattendance-hubデータを削除（開発・テスト用）
export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // attendance_で始まるすべてのキーを削除
  Object.keys(localStorage)
    .filter((key) => key.startsWith('attendance_'))
    .forEach((key) => {
      localStorage.removeItem(key);
    });
}
