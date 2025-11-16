import { createOrganization } from '@/lib/organization-service';
import { createGroup } from '@/lib/group-service';
import { createMember } from '@/lib/member-service';
import { getOrganizationById } from '@/lib/organization-service';
import { getAllGroups } from '@/lib/group-service';
import { getAllMembers } from '@/lib/member-service';
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

describe('URL Bookmark Integration Test', () => {
  beforeEach(() => {
    clearAllData();
  });

  afterEach(() => {
    clearAllData();
  });

  it('should allow accessing organization data via bookmarked URL across sessions', async () => {
    // セッション1: 団体を作成してデータを追加
    const org = await createOrganization({
      name: '音楽サークル',
      description: '大学の音楽サークルです',
    });

    // 団体IDを保存（URLとしてブックマークされる想定）
    const bookmarkedOrgId = org.id;

    // データを追加
    const group1 = await createGroup(org.id, {
      name: 'ボーカル',
      order: 1,
      color: '#FF0000',
    });

    const group2 = await createGroup(org.id, {
      name: 'ギター',
      order: 2,
      color: '#00FF00',
    });

    await createMember(org.id, {
      name: '田中太郎',
      groupId: group1.id,
    });

    await createMember(org.id, {
      name: '鈴木花子',
      groupId: group2.id,
    });

    // セッション2: ブックマークしたURLから団体にアクセス（localStorageは保持されている）
    // 実際のブラウザではlocalStorageはセッションをまたいで保持される
    const retrievedOrg = await getOrganizationById(bookmarkedOrgId);

    // 団体情報が取得できることを確認
    expect(retrievedOrg).not.toBeNull();
    expect(retrievedOrg!.id).toBe(bookmarkedOrgId);
    expect(retrievedOrg!.name).toBe('音楽サークル');
    expect(retrievedOrg!.description).toBe('大学の音楽サークルです');

    // データが保持されていることを確認
    const groups = await getAllGroups(bookmarkedOrgId);
    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('ボーカル');
    expect(groups[1].name).toBe('ギター');

    const members = await getAllMembers(bookmarkedOrgId);
    expect(members).toHaveLength(2);
    expect(members[0].name).toBe('田中太郎');
    expect(members[1].name).toBe('鈴木花子');
  });

  it('should handle invalid bookmarked URLs gracefully', async () => {
    // 存在しない団体IDでアクセスを試みる
    const invalidOrgId = 'non-existent-organization-id';

    const org = await getOrganizationById(invalidOrgId);

    // nullが返されることを確認（404ページに遷移する想定）
    expect(org).toBeNull();
  });

  it('should persist multiple organizations independently via their URLs', async () => {
    // 複数の団体を作成
    const org1 = await createOrganization({ name: '団体A' });
    const org2 = await createOrganization({ name: '団体B' });

    // それぞれのURLをブックマーク
    const bookmark1 = org1.id;
    const bookmark2 = org2.id;

    // 各団体にデータを追加
    await createGroup(org1.id, { name: 'グループA1', order: 1, color: '#FF0000' });
    await createGroup(org2.id, { name: 'グループB1', order: 1, color: '#0000FF' });

    // セッションをまたいでアクセス
    const retrievedOrg1 = await getOrganizationById(bookmark1);
    const retrievedOrg2 = await getOrganizationById(bookmark2);

    // 両方の団体にアクセスできることを確認
    expect(retrievedOrg1).not.toBeNull();
    expect(retrievedOrg1!.name).toBe('団体A');

    expect(retrievedOrg2).not.toBeNull();
    expect(retrievedOrg2!.name).toBe('団体B');

    // データが独立していることを確認
    const groupsA = await getAllGroups(bookmark1);
    const groupsB = await getAllGroups(bookmark2);

    expect(groupsA).toHaveLength(1);
    expect(groupsA[0].name).toBe('グループA1');

    expect(groupsB).toHaveLength(1);
    expect(groupsB[0].name).toBe('グループB1');
  });
});
