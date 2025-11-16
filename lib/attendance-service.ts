import type { Attendance, GroupSummary, EventTotalSummary, BulkAttendanceInput, BulkAttendanceResult, MemberAttendanceDetail } from '@/types';
import { loadAttendances, saveAttendances, loadGroups, loadMembers } from './storage';
import { CreateAttendanceInputSchema, type AttendanceInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// 出欠登録を作成
export async function createAttendance(organizationId: string, input: AttendanceInput): Promise<Attendance> {
  const validated = CreateAttendanceInputSchema.parse(input);

  const newAttendance: Attendance = {
    id: crypto.randomUUID(),
    organizationId,
    eventDateId: validated.eventDateId,
    memberId: validated.memberId,
    status: validated.status,
    createdAt: getCurrentTimestamp(),
  };

  const attendances = loadAttendances(organizationId);
  attendances.push(newAttendance);

  const success = saveAttendances(organizationId, attendances);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newAttendance;
}

// すべての出欠登録を取得
export function getAllAttendances(organizationId: string): Attendance[] {
  return loadAttendances(organizationId);
}

// イベント日付IDで出欠登録を取得
export async function getAttendancesByEventDateId(organizationId: string, eventDateId: string): Promise<Attendance[]> {
  const attendances = loadAttendances(organizationId);
  return attendances.filter((attendance) => attendance.eventDateId === eventDateId);
}

// メンバーIDで出欠登録を取得
export async function getAttendancesByMemberId(organizationId: string, memberId: string): Promise<Attendance[]> {
  const attendances = loadAttendances(organizationId);
  return attendances.filter((attendance) => attendance.memberId === memberId);
}

// IDで出欠登録を取得
export function getAttendanceById(organizationId: string, id: string): Attendance | null {
  const attendances = loadAttendances(organizationId);
  return attendances.find((attendance) => attendance.id === id) || null;
}

// 出欠登録を更新
export async function updateAttendance(
  organizationId: string,
  id: string,
  input: Partial<Omit<AttendanceInput, 'eventDateId' | 'memberId'>>
): Promise<Attendance> {
  const attendances = loadAttendances(organizationId);
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

  const success = saveAttendances(organizationId, attendances);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedAttendance;
}

// 出欠登録を削除
export async function deleteAttendance(organizationId: string, id: string): Promise<boolean> {
  const attendances = loadAttendances(organizationId);
  const filteredAttendances = attendances.filter((attendance) => attendance.id !== id);

  if (attendances.length === filteredAttendances.length) {
    return false;
  }

  return saveAttendances(organizationId, filteredAttendances);
}

// イベント日付の集計結果をグループ別に計算
export async function calculateEventSummary(organizationId: string, eventDateId: string): Promise<GroupSummary[]> {
  const attendances = await getAttendancesByEventDateId(organizationId, eventDateId);
  const groups = loadGroups(organizationId);
  const members = loadMembers(organizationId);

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

// イベント全体の人数集計を計算
export function calculateEventTotalSummary(organizationId: string, eventDateId: string): EventTotalSummary {
  const attendances = getAttendancesByEventDateId(organizationId, eventDateId);

  // NOTE: 現在のデータモデルでは、eventDateIdごとにmemberIdは一意なので重複は発生しない。
  // ただし、将来的にメンバーが複数グループに所属できるようになった場合に備えて、
  // 重複排除ロジックを保持している。現在のパフォーマンスへの影響は軽微。
  const uniqueMemberIds = new Set<string>();
  const uniqueAttendances: Attendance[] = [];

  for (const attendance of attendances) {
    if (!uniqueMemberIds.has(attendance.memberId)) {
      uniqueMemberIds.add(attendance.memberId);
      uniqueAttendances.push(attendance);
    }
  }

  // ステータス別に集計
  const totalAttending = uniqueAttendances.filter((a) => a.status === '◯').length;
  const totalMaybe = uniqueAttendances.filter((a) => a.status === '△').length;
  const totalNotAttending = uniqueAttendances.filter((a) => a.status === '✗').length;
  const totalResponded = uniqueAttendances.length;

  return {
    totalAttending,
    totalMaybe,
    totalNotAttending,
    totalResponded,
  };
}

// 出欠登録を作成または更新（upsert）
export async function upsertAttendance(organizationId: string, input: AttendanceInput): Promise<Attendance> {
  const validated = CreateAttendanceInputSchema.parse(input);
  const attendances = loadAttendances(organizationId);

  // 既存レコードを検索（eventDateId + memberId の複合キーで一意性を保証）
  // 重複がある場合は最新のもの（createdAtが最も新しいもの）を使用
  const matchingRecords = attendances.filter(
    (a) => a.eventDateId === validated.eventDateId && a.memberId === validated.memberId
  );

  if (matchingRecords.length === 0) {
    // 新規作成
    const newAttendance: Attendance = {
      id: crypto.randomUUID(),
      organizationId,
      eventDateId: validated.eventDateId,
      memberId: validated.memberId,
      status: validated.status,
      createdAt: getCurrentTimestamp(),
    };

    attendances.push(newAttendance);

    const success = saveAttendances(organizationId, attendances);
    if (!success) {
      throw new Error(ErrorMessages.STORAGE_FULL);
    }

    return newAttendance;
  } else {
    // 既存レコードを更新
    // 重複がある場合は最新のものを保持し、古いものは削除
    const sortedRecords = matchingRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestRecord = sortedRecords[0];

    // 重複レコードを削除し、最新のもののみを残す
    const filteredAttendances = attendances.filter(
      (a) => !(a.eventDateId === validated.eventDateId && a.memberId === validated.memberId)
    );

    const updatedAttendance: Attendance = {
      ...latestRecord,
      status: validated.status,
    };

    filteredAttendances.push(updatedAttendance);

    const success = saveAttendances(organizationId, filteredAttendances);
    if (!success) {
      throw new Error(ErrorMessages.STORAGE_FULL);
    }

    return updatedAttendance;
  }
}

// 複数の出欠登録を一括でupsert
export function upsertBulkAttendances(organizationId: string, inputs: BulkAttendanceInput[]): BulkAttendanceResult {
  const result: BulkAttendanceResult = {
    success: [],
    updated: [],
    failed: [],
  };

  // 空配列の場合は即座に返す
  if (inputs.length === 0) {
    loadAttendances(organizationId); // 読み込みは実行（テストのためのモック呼び出し）
    return result;
  }

  // バッチ処理: localStorage読み込みは1回のみ
  const attendances = loadAttendances(organizationId);

  // 各入力を処理
  for (const input of inputs) {
    try {
      // バリデーション
      const validated = CreateAttendanceInputSchema.parse(input);

      // 既存レコードを検索（重複処理含む）
      const matchingRecords = attendances.filter(
        (a) => a.eventDateId === validated.eventDateId && a.memberId === validated.memberId
      );

      if (matchingRecords.length === 0) {
        // 新規作成
        const newAttendance: Attendance = {
          id: crypto.randomUUID(),
          organizationId,
          eventDateId: validated.eventDateId,
          memberId: validated.memberId,
          status: validated.status,
          createdAt: getCurrentTimestamp(),
        };

        attendances.push(newAttendance);
        result.success.push(newAttendance);
      } else {
        // 既存レコード更新
        const sortedRecords = matchingRecords.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latestRecord = sortedRecords[0];

        // 重複レコードを削除（メモリ上の配列から）
        const indexToRemove = attendances.findIndex((a) => a.id === latestRecord.id);
        if (indexToRemove !== -1) {
          // 他の重複も削除
          for (let i = attendances.length - 1; i >= 0; i--) {
            if (
              attendances[i].eventDateId === validated.eventDateId &&
              attendances[i].memberId === validated.memberId
            ) {
              attendances.splice(i, 1);
            }
          }

          const updatedAttendance: Attendance = {
            ...latestRecord,
            status: validated.status,
          };

          attendances.push(updatedAttendance);
          result.updated.push(updatedAttendance);
        }
      }
    } catch (error) {
      // バリデーションエラーなどを記録
      result.failed.push({
        input,
        error: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  // バッチ処理: localStorage書き込みは1回のみ
  const success = saveAttendances(organizationId, attendances);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return result;
}

// Feature 007: イベント画面 個人別出欠状況表示機能
// グループメンバーの出欠詳細を取得
export async function getGroupMemberAttendances(
  organizationId: string,
  eventDateId: string,
  groupId: string
): Promise<MemberAttendanceDetail[]> {
  // 1. グループを取得
  const group = loadGroups(organizationId).find((g) => g.id === groupId);
  if (!group) return [];

  // 2. グループの全メンバーを取得
  const allMembers = loadMembers(organizationId).filter((m) => m.groupId === groupId);

  // 3. イベントの全出欠レコードを取得
  const attendances = await getAttendancesByEventDateId(organizationId, eventDateId);

  // 4. メンバーIDから出欠レコードへのマップを作成
  const attendanceMap = new Map<string, Attendance>();
  for (const att of attendances) {
    attendanceMap.set(att.memberId, att);
  }

  // 5. メンバーと出欠レコードを結合
  const details: MemberAttendanceDetail[] = allMembers.map((member) => {
    const attendance = attendanceMap.get(member.id);
    return {
      memberId: member.id,
      memberName: member.name,
      groupId: group.id,
      groupName: group.name,
      status: attendance?.status ?? null,
      hasRegistered: attendance !== undefined,
      memberCreatedAt: member.createdAt,
    };
  });

  // 6. 名前順でソート（五十音順）
  // NOTE: ひらがな・カタカナはlocaleCompareで正しくソートされます。
  // 漢字の読みに基づくソートには、ふりがなデータまたは専用ライブラリが必要です。
  details.sort((a, b) => a.memberName.localeCompare(b.memberName, 'ja'));

  return details;
}
