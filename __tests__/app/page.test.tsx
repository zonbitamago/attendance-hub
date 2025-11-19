import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import * as organizationService from '@/lib/organization-service';
import * as migration from '@/lib/migration';
import type { Organization } from '@/types';
import { ThemeProvider } from '@/components/ui/theme-provider';

// モック
jest.mock('@/lib/organization-service');
jest.mock('@/lib/migration');

// ThemeProviderでラップするヘルパー関数
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="system">
      {ui}
    </ThemeProvider>
  );
};

const mockCreateOrganization = organizationService.createOrganization as jest.MockedFunction<
  typeof organizationService.createOrganization
>;
const mockMigrateToMultiTenant = migration.migrateToMultiTenant as jest.MockedFunction<
  typeof migration.migrateToMultiTenant
>;

// useRouterをモック
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

describe('Home (Landing) Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // localStorageをクリア
    localStorage.clear();
    // デフォルトではマイグレーションなし
    mockMigrateToMultiTenant.mockReturnValue({ migrated: false });

    // matchMediaをモック（ThemeProvider用）
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
      writable: true,
    });

    // document.documentElement のクラスリストをクリア
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should display landing content with description and create button', () => {
    renderWithTheme(<Home />);

    // ページタイトルの確認
    expect(screen.getByText('Attendance Hub')).toBeInTheDocument();

    // 説明文の確認
    expect(screen.getByText(/新しい団体を作成/)).toBeInTheDocument();

    // 作成ボタンの確認
    expect(screen.getByRole('button', { name: /団体を作成/ })).toBeInTheDocument();
  });

  it('should create organization on form submission', async () => {
    const mockOrganization: Organization = {
      id: 'test-org-123',
      name: 'テスト団体',
      description: 'テスト説明',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockCreateOrganization.mockResolvedValue(mockOrganization);

    renderWithTheme(<Home />);

    // フォームに入力
    const nameInput = screen.getByLabelText('団体名');
    const descInput = screen.getByLabelText(/説明/);
    fireEvent.change(nameInput, { target: { value: 'テスト団体' } });
    fireEvent.change(descInput, { target: { value: 'テスト説明' } });

    // 作成ボタンをクリック
    const createButton = screen.getByRole('button', { name: /団体を作成/ });
    fireEvent.click(createButton);

    // createOrganizationが呼ばれたことを確認
    expect(mockCreateOrganization).toHaveBeenCalledWith({
      name: 'テスト団体',
      description: 'テスト説明',
    });
  });

  it('should display URL for bookmarking after organization creation', async () => {
    const mockOrganization: Organization = {
      id: 'test-org-456',
      name: '新しい団体',
      description: '',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockCreateOrganization.mockResolvedValue(mockOrganization);

    // window.location.originをモック
    delete (window as any).location;
    (window as any).location = { origin: 'http://localhost:3000' };

    renderWithTheme(<Home />);

    // フォームに入力
    const nameInput = screen.getByLabelText('団体名');
    fireEvent.change(nameInput, { target: { value: '新しい団体' } });

    // 作成ボタンをクリック
    const createButton = screen.getByRole('button', { name: /団体を作成/ });
    fireEvent.click(createButton);

    // URL表示を確認（非同期処理の完了を待つ）
    expect(await screen.findByText(/作成されました/)).toBeInTheDocument();
    expect(await screen.findByText(/test-org-456/)).toBeInTheDocument();

    // アクセスボタンがあることを確認
    expect(screen.getByRole('link', { name: /アクセスする/ })).toHaveAttribute(
      'href',
      '/test-org-456'
    );
  });

  describe('Migration Integration', () => {
    it('should call migrateToMultiTenant on mount', async () => {
      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(mockMigrateToMultiTenant).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to default organization when migration succeeds', async () => {
      mockMigrateToMultiTenant.mockReturnValue({
        migrated: true,
        defaultOrgId: 'default-org-123',
      });

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/default-org-123');
      });
    });

    it('should not redirect when migration returns migrated: false', async () => {
      mockMigrateToMultiTenant.mockReturnValue({ migrated: false });

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(mockMigrateToMultiTenant).toHaveBeenCalled();
      });

      // リダイレクトされない
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should display error message when migration fails', async () => {
      mockMigrateToMultiTenant.mockReturnValue({
        migrated: false,
        error: 'マイグレーションに失敗しました',
      });

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/マイグレーションに失敗しました/)).toBeInTheDocument();
      });
    });

    it('should still allow manual organization creation when migration fails', async () => {
      mockMigrateToMultiTenant.mockReturnValue({
        migrated: false,
        error: 'マイグレーションエラー',
      });

      const mockOrganization: Organization = {
        id: 'new-org-123',
        name: '新規団体',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateOrganization.mockResolvedValue(mockOrganization);

      renderWithTheme(<Home />);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/マイグレーションエラー/)).toBeInTheDocument();
      });

      // 新規作成フォームが使える
      const nameInput = screen.getByLabelText('団体名');
      fireEvent.change(nameInput, { target: { value: '新規団体' } });

      const createButton = screen.getByRole('button', { name: /団体を作成/ });
      fireEvent.click(createButton);

      expect(mockCreateOrganization).toHaveBeenCalledWith({
        name: '新規団体',
        description: '',
      });
    });
  });

  describe('Privacy Protection', () => {
    it('should not display list of organizations for privacy', () => {
      const mockOrganizations: Organization[] = [
        { id: 'org1', name: '団体1', description: '', createdAt: '2025-01-01T00:00:00.000Z' },
        { id: 'org2', name: '団体2', description: '', createdAt: '2025-01-01T00:00:00.000Z' },
      ];

      // getAllOrganizationsをモックしてデータが存在することを示す
      const mockGetAllOrganizations = jest.spyOn(organizationService, 'getAllOrganizations');
      mockGetAllOrganizations.mockResolvedValue(mockOrganizations);

      renderWithTheme(<Home />);

      // 団体名が表示されていないことを確認（プライバシー保護）
      expect(screen.queryByText('団体1')).not.toBeInTheDocument();
      expect(screen.queryByText('団体2')).not.toBeInTheDocument();

      // 団体一覧のヘッダーも表示されていないことを確認
      expect(screen.queryByText(/既存の団体/)).not.toBeInTheDocument();
      expect(screen.queryByText(/団体一覧/)).not.toBeInTheDocument();

      mockGetAllOrganizations.mockRestore();
    });

    it('should not call getAllOrganizations to prevent data leakage', () => {
      const mockGetAllOrganizations = jest.spyOn(organizationService, 'getAllOrganizations');

      renderWithTheme(<Home />);

      // getAllOrganizationsが呼ばれていないことを確認
      expect(mockGetAllOrganizations).not.toHaveBeenCalled();

      mockGetAllOrganizations.mockRestore();
    });
  });
});
