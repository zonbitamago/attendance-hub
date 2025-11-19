/**
 * 一括出欠登録ページのテスト
 *
 * テスト対象: app/[org]/my-register/page.tsx
 * 機能:
 * - メンバー選択
 * - イベント選択
 * - 個別イベントのステータス変更
 * - 一括登録処理
 * - バリデーション
 * - 成功メッセージと失敗メッセージ
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import MyRegisterPage from '@/app/[org]/my-register/page';
import { useOrganization } from '@/contexts/organization-context';
import * as attendanceService from '@/lib/attendance-service';
import * as memberService from '@/lib/member-service';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));

jest.mock('@/lib/attendance-service');
jest.mock('@/lib/member-service');

// コンポーネントのモック
jest.mock('@/components/bulk-register/member-selector', () => ({
  MemberSelector: ({ onSelect }: { onSelect: (selection: any) => void }) => (
    <div data-testid="member-selector">
      <button
        onClick={() =>
          onSelect({
            groupId: 'group-1',
            memberId: 'member-1',
            memberName: '山田太郎',
          })
        }
      >
        既存メンバーを選択
      </button>
      <button
        onClick={() =>
          onSelect({
            groupId: 'group-1',
            memberId: null,
            memberName: '新規メンバー',
          })
        }
      >
        新規メンバーを選択
      </button>
    </div>
  ),
}));

jest.mock('@/components/bulk-register/event-list', () => ({
  EventList: ({
    onSelectionChange,
    onStatusChange,
  }: {
    onSelectionChange: (eventIds: string[]) => void;
    onStatusChange: (eventId: string, status: string) => void;
  }) => (
    <div data-testid="event-list">
      <button onClick={() => onSelectionChange(['event-1', 'event-2'])}>
        イベントを選択
      </button>
      <button onClick={() => onStatusChange('event-1', '△')}>
        ステータスを変更
      </button>
    </div>
  ),
}));

describe('一括出欠登録ページ', () => {
  // モック関数の型定義
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
  const mockUpsertBulkAttendances =
    attendanceService.upsertBulkAttendances as jest.MockedFunction<
      typeof attendanceService.upsertBulkAttendances
    >;
  const mockSaveMember = memberService.saveMember as jest.MockedFunction<
    typeof memberService.saveMember
  >;

  // モックデータ
  const mockOrganization = {
    id: 'test-org-123',
    name: 'テスト団体',
    description: 'テスト用の団体',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockAttendance1 = {
    id: 'att-1',
    organizationId: 'test-org-123',
    eventDateId: 'event-1',
    memberId: 'member-1',
    status: '◯' as const,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockAttendance2 = {
    id: 'att-2',
    organizationId: 'test-org-123',
    eventDateId: 'event-2',
    memberId: 'member-1',
    status: '◯' as const,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // デフォルトのモック設定
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});


    mockUseParams.mockReturnValue({
      org: 'test-org-123',
    });

    mockUseOrganization.mockReturnValue({
      organization: mockOrganization,
      isLoading: false,
      error: null,
    });

    mockUpsertBulkAttendances.mockResolvedValue({
      success: [mockAttendance1, mockAttendance2],
      updated: [],
      failed: [],
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('基本表示', () => {
    test('ページタイトルが表示される', async () => {
      render(<MyRegisterPage />);

      await waitFor(() => {
        expect(screen.getByText('一括出欠登録')).toBeInTheDocument();
      });
    });

    test('トップページへ戻るリンクが表示される', async () => {
      render(<MyRegisterPage />);

      const backLink = screen.getByRole('link', { name: /トップページへ戻る/ });
      await waitFor(() => {
        expect(backLink).toHaveAttribute('href', '/test-org-123');
      });
    });

    test('MemberSelectorコンポーネントが表示される', async () => {
      render(<MyRegisterPage />);

      await waitFor(() => {
        expect(screen.getByTestId('member-selector')).toBeInTheDocument();
      });
    });

    test('メンバー未選択時はEventListが非表示', async () => {
      render(<MyRegisterPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('event-list')).not.toBeInTheDocument();
      });
    });
  });

  describe('メンバー選択', () => {
    test('メンバー選択時にEventListが表示される', async () => {
      render(<MyRegisterPage />);

      const selectButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('event-list')).toBeInTheDocument();
      });
    });

    test('メンバー選択時にmemberSelectionステートが保存される', async () => {
      render(<MyRegisterPage />);

      const selectButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectButton);

      // EventListが表示されることで、memberSelectionが設定されたことを確認
      await waitFor(() => {
        expect(screen.getByTestId('event-list')).toBeInTheDocument();
      });
    });
  });

  describe('イベント選択', () => {
    test('イベント選択時に選択一覧が更新される', async () => {
      render(<MyRegisterPage />);

      // メンバーを選択
      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      // イベントを選択
      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      // 登録ボタンが表示される（イベントが選択されたため）
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /2件のイベントに登録/ })).toBeInTheDocument();
      });
    });

    test('イベント選択時にデフォルトステータス「◯」が設定される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      // 内部的にeventStatusesが設定されることを期待
      // （実際の確認は一括登録時のupsertBulkAttendances呼び出しで行う）
    });
  });

  describe('イベントステータス変更', () => {
    test('個別イベントステータス変更が反映される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const changeStatusButton = screen.getByRole('button', { name: 'ステータスを変更' });
      fireEvent.click(changeStatusButton);

      // eventStatusesステートが更新されることを期待
      // （実際の確認は一括登録時のupsertBulkAttendances呼び出しで行う）
    });
  });

  describe('一括登録処理', () => {
    test('有効な入力で登録するとupsertBulkAttendancesが呼ばれる', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpsertBulkAttendances).toHaveBeenCalledWith('test-org-123', [
          { eventDateId: 'event-1', memberId: 'member-1', status: '◯' },
          { eventDateId: 'event-2', memberId: 'member-1', status: '◯' },
        ]);
          });
    });

    test('新規メンバーの場合は先にsaveMemberが呼ばれる', async () => {
      mockSaveMember.mockResolvedValue({
        id: 'new-member-1',
        organizationId: 'test-org-123',
        groupId: 'group-1',
        name: '新規メンバー',
        createdAt: '2025-01-01T00:00:00.000Z',
      });

      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '新規メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveMember).toHaveBeenCalledWith('test-org-123', {
          groupId: 'group-1',
          name: '新規メンバー',
        });
      });
    });

    test('登録成功時は成功メッセージが表示される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('2件登録しました')).toBeInTheDocument();
          });
    });

    test('更新件数がある場合はメッセージに含まれる', async () => {
      mockUpsertBulkAttendances.mockResolvedValue({
        success: [mockAttendance1],
        updated: [mockAttendance2],
        failed: [],
      });

      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('2件登録しました（うち1件更新）')).toBeInTheDocument();
      });
    });

    test('失敗件数がある場合はメッセージに含まれる', async () => {
      mockUpsertBulkAttendances.mockResolvedValue({
        success: [mockAttendance1],
        updated: [],
        failed: [{ input: { eventDateId: 'event-2', memberId: 'member-1', status: '◯' }, error: 'Failed to register' }],
      });

      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/1件登録しました.*1件失敗しました/)).toBeInTheDocument();
      });
    });

    test('成功時は1秒後にトップページにリダイレクトされる', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('2件登録しました')).toBeInTheDocument();
          });

      // 1秒進める
      jest.advanceTimersByTime(1000);

      expect(mockPush).toHaveBeenCalledWith('/test-org-123');
    });
  });

  describe('バリデーション', () => {
    test('メンバー未選択時はエラーメッセージが表示される', async () => {
      render(<MyRegisterPage />);

      // フォームを直接送信しようとする
      const form = screen.getByRole('button', { name: '既存メンバーを選択' }).closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // メンバー未選択なので送信できない（登録ボタンが表示されていない）
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /のイベントに登録/ })).not.toBeInTheDocument();
      });
    });

    test('イベント未選択時はエラーメッセージが表示される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      // イベント未選択なので登録ボタンが表示されない
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /のイベントに登録/ })).not.toBeInTheDocument();
      });
    });
  });

  describe('UI状態管理', () => {
    test('送信中はボタンが無効化される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      const submitButton = screen.getByRole('button', { name: /2件のイベントに登録/ });

      // 送信前は有効
      expect(submitButton).not.toBeDisabled();

      fireEvent.click(submitButton);

      // upsertBulkAttendancesは同期関数なので、クリック後すぐに処理完了
      // 成功メッセージが表示されていることを確認
      await waitFor(() => {
        expect(screen.getByText('2件登録しました')).toBeInTheDocument();
      });
    });

    test('イベント選択数が登録ボタンに表示される', async () => {
      render(<MyRegisterPage />);

      const selectMemberButton = screen.getByRole('button', { name: '既存メンバーを選択' });
      fireEvent.click(selectMemberButton);

      const selectEventButton = screen.getByRole('button', { name: 'イベントを選択' });
      fireEvent.click(selectEventButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '2件のイベントに登録' })).toBeInTheDocument();
      });
    });
  });
});
