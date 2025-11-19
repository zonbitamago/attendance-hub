/**
 * グループ管理ページのテスト
 *
 * テスト対象: app/[org]/admin/groups/page.tsx
 * 機能:
 * - グループ一覧表示
 * - グループ作成（名前、表示順序、カラーコード）
 * - グループ編集
 * - グループ削除
 * - エラーハンドリング
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import AdminGroupsPage from '@/app/[org]/admin/groups/page';
import { useOrganization } from '@/contexts/organization-context';
import * as groupService from '@/lib/group-service';
import { renderWithTheme, setupMatchMediaMock, clearDocumentClasses } from '../../../../utils/test-utils';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));

jest.mock('@/lib/group-service');

jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/components/loading-spinner', () => {
  return function LoadingSpinner({ message }: { message: string }) {
    return <div>{message}</div>;
  };
});

describe('グループ管理ページ', () => {
  // モック関数の型定義
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
  const mockGetAllGroups = groupService.getAllGroups as jest.MockedFunction<
    typeof groupService.getAllGroups
  >;
  const mockCreateGroup = groupService.createGroup as jest.MockedFunction<
    typeof groupService.createGroup
  >;
  const mockUpdateGroup = groupService.updateGroup as jest.MockedFunction<
    typeof groupService.updateGroup
  >;
  const mockDeleteGroup = groupService.deleteGroup as jest.MockedFunction<
    typeof groupService.deleteGroup
  >;

  // モックデータ
  const mockOrganization = {
    id: 'test-org-123',
    name: 'テスト団体',
    description: 'テスト用の団体',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockGroups = [
    {
      id: 'group-1',
      organizationId: 'test-org-123',
      name: '打',
      order: 1,
      color: '#FF0000',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'group-2',
      organizationId: 'test-org-123',
      name: '投',
      order: 2,
      color: '#0000FF',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック設定
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    mockUseParams.mockReturnValue({
      org: 'test-org-123',
    });

    mockUseOrganization.mockReturnValue({
      organization: mockOrganization,
      isLoading: false,
      error: null,
    });

    mockGetAllGroups.mockResolvedValue(mockGroups);
    setupMatchMediaMock();
    clearDocumentClasses();
  });

  describe('基本表示', () => {
    test('ローディング中はLoadingSpinnerが表示される', () => {
      // データ取得に時間がかかる状態をシミュレート
      mockGetAllGroups.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      renderWithTheme(<AdminGroupsPage />);
      expect(screen.getByText('グループ情報を読み込み中...')).toBeInTheDocument();
    });

    test('ローディング完了後はコンテンツが表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.queryByText('グループ情報を読み込み中...')).not.toBeInTheDocument();
        expect(screen.getByText('グループ管理')).toBeInTheDocument();
      });
    });

    test('ページタイトルと説明が表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('グループ管理')).toBeInTheDocument();
        expect(screen.getByText('グループの作成・編集・削除を行います')).toBeInTheDocument();
      });
    });

    test('管理画面に戻るリンクが表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /管理画面に戻る/ });
        expect(backLink).toHaveAttribute('href', '/test-org-123/admin');
      });
    });

    test('グループが0件の場合はメッセージが表示される', async () => {
      mockGetAllGroups.mockResolvedValue([]);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('グループが登録されていません')).toBeInTheDocument();
      });
    });
  });

  describe('グループ一覧表示', () => {
    test('グループ一覧が表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('登録済みグループ')).toBeInTheDocument();
        expect(screen.getByText('打')).toBeInTheDocument();
        expect(screen.getByText('投')).toBeInTheDocument();
        expect(screen.getByText('表示順序: 1')).toBeInTheDocument();
        expect(screen.getByText('表示順序: 2')).toBeInTheDocument();
      });
    });

    test('各グループに編集・削除ボタンが表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });

        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    test('カラーコードが設定されている場合は色が表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const colorBoxes = screen.getAllByRole('generic').filter((el) => {
          return el.style.backgroundColor !== '';
        });

        expect(colorBoxes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('グループ作成', () => {
    test('新規作成フォームが表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
        expect(screen.getByLabelText(/グループ名/)).toBeInTheDocument();
        expect(screen.getByLabelText(/表示順序/)).toBeInTheDocument();
        expect(screen.getByLabelText(/カラーコード/)).toBeInTheDocument();
      });
    });

    test('有効な入力で作成ボタンをクリックするとcreateGroupが呼ばれる', async () => {
      const newGroup = {
        id: 'group-3',
        organizationId: 'test-org-123',
        name: 'Sax',
        order: 3,
        color: '#00FF00',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateGroup.mockResolvedValue(newGroup);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/グループ名/);
      const orderInput = screen.getByLabelText(/表示順序/);
      const colorInput = screen.getByLabelText(/カラーコード/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(nameInput, { target: { value: 'Sax' } });
      fireEvent.change(orderInput, { target: { value: '3' } });
      fireEvent.change(colorInput, { target: { value: '#00FF00' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateGroup).toHaveBeenCalledWith('test-org-123', {
          name: 'Sax',
          order: 3,
          color: '#00FF00',
        });
      });
    });

    test('カラーコードが空の場合はundefinedで作成される', async () => {
      const newGroup = {
        id: 'group-3',
        organizationId: 'test-org-123',
        name: 'Sax',
        order: 3,
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateGroup.mockResolvedValue(newGroup);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/グループ名/);
      const orderInput = screen.getByLabelText(/表示順序/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(nameInput, { target: { value: 'Sax' } });
      fireEvent.change(orderInput, { target: { value: '3' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateGroup).toHaveBeenCalledWith('test-org-123', {
          name: 'Sax',
          order: 3,
          color: undefined,
        });
      });
    });

    test('作成成功後はフォームがクリアされる', async () => {
      const newGroup = {
        id: 'group-3',
        organizationId: 'test-org-123',
        name: 'Sax',
        order: 3,
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateGroup.mockResolvedValue(newGroup);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/グループ名/) as HTMLInputElement;
      const orderInput = screen.getByLabelText(/表示順序/) as HTMLInputElement;
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(nameInput, { target: { value: 'Sax' } });
      fireEvent.change(orderInput, { target: { value: '3' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(orderInput.value).toBe('0');
      });
    });
  });

  describe('グループ編集', () => {
    test('編集ボタンをクリックするとフォームに既存データが入力される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByLabelText(/グループ名/) as HTMLInputElement;
      const orderInput = screen.getByLabelText(/表示順序/) as HTMLInputElement;
      const colorInput = screen.getByLabelText(/カラーコード/) as HTMLInputElement;

      expect(nameInput.value).toBe('打');
      expect(orderInput.value).toBe('1');
      expect(colorInput.value).toBe('#FF0000');
    });

    test('編集中はフォームタイトルが「グループを編集」になる', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('グループを編集')).toBeInTheDocument();
    });

    test('編集中は更新ボタンとキャンセルボタンが表示される', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    test('グループ名を変更して更新ボタンをクリックするとupdateGroupが呼ばれる', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByLabelText(/グループ名/);
      const updateButton = screen.getByRole('button', { name: '更新' });

      fireEvent.change(nameInput, { target: { value: '打楽器' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalledWith('test-org-123', 'group-1', {
          name: '打楽器',
          order: 1,
          color: '#FF0000',
        });
      });
    });

    test('キャンセルボタンをクリックするとフォームがクリアされる', async () => {
      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      fireEvent.click(cancelButton);

      const nameInput = screen.getByLabelText(/グループ名/) as HTMLInputElement;
      expect(nameInput.value).toBe('');
      expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
    });
  });

  describe('グループ削除', () => {
    test('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('このグループを削除しますか?')
      );

      confirmSpy.mockRestore();
    });

    test('確認ダイアログでOKを選択するとdeleteGroupが呼ばれる', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(mockDeleteGroup).toHaveBeenCalledWith('test-org-123', 'group-1');
      });

      confirmSpy.mockRestore();
    });

    test('確認ダイアログでキャンセルを選択するとdeleteGroupが呼ばれない', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);
      });

      expect(mockDeleteGroup).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    test('データ読み込み失敗時はエラーメッセージが表示される', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAllGroups.mockRejectedValue(new Error('Network error'));

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/グループ情報を読み込み中/)).not.toBeInTheDocument();
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    test('createGroup失敗時はエラーメッセージが表示される', async () => {
      mockCreateGroup.mockRejectedValue(new Error('作成に失敗しました'));

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいグループを作成')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/グループ名/);
      const orderInput = screen.getByLabelText(/表示順序/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(nameInput, { target: { value: 'Sax' } });
      fireEvent.change(orderInput, { target: { value: '3' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
      });
    });

    test('updateGroup失敗時はエラーメッセージが表示される', async () => {
      mockUpdateGroup.mockRejectedValue(new Error('更新に失敗しました'));

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: '編集' });
        fireEvent.click(editButtons[0]);
      });

      await waitFor(() => {
        const updateButton = screen.getByRole('button', { name: '更新' });
        fireEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
      });
    });

    test('deleteGroup失敗時はエラーメッセージが表示される', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockDeleteGroup.mockRejectedValue(new Error('削除に失敗しました'));

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    test('グループデータの読み込みに失敗した場合はエラーメッセージが表示される', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAllGroups.mockRejectedValue(new Error('データの読み込みに失敗しました'));

      renderWithTheme(<AdminGroupsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/グループを読み込み中/)).not.toBeInTheDocument();
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
        expect(screen.getByText(/データの読み込みに失敗しました/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });
});
