import type { Attendance, GroupSummary } from '@/types';
import { loadAttendances, saveAttendances, loadGroups, loadMembers } from './storage';
import { CreateAttendanceInputSchema, type AttendanceInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// 出欠登録を作成
export function createAttendance(input: AttendanceInput): Attendance {
  const validated = CreateAttendanceInputSchema.parse(input);

  const newAttendance: Attendance = {
    id: crypto.randomUUID(),
    eventDateId: validated.eventDateId,
    memberId: validated.memberId,
    status: validated.status,
    createdAt: getCurrentTimestamp(),
  };

  const attendances = loadAttendances();
  attendances.push(newAttendance);

  const success = saveAttendances(attendances);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newAttendance;
}

// すべての出欠登録を取得
export function getAllAttendances(): Attendance[] {
  return loadAttendances();
}

// イベント日付IDで出欠登録を取得
export function getAttendancesByEventDateId(eventDateId: string): Attendance[] {
  const attendances = loadAttendances();
  return attendances.filter((attendance) => attendance.eventDateId === eventDateId);
}

// メンバーIDで出欠登録を取得
export function getAttendancesByMemberId(memberId: string): Attendance[] {
  const attendances = loadAttendances();
  return attendances.filter((attendance) => attendance.memberId === memberId);
}

// IDで出欠登録を取得
export function getAttendanceById(id: string): Attendance | null {
  const attendances = loadAttendances();
  return attendances.find((attendance) => attendance.id === id) || null;
}

// 出欠登録を更新
export function updateAttendance(
  id: string,
  input: Partial<Omit<AttendanceInput, 'eventDateId' | 'memberId'>>
): Attendance {
  const attendances = loadAttendances();
  const index = attendances.findIndex((attendance) => attendance.id === id);

  if (index === -1) {
    throw new Error(ErrorMessages.NOT_FOUND('出欠登録'));
  }

  const updateData: AttendanceInput = {
    eventDateId: attendances[index].eventDateId,
    memberId: attendances[index].memberId,
    status: input.status ?? attendances[index].status,
  };
  const validated = CreateAttendanceInputSchema.parse(updateData);

  const updatedAttendance: Attendance = {
    ...attendances[index],
    status: validated.status,
  };

  attendances[index] = updatedAttendance;

  const success = saveAttendances(attendances);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedAttendance;
}

// 出欠登録を削除
export function deleteAttendance(id: string): boolean {
  const attendances = loadAttendances();
  const filteredAttendances = attendances.filter((attendance) => attendance.id !== id);

  if (attendances.length === filteredAttendances.length) {
    return false;
  }

  return saveAttendances(filteredAttendances);
}

// イベント日付の集計結果をグループ別に計算
export function calculateEventSummary(eventDateId: string): GroupSummary[] {
  const attendances = getAttendancesByEventDateId(eventDateId);
  const groups = loadGroups();
  const members = loadMembers();

  // グループごとに集計
  return groups
    .sort((a, b) => a.order - b.order)
    .map((group) => {
      // このグループに所属するメンバーを取得
      const groupMembers = members.filter((m) => m.groupId === group.id);
      const groupMemberIds = new Set(groupMembers.map((m) => m.id));

      // このグループのメンバーの出欠を取得
      const groupAttendances = attendances.filter((a) => groupMemberIds.has(a.memberId));

      return {
        groupId: group.id,
        groupName: group.name,
        attending: groupAttendances.filter((a) => a.status === '◯').length,
        maybe: groupAttendances.filter((a) => a.status === '△').length,
        notAttending: groupAttendances.filter((a) => a.status === '✗').length,
        total: groupAttendances.length,
      };
    })
    .filter((summary) => summary.total > 0); // 出欠登録があるグループのみ表示
}
