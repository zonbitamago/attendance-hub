import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from '@/lib/group-service';
import { loadGroups, saveGroups } from '@/lib/storage';
import type { Group } from '@/types';

// storage モジュールをモック
jest.mock('@/lib/storage');

describe('Group Service', () => {
  const mockLoadGroups = loadGroups as jest.MockedFunction<typeof loadGroups>;
  const mockSaveGroups = saveGroups as jest.MockedFunction<typeof saveGroups>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadGroups.mockReturnValue([]);
    mockSaveGroups.mockReturnValue(true);
  });

  describe('createGroup', () => {
    it('有効な入力で新しいグループを作成できる', async () => {
      const input = {
        name: '打',
        order: 0,
        color: '#FF0000',
      };

      const group = await createGroup('test-org-id', input);

      expect(group).toMatchObject({
        name: '打',
        order: 0,
        color: '#FF0000',
      });
      expect(group.id).toBeDefined();
      expect(group.createdAt).toBeDefined();
      expect(mockSaveGroups).toHaveBeenCalledWith('test-org-id', [group]);
    });

    it('色なしでグループを作成できる', async () => {
      const input = {
        name: 'Cla',
        order: 1,
      };

      const group = await createGroup('test-org-id', input);

      expect(group.name).toBe('Cla');
      expect(group.order).toBe(1);
      expect(group.color).toBeUndefined();
    });

    it('無効な入力でエラーをスローする', async () => {
      const input = {
        name: '',
        order: 0,
      };

      await expect(createGroup('test-org-id', input)).rejects.toThrow();
    });

    it('名前が長すぎる場合はエラーをスローする', async () => {
      const input = {
        name: 'a'.repeat(51),
        order: 0,
      };

      await expect(createGroup('test-org-id', input)).rejects.toThrow();
    });

    it('無効な色フォーマットの場合はエラーをスローする', async () => {
      const input = {
        name: 'Test',
        order: 0,
        color: 'red', // Invalid format
      };

      await expect(createGroup('test-org-id', input)).rejects.toThrow();
    });

    it('ストレージが失敗した場合はエラーをスローする', async () => {
      mockSaveGroups.mockReturnValue(false);

      const input = {
        name: 'Test Group',
        order: 0,
      };

      await expect(createGroup('test-org-id', input)).rejects.toThrow();
    });
  });

  describe('getAllGroups', () => {
    it('すべてのグループを順序でソートして取得できる', async () => {
      const mockGroups: Group[] = [
        {
          id: '2',
          organizationId: 'test-org-id',
          name: 'Sax',
          order: 2,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '1',
          organizationId: 'test-org-id',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '3',
          organizationId: 'test-org-id',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);

      const groups = await getAllGroups('test-org-id');

      expect(groups).toHaveLength(3);
      expect(groups[0].name).toBe('打'); // order: 0
      expect(groups[1].name).toBe('Cla'); // order: 1
      expect(groups[2].name).toBe('Sax'); // order: 2
      expect(mockLoadGroups).toHaveBeenCalled();
    });

    it('グループが存在しない場合は空配列を返す', async () => {
      mockLoadGroups.mockReturnValue([]);

      const groups = await getAllGroups('test-org-id');

      expect(groups).toEqual([]);
    });
  });

  describe('getGroupById', () => {
    it('IDでグループを取得できる', async () => {
      const mockGroups: Group[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(mockGroups);

      const group = await getGroupById('test-org-id', '1');

      expect(group).toEqual(mockGroups[0]);
    });

    it('グループが見つからない場合はnullを返す', async () => {
      mockLoadGroups.mockReturnValue([]);

      const group = await getGroupById('test-org-id', 'nonexistent');

      expect(group).toBeNull();
    });
  });

  describe('updateGroup', () => {
    it('既存のグループを更新できる', async () => {
      const existingGroup: Group = {
        id: '1',
        organizationId: 'test-org-id',
        name: 'Old Name',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadGroups.mockReturnValue([existingGroup]);

      const updated = await updateGroup('test-org-id', '1', {
        name: 'New Name',
        order: 1,
        color: '#00FF00',
      });

      expect(updated).toMatchObject({
        id: '1',
        name: 'New Name',
        order: 1,
        color: '#00FF00',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(mockSaveGroups).toHaveBeenCalled();
    });

    it('グループが見つからない場合はエラーをスローする', async () => {
      mockLoadGroups.mockReturnValue([]);

      await expect(
        updateGroup('test-org-id', 'nonexistent', { name: 'New Name', order: 0 })
      ).rejects.toThrow();
    });

    it('無効な更新データの場合はエラーをスローする', async () => {
      const existingGroup: Group = {
        id: '1',
        organizationId: 'test-org-id',
        name: 'Old Name',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockLoadGroups.mockReturnValue([existingGroup]);

      await expect(
        updateGroup('test-org-id', '1', { name: '', order: 0 })
      ).rejects.toThrow();
    });
  });

  describe('deleteGroup', () => {
    it('既存のグループを削除できる', async () => {
      const groups: Group[] = [
        {
          id: '1',
          organizationId: 'test-org-id',
          name: '打',
          order: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          organizationId: 'test-org-id',
          name: 'Cla',
          order: 1,
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ];

      mockLoadGroups.mockReturnValue(groups);

      const result = await deleteGroup('test-org-id', '1');

      expect(result).toBe(true);
      expect(mockSaveGroups).toHaveBeenCalledWith('test-org-id', [groups[1]]);
    });

    it('グループが見つからない場合はfalseを返す', async () => {
      mockLoadGroups.mockReturnValue([]);

      const result = await deleteGroup('test-org-id', 'nonexistent');

      expect(result).toBe(false);
      expect(mockSaveGroups).not.toHaveBeenCalled();
    });
  });
});
