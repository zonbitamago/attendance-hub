import { migrateToMultiTenant, hasLegacyData, isMigrationCompleted } from '@/lib/migration';
import { getOrganizationById, getAllOrganizations } from '@/lib/organization-service';
import { getAllEventDates } from '@/lib/event-service';
import { getAllGroups } from '@/lib/group-service';
import { getAllMembers } from '@/lib/member-service';
import { getAllAttendances } from '@/lib/attendance-service';
import { clearAllData } from '@/lib/storage';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// レガシーキー定数
const LEGACY_KEYS = {
  EVENT_DATES: 'attendance_event_dates',
  GROUPS: 'attendance_groups',
  MEMBERS: 'attendance_members',
  ATTENDANCES: 'attendance_attendances',
} as const;

describe('Migration Integration Test', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    clearAllData();
  });

  describe('Complete Migration Workflow', () => {
    it('should migrate all legacy data types and create default organization', async () => {
      // レガシーデータをセットアップ（v1.0形式）
      const legacyEvents = [
        { id: 'evt1', title: '定期練習', date: '2025-01-10' },
        { id: 'evt2', title: '本番', date: '2025-01-20' },
        { id: 'evt3', title: '追加練習', date: '2025-01-15' },
      ];

      const legacyGroups = [
        { id: 'grp1', name: 'ボーカル', order: 1, color: '#FF0000' },
        { id: 'grp2', name: 'ギター', order: 2, color: '#00FF00' },
        { id: 'grp3', name: 'ドラム', order: 3, color: '#0000FF' },
      ];

      const legacyMembers = [
        { id: 'mem1', name: '田中太郎', groupId: 'grp1' },
        { id: 'mem2', name: '鈴木花子', groupId: 'grp1' },
        { id: 'mem3', name: '佐藤次郎', groupId: 'grp2' },
        { id: 'mem4', name: '高橋美咲', groupId: 'grp3' },
      ];

      const legacyAttendances = [
        { id: 'att1', eventDateId: 'evt1', memberId: 'mem1', status: '◯' },
        { id: 'att2', eventDateId: 'evt1', memberId: 'mem2', status: '△' },
        { id: 'att3', eventDateId: 'evt2', memberId: 'mem3', status: '✗' },
        { id: 'att4', eventDateId: 'evt3', memberId: 'mem4', status: '◯' },
      ];

      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, JSON.stringify(legacyEvents));
      localStorage.setItem(LEGACY_KEYS.GROUPS, JSON.stringify(legacyGroups));
      localStorage.setItem(LEGACY_KEYS.MEMBERS, JSON.stringify(legacyMembers));
      localStorage.setItem(LEGACY_KEYS.ATTENDANCES, JSON.stringify(legacyAttendances));

      // レガシーデータの存在を確認
      expect(hasLegacyData()).toBe(true);
      expect(isMigrationCompleted()).toBe(false);

      // マイグレーション実行
      const result = migrateToMultiTenant();

      // マイグレーション成功を確認
      expect(result.migrated).toBe(true);
      expect(result.defaultOrgId).toBeDefined();
      expect(result.error).toBeUndefined();

      const defaultOrgId = result.defaultOrgId!;

      // デフォルト団体が作成されたことを確認
      const orgs = await getAllOrganizations();
      expect(orgs).toHaveLength(1);
      expect(orgs[0].id).toBe(defaultOrgId);
      expect(orgs[0].name).toBe('マイ団体');
      expect(orgs[0].description).toBe('既存データから自動作成された団体です');

      const defaultOrg = await getOrganizationById(defaultOrgId);
      expect(defaultOrg).toBeDefined();
      expect(defaultOrg!.name).toBe('マイ団体');

      // イベントがマイグレーションされたことを確認
      const migratedEvents = await getAllEventDates(defaultOrgId);
      expect(migratedEvents).toHaveLength(3);
      expect(migratedEvents[0].id).toBe('evt1');
      expect(migratedEvents[0].title).toBe('定期練習');
      expect(migratedEvents[0].organizationId).toBe(defaultOrgId);
      expect(migratedEvents[1].organizationId).toBe(defaultOrgId);
      expect(migratedEvents[2].organizationId).toBe(defaultOrgId);

      // グループがマイグレーションされたことを確認
      const migratedGroups = await getAllGroups(defaultOrgId);
      expect(migratedGroups).toHaveLength(3);
      expect(migratedGroups[0].id).toBe('grp1');
      expect(migratedGroups[0].name).toBe('ボーカル');
      expect(migratedGroups[0].organizationId).toBe(defaultOrgId);
      expect(migratedGroups[1].organizationId).toBe(defaultOrgId);
      expect(migratedGroups[2].organizationId).toBe(defaultOrgId);

      // メンバーがマイグレーションされたことを確認
      const migratedMembers = await getAllMembers(defaultOrgId);
      expect(migratedMembers).toHaveLength(4);
      expect(migratedMembers[0].id).toBe('mem1');
      expect(migratedMembers[0].name).toBe('田中太郎');
      expect(migratedMembers[0].organizationId).toBe(defaultOrgId);
      expect(migratedMembers[1].organizationId).toBe(defaultOrgId);
      expect(migratedMembers[2].organizationId).toBe(defaultOrgId);
      expect(migratedMembers[3].organizationId).toBe(defaultOrgId);

      // 出欠記録がマイグレーションされたことを確認
      const migratedAttendances = await getAllAttendances(defaultOrgId);
      expect(migratedAttendances).toHaveLength(4);
      expect(migratedAttendances[0].id).toBe('att1');
      expect(migratedAttendances[0].eventDateId).toBe('evt1');
      expect(migratedAttendances[0].organizationId).toBe(defaultOrgId);
      expect(migratedAttendances[1].organizationId).toBe(defaultOrgId);
      expect(migratedAttendances[2].organizationId).toBe(defaultOrgId);
      expect(migratedAttendances[3].organizationId).toBe(defaultOrgId);

      // レガシーキーが削除されたことを確認
      expect(localStorage.getItem(LEGACY_KEYS.EVENT_DATES)).toBeNull();
      expect(localStorage.getItem(LEGACY_KEYS.GROUPS)).toBeNull();
      expect(localStorage.getItem(LEGACY_KEYS.MEMBERS)).toBeNull();
      expect(localStorage.getItem(LEGACY_KEYS.ATTENDANCES)).toBeNull();

      // マイグレーション完了フラグが設定されたことを確認
      expect(isMigrationCompleted()).toBe(true);

      // レガシーデータが存在しないことを確認
      expect(hasLegacyData()).toBe(false);
    });

    it('should not migrate data twice when called multiple times', async () => {
      // レガシーデータをセットアップ
      const legacyEvents = [{ id: 'evt1', title: 'イベント', date: '2025-01-10' }];
      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, JSON.stringify(legacyEvents));

      // 1回目のマイグレーション
      const result1 = migrateToMultiTenant();
      expect(result1.migrated).toBe(true);

      const firstOrgId = result1.defaultOrgId!;
      const orgsAfterFirst = await getAllOrganizations();
      expect(orgsAfterFirst).toHaveLength(1);

      // 2回目のマイグレーション
      const result2 = migrateToMultiTenant();
      expect(result2.migrated).toBe(false); // 既に完了しているのでスキップ

      const orgsAfterSecond = await getAllOrganizations();
      expect(orgsAfterSecond).toHaveLength(1); // 増えていない
      expect(orgsAfterSecond[0].id).toBe(firstOrgId); // 同じID
    });

    it('should handle migration with only partial legacy data', async () => {
      // イベントとグループのみ存在するケース
      const legacyEvents = [{ id: 'evt1', title: 'イベント', date: '2025-01-10' }];
      const legacyGroups = [{ id: 'grp1', name: 'グループA', order: 1, color: '#FF0000' }];

      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, JSON.stringify(legacyEvents));
      localStorage.setItem(LEGACY_KEYS.GROUPS, JSON.stringify(legacyGroups));

      // マイグレーション実行
      const result = migrateToMultiTenant();

      expect(result.migrated).toBe(true);
      const defaultOrgId = result.defaultOrgId!;

      // イベントとグループのみマイグレーションされる
      const events = await getAllEventDates(defaultOrgId);
      const groups = await getAllGroups(defaultOrgId);
      const members = await getAllMembers(defaultOrgId);
      const attendances = await getAllAttendances(defaultOrgId);

      expect(events).toHaveLength(1);
      expect(groups).toHaveLength(1);
      expect(members).toHaveLength(0);
      expect(attendances).toHaveLength(0);
    });

    it('should preserve data integrity across migration', async () => {
      // データの整合性を保つかテスト
      const legacyEvents = [
        { id: 'evt1', title: 'イベント1', date: '2025-01-10' },
        { id: 'evt2', title: 'イベント2', date: '2025-01-20' },
      ];
      const legacyGroups = [{ id: 'grp1', name: 'グループ', order: 1, color: '#FF0000' }];
      const legacyMembers = [
        { id: 'mem1', name: 'メンバー1', groupId: 'grp1' },
        { id: 'mem2', name: 'メンバー2', groupId: 'grp1' },
      ];
      const legacyAttendances = [
        { id: 'att1', eventDateId: 'evt1', memberId: 'mem1', status: '◯' },
        { id: 'att2', eventDateId: 'evt1', memberId: 'mem2', status: '△' },
        { id: 'att3', eventDateId: 'evt2', memberId: 'mem1', status: '✗' },
      ];

      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, JSON.stringify(legacyEvents));
      localStorage.setItem(LEGACY_KEYS.GROUPS, JSON.stringify(legacyGroups));
      localStorage.setItem(LEGACY_KEYS.MEMBERS, JSON.stringify(legacyMembers));
      localStorage.setItem(LEGACY_KEYS.ATTENDANCES, JSON.stringify(legacyAttendances));

      const result = migrateToMultiTenant();
      const orgId = result.defaultOrgId!;

      // データの参照整合性が保たれているか確認
      const members = await getAllMembers(orgId);
      const attendances = await getAllAttendances(orgId);

      // メンバーのgroupIdが保持されている
      expect(members[0].groupId).toBe('grp1');
      expect(members[1].groupId).toBe('grp1');

      // 出欠のeventDateIdとmemberIdが保持されている
      expect(attendances[0].eventDateId).toBe('evt1');
      expect(attendances[0].memberId).toBe('mem1');
      expect(attendances[1].eventDateId).toBe('evt1');
      expect(attendances[1].memberId).toBe('mem2');
      expect(attendances[2].eventDateId).toBe('evt2');
      expect(attendances[2].memberId).toBe('mem1');
    });
  });
});
