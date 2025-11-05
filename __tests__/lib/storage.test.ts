import {
  loadEventDates,
  saveEventDates,
  loadGroups,
  saveGroups,
  loadMembers,
  saveMembers,
  loadAttendances,
  saveAttendances,
} from '@/lib/storage';
import type { EventDate, Group, Member, Attendance } from '@/types';

describe('Storage utilities', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
  });

  describe('EventDates', () => {
    it('should load empty array when no event dates exist', () => {
      const events = loadEventDates();
      expect(events).toEqual([]);
    });

    it('should save and load event dates', () => {
      const testEvents: EventDate[] = [
        {
          id: '1',
          date: '2025-01-15',
          title: 'Event 1',
          location: 'Location 1',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          date: '2025-01-20',
          title: 'Event 2',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      const saved = saveEventDates(testEvents);
      expect(saved).toBe(true);

      const loaded = loadEventDates();
      expect(loaded).toEqual(testEvents);
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('attendance_event_dates', 'invalid json');
      const events = loadEventDates();
      expect(events).toEqual([]);
    });
  });

  describe('Groups', () => {
    it('should load empty array when no groups exist', () => {
      const groups = loadGroups();
      expect(groups).toEqual([]);
    });

    it('should save and load groups', () => {
      const testGroups: Group[] = [
        {
          id: '1',
          name: '打',
          order: 0,
          color: '#FF0000',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      const saved = saveGroups(testGroups);
      expect(saved).toBe(true);

      const loaded = loadGroups();
      expect(loaded).toEqual(testGroups);
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('attendance_groups', 'invalid json');
      const groups = loadGroups();
      expect(groups).toEqual([]);
    });

    it('should overwrite existing groups', () => {
      const groups1: Group[] = [
        {
          id: '1',
          name: 'Group 1',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const groups2: Group[] = [
        {
          id: '2',
          name: 'Group 2',
          order: 0,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveGroups(groups1);
      saveGroups(groups2);

      const loaded = loadGroups();
      expect(loaded).toEqual(groups2);
    });
  });

  describe('Members', () => {
    it('should load empty array when no members exist', () => {
      const members = loadMembers();
      expect(members).toEqual([]);
    });

    it('should save and load members', () => {
      const testMembers: Member[] = [
        {
          id: '1',
          groupId: 'group1',
          name: 'Taro',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          groupId: 'group1',
          name: 'Hanako',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      const saved = saveMembers(testMembers);
      expect(saved).toBe(true);

      const loaded = loadMembers();
      expect(loaded).toEqual(testMembers);
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('attendance_members', 'invalid json');
      const members = loadMembers();
      expect(members).toEqual([]);
    });
  });

  describe('Attendances', () => {
    it('should load empty array when no attendances exist', () => {
      const attendances = loadAttendances();
      expect(attendances).toEqual([]);
    });

    it('should save and load attendances', () => {
      const testAttendances: Attendance[] = [
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

      const saved = saveAttendances(testAttendances);
      expect(saved).toBe(true);

      const loaded = loadAttendances();
      expect(loaded).toEqual(testAttendances);
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('attendance_attendances', 'invalid json');
      const attendances = loadAttendances();
      expect(attendances).toEqual([]);
    });

    it('should overwrite existing attendances', () => {
      const attendances1: Attendance[] = [
        {
          id: '1',
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const attendances2: Attendance[] = [
        {
          id: '2',
          eventDateId: 'event2',
          memberId: 'member2',
          status: '✗',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveAttendances(attendances1);
      saveAttendances(attendances2);

      const loaded = loadAttendances();
      expect(loaded).toEqual(attendances2);
    });
  });

  describe('Data isolation', () => {
    it('should keep all data types separate', () => {
      const testEvent: EventDate = {
        id: '1',
        date: '2025-01-15',
        title: 'Test Event',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const testGroup: Group = {
        id: '1',
        name: 'Test Group',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const testMember: Member = {
        id: '1',
        groupId: '1',
        name: 'Test Member',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const testAttendance: Attendance = {
        id: '1',
        eventDateId: '1',
        memberId: '1',
        status: '◯',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      saveEventDates([testEvent]);
      saveGroups([testGroup]);
      saveMembers([testMember]);
      saveAttendances([testAttendance]);

      const events = loadEventDates();
      const groups = loadGroups();
      const members = loadMembers();
      const attendances = loadAttendances();

      expect(events).toHaveLength(1);
      expect(groups).toHaveLength(1);
      expect(members).toHaveLength(1);
      expect(attendances).toHaveLength(1);
      expect(events[0]).toEqual(testEvent);
      expect(groups[0]).toEqual(testGroup);
      expect(members[0]).toEqual(testMember);
      expect(attendances[0]).toEqual(testAttendance);
    });
  });
});
