import { describe, it, expect } from '@jest/globals';
import {
  OrganizationSchema,
  CreateOrganizationInputSchema,
  UpdateOrganizationInputSchema,
} from '@/lib/validation';

describe('Validation Schemas - Organization', () => {
  describe('OrganizationSchema', () => {
    it('有効な団体データを検証できる', () => {
      const validOrg = {
        id: '1234567890',
        name: 'テスト団体',
        description: 'これはテスト用の団体です',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(validOrg);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validOrg);
      }
    });

    it('descriptionが省略可能である', () => {
      const validOrg = {
        id: '1234567890',
        name: 'テスト団体',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(validOrg);
      expect(result.success).toBe(true);
    });

    it('idが10文字でない場合はエラー', () => {
      const invalidOrg = {
        id: '12345', // 5文字
        name: 'テスト団体',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(invalidOrg);
      expect(result.success).toBe(false);
    });

    it('nameが空文字の場合はエラー', () => {
      const invalidOrg = {
        id: '1234567890',
        name: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(invalidOrg);
      expect(result.success).toBe(false);
    });

    it('nameが100文字を超える場合はエラー', () => {
      const invalidOrg = {
        id: '1234567890',
        name: 'あ'.repeat(101),
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(invalidOrg);
      expect(result.success).toBe(false);
    });

    it('descriptionが500文字を超える場合はエラー', () => {
      const invalidOrg = {
        id: '1234567890',
        name: 'テスト団体',
        description: 'あ'.repeat(501),
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(invalidOrg);
      expect(result.success).toBe(false);
    });

    it('createdAtがdatetime形式でない場合はエラー', () => {
      const invalidOrg = {
        id: '1234567890',
        name: 'テスト団体',
        createdAt: '2025-01-01', // YYYY-MM-DD形式
      };

      const result = OrganizationSchema.safeParse(invalidOrg);
      expect(result.success).toBe(false);
    });

    it('nameの前後の空白をtrimする', () => {
      const orgWithSpaces = {
        id: '1234567890',
        name: '  テスト団体  ',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const result = OrganizationSchema.safeParse(orgWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('テスト団体');
      }
    });
  });

  describe('CreateOrganizationInputSchema', () => {
    it('有効な作成入力を検証できる', () => {
      const validInput = {
        name: 'テスト団体',
        description: 'これはテスト用の団体です',
      };

      const result = CreateOrganizationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('descriptionが省略可能である', () => {
      const validInput = {
        name: 'テスト団体',
      };

      const result = CreateOrganizationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('nameが空文字の場合はエラー', () => {
      const invalidInput = {
        name: '',
      };

      const result = CreateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('nameが100文字を超える場合はエラー', () => {
      const invalidInput = {
        name: 'あ'.repeat(101),
      };

      const result = CreateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('nameの前後の空白をtrimする', () => {
      const inputWithSpaces = {
        name: '  テスト団体  ',
      };

      const result = CreateOrganizationInputSchema.safeParse(inputWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('テスト団体');
      }
    });
  });

  describe('UpdateOrganizationInputSchema', () => {
    it('有効な更新入力を検証できる', () => {
      const validInput = {
        name: 'テスト団体（更新後）',
      };

      const result = UpdateOrganizationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('descriptionのみの更新も可能', () => {
      const validInput = {
        description: '説明を更新しました',
      };

      const result = UpdateOrganizationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('nameとdescriptionの両方を更新できる', () => {
      const validInput = {
        name: '新しい団体名',
        description: '新しい説明',
      };

      const result = UpdateOrganizationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('空のオブジェクトの場合はエラー（少なくとも1つのフィールドが必要）', () => {
      const invalidInput = {};

      const result = UpdateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('少なくとも1つのフィールドを指定してください');
      }
    });

    it('nameが空文字の場合はエラー', () => {
      const invalidInput = {
        name: '',
      };

      const result = UpdateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('nameが100文字を超える場合はエラー', () => {
      const invalidInput = {
        name: 'あ'.repeat(101),
      };

      const result = UpdateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('descriptionが500文字を超える場合はエラー', () => {
      const invalidInput = {
        description: 'あ'.repeat(501),
      };

      const result = UpdateOrganizationInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
