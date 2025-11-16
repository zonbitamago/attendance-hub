import { render, screen, waitFor } from '@testing-library/react';
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
    it('should provide organization data to children', async () => {
      const testOrg: Organization = {
        id: 'test-org-1',
        name: 'テスト団体',
        description: 'テスト用の説明',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockResolvedValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-1">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('org-name')).toHaveTextContent('テスト団体');
      });
      expect(mockGetOrganizationById).toHaveBeenCalledWith('test-org-1');
    });

    it('should call notFound when organization is not found', async () => {
      // モックで null を返す（団体が見つからない）
      mockGetOrganizationById.mockResolvedValue(null);
      // notFound() はエラーを投げずに呼び出しを記録するだけ
      mockNotFound.mockImplementation(() => undefined as never);

      render(
        <OrganizationProvider organizationId="non-existent-id">
          <div>Dummy content</div>
        </OrganizationProvider>
      );

      // 非同期処理完了後にnotFoundが呼ばれることを確認
      await waitFor(() => {
        expect(mockNotFound).toHaveBeenCalled();
      });
    });
  });

  describe('useOrganization', () => {
    it('should return organization context value', async () => {
      const testOrg: Organization = {
        id: 'test-org-2',
        name: 'コンテキストテスト',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockResolvedValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-2">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('org-name')).toHaveTextContent('コンテキストテスト');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
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

      mockGetOrganizationById.mockResolvedValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-3">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        // setOrganizationContextが組織IDで呼び出されることを検証
        expect(mockSetOrganizationContext).toHaveBeenCalledWith('test-org-3');
      });
    });
  });

  // ==========================================================================
  // Phase 6 Cycle 1: Async Support and Error Handling (T138-T141)
  // ==========================================================================

  describe('Loading State', () => {
    it('should display loading message while fetching organization', () => {
      const testOrg: Organization = {
        id: 'test-org-4',
        name: 'ローディングテスト',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      // データ取得に時間がかかる状態をシミュレート
      mockGetOrganizationById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(testOrg), 100))
      );

      render(
        <OrganizationProvider organizationId="test-org-4">
          <TestComponent />
        </OrganizationProvider>
      );

      // ローディング中は「読み込み中...」が表示される
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('should hide loading message after data is fetched', async () => {
      const testOrg: Organization = {
        id: 'test-org-5',
        name: 'ローディング完了テスト',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetOrganizationById.mockResolvedValue(testOrg);

      render(
        <OrganizationProvider organizationId="test-org-5">
          <TestComponent />
        </OrganizationProvider>
      );

      // データ取得後はローディングメッセージが消える
      await waitFor(() => {
        expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
        expect(screen.getByTestId('org-name')).toHaveTextContent('ローディング完了テスト');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // データ取得エラーをシミュレート
      mockGetOrganizationById.mockRejectedValue(new Error('Network error'));

      render(
        <OrganizationProvider organizationId="test-org-6">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should recover from error when organizationId changes', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // 最初はエラー
      mockGetOrganizationById.mockRejectedValueOnce(new Error('Network error'));

      const { rerender } = render(
        <OrganizationProvider organizationId="test-org-7">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });

      // 次は成功
      const testOrg: Organization = {
        id: 'test-org-8',
        name: 'リカバリーテスト',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockGetOrganizationById.mockResolvedValue(testOrg);

      rerender(
        <OrganizationProvider organizationId="test-org-8">
          <TestComponent />
        </OrganizationProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText(/エラーが発生しました/)).not.toBeInTheDocument();
        expect(screen.getByTestId('org-name')).toHaveTextContent('リカバリーテスト');
      });

      consoleError.mockRestore();
    });
  });
});
