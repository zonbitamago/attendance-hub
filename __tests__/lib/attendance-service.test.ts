import {
  createAttendance,
  getAttendancesByEventDateId,
  getAttendancesByMemberId,
  updateAttendance,
  deleteAttendance,
  calculateEventSummary,
  calculateEventTotalSummary,
} from '@/lib/attendance-service';
import { loadAttendances, saveAttendances, loadGroups, loadMembers } from '@/lib/storage';
import type { Attendance, Group, Member } from '@/types';

// storage モジュールをモック
jest.mock('@/lib/storage');

describe('Attendance Service', () => {
  const mockLoadAttendances = loadAttendances as jest.MockedFunction<typeof loadAttendances>;
  const mockSaveAttendances = saveAttendances as jest.MockedFunction<typeof saveAttendances>;
  const mockLoadGroups = loadGroups as jest.MockedFunction<typeof loadGroups>;
  const mockLoadMembers = loadMembers as jest.MockedFunction<typeof loadMembers>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAttendances.mockReturnValue([]);
    mockSaveAttendances.mockReturnValue(true);
    mockLoadGroups.mockReturnValue([]);
    mockLoadMembers.mockReturnValue([]);
  });

  describe('createAttendance', () => {
    it('有効な入力で新しい出欠情報を作成できる', () => {
      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: '◯' as const,
      };

      const attendance = createAttendance(input);

      expect(attendance).toMatchObject({
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: '◯',
      });
      expect(attendance.id).toBeDefined();
      expect(attendance.createdAt).toBeDefined();
      expect(mockSaveAttendances).toHaveBeenCalledWith([attendance]);
    });

    it('無効なステータスでエラーをスローする', () => {
      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: 'invalid' as any,
      };

      expect(() => createAttendance(input)).toThrow();
    });

    it('ストレージが失敗した場合はエラーをスローする', () => {
      mockSaveAttendances.mockReturnValue(false);

      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: '◯' as const,
      };

      expect(() => createAttendance(input)).toThrow();
    });
  });

  describe('getAttendancesByEventDateId', () => {
    it('特定のイベント日付の出欠情報を取得できる', () => {
      const mockAttendances: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          eventDateId: 'event2',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          eventDateId: 'event1',
          memberId: 'member3',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const attendances = getAttendancesByEventDateId('event1');

      expect(attendances).toHaveLength(2);
      expect(attendances[0].eventDateId).toBe('event1');
      expect(attendances[1].eventDateId).toBe('event1');
    });

    it('イベントに出欠情報が存在しない場合は空配列を返す', () => {
      mockLoadAttendances.mockReturnValue([]);

      const attendances = getAttendancesByEventDateId('event1');

      expect(attendances).toEqual([]);
    });
  });

  describe('getAttendancesByMemberId', () => {
    it('特定のメンバーの出欠情報を取得できる', () => {
      const mockAttendances: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          eventDateId: 'event2',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          eventDateId: 'event3',
          memberId: 'member1',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const attendances = getAttendancesByMemberId('member1');

      expect(attendances).toHaveLength(2);
      expect(attendances[0].memberId).toBe('member1');
      expect(attendances[1].memberId).toBe('member1');
    });
  });

  describe('updateAttendance', () => {
    it('既存の出欠ステータスを更新できる', () => {
      const existingAttendance: Attendance = {
        id: '00000000-0000-0000-0000-000000000001',
        eventDateId: '00000000-0000-0000-0000-000000000011',
        memberId: '00000000-0000-0000-0000-000000000022',
        status: '◯',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadAttendances.mockReturnValue([existingAttendance]);

      const updated = updateAttendance('00000000-0000-0000-0000-000000000001', {
        status: '△',
      });

      expect(updated).toMatchObject({
        id: '00000000-0000-0000-0000-000000000001',
        eventDateId: '00000000-0000-0000-0000-000000000011',
        memberId: '00000000-0000-0000-0000-000000000022',
        status: '△',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(mockSaveAttendances).toHaveBeenCalled();
    });

    it('出欠情報が見つからない場合はエラーをスローする', () => {
      mockLoadAttendances.mockReturnValue([]);

      expect(() =>
        updateAttendance('nonexistent', { status: '◯' })
      ).toThrow();
    });

    it('無効な更新データの場合はエラーをスローする', () => {
      const existingAttendance: Attendance = {
        id: '00000000-0000-0000-0000-000000000001',
        eventDateId: '00000000-0000-0000-0000-000000000011',
        memberId: '00000000-0000-0000-0000-000000000022',
        status: '◯',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadAttendances.mockReturnValue([existingAttendance]);

      expect(() =>
        updateAttendance('00000000-0000-0000-0000-000000000001', { status: 'invalid' as any })
      ).toThrow();
    });
  });

  describe('deleteAttendance', () => {
    it('既存の出欠情報を削除できる', () => {
      const attendances: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          eventDateId: 'event1',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(attendances);

      const result = deleteAttendance('1');

      expect(result).toBe(true);
      expect(mockSaveAttendances).toHaveBeenCalledWith([attendances[1]]);
    });

    it('出欠情報が見つからない場合はfalseを返す', () => {
      mockLoadAttendances.mockReturnValue([]);

      const result = deleteAttendance('nonexistent');

      expect(result).toBe(false);
      expect(mockSaveAttendances).not.toHaveBeenCalled();
    });
  });

  describe('calculateEventSummary', () => {
    it('グループごとの集計を正しく計算できる', () => {
      const mockGroups: Group[] = [
        {
          id: 'group1',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'group2',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockMembers: Member[] = [
        {
          id: 'member1',
          groupId: 'group1',
          name: 'Taro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'member2',
          groupId: 'group1',
          name: 'Jiro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'member3',
          groupId: 'group2',
          name: 'Hanako',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockAttendances: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          eventDateId: 'event1',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          eventDateId: 'event1',
          memberId: 'member3',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);
      mockLoadMembers.mockReturnValue(mockMembers);
      mockLoadAttendances.mockReturnValue(mockAttendances);

      const summaries = calculateEventSummary('event1');

      expect(summaries).toHaveLength(2);

      // Group 1 (打)
      expect(summaries[0]).toEqual({
        groupId: 'group1',
        groupName: '打',
        attending: 1,
        maybe: 1,
        notAttending: 0,
        total: 2,
      });

      // Group 2 (Cla)
      expect(summaries[1]).toEqual({
        groupId: 'group2',
        groupName: 'Cla',
        attending: 0,
        maybe: 0,
        notAttending: 1,
        total: 1,
      });
    });

    it('出欠情報が存在しない場合は空配列を返す', () => {
      mockLoadGroups.mockReturnValue([]);
      mockLoadMembers.mockReturnValue([]);
      mockLoadAttendances.mockReturnValue([]);

      const summaries = calculateEventSummary('event1');

      expect(summaries).toEqual([]);
    });

    it('出欠情報がないグループを除外する', () => {
      const mockGroups: Group[] = [
        {
          id: 'group1',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'group2',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockMembers: Member[] = [
        {
          id: 'member1',
          groupId: 'group1',
          name: 'Taro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockAttendances: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);
      mockLoadMembers.mockReturnValue(mockMembers);
      mockLoadAttendances.mockReturnValue(mockAttendances);

      const summaries = calculateEventSummary('event1');

      // Only group1 should be returned (group2 has no attendances)
      expect(summaries).toHaveLength(1);
      expect(summaries[0].groupId).toBe('group1');
    });
  });

  describe('calculateEventTotalSummary', () => {
    describe('基本シナリオの集計', () => {
      it('基本シナリオでイベント全体の集計を正しく計算できる', () => {
        const mockAttendances: Attendance[] = [
          {
            id: '1',
            eventDateId: 'event1',
            memberId: 'member1',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            eventDateId: 'event1',
            memberId: 'member2',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '3',
            eventDateId: 'event1',
            memberId: 'member3',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '4',
            eventDateId: 'event1',
            memberId: 'member4',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '5',
            eventDateId: 'event1',
            memberId: 'member5',
            status: '✗',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ];

        mockLoadAttendances.mockReturnValue(mockAttendances);

        const result = calculateEventTotalSummary('event1');

        expect(result).toEqual({
          totalAttending: 2,
          totalMaybe: 2,
          totalNotAttending: 1,
          totalResponded: 5,
        });
      });
    });

    describe('出欠登録なしの場合', () => {
      it('出欠情報が存在しない場合はすべて0を返す', () => {
        mockLoadAttendances.mockReturnValue([]);

        const result = calculateEventTotalSummary('event1');

        expect(result).toEqual({
          totalAttending: 0,
          totalMaybe: 0,
          totalNotAttending: 0,
          totalResponded: 0,
        });
      });
    });

    describe('メンバー重複カウント防止', () => {
      it('複数の出欠登録があっても各メンバーを1回のみカウントする', () => {
        // 同じメンバーが複数の出欠登録を持つ場合（将来的に複数グループに所属する可能性）
        const mockAttendances: Attendance[] = [
          {
            id: '1',
            eventDateId: 'event1',
            memberId: 'member1',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            eventDateId: 'event1',
            memberId: 'member1', // 同じメンバー
            status: '◯',
            createdAt: '2025-01-01T00:01:00.000Z',
          },
          {
            id: '3',
            eventDateId: 'event1',
            memberId: 'member2',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ];

        mockLoadAttendances.mockReturnValue(mockAttendances);

        const result = calculateEventTotalSummary('event1');

        // member1は2回登録されているが1回のみカウント
        expect(result).toEqual({
          totalAttending: 1,
          totalMaybe: 1,
          totalNotAttending: 0,
          totalResponded: 2,
        });
      });
    });
  });
});
