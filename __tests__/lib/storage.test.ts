import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  loadOrganizations,
  saveOrganizations,
  loadEventDates,
  saveEventDates,
  loadGroups,
  saveGroups,
  loadMembers,
  saveMembers,
  loadAttendances,
  saveAttendances,
  clearOrganizationData,
  clearAllData,
} from '@/lib/storage';
import type { Organization, EventDate, Group, Member, Attendance } from '@/types';

describe('Storage utilities - Multi-tenant (v2.0)', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear();
  });

  describe('Organizations', () => {
    it('データが存在しない場合は空配列を返す', () => {
      const orgs = loadOrganizations();
      expect(orgs).toEqual([]);
    });

    it('組織を保存・読み込みできる', () => {
      const testOrgs: Organization[] = [
        {
          id: '1234567890',
          name: 'テスト団体1',
          description: '説明1',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'abcdefghij',
          name: 'テスト団体2',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      const saved = saveOrganizations(testOrgs);
      expect(saved).toBe(true);

      const loaded = loadOrganizations();
      expect(loaded).toEqual(testOrgs);
    });

    it('localStorageにattendance_organizationsキーで保存される', () => {
      const testOrgs: Organization[] = [
        {
          id: '1234567890',
          name: 'テスト団体',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      saveOrganizations(testOrgs);

      const raw = localStorage.getItem('attendance_organizations');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(testOrgs);
    });
  });

  describe('EventDates - organization-scoped', () => {
    const orgId1 = '1234567890';
    const orgId2 = 'abcdefghij';

    it('組織IDをパラメータとして受け取る', () => {
      const events = loadEventDates(orgId1);
      expect(events).toEqual([]);
    });

    it('組織ごとにデータを分離して保存できる', () => {
      const eventsOrg1: EventDate[] = [
        {
          id: 'event1',
          organizationId: orgId1,
          date: '2025-01-15',
          title: 'Org1 Event',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const eventsOrg2: EventDate[] = [
        {
          id: 'event2',
          organizationId: orgId2,
          date: '2025-01-20',
          title: 'Org2 Event',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveEventDates(orgId1, eventsOrg1);
      saveEventDates(orgId2, eventsOrg2);

      const loadedOrg1 = loadEventDates(orgId1);
      const loadedOrg2 = loadEventDates(orgId2);

      expect(loadedOrg1).toEqual(eventsOrg1);
      expect(loadedOrg2).toEqual(eventsOrg2);
    });

    it('localStorageにattendance_{orgId}_event_datesキーで保存される', () => {
      const events: EventDate[] = [
        {
          id: 'event1',
          organizationId: orgId1,
          date: '2025-01-15',
          title: 'Test Event',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      saveEventDates(orgId1, events);

      const raw = localStorage.getItem(`attendance_${orgId1}_event_dates`);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(events);
    });
  });

  describe('Groups - organization-scoped', () => {
    const orgId1 = '1234567890';
    const orgId2 = 'abcdefghij';

    it('組織ごとにデータを分離して保存できる', () => {
      const groupsOrg1: Group[] = [
        {
          id: 'group1',
          organizationId: orgId1,
          name: 'Org1 Group',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const groupsOrg2: Group[] = [
        {
          id: 'group2',
          organizationId: orgId2,
          name: 'Org2 Group',
          order: 0,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveGroups(orgId1, groupsOrg1);
      saveGroups(orgId2, groupsOrg2);

      const loadedOrg1 = loadGroups(orgId1);
      const loadedOrg2 = loadGroups(orgId2);

      expect(loadedOrg1).toEqual(groupsOrg1);
      expect(loadedOrg2).toEqual(groupsOrg2);
    });

    it('localStorageにattendance_{orgId}_groupsキーで保存される', () => {
      const groups: Group[] = [
        {
          id: 'group1',
          organizationId: orgId1,
          name: 'Test Group',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      saveGroups(orgId1, groups);

      const raw = localStorage.getItem(`attendance_${orgId1}_groups`);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(groups);
    });
  });

  describe('Members - organization-scoped', () => {
    const orgId1 = '1234567890';
    const orgId2 = 'abcdefghij';

    it('組織ごとにデータを分離して保存できる', () => {
      const membersOrg1: Member[] = [
        {
          id: 'member1',
          organizationId: orgId1,
          groupId: 'group1',
          name: 'Org1 Member',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const membersOrg2: Member[] = [
        {
          id: 'member2',
          organizationId: orgId2,
          groupId: 'group2',
          name: 'Org2 Member',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveMembers(orgId1, membersOrg1);
      saveMembers(orgId2, membersOrg2);

      const loadedOrg1 = loadMembers(orgId1);
      const loadedOrg2 = loadMembers(orgId2);

      expect(loadedOrg1).toEqual(membersOrg1);
      expect(loadedOrg2).toEqual(membersOrg2);
    });

    it('localStorageにattendance_{orgId}_membersキーで保存される', () => {
      const members: Member[] = [
        {
          id: 'member1',
          organizationId: orgId1,
          groupId: 'group1',
          name: 'Test Member',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      saveMembers(orgId1, members);

      const raw = localStorage.getItem(`attendance_${orgId1}_members`);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(members);
    });
  });

  describe('Attendances - organization-scoped', () => {
    const orgId1 = '1234567890';
    const orgId2 = 'abcdefghij';

    it('組織ごとにデータを分離して保存できる', () => {
      const attendancesOrg1: Attendance[] = [
        {
          id: 'attendance1',
          organizationId: orgId1,
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const attendancesOrg2: Attendance[] = [
        {
          id: 'attendance2',
          organizationId: orgId2,
          eventDateId: 'event2',
          memberId: 'member2',
          status: '△',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      saveAttendances(orgId1, attendancesOrg1);
      saveAttendances(orgId2, attendancesOrg2);

      const loadedOrg1 = loadAttendances(orgId1);
      const loadedOrg2 = loadAttendances(orgId2);

      expect(loadedOrg1).toEqual(attendancesOrg1);
      expect(loadedOrg2).toEqual(attendancesOrg2);
    });

    it('localStorageにattendance_{orgId}_attendancesキーで保存される', () => {
      const attendances: Attendance[] = [
        {
          id: 'attendance1',
          organizationId: orgId1,
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      saveAttendances(orgId1, attendances);

      const raw = localStorage.getItem(`attendance_${orgId1}_attendances`);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(attendances);
    });
  });

  describe('clearOrganizationData', () => {
    const orgId1 = '1234567890';
    const orgId2 = 'abcdefghij';

    it('指定した組織のすべてのデータを削除する', () => {
      // orgId1のデータを保存
      saveEventDates(orgId1, [
        {
          id: 'event1',
          organizationId: orgId1,
          date: '2025-01-15',
          title: 'Event',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveGroups(orgId1, [
        {
          id: 'group1',
          organizationId: orgId1,
          name: 'Group',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveMembers(orgId1, [
        {
          id: 'member1',
          organizationId: orgId1,
          groupId: 'group1',
          name: 'Member',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveAttendances(orgId1, [
        {
          id: 'attendance1',
          organizationId: orgId1,
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);

      // orgId2のデータを保存
      saveEventDates(orgId2, [
        {
          id: 'event2',
          organizationId: orgId2,
          date: '2025-01-20',
          title: 'Event2',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ]);

      // orgId1のデータを削除
      clearOrganizationData(orgId1);

      // orgId1のデータが空になっていることを確認
      expect(loadEventDates(orgId1)).toEqual([]);
      expect(loadGroups(orgId1)).toEqual([]);
      expect(loadMembers(orgId1)).toEqual([]);
      expect(loadAttendances(orgId1)).toEqual([]);

      // orgId2のデータは残っていることを確認
      expect(loadEventDates(orgId2)).toHaveLength(1);
    });
  });

  describe('clearAllData', () => {
    it('すべてのattendance-hubデータを削除する', () => {
      const orgId1 = '1234567890';

      // 複数のデータを保存
      saveOrganizations([
        {
          id: orgId1,
          name: 'Test Org',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveEventDates(orgId1, [
        {
          id: 'event1',
          organizationId: orgId1,
          date: '2025-01-15',
          title: 'Event',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveGroups(orgId1, [
        {
          id: 'group1',
          organizationId: orgId1,
          name: 'Group',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);

      // 他のキーも保存（attendance_以外）
      localStorage.setItem('other_key', 'should not be deleted');

      // すべてのattendance-hubデータを削除
      clearAllData();

      // attendance-hubのデータがすべて削除されていることを確認
      expect(loadOrganizations()).toEqual([]);
      expect(loadEventDates(orgId1)).toEqual([]);
      expect(loadGroups(orgId1)).toEqual([]);

      // 他のキーは残っていることを確認
      expect(localStorage.getItem('other_key')).toBe('should not be deleted');
    });

    it('attendance_で始まるすべてのキーを削除する', () => {
      // attendance_で始まる複数のキーを作成
      localStorage.setItem('attendance_organizations', '[]');
      localStorage.setItem('attendance_1234567890_event_dates', '[]');
      localStorage.setItem('attendance_abcdefghij_groups', '[]');
      localStorage.setItem('other_key', 'keep this');

      clearAllData();

      // attendance_で始まるキーがすべて削除されている
      expect(localStorage.getItem('attendance_organizations')).toBeNull();
      expect(localStorage.getItem('attendance_1234567890_event_dates')).toBeNull();
      expect(localStorage.getItem('attendance_abcdefghij_groups')).toBeNull();

      // other_keyは残っている
      expect(localStorage.getItem('other_key')).toBe('keep this');
    });
  });

  describe('Data isolation', () => {
    it('異なる組織のデータが完全に分離されている', () => {
      const orgId1 = '1234567890';
      const orgId2 = 'abcdefghij';

      // orgId1のデータ
      saveEventDates(orgId1, [
        {
          id: 'event1',
          organizationId: orgId1,
          date: '2025-01-15',
          title: 'Org1 Event',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveGroups(orgId1, [
        {
          id: 'group1',
          organizationId: orgId1,
          name: 'Org1 Group',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveMembers(orgId1, [
        {
          id: 'member1',
          organizationId: orgId1,
          groupId: 'group1',
          name: 'Org1 Member',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      saveAttendances(orgId1, [
        {
          id: 'attendance1',
          organizationId: orgId1,
          eventDateId: 'event1',
          memberId: 'member1',
          status: '◯',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);

      // orgId2のデータ
      saveEventDates(orgId2, [
        {
          id: 'event2',
          organizationId: orgId2,
          date: '2025-01-20',
          title: 'Org2 Event',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ]);
      saveGroups(orgId2, [
        {
          id: 'group2',
          organizationId: orgId2,
          name: 'Org2 Group',
          order: 0,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ]);

      // orgId1のデータを読み込み
      const eventsOrg1 = loadEventDates(orgId1);
      const groupsOrg1 = loadGroups(orgId1);
      const membersOrg1 = loadMembers(orgId1);
      const attendancesOrg1 = loadAttendances(orgId1);

      // orgId2のデータを読み込み
      const eventsOrg2 = loadEventDates(orgId2);
      const groupsOrg2 = loadGroups(orgId2);
      const membersOrg2 = loadMembers(orgId2);
      const attendancesOrg2 = loadAttendances(orgId2);

      // orgId1のデータが正しい
      expect(eventsOrg1).toHaveLength(1);
      expect(eventsOrg1[0].title).toBe('Org1 Event');
      expect(groupsOrg1).toHaveLength(1);
      expect(groupsOrg1[0].name).toBe('Org1 Group');
      expect(membersOrg1).toHaveLength(1);
      expect(attendancesOrg1).toHaveLength(1);

      // orgId2のデータが正しい
      expect(eventsOrg2).toHaveLength(1);
      expect(eventsOrg2[0].title).toBe('Org2 Event');
      expect(groupsOrg2).toHaveLength(1);
      expect(groupsOrg2[0].name).toBe('Org2 Group');
      expect(membersOrg2).toHaveLength(0); // orgId2にはメンバーを追加していない
      expect(attendancesOrg2).toHaveLength(0);
    });
  });

  describe('SSR compatibility', () => {
    // Note: このテストはNode.js環境で実行されるため、windowは常に定義されている
    // SSR対応の実際のテストは、別の環境で行う必要がある
    it('localStorageが利用可能な環境で動作する', () => {
      const orgs = loadOrganizations();
      expect(orgs).toEqual([]);

      const saved = saveOrganizations([
        {
          id: '1234567890',
          name: 'Test',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
      expect(saved).toBe(true);
    });
  });
});
