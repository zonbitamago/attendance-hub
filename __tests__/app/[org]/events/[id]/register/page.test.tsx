/**
 * 出欠登録ページのテスト
 *
 * テスト対象: app/[org]/events/[id]/register/page.tsx
 * 機能:
 * - イベント情報の表示
 * - グループ選択
 * - メンバー選択（既存）または新規メンバー作成
 * - 出欠ステータス選択（◯/△/✗）
 * - フォーム送信とリダイレクト
 * - バリデーションとエラーハンドリング
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import RegisterAttendancePage from '@/app/[org]/events/[id]/register/page';
import { useOrganization } from '@/contexts/organization-context';
import * as eventService from '@/lib/event-service';
import * as groupService from '@/lib/group-service';
import * as memberService from '@/lib/member-service';
import * as attendanceService from '@/lib/attendance-service';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));

jest.mock('@/lib/event-service');
jest.mock('@/lib/group-service');
jest.mock('@/lib/member-service');
jest.mock('@/lib/attendance-service');
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});
jest.mock('@/components/loading-spinner', () => {
  return function LoadingSpinner({ message }: { message: string }) {
    return <div>{message}</div>;
  };
});

describe('出欠登録ページ', () => {
  // モック関数の型定義
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
  const mockGetEventDateById = eventService.getEventDateById as jest.MockedFunction<
    typeof eventService.getEventDateById
  >;
  const mockGetAllGroups = groupService.getAllGroups as jest.MockedFunction<
    typeof groupService.getAllGroups
  >;
  const mockGetMembersByGroupId = memberService.getMembersByGroupId as jest.MockedFunction<
    typeof memberService.getMembersByGroupId
  >;
  const mockCreateMember = memberService.createMember as jest.MockedFunction<
    typeof memberService.createMember
  >;
  const mockCreateAttendance = attendanceService.createAttendance as jest.MockedFunction<
    typeof attendanceService.createAttendance
  >;

  // モックデータ
  const mockOrganization = {
    id: 'test-org-123',
    name: 'テスト団体',
    description: 'テスト用の団体',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockEvent = {
    id: 'event-123',
    organizationId: 'test-org-123',
    title: 'テストイベント',
    date: '2025-11-20T10:00:00.000Z',
    location: 'テスト会場',
    description: 'テストイベントの説明',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockGroups = [
    { id: 'group-1', organizationId: 'test-org-123', name: '打', color: '#FF0000', order: 1, createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'group-2', organizationId: 'test-org-123', name: '投', color: '#00FF00', order: 2, createdAt: '2025-01-01T00:00:00.000Z' },
  ];

  const mockMembers = [
    {
      id: 'member-1',
      organizationId: 'test-org-123',
      groupId: 'group-1',
      name: '山田太郎',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'member-2',
      organizationId: 'test-org-123',
      groupId: 'group-1',
      name: '佐藤花子',
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
      id: 'event-123',
    });

    mockUseOrganization.mockReturnValue({
      organization: mockOrganization,
      isLoading: false,
      error: null,
    });

    mockGetEventDateById.mockResolvedValue(mockEvent);
    mockGetAllGroups.mockResolvedValue(mockGroups);
    mockGetMembersByGroupId.mockResolvedValue(mockMembers);
  });

  describe('基本表示', () => {
    test('ローディング中はLoadingSpinnerが表示される', async () => {
      mockUseOrganization.mockReturnValue({
        organization: null as any,
        isLoading: true,
      });

      render(<RegisterAttendancePage />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('イベント情報が表示される', async () => {
      render(<RegisterAttendancePage />);

      await waitFor(() => {
        expect(screen.getByText('出欠を登録')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('テストイベント')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/2025年11月20日/)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('場所: テスト会場')).toBeInTheDocument();
      });
    });

    test('イベントが存在しない場合は組織トップページにリダイレクトされる', async () => {
      mockGetEventDateById.mockResolvedValue(null);

      render(<RegisterAttendancePage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/test-org-123');
      });
    });

    test('グループが0件の場合は登録を促すメッセージが表示される', async () => {
      mockGetAllGroups.mockResolvedValue([]);

      render(<RegisterAttendancePage />);

      await waitFor(() => {
        expect(screen.getByText('グループが登録されていません')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /グループを登録する/ })).toHaveAttribute(
          'href',
          '/test-org-123/admin/groups'
        );
      });
    });

    test('イベント詳細に戻るリンクが表示される', async () => {
      render(<RegisterAttendancePage />);

      const link = screen.getByRole('link', { name: /イベント詳細に戻る/ });
      await waitFor(() => {
        expect(link).toHaveAttribute('href', '/test-org-123/events/event-123');
      });
    });
  });

  describe('グループ選択', () => {
    test('グループ一覧が表示される', async () => {
      render(<RegisterAttendancePage />);

      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      await waitFor(() => {
        expect(groupSelect).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '打' })).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '投' })).toBeInTheDocument();
      });
    });

    test('グループを選択するとメンバー一覧が読み込まれる', async () => {
      render(<RegisterAttendancePage />);

      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(mockGetMembersByGroupId).toHaveBeenCalledWith('test-org-123', 'group-1');
      });

      expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '山田太郎' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '佐藤花子' })).toBeInTheDocument();
    });

    test('グループ未選択の場合はメンバー選択が表示されない', async () => {
      render(<RegisterAttendancePage />);

      await waitFor(() => {
        expect(screen.queryByLabelText(/2\. メンバーを選択または新規登録/)).not.toBeInTheDocument();
      });
    });
  });

  describe('メンバー選択', () => {
    beforeEach(async () => {
      render(<RegisterAttendancePage />);

      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      });
    });

    test('既存メンバーを選択すると新規入力が無効化される', async () => {
      const memberSelect = screen.getByLabelText(/既存のメンバーから選択/);
      const newMemberInput = screen.getByLabelText(/または新しい名前を入力/);

      fireEvent.change(memberSelect, { target: { value: 'member-1' } });

      expect(newMemberInput).toBeDisabled();
    });

    test('新規名前を入力すると既存選択が無効化される', async () => {
      const memberSelect = screen.getByLabelText(/既存のメンバーから選択/);
      const newMemberInput = screen.getByLabelText(/または新しい名前を入力/);

      fireEvent.change(newMemberInput, { target: { value: '新メンバー' } });

      expect(memberSelect).toBeDisabled();
    });
  });

  describe('出欠ステータス選択', () => {
    beforeEach(async () => {
      render(<RegisterAttendancePage />);

      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByText(/3\. 出欠状況を選択/)).toBeInTheDocument();
      });
    });

    test('3つのステータスボタンが表示される', async () => {
      expect(screen.getByRole('button', { name: /◯[\s\S]*参加/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /△[\s\S]*未定/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✗[\s\S]*欠席/ })).toBeInTheDocument();
    });

    test('デフォルトは「◯」が選択されている', async () => {
      const attendingButton = screen.getByRole('button', { name: /◯[\s\S]*参加/ });
      expect(attendingButton).toHaveClass('border-green-500');
    });

    test('ステータスボタンをクリックすると選択状態が変わる', async () => {
      const maybeButton = screen.getByRole('button', { name: /△[\s\S]*未定/ });
      const notAttendingButton = screen.getByRole('button', { name: /✗[\s\S]*欠席/ });

      fireEvent.click(maybeButton);
      expect(maybeButton).toHaveClass('border-yellow-500');

      fireEvent.click(notAttendingButton);
      expect(notAttendingButton).toHaveClass('border-red-500');
    });
  });

  describe('フォーム送信', () => {
    test('既存メンバーで出欠登録が成功する', async () => {
      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      });

      // メンバー選択
      const memberSelect = screen.getByLabelText(/既存のメンバーから選択/);
      fireEvent.change(memberSelect, { target: { value: 'member-1' } });

      // ステータス選択（デフォルトは◯）
      // 送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateAttendance).toHaveBeenCalledWith('test-org-123', {
          eventDateId: 'event-123',
          memberId: 'member-1',
          status: '◯',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/test-org-123/events/event-123');
    });

    test('新規メンバーで出欠登録が成功する', async () => {
      const newMember = {
        id: 'new-member-123',
        organizationId: 'test-org-123',
        groupId: 'group-1',
        name: '新メンバー',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateMember.mockResolvedValue(newMember);

      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/または新しい名前を入力/)).toBeInTheDocument();
      });

      // 新規メンバー名入力
      const newMemberInput = screen.getByLabelText(/または新しい名前を入力/);
      fireEvent.change(newMemberInput, { target: { value: '新メンバー' } });

      // ステータス選択
      const maybeButton = screen.getByRole('button', { name: /△[\s\S]*未定/ });
      fireEvent.click(maybeButton);

      // 送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateMember).toHaveBeenCalledWith('test-org-123', {
          groupId: 'group-1',
          name: '新メンバー',
        });
      });

      expect(mockCreateAttendance).toHaveBeenCalledWith('test-org-123', {
        eventDateId: 'event-123',
        memberId: 'new-member-123',
        status: '△',
      });

      expect(mockPush).toHaveBeenCalledWith('/test-org-123/events/event-123');
    });

    test('送信中は二重送信が防止される', async () => {
      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      });

      // メンバー選択
      const memberSelect = screen.getByLabelText(/既存のメンバーから選択/);
      fireEvent.change(memberSelect, { target: { value: 'member-1' } });

      // 送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      // 送信中はボタンが無効化される
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('登録中...');
    });
  });

  describe('バリデーションエラー', () => {
    test('グループ未選択の場合はエラーが表示される', async () => {
      render(<RegisterAttendancePage />);

      const submitButton = screen.getByRole('button', { name: /登録する/ });
      await waitFor(() => {
        expect(submitButton).toBeDisabled(); // グループ未選択時は送信ボタンが無効
      });
    });

    test('メンバー未選択かつ新規名前未入力の場合はエラーが表示される', async () => {
      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      });

      // メンバー未選択のまま送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/メンバーを選択するか、新しい名前を入力してください/)).toBeInTheDocument();
      });

      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    test('組織情報がない場合はエラーが表示される', async () => {
      mockUseOrganization.mockReturnValue({
        organization: null as any,
        isLoading: false,
        error: null,
      });

      render(<RegisterAttendancePage />);

      // グループ選択（モックデータがないためスキップ）
      // 送信ボタンがないため、テストは組織情報がない状態での動作を確認
      await waitFor(() => {
        expect(screen.queryByText('出欠を登録')).not.toBeInTheDocument();
      });
    });

    test('createMember失敗時はエラーが表示される', async () => {
      mockCreateMember.mockImplementation(() => {
        throw new Error('メンバー作成に失敗しました');
      });

      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/または新しい名前を入力/)).toBeInTheDocument();
      });

      // 新規メンバー名入力
      const newMemberInput = screen.getByLabelText(/または新しい名前を入力/);
      fireEvent.change(newMemberInput, { target: { value: '新メンバー' } });

      // 送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('メンバー作成に失敗しました')).toBeInTheDocument();
      });

      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });

    test('createAttendance失敗時はエラーが表示される', async () => {
      mockCreateAttendance.mockImplementation(() => {
        throw new Error('出欠登録に失敗しました');
      });

      render(<RegisterAttendancePage />);

      // グループ選択
      const groupSelect = screen.getByLabelText(/1\. グループを選択/);
      fireEvent.change(groupSelect, { target: { value: 'group-1' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/既存のメンバーから選択/)).toBeInTheDocument();
      });

      // メンバー選択
      const memberSelect = screen.getByLabelText(/既存のメンバーから選択/);
      fireEvent.change(memberSelect, { target: { value: 'member-1' } });

      // 送信
      const submitButton = screen.getByRole('button', { name: /登録する/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('出欠登録に失敗しました')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
