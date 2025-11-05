import {
  createAttendance,
  getAttendancesByEventDateId,
  getAttendancesByMemberId,
  updateAttendance,
  deleteAttendance,
  calculateEventSummary,
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
    it('should create a new attendance with valid input', () => {
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

    it('should throw error for invalid status', () => {
      const input = {
        eventDateId: '00000000-0000-0000-0000-000000000001',
        memberId: '00000000-0000-0000-0000-000000000002',
        status: 'invalid' as any,
      };

      expect(() => createAttendance(input)).toThrow();
    });

    it('should throw error when storage fails', () => {
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
    it('should return attendances for a specific event date', () => {
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

    it('should return empty array when no attendances exist for event', () => {
      mockLoadAttendances.mockReturnValue([]);

      const attendances = getAttendancesByEventDateId('event1');

      expect(attendances).toEqual([]);
    });
  });

  describe('getAttendancesByMemberId', () => {
    it('should return attendances for a specific member', () => {
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
    it('should update existing attendance status', () => {
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

    it('should throw error when attendance not found', () => {
      mockLoadAttendances.mockReturnValue([]);

      expect(() =>
        updateAttendance('nonexistent', { status: '◯' })
      ).toThrow();
    });

    it('should throw error for invalid update data', () => {
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
    it('should delete existing attendance', () => {
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

    it('should return false when attendance not found', () => {
      mockLoadAttendances.mockReturnValue([]);

      const result = deleteAttendance('nonexistent');

      expect(result).toBe(false);
      expect(mockSaveAttendances).not.toHaveBeenCalled();
    });
  });

  describe('calculateEventSummary', () => {
    it('should calculate correct summary by group', () => {
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

    it('should return empty array when no attendances exist', () => {
      mockLoadGroups.mockReturnValue([]);
      mockLoadMembers.mockReturnValue([]);
      mockLoadAttendances.mockReturnValue([]);

      const summaries = calculateEventSummary('event1');

      expect(summaries).toEqual([]);
    });

    it('should filter out groups with no attendances', () => {
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
});
