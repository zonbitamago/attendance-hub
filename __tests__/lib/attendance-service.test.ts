import {
  createAttendance,
  getAttendancesByEventDateId,
  getAttendancesByMemberId,
  updateAttendance,
  deleteAttendance,
  calculateEventSummary,
  calculateEventTotalSummary,
  upsertAttendance,
  upsertBulkAttendances,
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

      const attendance = createAttendance('test-org-id', input);

      expect(attendance).toMatchObject({
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: '◯',
      });
      expect(attendance.id).toBeDefined();
      expect(attendance.createdAt).toBeDefined();
      expect(mockSaveAttendances).toHaveBeenCalledWith('test-org-id', [attendance]);
    });

    it('無効なステータスでエラーをスローする', () => {
      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: 'invalid' as any,
      };

      expect(() => createAttendance('test-org-id', input)).toThrow();
    });

    it('ストレージが失敗した場合はエラーをスローする', () => {
      mockSaveAttendances.mockReturnValue(false);

      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: '◯' as const,
      };

      expect(() => createAttendance('test-org-id', input)).toThrow();
    });
  });

  describe('getAttendancesByEventDateId', () => {
    it('特定のイベント日付の出欠情報を取得できる', () => {
      const mockAttendances: Attendance[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          eventDateId: 'event2',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member3',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const attendances = getAttendancesByEventDateId('test-org-id', 'event1');

      expect(attendances).toHaveLength(2);
      expect(attendances[0].eventDateId).toBe('event1');
      expect(attendances[1].eventDateId).toBe('event1');
    });

    it('イベントに出欠情報が存在しない場合は空配列を返す', () => {
      mockLoadAttendances.mockReturnValue([]);

      const attendances = getAttendancesByEventDateId('test-org-id', 'event1');

      expect(attendances).toEqual([]);
    });
  });

  describe('getAttendancesByMemberId', () => {
    it('特定のメンバーの出欠情報を取得できる', () => {
      const mockAttendances: Attendance[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          eventDateId: 'event2',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          organizationId: 'test-org-id',
          eventDateId: 'event3',
          memberId: 'member1',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const attendances = getAttendancesByMemberId('test-org-id', 'member1');

      expect(attendances).toHaveLength(2);
      expect(attendances[0].memberId).toBe('member1');
      expect(attendances[1].memberId).toBe('member1');
    });
  });

  describe('updateAttendance', () => {
    it('既存の出欠ステータスを更新できる', () => {
      const existingAttendance: Attendance = {
        id: '00000000-0000-0000-0000-000000000001',
        organizationId: 'test-org-id',
        eventDateId: '00000000-0000-0000-0000-000000000011',
        memberId: '00000000-0000-0000-0000-000000000022',
        status: '◯',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadAttendances.mockReturnValue([existingAttendance]);

      const updated = updateAttendance('test-org-id', '00000000-0000-0000-0000-000000000001', {
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
        updateAttendance('test-org-id', 'nonexistent', { status: '◯' })
      ).toThrow();
    });

    it('無効な更新データの場合はエラーをスローする', () => {
      const existingAttendance: Attendance = {
        id: '00000000-0000-0000-0000-000000000001',
        organizationId: 'test-org-id',
        eventDateId: '00000000-0000-0000-0000-000000000011',
        memberId: '00000000-0000-0000-0000-000000000022',
        status: '◯',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadAttendances.mockReturnValue([existingAttendance]);

      expect(() =>
        updateAttendance('test-org-id', '00000000-0000-0000-0000-000000000001', { status: 'invalid' as any })
      ).toThrow();
    });
  });

  describe('deleteAttendance', () => {
    it('既存の出欠情報を削除できる', () => {
      const attendances: Attendance[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(attendances);

      const result = deleteAttendance('test-org-id', '1');

      expect(result).toBe(true);
      expect(mockSaveAttendances).toHaveBeenCalledWith('test-org-id', [attendances[1]]);
    });

    it('出欠情報が見つからない場合はfalseを返す', () => {
      mockLoadAttendances.mockReturnValue([]);

      const result = deleteAttendance('test-org-id', 'nonexistent');

      expect(result).toBe(false);
      expect(mockSaveAttendances).not.toHaveBeenCalled();
    });
  });

  describe('calculateEventSummary', () => {
    it('グループごとの集計を正しく計算できる', () => {
      const mockGroups: Group[] = [
        {
          id: 'group1',
          organizationId: 'test-org-id',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'group2',
          organizationId: 'test-org-id',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockMembers: Member[] = [
        {
          id: 'member1',
          organizationId: 'test-org-id',
          groupId: 'group1',
          name: 'Taro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'member2',
          organizationId: 'test-org-id',
          groupId: 'group1',
          name: 'Jiro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'member3',
          organizationId: 'test-org-id',
          groupId: 'group2',
          name: 'Hanako',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockAttendances: Attendance[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member3',
          status: '✗',
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);
      mockLoadMembers.mockReturnValue(mockMembers);
      mockLoadAttendances.mockReturnValue(mockAttendances);

      const summaries = calculateEventSummary('test-org-id', 'event1');

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

      const summaries = calculateEventSummary('test-org-id', 'event1');

      expect(summaries).toEqual([]);
    });

    it('出欠情報がないグループを除外する', () => {
      const mockGroups: Group[] = [
        {
          id: 'group1',
          organizationId: 'test-org-id',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'group2',
          organizationId: 'test-org-id',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockMembers: Member[] = [
        {
          id: 'member1',
          organizationId: 'test-org-id',
          groupId: 'group1',
          name: 'Taro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const mockAttendances: Attendance[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);
      mockLoadMembers.mockReturnValue(mockMembers);
      mockLoadAttendances.mockReturnValue(mockAttendances);

      const summaries = calculateEventSummary('test-org-id', 'event1');

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
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member1',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member2',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '3',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member3',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '4',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member4',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '5',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member5',
            status: '✗',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ];

        mockLoadAttendances.mockReturnValue(mockAttendances);

        const result = calculateEventTotalSummary('test-org-id', 'event1');

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

        const result = calculateEventTotalSummary('test-org-id', 'event1');

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
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member1',
            status: '◯',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member1', // 同じメンバー
            status: '◯',
            createdAt: '2025-01-01T00:01:00.000Z',
          },
          {
            id: '3',
            organizationId: 'test-org-id',
            eventDateId: 'event1',
            memberId: 'member2',
            status: '△',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ];

        mockLoadAttendances.mockReturnValue(mockAttendances);

        const result = calculateEventTotalSummary('test-org-id', 'event1');

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

  // User Story 1: 複数イベント一括出欠登録
  describe('upsertAttendance', () => {
    describe('Test Case 1: 新規レコードを作成する', () => {
      it('既存レコードがない場合、新規レコードを作成する', () => {
        const eventDateId = '550e8400-e29b-41d4-a716-446655440001';
        const memberId = '550e8400-e29b-41d4-a716-446655440002';

        const input = {
          eventDateId,
          memberId,
          status: '◯' as const,
        };

        mockLoadAttendances.mockReturnValue([]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertAttendance('test-org-id', input);

        expect(result).toMatchObject({
          eventDateId,
          memberId,
          status: '◯',
        });
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(mockSaveAttendances).toHaveBeenCalled();
      });
    });

    describe('Test Case 2: 既存レコードを更新する', () => {
      it('既存レコードがある場合、ステータスのみを更新する', () => {
        const eventDateId = '550e8400-e29b-41d4-a716-446655440001';
        const memberId = '550e8400-e29b-41d4-a716-446655440002';
        const existingAttendanceId = '550e8400-e29b-41d4-a716-446655440003';

        const existingAttendance: Attendance = {
          id: existingAttendanceId,
          organizationId: 'test-org-id',
          eventDateId,
          memberId,
          status: '◯',
          createdAt: '2025-01-15T10:00:00Z',
        };

        const input = {
          eventDateId,
          memberId,
          status: '✗' as const,
        };

        mockLoadAttendances.mockReturnValue([existingAttendance]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertAttendance('test-org-id', input);

        expect(result).toMatchObject({
          id: existingAttendanceId,
          eventDateId,
          memberId,
          status: '✗',
          createdAt: '2025-01-15T10:00:00Z',
        });
        expect(mockSaveAttendances).toHaveBeenCalled();
      });
    });

    describe('Test Case 3: 重複レコードを処理する', () => {
      it('重複レコードがある場合、最新のものを保持し古いものを削除する', () => {
        const eventDateId = '550e8400-e29b-41d4-a716-446655440001';
        const memberId = '550e8400-e29b-41d4-a716-446655440002';

        // 重複レコード（同じeventDateId + memberId）
        const olderDuplicate: Attendance = {
          id: '550e8400-e29b-41d4-a716-446655440003',
          organizationId: 'test-org-id',
          eventDateId,
          memberId,
          status: '◯',
          createdAt: '2025-01-15T10:00:00Z',
        };

        const newerDuplicate: Attendance = {
          id: '550e8400-e29b-41d4-a716-446655440004',
          organizationId: 'test-org-id',
          eventDateId,
          memberId,
          status: '△',
          createdAt: '2025-01-15T11:00:00Z',
        };

        const input = {
          eventDateId,
          memberId,
          status: '✗' as const,
        };

        mockLoadAttendances.mockReturnValue([olderDuplicate, newerDuplicate]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertAttendance('test-org-id', input);

        // 最新のレコード（newerDuplicate）が更新される
        expect(result).toMatchObject({
          id: newerDuplicate.id,
          eventDateId,
          memberId,
          status: '✗',
          createdAt: newerDuplicate.createdAt,
        });

        // saveAttendancesが呼ばれたときの引数を検証
        expect(mockSaveAttendances).toHaveBeenCalled();
        const savedAttendances = mockSaveAttendances.mock.calls[0][1];

        // 保存されたレコードに重複がないことを確認
        const duplicates = savedAttendances.filter(
          (a: Attendance) => a.eventDateId === eventDateId && a.memberId === memberId
        );
        expect(duplicates).toHaveLength(1);
        expect(duplicates[0].id).toBe(newerDuplicate.id);
      });
    });
  });

  // 一括登録機能のテスト
  describe('upsertBulkAttendances', () => {
    describe('Test Case 1: すべて新規レコードを作成', () => {
      it('すべての入力が新規レコードの場合、すべてsuccessに格納される', () => {
        const inputs = [
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440001',
            memberId: '550e8400-e29b-41d4-a716-446655440010',
            status: '◯' as const,
          },
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440002',
            memberId: '550e8400-e29b-41d4-a716-446655440011',
            status: '△' as const,
          },
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440003',
            memberId: '550e8400-e29b-41d4-a716-446655440012',
            status: '✗' as const,
          },
        ];

        mockLoadAttendances.mockReturnValue([]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertBulkAttendances('test-org-id', inputs);

        expect(result.success).toHaveLength(3);
        expect(result.updated).toHaveLength(0);
        expect(result.failed).toHaveLength(0);

        expect(result.success[0]).toMatchObject({
          eventDateId: inputs[0].eventDateId,
          memberId: inputs[0].memberId,
          status: '◯',
        });
        expect(result.success[1]).toMatchObject({
          eventDateId: inputs[1].eventDateId,
          memberId: inputs[1].memberId,
          status: '△',
        });
        expect(result.success[2]).toMatchObject({
          eventDateId: inputs[2].eventDateId,
          memberId: inputs[2].memberId,
          status: '✗',
        });

        // localStorageへの読み書きは1回ずつのみ
        expect(mockLoadAttendances).toHaveBeenCalledTimes(1);
        expect(mockSaveAttendances).toHaveBeenCalledTimes(1);
      });
    });

    describe('Test Case 2: 新規と既存が混在', () => {
      it('新規レコードはsuccessに、既存レコードはupdatedに格納される', () => {
        const existingAttendance: Attendance = {
          id: '550e8400-e29b-41d4-a716-446655440020',
          organizationId: 'test-org-id',
          eventDateId: '550e8400-e29b-41d4-a716-446655440001',
          memberId: '550e8400-e29b-41d4-a716-446655440010',
          status: '◯',
          createdAt: '2025-01-15T10:00:00Z',
        };

        const inputs = [
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440001',
            memberId: '550e8400-e29b-41d4-a716-446655440010',
            status: '△' as const, // 既存レコードを更新
          },
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440002',
            memberId: '550e8400-e29b-41d4-a716-446655440011',
            status: '◯' as const, // 新規レコード
          },
        ];

        mockLoadAttendances.mockReturnValue([existingAttendance]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertBulkAttendances('test-org-id', inputs);

        expect(result.success).toHaveLength(1);
        expect(result.updated).toHaveLength(1);
        expect(result.failed).toHaveLength(0);

        // 更新されたレコードはIDとcreatedAtが保持される
        expect(result.updated[0]).toMatchObject({
          id: existingAttendance.id,
          eventDateId: inputs[0].eventDateId,
          memberId: inputs[0].memberId,
          status: '△',
          createdAt: existingAttendance.createdAt,
        });

        // 新規レコード
        expect(result.success[0]).toMatchObject({
          eventDateId: inputs[1].eventDateId,
          memberId: inputs[1].memberId,
          status: '◯',
        });

        expect(mockLoadAttendances).toHaveBeenCalledTimes(1);
        expect(mockSaveAttendances).toHaveBeenCalledTimes(1);
      });
    });

    describe('Test Case 3: バリデーションエラー時の部分的失敗', () => {
      it('無効な入力があっても他の有効な入力は処理される', () => {
        const inputs = [
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440001',
            memberId: '550e8400-e29b-41d4-a716-446655440010',
            status: '◯' as const,
          },
          {
            eventDateId: 'invalid-uuid',
            memberId: '550e8400-e29b-41d4-a716-446655440011',
            status: '△' as const,
          },
          {
            eventDateId: '550e8400-e29b-41d4-a716-446655440003',
            memberId: '550e8400-e29b-41d4-a716-446655440012',
            status: '✗' as const,
          },
        ];

        mockLoadAttendances.mockReturnValue([]);
        mockSaveAttendances.mockReturnValue(true);

        const result = upsertBulkAttendances('test-org-id', inputs);

        expect(result.success).toHaveLength(2);
        expect(result.updated).toHaveLength(0);
        expect(result.failed).toHaveLength(1);

        expect(result.failed[0].input).toEqual(inputs[1]);
        expect(result.failed[0].error).toBeDefined();
      });
    });

    describe('Test Case 4: 空配列の処理', () => {
      it('空配列の場合、すべて0件として処理される', () => {
        mockLoadAttendances.mockReturnValue([]);

        const result = upsertBulkAttendances('test-org-id', []);

        expect(result.success).toHaveLength(0);
        expect(result.updated).toHaveLength(0);
        expect(result.failed).toHaveLength(0);

        // 空配列の場合は読み込みは行うが、保存は不要
        expect(mockLoadAttendances).toHaveBeenCalledTimes(1);
        expect(mockSaveAttendances).not.toHaveBeenCalled();
      });
    });
  });
});
