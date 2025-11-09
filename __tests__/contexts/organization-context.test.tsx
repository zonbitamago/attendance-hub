import { render, screen } from '@testing-library/react';
import { OrganizationProvider, useOrganization } from '@/contexts/organization-context';
import type { Organization } from '@/types';
import * as organizationService from '@/lib/organization-service';

// getOrganizationByIdをモック
jest.mock('@/lib/organization-service');

// テスト用のコンポーネント
function TestComponent() {
  const { organization } = useOrganization();
  return (
    <div>
      <div data-testid="org-id">{organization.id}</div>
      <div data-testid="org-name">{organization.name}</div>
    </div>
  );
}

describe('OrganizationContext', () => {
  const mockGetOrganizationById = organizationService.getOrganizationById as jest.MockedFunction<
    typeof organizationService.getOrganizationById
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOrganization', () => {
    it('should return organization from context', () => {
      // テスト用の団体データ
      const testOrganization: Organization = {
        id: 'test-org-123',
        name: 'テスト団体',
        description: 'テスト用の説明',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      // モックの設定
      mockGetOrganizationById.mockReturnValue(testOrganization);

      render(
        <OrganizationProvider organizationId={testOrganization.id}>
          <TestComponent />
        </OrganizationProvider>
      );

      expect(screen.getByTestId('org-id')).toHaveTextContent('test-org-123');
      expect(screen.getByTestId('org-name')).toHaveTextContent('テスト団体');
    });

    it('should throw error when organization is not found', () => {
      // モックで null を返す（団体が見つからない）
      mockGetOrganizationById.mockReturnValue(null);

      // エラーバウンダリーのコンソールエラーを抑制
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <OrganizationProvider organizationId="non-existent-id">
            <TestComponent />
          </OrganizationProvider>
        );
      }).toThrow('団体が見つかりません: non-existent-id');

      consoleError.mockRestore();
    });
  });
});
