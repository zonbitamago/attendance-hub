import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';
import * as organizationService from '@/lib/organization-service';
import type { Organization } from '@/types';

// モック
jest.mock('@/lib/organization-service');
const mockCreateOrganization = organizationService.createOrganization as jest.MockedFunction<
  typeof organizationService.createOrganization
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
  });

  it('should display landing content with description and create button', () => {
    render(<Home />);

    // ページタイトルの確認
    expect(screen.getByText('Attendance Hub')).toBeInTheDocument();

    // 説明文の確認
    expect(screen.getByText(/新しい団体を作成/)).toBeInTheDocument();

    // 作成ボタンの確認
    expect(screen.getByRole('button', { name: /団体を作成/ })).toBeInTheDocument();
  });

  it('should create organization on form submission', () => {
    const mockOrganization: Organization = {
      id: 'test-org-123',
      name: 'テスト団体',
      description: 'テスト説明',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockCreateOrganization.mockReturnValue(mockOrganization);

    render(<Home />);

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

  it('should display URL for bookmarking after organization creation', () => {
    const mockOrganization: Organization = {
      id: 'test-org-456',
      name: '新しい団体',
      description: '',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    mockCreateOrganization.mockReturnValue(mockOrganization);

    // window.location.originをモック
    delete (window as any).location;
    (window as any).location = { origin: 'http://localhost:3000' };

    render(<Home />);

    // フォームに入力
    const nameInput = screen.getByLabelText('団体名');
    fireEvent.change(nameInput, { target: { value: '新しい団体' } });

    // 作成ボタンをクリック
    const createButton = screen.getByRole('button', { name: /団体を作成/ });
    fireEvent.click(createButton);

    // URL表示を確認
    expect(screen.getByText(/作成されました/)).toBeInTheDocument();
    expect(screen.getByText(/test-org-456/)).toBeInTheDocument();

    // アクセスボタンがあることを確認
    expect(screen.getByRole('link', { name: /アクセスする/ })).toHaveAttribute(
      'href',
      '/test-org-456'
    );
  });
});
