import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createMember,
  saveMember,
  getAllMembers,
  getMembersByGroupId,
  getMemberById,
  updateMember,
  deleteMember,
} from '@/lib/member-service';
import { loadMembers, clearAllData } from '@/lib/storage';
import type { MemberInput } from '@/types';

describe('Member Service', () => {
  const TEST_ORG_ID = 'test_org_1';
  const TEST_GROUP_ID = '11111111-0000-0000-0000-000000000001';
  const OTHER_GROUP_ID = '22222222-0000-0000-0000-000000000002';

  beforeEach(() => {
    clearAllData();
  });

  describe('createMember', () => {
    it('有効な入力で新しいメンバーを作成できる', async () => {
      const input: MemberInput = {
        groupId: TEST_GROUP_ID,
        name: 'テスト太郎',
      };

      const member = await createMember(TEST_ORG_ID, input);

      expect(member.id).toBeDefined();
      expect(member.organizationId).toBe(TEST_ORG_ID);
      expect(member.groupId).toBe(TEST_GROUP_ID);
      expect(member.name).toBe('テスト太郎');
      expect(member.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('localStorageに保存される', async () => {
      const input: MemberInput = {
        groupId: TEST_GROUP_ID,
        name: 'ストレージテスト',
      };

      const member = await createMember(TEST_ORG_ID, input);

      const members = loadMembers(TEST_ORG_ID);
      expect(members).toHaveLength(1);
      expect(members[0].id).toBe(member.id);
      expect(members[0].name).toBe('ストレージテスト');
    });

    it('複数のメンバーを作成できる', async () => {
      const input1: MemberInput = {
        groupId: TEST_GROUP_ID,
        name: 'メンバー1',
      };
      const input2: MemberInput = {
        groupId: TEST_GROUP_ID,
        name: 'メンバー2',
      };

      await createMember(TEST_ORG_ID, input1);
      await createMember(TEST_ORG_ID, input2);

      const members = loadMembers(TEST_ORG_ID);
      expect(members).toHaveLength(2);
    });

    it('空の名前でエラー', async () => {
      const input = {
        groupId: TEST_GROUP_ID,
        name: '',
      };

      await expect(createMember(TEST_ORG_ID, input as MemberInput)).rejects.toThrow();
    });

    it('groupIdが必須', async () => {
      const input = {
        name: 'テスト',
      };

      await expect(createMember(TEST_ORG_ID, input as MemberInput)).rejects.toThrow();
    });
  });

  describe('saveMember', () => {
    it('createMemberと同じ動作をする', async () => {
      const input: MemberInput = {
        groupId: TEST_GROUP_ID,
        name: 'saveMemberテスト',
      };

      const member = await saveMember(TEST_ORG_ID, input);

      expect(member.id).toBeDefined();
      expect(member.organizationId).toBe(TEST_ORG_ID);
      expect(member.groupId).toBe(TEST_GROUP_ID);
      expect(member.name).toBe('saveMemberテスト');

      const members = loadMembers(TEST_ORG_ID);
      expect(members).toHaveLength(1);
      expect(members[0].id).toBe(member.id);
    });
  });

  describe('getAllMembers', () => {
    it('すべてのメンバーを取得できる', async () => {
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'メンバー1' });
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'メンバー2' });
      await createMember(TEST_ORG_ID, { groupId: OTHER_GROUP_ID, name: 'メンバー3' });

      const members = await getAllMembers(TEST_ORG_ID);

      expect(members).toHaveLength(3);
      expect(members.map((m) => m.name)).toContain('メンバー1');
      expect(members.map((m) => m.name)).toContain('メンバー2');
      expect(members.map((m) => m.name)).toContain('メンバー3');
    });

    it('メンバーがない場合は空配列を返す', async () => {
      const members = await getAllMembers(TEST_ORG_ID);
      expect(members).toEqual([]);
    });

    it('異なる団体のメンバーは取得しない', async () => {
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'メンバーA' });
      await createMember('other_org', { groupId: TEST_GROUP_ID, name: 'メンバーB' });

      const members = await getAllMembers(TEST_ORG_ID);

      expect(members).toHaveLength(1);
      expect(members[0].name).toBe('メンバーA');
    });
  });

  describe('getMembersByGroupId', () => {
    it('指定したグループのメンバーのみ取得できる', async () => {
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'グループ1メンバー1' });
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'グループ1メンバー2' });
      await createMember(TEST_ORG_ID, { groupId: OTHER_GROUP_ID, name: 'グループ2メンバー' });

      const members = await getMembersByGroupId(TEST_ORG_ID, TEST_GROUP_ID);

      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('グループ1メンバー1');
      expect(members[1].name).toBe('グループ1メンバー2');
    });

    it('該当グループにメンバーがいない場合は空配列を返す', async () => {
      await createMember(TEST_ORG_ID, { groupId: OTHER_GROUP_ID, name: 'メンバー' });

      const members = await getMembersByGroupId(TEST_ORG_ID, TEST_GROUP_ID);

      expect(members).toEqual([]);
    });

    it('異なる団体のメンバーは取得しない', async () => {
      await createMember(TEST_ORG_ID, { groupId: TEST_GROUP_ID, name: 'メンバーA' });
      await createMember('other_org', { groupId: TEST_GROUP_ID, name: 'メンバーB' });

      const members = await getMembersByGroupId(TEST_ORG_ID, TEST_GROUP_ID);

      expect(members).toHaveLength(1);
      expect(members[0].name).toBe('メンバーA');
    });
  });

  describe('getMemberById', () => {
    it('IDでメンバーを取得できる', async () => {
      const created = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: 'テストメンバー',
      });

      const member = await getMemberById(TEST_ORG_ID, created.id);

      expect(member).not.toBeNull();
      expect(member?.id).toBe(created.id);
      expect(member?.name).toBe('テストメンバー');
    });

    it('存在しないIDの場合nullを返す', async () => {
      const member = await getMemberById(TEST_ORG_ID, 'nonexistent');
      expect(member).toBeNull();
    });

    it('異なる団体のメンバーは取得できない', async () => {
      const created = await createMember('other_org', {
        groupId: TEST_GROUP_ID,
        name: '他団体メンバー',
      });

      const member = await getMemberById(TEST_ORG_ID, created.id);
      expect(member).toBeNull();
    });
  });

  describe('updateMember', () => {
    it('メンバーを更新できる', async () => {
      const created = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: '元の名前',
      });

      const updated = await updateMember(TEST_ORG_ID, created.id, {
        name: '更新された名前',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('更新された名前');
      expect(updated.groupId).toBe(TEST_GROUP_ID); // 変更していない
    });

    it('存在しないメンバーの更新でエラー', async () => {
      await expect(
        updateMember(TEST_ORG_ID, 'nonexistent', { name: 'テスト' })
      ).rejects.toThrow('メンバー');
    });

    it('localStorageに反映される', async () => {
      const created = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: '元の名前',
      });

      await updateMember(TEST_ORG_ID, created.id, {
        name: '更新された名前',
      });

      const members = loadMembers(TEST_ORG_ID);
      expect(members[0].name).toBe('更新された名前');
    });

    it('空の名前でエラー', async () => {
      const created = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: '元の名前',
      });

      await expect(
        updateMember(TEST_ORG_ID, created.id, { name: '' })
      ).rejects.toThrow();
    });
  });

  describe('deleteMember', () => {
    it('メンバーを削除できる', async () => {
      const created = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: 'テストメンバー',
      });

      const result = await deleteMember(TEST_ORG_ID, created.id);

      expect(result).toBe(true);

      const members = loadMembers(TEST_ORG_ID);
      expect(members).toHaveLength(0);
    });

    it('存在しないメンバーの削除でfalseを返す', async () => {
      const result = await deleteMember(TEST_ORG_ID, 'nonexistent');
      expect(result).toBe(false);
    });

    it('複数のメンバーから特定のメンバーのみ削除', async () => {
      const member1 = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: 'メンバー1',
      });
      const member2 = await createMember(TEST_ORG_ID, {
        groupId: TEST_GROUP_ID,
        name: 'メンバー2',
      });

      await deleteMember(TEST_ORG_ID, member1.id);

      const members = loadMembers(TEST_ORG_ID);
      expect(members).toHaveLength(1);
      expect(members[0].id).toBe(member2.id);
    });
  });
});
