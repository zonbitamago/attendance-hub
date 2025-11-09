import { hasLegacyData, isMigrationCompleted, migrateToMultiTenant } from '@/lib/migration';

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

const MIGRATION_FLAG_KEY = 'attendance_migration_completed';

describe('Migration Module', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('hasLegacyData', () => {
    it('should return true when legacy event_dates key exists', () => {
      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should return true when legacy groups key exists', () => {
      localStorage.setItem(LEGACY_KEYS.GROUPS, '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should return true when legacy members key exists', () => {
      localStorage.setItem(LEGACY_KEYS.MEMBERS, '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should return true when legacy attendances key exists', () => {
      localStorage.setItem(LEGACY_KEYS.ATTENDANCES, '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should return true when multiple legacy keys exist', () => {
      localStorage.setItem(LEGACY_KEYS.EVENT_DATES, '[]');
      localStorage.setItem(LEGACY_KEYS.GROUPS, '[]');
      expect(hasLegacyData()).toBe(true);
    });

    it('should return false when no legacy keys exist', () => {
      expect(hasLegacyData()).toBe(false);
    });

    it('should return false when only new format keys exist', () => {
      localStorage.setItem('attendance_test-org_event_dates', '[]');
      localStorage.setItem('attendance_organizations', '[]');
      expect(hasLegacyData()).toBe(false);
    });
  });

  describe('isMigrationCompleted', () => {
    it('should return true when migration flag is set to "true"', () => {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      expect(isMigrationCompleted()).toBe(true);
    });

    it('should return false when migration flag is not set', () => {
      expect(isMigrationCompleted()).toBe(false);
    });

    it('should return false when migration flag is set to "false"', () => {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'false');
      expect(isMigrationCompleted()).toBe(false);
    });

    it('should return false when migration flag is empty string', () => {
      localStorage.setItem(MIGRATION_FLAG_KEY, '');
      expect(isMigrationCompleted()).toBe(false);
    });
  });

  describe('migrateToMultiTenant', () => {
    describe('when no legacy data exists', () => {
      it('should return migrated: false', () => {
        const result = migrateToMultiTenant();
        expect(result.migrated).toBe(false);
        expect(result.defaultOrgId).toBeUndefined();
      });

      it('should set migration completed flag', () => {
        migrateToMultiTenant();
        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe('true');
      });

      it('should not create any organization', () => {
        migrateToMultiTenant();
        const orgs = localStorage.getItem('attendance_organizations');
        expect(orgs).toBeNull();
      });
    });

    describe('when migration is already completed', () => {
      beforeEach(() => {
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        localStorage.setItem(LEGACY_KEYS.EVENT_DATES, '[]');
      });

      it('should return migrated: false and skip migration', () => {
        const result = migrateToMultiTenant();
        expect(result.migrated).toBe(false);
      });

      it('should not touch legacy data', () => {
        migrateToMultiTenant();
        expect(localStorage.getItem(LEGACY_KEYS.EVENT_DATES)).toBe('[]');
      });
    });

    describe('when legacy data exists', () => {
      beforeEach(() => {
        // レガシーデータをセットアップ
        localStorage.setItem(
          LEGACY_KEYS.EVENT_DATES,
          JSON.stringify([
            { id: 'event1', title: 'イベント1', date: '2025-01-10' },
            { id: 'event2', title: 'イベント2', date: '2025-01-15' },
          ])
        );
        localStorage.setItem(
          LEGACY_KEYS.GROUPS,
          JSON.stringify([
            { id: 'group1', name: 'グループA', order: 1, color: '#FF0000' },
            { id: 'group2', name: 'グループB', order: 2, color: '#00FF00' },
          ])
        );
        localStorage.setItem(
          LEGACY_KEYS.MEMBERS,
          JSON.stringify([
            { id: 'member1', name: 'メンバー1', groupId: 'group1' },
            { id: 'member2', name: 'メンバー2', groupId: 'group2' },
          ])
        );
        localStorage.setItem(
          LEGACY_KEYS.ATTENDANCES,
          JSON.stringify([
            { id: 'att1', eventDateId: 'event1', memberId: 'member1', status: '◯' },
            { id: 'att2', eventDateId: 'event2', memberId: 'member2', status: '✗' },
          ])
        );
      });

      it('should return migrated: true with defaultOrgId', () => {
        const result = migrateToMultiTenant();
        expect(result.migrated).toBe(true);
        expect(result.defaultOrgId).toBeDefined();
        expect(typeof result.defaultOrgId).toBe('string');
        expect(result.defaultOrgId!.length).toBeGreaterThan(0);
      });

      it('should create default organization with name "マイ団体"', () => {
        const result = migrateToMultiTenant();
        const orgs = JSON.parse(localStorage.getItem('attendance_organizations') || '[]');

        expect(orgs).toHaveLength(1);
        expect(orgs[0].id).toBe(result.defaultOrgId);
        expect(orgs[0].name).toBe('マイ団体');
        expect(orgs[0].description).toBe('既存データから自動作成された団体です');
        expect(orgs[0].createdAt).toBeDefined();
      });

      it('should migrate event dates with organizationId', () => {
        const result = migrateToMultiTenant();
        const events = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_event_dates`) || '[]'
        );

        expect(events).toHaveLength(2);
        expect(events[0].id).toBe('event1');
        expect(events[0].title).toBe('イベント1');
        expect(events[0].organizationId).toBe(result.defaultOrgId);
        expect(events[1].organizationId).toBe(result.defaultOrgId);
      });

      it('should migrate groups with organizationId', () => {
        const result = migrateToMultiTenant();
        const groups = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_groups`) || '[]'
        );

        expect(groups).toHaveLength(2);
        expect(groups[0].id).toBe('group1');
        expect(groups[0].name).toBe('グループA');
        expect(groups[0].organizationId).toBe(result.defaultOrgId);
        expect(groups[1].organizationId).toBe(result.defaultOrgId);
      });

      it('should migrate members with organizationId', () => {
        const result = migrateToMultiTenant();
        const members = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_members`) || '[]'
        );

        expect(members).toHaveLength(2);
        expect(members[0].id).toBe('member1');
        expect(members[0].name).toBe('メンバー1');
        expect(members[0].organizationId).toBe(result.defaultOrgId);
        expect(members[1].organizationId).toBe(result.defaultOrgId);
      });

      it('should migrate attendances with organizationId', () => {
        const result = migrateToMultiTenant();
        const attendances = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_attendances`) || '[]'
        );

        expect(attendances).toHaveLength(2);
        expect(attendances[0].id).toBe('att1');
        expect(attendances[0].eventDateId).toBe('event1');
        expect(attendances[0].organizationId).toBe(result.defaultOrgId);
        expect(attendances[1].organizationId).toBe(result.defaultOrgId);
      });

      it('should remove legacy keys after migration', () => {
        migrateToMultiTenant();

        expect(localStorage.getItem(LEGACY_KEYS.EVENT_DATES)).toBeNull();
        expect(localStorage.getItem(LEGACY_KEYS.GROUPS)).toBeNull();
        expect(localStorage.getItem(LEGACY_KEYS.MEMBERS)).toBeNull();
        expect(localStorage.getItem(LEGACY_KEYS.ATTENDANCES)).toBeNull();
      });

      it('should set migration completed flag', () => {
        migrateToMultiTenant();
        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBe('true');
      });
    });

    describe('when only some legacy data exists', () => {
      it('should migrate only events when only events exist', () => {
        localStorage.setItem(
          LEGACY_KEYS.EVENT_DATES,
          JSON.stringify([{ id: 'event1', title: 'イベント1', date: '2025-01-10' }])
        );

        const result = migrateToMultiTenant();

        const events = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_event_dates`) || '[]'
        );
        expect(events).toHaveLength(1);
        expect(events[0].organizationId).toBe(result.defaultOrgId);

        const groups = localStorage.getItem(`attendance_${result.defaultOrgId}_groups`);
        expect(groups).toBeNull();
      });

      it('should migrate only groups when only groups exist', () => {
        localStorage.setItem(
          LEGACY_KEYS.GROUPS,
          JSON.stringify([{ id: 'group1', name: 'グループA', order: 1, color: '#FF0000' }])
        );

        const result = migrateToMultiTenant();

        const groups = JSON.parse(
          localStorage.getItem(`attendance_${result.defaultOrgId}_groups`) || '[]'
        );
        expect(groups).toHaveLength(1);
        expect(groups[0].organizationId).toBe(result.defaultOrgId);
      });
    });

    describe('error handling', () => {
      it('should return error when migration fails', () => {
        // 不正なJSON形式でエラーを発生させる
        localStorage.setItem(LEGACY_KEYS.EVENT_DATES, 'invalid json');

        const result = migrateToMultiTenant();

        expect(result.migrated).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      });

      it('should not remove legacy data when migration fails', () => {
        localStorage.setItem(LEGACY_KEYS.EVENT_DATES, 'invalid json');

        migrateToMultiTenant();

        // レガシーデータは削除されない（ロールバック安全性）
        expect(localStorage.getItem(LEGACY_KEYS.EVENT_DATES)).toBe('invalid json');
      });

      it('should not set migration flag when migration fails', () => {
        localStorage.setItem(LEGACY_KEYS.EVENT_DATES, 'invalid json');

        migrateToMultiTenant();

        expect(localStorage.getItem(MIGRATION_FLAG_KEY)).toBeNull();
      });
    });
  });
});
