import { render, screen } from '@testing-library/react';
import { OrganizationProvider, useOrganization } from '@/contexts/organization-context';
import * as organizationService from '@/lib/organization-service';
import * as supabaseStorage from '@/lib/supabase-storage';
import * as nextNavigation from 'next/navigation';
import type { Organization } from '@/types';

// モック
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));
jest.mock('@/lib/organization-service');
jest.mock('@/lib/supabase-storage');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

const TestComponent = () => {
  const { organization, isLoading } = useOrganization();
  return (
    <div>
      <div data-testid="org-name">{organization.name}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
    </div>
  );
};

describe('OrganizationContext', () => {
  const mockGetOrganizationById = organizationService.getOrganizationById as jest.MockedFunction<
    typeof organizationService.getOrganizationById
  >;
  const mockNotFound = nextNavigation.notFound as jest.MockedFunction<typeof nextNavigation.notFound>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OrganizationProvider', () => {
    it('should provide organization data to children', () => {
      const testOrg: Organization = {
        id: 'test-org-1',
        name: 'テスト団体',
        description: 'テスト用の説明',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockReturnValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-1">
          <TestComponent />
        </OrganizationProvider>
      );

      expect(screen.getByTestId('org-name')).toHaveTextContent('テスト団体');
      expect(mockGetOrganizationById).toHaveBeenCalledWith('test-org-1');
    });

    it('should call notFound when organization is not found', () => {
      // モックで null を返す（団体が見つからない）
      mockGetOrganizationById.mockReturnValue(null);
      mockNotFound.mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });

      // エラーバウンダリーのコンソールエラーを抑制
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <OrganizationProvider organizationId="non-existent-id">
            <TestComponent />
          </OrganizationProvider>
        );
      }).toThrow('NEXT_NOT_FOUND');

      expect(mockNotFound).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('useOrganization', () => {
    it('should return organization context value', () => {
      const testOrg: Organization = {
        id: 'test-org-2',
        name: 'コンテキストテスト',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockReturnValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-2">
          <TestComponent />
        </OrganizationProvider>
      );

      expect(screen.getByTestId('org-name')).toHaveTextContent('コンテキストテスト');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  // ==========================================================================
  // Cycle 2: OrganizationContext Integration with RLS (T073-T075)
  // Phase 4: US2 - RLS Implementation
  // ==========================================================================

  describe('RLS Integration', () => {
    const mockSetOrganizationContext = supabaseStorage.setOrganizationContext as jest.MockedFunction<
      typeof supabaseStorage.setOrganizationContext
    >;

    beforeEach(() => {
      mockSetOrganizationContext.mockResolvedValue(true);
    });

    it('should call setOrganizationContext when provider is mounted', async () => {
      const testOrg: Organization = {
        id: 'test-org-3',
        name: 'RLSテスト団体',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockReturnValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-3">
          <TestComponent />
        </OrganizationProvider>
      );

      // setOrganizationContextが組織IDで呼び出されることを検証
      expect(mockSetOrganizationContext).toHaveBeenCalledWith('test-org-3');
    });
  });
});
