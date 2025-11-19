/**
 * 統合ストレージ層のテスト
 */

// 環境変数をモック
const originalEnv = { ...process.env };

beforeEach(() => {
  jest.resetModules();
  // 環境変数をリセット
  process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  // デフォルトはlocalStorageモード
  process.env.NEXT_PUBLIC_USE_SUPABASE = undefined;
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
});

afterEach(() => {
  process.env = originalEnv as NodeJS.ProcessEnv;
  // localStorageをクリア
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
});

describe('getStorageMode', () => {
  it('デフォルトでlocalStorageモードを返す', async () => {
    const { getStorageMode } = await import('@/lib/unified-storage');
    expect(getStorageMode()).toBe('localStorage');
  });

  it('NEXT_PUBLIC_USE_SUPABASE=trueの場合はsupabaseモードを返す', async () => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'true';
    const { getStorageMode } = await import('@/lib/unified-storage');
    expect(getStorageMode()).toBe('supabase');
  });

  it('NODE_ENV=productionの場合はsupabaseモードを強制', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const { getStorageMode } = await import('@/lib/unified-storage');
    expect(getStorageMode()).toBe('supabase');
  });

  it('NODE_ENV=productionの場合、NEXT_PUBLIC_USE_SUPABASE=falseでもsupabaseを使用', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
    const { getStorageMode } = await import('@/lib/unified-storage');
    expect(getStorageMode()).toBe('supabase');
  });
});

describe('Organization操作（localStorageモード）', () => {
  beforeEach(() => {
    // localStorageモードを強制
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('loadAllOrganizationsが空配列を返す（初期状態）', async () => {
    const { loadAllOrganizations } = await import('@/lib/unified-storage');
    const result = await loadAllOrganizations();
    expect(result).toEqual([]);
  });

  it('saveOrganizationとloadOrganizationが正しく動作する', async () => {
    const { saveOrganization, loadOrganization } = await import('@/lib/unified-storage');

    const org = {
      id: 'test-org-1',
      name: 'Test Organization',
      description: 'Test description',
      createdAt: new Date().toISOString(),
    };

    const saved = await saveOrganization(org);
    expect(saved).toBe(true);

    const loaded = await loadOrganization('test-org-1');
    expect(loaded).toEqual(org);
  });

  it('存在しない団体を読み込むとnullを返す', async () => {
    const { loadOrganization } = await import('@/lib/unified-storage');
    const result = await loadOrganization('non-existent');
    expect(result).toBeNull();
  });

  it('loadAllOrganizationsが保存された団体を返す', async () => {
    const { saveOrganization, loadAllOrganizations } = await import('@/lib/unified-storage');

    const org1 = {
      id: 'test-org-1',
      name: 'Test Organization 1',
      description: 'Description 1',
      createdAt: new Date().toISOString(),
    };
    const org2 = {
      id: 'test-org-2',
      name: 'Test Organization 2',
      description: 'Description 2',
      createdAt: new Date().toISOString(),
    };

    await saveOrganization(org1);
    await saveOrganization(org2);

    const result = await loadAllOrganizations();
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(org1);
    expect(result).toContainEqual(org2);
  });

  it('deleteOrganizationが正しく動作する', async () => {
    const { saveOrganization, deleteOrganization, loadOrganization } = await import('@/lib/unified-storage');

    const org = {
      id: 'test-org-delete',
      name: 'To Delete',
      description: 'Will be deleted',
      createdAt: new Date().toISOString(),
    };

    await saveOrganization(org);
    const deleted = await deleteOrganization('test-org-delete');
    expect(deleted).toBe(true);

    const loaded = await loadOrganization('test-org-delete');
    expect(loaded).toBeNull();
  });
});

describe('Group操作（localStorageモード）', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('loadGroupsが空配列を返す（初期状態）', async () => {
    const { loadGroups } = await import('@/lib/unified-storage');
    const result = await loadGroups('test-org');
    expect(result).toEqual([]);
  });

  it('saveGroupsとloadGroupsが正しく動作する', async () => {
    const { saveGroups, loadGroups } = await import('@/lib/unified-storage');

    const groups = [
      { id: 'group-1', organizationId: 'test-org', name: 'Group 1', order: 1, createdAt: new Date().toISOString() },
      { id: 'group-2', organizationId: 'test-org', name: 'Group 2', order: 2, createdAt: new Date().toISOString() },
    ];

    const saved = await saveGroups('test-org', groups);
    expect(saved).toBe(true);

    const loaded = await loadGroups('test-org');
    expect(loaded).toEqual(groups);
  });
});

describe('Member操作（localStorageモード）', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('loadMembersが空配列を返す（初期状態）', async () => {
    const { loadMembers } = await import('@/lib/unified-storage');
    const result = await loadMembers('test-org');
    expect(result).toEqual([]);
  });

  it('saveMembersとloadMembersが正しく動作する', async () => {
    const { saveMembers, loadMembers } = await import('@/lib/unified-storage');

    const members = [
      { id: 'member-1', organizationId: 'test-org', groupId: 'group-1', name: 'Member 1', order: 1, createdAt: new Date().toISOString() },
    ];

    const saved = await saveMembers('test-org', members);
    expect(saved).toBe(true);

    const loaded = await loadMembers('test-org');
    expect(loaded).toEqual(members);
  });
});

describe('EventDate操作（localStorageモード）', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('loadEventDatesが空配列を返す（初期状態）', async () => {
    const { loadEventDates } = await import('@/lib/unified-storage');
    const result = await loadEventDates('test-org');
    expect(result).toEqual([]);
  });

  it('saveEventDatesとloadEventDatesが正しく動作する', async () => {
    const { saveEventDates, loadEventDates } = await import('@/lib/unified-storage');

    const eventDates = [
      { id: 'event-1', organizationId: 'test-org', date: '2024-01-01', title: 'Event 1', description: '', createdAt: new Date().toISOString() },
    ];

    const saved = await saveEventDates('test-org', eventDates);
    expect(saved).toBe(true);

    const loaded = await loadEventDates('test-org');
    expect(loaded).toEqual(eventDates);
  });
});

describe('Attendance操作（localStorageモード）', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('loadAttendancesが空配列を返す（初期状態）', async () => {
    const { loadAttendances } = await import('@/lib/unified-storage');
    const result = await loadAttendances('test-org');
    expect(result).toEqual([]);
  });

  it('saveAttendancesとloadAttendancesが正しく動作する', async () => {
    const { saveAttendances, loadAttendances } = await import('@/lib/unified-storage');

    const attendances = [
      { id: 'att-1', organizationId: 'test-org', eventDateId: 'event-1', memberId: 'member-1', status: '◯' as const, createdAt: new Date().toISOString() },
    ];

    const saved = await saveAttendances('test-org', attendances);
    expect(saved).toBe(true);

    const loaded = await loadAttendances('test-org');
    expect(loaded).toEqual(attendances);
  });
});

describe('clearOrganizationData（localStorageモード）', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_SUPABASE = 'false';
  });

  it('団体の全データを削除する', async () => {
    const {
      saveOrganization,
      saveGroups,
      saveMembers,
      saveEventDates,
      saveAttendances,
      clearOrganizationData,
      loadGroups,
      loadMembers,
      loadEventDates,
      loadAttendances
    } = await import('@/lib/unified-storage');

    const orgId = 'test-org-clear';

    // データを保存
    await saveOrganization({
      id: orgId,
      name: 'Test',
      description: '',
      createdAt: new Date().toISOString(),
    });
    await saveGroups(orgId, [{ id: 'g1', organizationId: orgId, name: 'G1', order: 1, createdAt: new Date().toISOString() }]);
    await saveMembers(orgId, [{ id: 'm1', organizationId: orgId, groupId: 'g1', name: 'M1', createdAt: new Date().toISOString() }]);
    await saveEventDates(orgId, [{ id: 'e1', organizationId: orgId, date: '2024-01-01', title: 'E1', createdAt: new Date().toISOString() }]);
    await saveAttendances(orgId, [{ id: 'a1', organizationId: orgId, eventDateId: 'e1', memberId: 'm1', status: '◯' as const, createdAt: new Date().toISOString() }]);

    // データを削除
    const result = await clearOrganizationData(orgId);
    expect(result).toBe(true);

    // 全て空になっていることを確認
    expect(await loadGroups(orgId)).toEqual([]);
    expect(await loadMembers(orgId)).toEqual([]);
    expect(await loadEventDates(orgId)).toEqual([]);
    expect(await loadAttendances(orgId)).toEqual([]);
  });
});
