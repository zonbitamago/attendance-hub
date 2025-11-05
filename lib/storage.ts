import type { EventDate, Group, Member, Attendance } from '@/types';

// localStorageのキー
const STORAGE_KEYS = {
  EVENT_DATES: 'attendance_event_dates',
  GROUPS: 'attendance_groups',
  MEMBERS: 'attendance_members',
  ATTENDANCES: 'attendance_attendances',
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

// EventDate（イベント日付）操作
export function loadEventDates(): EventDate[] {
  return safeLoadData<EventDate[]>(STORAGE_KEYS.EVENT_DATES, []);
}

export function saveEventDates(eventDates: EventDate[]): boolean {
  return safeSetItem(STORAGE_KEYS.EVENT_DATES, eventDates);
}

// Group（グループ）操作
export function loadGroups(): Group[] {
  return safeLoadData<Group[]>(STORAGE_KEYS.GROUPS, []);
}

export function saveGroups(groups: Group[]): boolean {
  return safeSetItem(STORAGE_KEYS.GROUPS, groups);
}

// Member（メンバー）操作
export function loadMembers(): Member[] {
  return safeLoadData<Member[]>(STORAGE_KEYS.MEMBERS, []);
}

export function saveMembers(members: Member[]): boolean {
  return safeSetItem(STORAGE_KEYS.MEMBERS, members);
}

// Attendance（出欠登録）操作
export function loadAttendances(): Attendance[] {
  return safeLoadData<Attendance[]>(STORAGE_KEYS.ATTENDANCES, []);
}

export function saveAttendances(attendances: Attendance[]): boolean {
  return safeSetItem(STORAGE_KEYS.ATTENDANCES, attendances);
}

// データ初期化（開発・テスト用）
export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
