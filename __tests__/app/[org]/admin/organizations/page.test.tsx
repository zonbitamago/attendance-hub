import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrganizationsPage from '@/app/[org]/admin/organizations/page';
import * as organizationService from '@/lib/organization-service';
import * as OrganizationContextModule from '@/contexts/organization-context';
import type { Organization } from '@/types';

// モック
jest.mock('@/lib/organization-service');
jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));

// useRouterのモック
const mockPush = jest.fn();
const mockParams = { org: 'test-org-123' };
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Organizations Admin Page', () => {
  const mockUpdateOrganization = organizationService.updateOrganization as jest.MockedFunction<
    typeof organizationService.updateOrganization
  >;
  const mockDeleteOrganization = organizationService.deleteOrganization as jest.MockedFunction<
    typeof organizationService.deleteOrganization
  >;

  const testOrganization: Organization = {
    id: 'test-org-123',
    name: 'テスト団体',
    description: 'テスト用の説明',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (OrganizationContextModule.useOrganization as jest.Mock).mockReturnValue({
      organization: testOrganization,
      isLoading: false,
      error: null,
    });
  });

  it('should display organization information', () => {
    render(<OrganizationsPage />);

    expect(screen.getByText('団体設定')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト団体')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト用の説明')).toBeInTheDocument();
  });

  it('should update organization name', async () => {
    const updatedOrg: Organization = {
      ...testOrganization,
      name: '新しい団体名',
    };
    mockUpdateOrganization.mockResolvedValue(updatedOrg);

    render(<OrganizationsPage />);

    const nameInput = screen.getByLabelText('団体名');
    fireEvent.change(nameInput, { target: { value: '新しい団体名' } });

    const saveButton = screen.getByRole('button', { name: /保存/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalledWith('test-org-123', {
        name: '新しい団体名',
        description: 'テスト用の説明',
      });
    });
  });

  it('should update organization description', async () => {
    const updatedOrg: Organization = {
      ...testOrganization,
      description: '新しい説明',
    };
    mockUpdateOrganization.mockResolvedValue(updatedOrg);

    render(<OrganizationsPage />);

    const descInput = screen.getByLabelText(/説明/);
    fireEvent.change(descInput, { target: { value: '新しい説明' } });

    const saveButton = screen.getByRole('button', { name: /保存/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalledWith('test-org-123', {
        name: 'テスト団体',
        description: '新しい説明',
      });
    });
  });

  it('should show delete confirmation dialog', () => {
    render(<OrganizationsPage />);

    const deleteButton = screen.getByRole('button', { name: /団体を削除/ });
    fireEvent.click(deleteButton);

    // 確認ダイアログが表示される
    expect(screen.getByText(/本当に削除しますか/)).toBeInTheDocument();
  });

  it('should delete organization and redirect to home', async () => {
    mockDeleteOrganization.mockResolvedValue(undefined);

    render(<OrganizationsPage />);

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /団体を削除/ });
    fireEvent.click(deleteButton);

    // 確認ダイアログで「削除する」をクリック
    const confirmButton = screen.getByRole('button', { name: /削除する/ });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteOrganization).toHaveBeenCalledWith('test-org-123');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should cancel deletion when clicking cancel button', () => {
    render(<OrganizationsPage />);

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /団体を削除/ });
    fireEvent.click(deleteButton);

    // 確認ダイアログでキャンセルをクリック
    const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
    fireEvent.click(cancelButton);

    // 削除されていないことを確認
    expect(mockDeleteOrganization).not.toHaveBeenCalled();

    // ダイアログが閉じていることを確認
    expect(screen.queryByText(/本当に削除しますか/)).not.toBeInTheDocument();
  });

  it('should display error message when update fails', async () => {
    mockUpdateOrganization.mockRejectedValue(new Error('更新に失敗しました'));

    render(<OrganizationsPage />);

    const nameInput = screen.getByLabelText('団体名');
    fireEvent.change(nameInput, { target: { value: '新しい名前' } });

    const saveButton = screen.getByRole('button', { name: /保存/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/更新に失敗しました/)).toBeInTheDocument();
    });
  });
});
