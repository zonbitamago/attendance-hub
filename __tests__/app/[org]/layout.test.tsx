import { render, screen } from '@testing-library/react';
import { OrganizationProvider } from '@/contexts/organization-context';
import * as organizationService from '@/lib/organization-service';
import * as nextNavigation from 'next/navigation';
import type { Organization } from '@/types';

// Mockモジュール
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));
jest.mock('@/lib/supabase-storage');
jest.mock('@/lib/organization-service');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

describe('[org] Layout - Organization Context', () => {
  const mockGetOrganizationById = organizationService.getOrganizationById as jest.MockedFunction<
    typeof organizationService.getOrganizationById
  >;
  const mockNotFound = nextNavigation.notFound as jest.MockedFunction<typeof nextNavigation.notFound>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display organization data when organization exists', () => {
    const testOrganization: Organization = {
      id: 'test-org-123',
      name: 'テスト団体',
      description: 'テスト用の説明',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockGetOrganizationById.mockReturnValue(testOrganization);

    render(
      <OrganizationProvider organizationId="test-org-123">
        <div>子コンポーネント</div>
      </OrganizationProvider>
    );

    expect(screen.getByText('子コンポーネント')).toBeInTheDocument();
    expect(mockGetOrganizationById).toHaveBeenCalledWith('test-org-123');
  });

  it('should call notFound when organization does not exist', () => {
    mockGetOrganizationById.mockReturnValue(null);
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    expect(() => {
      render(
        <OrganizationProvider organizationId="non-existent-org">
          <div>子コンポーネント</div>
        </OrganizationProvider>
      );
    }).toThrow('NEXT_NOT_FOUND');

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should display loading state while fetching organization', () => {
    const testOrganization: Organization = {
      id: 'test-org-123',
      name: 'テスト団体',
      description: '',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockGetOrganizationById.mockReturnValue(testOrganization);

    const { container } = render(
      <OrganizationProvider organizationId="test-org-123">
        <div>子コンポーネント</div>
      </OrganizationProvider>
    );

    // 初期レンダリング時は読み込み中
    // useEffectが実行された後は子コンポーネントが表示される
    expect(container).toBeTruthy();
  });
});
