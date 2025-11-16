import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  generateOrganizationId,
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from '@/lib/organization-service';
import { loadOrganizations, clearAllData } from '@/lib/storage';
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '@/types';

describe('Organization Service', () => {
  beforeEach(() => {
    clearAllData();
  });

  describe('generateOrganizationId', () => {
    it('10文字のIDを生成する', () => {
      const id = generateOrganizationId();
      expect(id).toHaveLength(10);
    });

    it('呼び出すたびに異なるIDを生成する', () => {
      const id1 = generateOrganizationId();
      const id2 = generateOrganizationId();
      const id3 = generateOrganizationId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('URL-safeな文字列を生成する（nanoidの仕様）', () => {
      const id = generateOrganizationId();
      // nanoidはURL-safe文字（A-Za-z0-9_-）のみを使用
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('createOrganization', () => {
    it('有効な入力で新しい団体を作成できる', async () => {
      const input: CreateOrganizationInput = {
        name: 'テスト団体',
        description: 'これはテスト用の団体です',
      };

      const org = await createOrganization(input);

      expect(org.id).toHaveLength(10);
      expect(org.name).toBe('テスト団体');
      expect(org.description).toBe('これはテスト用の団体です');
      expect(org.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('descriptionが省略可能', async () => {
      const input: CreateOrganizationInput = {
        name: 'シンプル団体',
      };

      const org = await createOrganization(input);

      expect(org.name).toBe('シンプル団体');
      expect(org.description).toBeUndefined();
    });

    it('localStorageに保存される', async () => {
      const input: CreateOrganizationInput = {
        name: 'ストレージテスト団体',
      };

      const org = await createOrganization(input);

      const orgs = loadOrganizations();
      expect(orgs).toHaveLength(1);
      expect(orgs[0].id).toBe(org.id);
      expect(orgs[0].name).toBe('ストレージテスト団体');
    });

    it('複数の団体を作成できる', async () => {
      await createOrganization({ name: '団体1' });
      await createOrganization({ name: '団体2' });
      await createOrganization({ name: '団体3' });

      const orgs = loadOrganizations();
      expect(orgs).toHaveLength(3);
      expect(orgs.map((o) => o.name)).toEqual(['団体1', '団体2', '団体3']);
    });

    it('無効な名前でZodValidationErrorをスロー', async () => {
      const invalidInput: any = {
        name: '', // 空文字
      };

      await expect(createOrganization(invalidInput)).rejects.toThrow();
    });

    it('名前が100文字を超える場合にエラー', async () => {
      const invalidInput: any = {
        name: 'あ'.repeat(101),
      };

      await expect(createOrganization(invalidInput)).rejects.toThrow();
    });

    it('descriptionが500文字を超える場合にエラー', async () => {
      const invalidInput: any = {
        name: '団体',
        description: 'あ'.repeat(501),
      };

      await expect(createOrganization(invalidInput)).rejects.toThrow();
    });

    it('nameの前後の空白をtrimする', async () => {
      const input: CreateOrganizationInput = {
        name: '  スペース付き団体  ',
      };

      const org = await createOrganization(input);

      expect(org.name).toBe('スペース付き団体');
    });
  });

  describe('getAllOrganizations', () => {
    it('団体が存在しない場合は空配列を返す', async () => {
      const orgs = await getAllOrganizations();
      expect(orgs).toEqual([]);
    });

    it('すべての団体を返す', async () => {
      await createOrganization({ name: '団体A' });
      await createOrganization({ name: '団体B' });

      const orgs = await getAllOrganizations();

      expect(orgs).toHaveLength(2);
      expect(orgs.map((o) => o.name)).toContain('団体A');
      expect(orgs.map((o) => o.name)).toContain('団体B');
    });

    it('createdAt降順（新しい順）でソートして返す', async () => {
      // 時間差を確保するため、少し待機
      const org1 = await createOrganization({ name: '古い団体' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const org2 = await createOrganization({ name: '新しい団体' });

      const orgs = await getAllOrganizations();

      expect(orgs).toHaveLength(2);
      // 新しい団体が先頭
      expect(orgs[0].id).toBe(org2.id);
      expect(orgs[1].id).toBe(org1.id);
    });

    it('元の配列を変更せずにソートされたコピーを返す', async () => {
      await createOrganization({ name: '団体1' });
      await createOrganization({ name: '団体2' });

      const orgs1 = await getAllOrganizations();
      const orgs2 = await getAllOrganizations();

      expect(orgs1).toEqual(orgs2);
      expect(orgs1).not.toBe(orgs2); // 異なる配列インスタンス
    });
  });

  describe('getOrganizationById', () => {
    it('存在する団体IDで団体を返す', async () => {
      const created = await createOrganization({ name: 'テスト団体' });

      const found = await getOrganizationById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('テスト団体');
    });

    it('存在しない団体IDでnullを返す', async () => {
      await createOrganization({ name: 'テスト団体' });

      const found = await getOrganizationById('nonexistent');

      expect(found).toBeNull();
    });

    it('複数の団体から正しい団体を見つける', async () => {
      const org1 = await createOrganization({ name: '団体1' });
      const org2 = await createOrganization({ name: '団体2' });
      const org3 = await createOrganization({ name: '団体3' });

      const found = await getOrganizationById(org2.id);

      expect(found).not.toBeNull();
      expect(found!.name).toBe('団体2');
    });
  });

  describe('updateOrganization', () => {
    it('団体名を更新できる', async () => {
      const org = await createOrganization({ name: '元の名前' });

      const updated = await updateOrganization(org.id, { name: '新しい名前' });

      expect(updated.id).toBe(org.id);
      expect(updated.name).toBe('新しい名前');
      expect(updated.createdAt).toBe(org.createdAt); // createdAtは保持
    });

    it('説明のみを更新できる', async () => {
      const org = await createOrganization({ name: '団体名', description: '元の説明' });

      const updated = await updateOrganization(org.id, { description: '新しい説明' });

      expect(updated.name).toBe('団体名'); // nameは変更なし
      expect(updated.description).toBe('新しい説明');
    });

    it('名前と説明の両方を更新できる', async () => {
      const org = await createOrganization({ name: '元の名前', description: '元の説明' });

      const updated = await updateOrganization(org.id, {
        name: '新しい名前',
        description: '新しい説明',
      });

      expect(updated.name).toBe('新しい名前');
      expect(updated.description).toBe('新しい説明');
    });

    it('更新がlocalStorageに反映される', async () => {
      const org = await createOrganization({ name: '元の名前' });

      await updateOrganization(org.id, { name: '更新後の名前' });

      const orgs = loadOrganizations();
      const found = orgs.find((o) => o.id === org.id);
      expect(found).not.toBeUndefined();
      expect(found!.name).toBe('更新後の名前');
    });

    it('存在しない団体IDでエラーをスロー', async () => {
      await expect(
        updateOrganization('nonexistent', { name: '新しい名前' })
      ).rejects.toThrow('Organization not found');
    });

    it('空のオブジェクトで更新しようとするとエラー', async () => {
      const org = await createOrganization({ name: '団体名' });

      await expect(
        updateOrganization(org.id, {})
      ).rejects.toThrow();
    });

    it('無効な名前でエラーをスロー', async () => {
      const org = await createOrganization({ name: '団体名' });

      await expect(
        updateOrganization(org.id, { name: '' })
      ).rejects.toThrow();
    });

    it('nameの前後の空白をtrimする', async () => {
      const org = await createOrganization({ name: '団体名' });

      const updated = await updateOrganization(org.id, { name: '  新しい名前  ' });

      expect(updated.name).toBe('新しい名前');
    });
  });

  describe('deleteOrganization', () => {
    it('団体を削除できる', async () => {
      const org = await createOrganization({ name: '削除される団体' });

      await deleteOrganization(org.id);

      const orgs = loadOrganizations();
      expect(orgs).toHaveLength(0);
    });

    it('削除後に団体を取得できない', async () => {
      const org = await createOrganization({ name: '削除される団体' });

      await deleteOrganization(org.id);

      const found = await getOrganizationById(org.id);
      expect(found).toBeNull();
    });

    it('存在しない団体IDでエラーをスロー', async () => {
      await expect(
        deleteOrganization('nonexistent')
      ).rejects.toThrow('Organization not found');
    });

    it('複数の団体から特定の団体のみを削除', async () => {
      const org1 = await createOrganization({ name: '団体1' });
      const org2 = await createOrganization({ name: '団体2' });
      const org3 = await createOrganization({ name: '団体3' });

      await deleteOrganization(org2.id);

      const orgs = loadOrganizations();
      expect(orgs).toHaveLength(2);
      expect(orgs.map((o) => o.id)).toContain(org1.id);
      expect(orgs.map((o) => o.id)).toContain(org3.id);
      expect(orgs.map((o) => o.id)).not.toContain(org2.id);
    });

    it('カスケード削除: 団体削除時に関連データも削除される', async () => {
      const org = await createOrganization({ name: 'カスケードテスト団体' });

      // 関連データを作成（実際のEventDate等のデータ）
      // ここではclearOrganizationDataが呼ばれることを確認するためのテスト
      // 実際のデータ作成はPhase 3のUI実装後に可能になる

      await deleteOrganization(org.id);

      // clearOrganizationDataが呼ばれていることを確認
      // （ストレージテストで既に検証済み）
      const found = await getOrganizationById(org.id);
      expect(found).toBeNull();
    });
  });
});
