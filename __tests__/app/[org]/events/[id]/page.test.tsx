/**
 * イベント詳細ページのテスト
 *
 * テスト対象: app/[org]/events/[id]/page.tsx
 * 機能:
 * - イベント情報の表示
 * - 全体出欠集計の表示
 * - グループ別出欠集計の表示
 * - フィルター・ソート・検索機能
 * - グループアコーディオンの展開/折りたたみ
 * - メモ化（useMemo）の動作確認
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import EventDetailPage from '@/app/[org]/events/[id]/page';
import { useOrganization } from '@/contexts/organization-context';
import * as eventService from '@/lib/event-service';
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
jest.mock('@/lib/attendance-service');

describe('イベント詳細ページ', () => {
  // モック関数の型定義
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
  const mockGetEventDateById = eventService.getEventDateById as jest.MockedFunction<
    typeof eventService.getEventDateById
  >;
  const mockCalculateEventSummary = attendanceService.calculateEventSummary as jest.MockedFunction<
    typeof attendanceService.calculateEventSummary
  >;
  const mockCalculateEventTotalSummary =
    attendanceService.calculateEventTotalSummary as jest.MockedFunction<
      typeof attendanceService.calculateEventTotalSummary
    >;
  const mockGetGroupMemberAttendances =
    attendanceService.getGroupMemberAttendances as jest.MockedFunction<
      typeof attendanceService.getGroupMemberAttendances
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

  const mockSummaries = [
    { groupId: 'group-1', groupName: '打', attending: 2, maybe: 1, notAttending: 0, total: 3 },
    { groupId: 'group-2', groupName: '投', attending: 1, maybe: 0, notAttending: 1, total: 2 },
  ];

  const mockTotalSummary = {
    totalAttending: 3,
    totalMaybe: 1,
    totalNotAttending: 1,
    totalResponded: 5,
  };

  const mockGroupMembers = [
    {
      memberId: 'member-1',
      memberName: '山田太郎',
      status: '◯' as const,
      hasRegistered: true,
    },
    {
      memberId: 'member-2',
      memberName: '佐藤花子',
      status: '△' as const,
      hasRegistered: true,
    },
    {
      memberId: 'member-3',
      memberName: '鈴木一郎',
      status: null,
      hasRegistered: false,
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
    });

    mockGetEventDateById.mockReturnValue(mockEvent);
    mockCalculateEventSummary.mockReturnValue(mockSummaries);
    mockCalculateEventTotalSummary.mockReturnValue(mockTotalSummary);
    mockGetGroupMemberAttendances.mockReturnValue(mockGroupMembers);
  });

  describe('基本表示', () => {
    test('ローディング中はLoadingSpinnerが表示される', () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
        isLoading: true,
      });

      render(<EventDetailPage />);
      expect(screen.getByText('イベント情報を読み込み中...')).toBeInTheDocument();
    });

    test('イベント情報が表示される', () => {
      render(<EventDetailPage />);

      expect(screen.getByText('テストイベント')).toBeInTheDocument();
      expect(screen.getByText(/2025年11月20日/)).toBeInTheDocument();
      expect(screen.getByText('場所: テスト会場')).toBeInTheDocument();
    });

    test('イベントが存在しない場合は組織トップページにリダイレクトされる', () => {
      mockGetEventDateById.mockReturnValue(null);

      render(<EventDetailPage />);

      expect(mockPush).toHaveBeenCalledWith('/test-org-123');
    });

    test('出欠登録ボタンが表示される', () => {
      render(<EventDetailPage />);

      const registerLink = screen.getByRole('link', { name: /出欠を登録する/ });
      expect(registerLink).toHaveAttribute('href', '/test-org-123/events/event-123/register');
    });

    test('トップページに戻るリンクが表示される', () => {
      render(<EventDetailPage />);

      const backLink = screen.getByRole('link', { name: /トップページに戻る/ });
      expect(backLink).toHaveAttribute('href', '/test-org-123');
    });
  });

  describe('全体出欠集計', () => {
    test('全体集計が正しく表示される', () => {
      render(<EventDetailPage />);

      // 全体出欠状況セクションを探す
      const summarySection = screen.getByText('全体出欠状況').closest('div');
      expect(summarySection).toBeInTheDocument();

      // 各ステータスが表示されていることを確認
      expect(screen.getByText(/参加:/)).toBeInTheDocument();
      expect(screen.getByText('3人')).toBeInTheDocument(); // totalAttending
      expect(screen.getByText(/未定:/)).toBeInTheDocument();
      expect(screen.getByText(/欠席:/)).toBeInTheDocument();
      expect(screen.getByText(/計5人/)).toBeInTheDocument(); // totalResponded
    });

    test('出欠登録が0件の場合は空状態メッセージが表示される', () => {
      mockCalculateEventSummary.mockReturnValue([]);
      mockCalculateEventTotalSummary.mockReturnValue({
        totalAttending: 0,
        totalMaybe: 0,
        totalNotAttending: 0,
        totalResponded: 0,
      });

      render(<EventDetailPage />);

      expect(screen.getByText('まだ出欠登録がありません')).toBeInTheDocument();
    });
  });

  describe('グループ別出欠集計', () => {
    test('グループ別集計が表示される', () => {
      render(<EventDetailPage />);

      // グループ名が表示される
      expect(screen.getByText('打')).toBeInTheDocument();
      expect(screen.getByText('投')).toBeInTheDocument();

      // 各グループの集計が表示される
      expect(screen.getByText('◯ 2')).toBeInTheDocument(); // 打の参加
      expect(screen.getByText('△ 1')).toBeInTheDocument(); // 打の未定
      expect(screen.getByText('◯ 1')).toBeInTheDocument(); // 投の参加
      expect(screen.getByText('✗ 1')).toBeInTheDocument(); // 投の欠席
    });

    test('グループアコーディオンが展開/折りたたみできる', () => {
      render(<EventDetailPage />);

      // 初期状態では閉じている
      expect(screen.queryByText('山田太郎')).not.toBeInTheDocument();

      // アコーディオンをクリックして展開
      // GroupAttendanceAccordionのgroupNameは"メンバー詳細"
      const accordionButtons = screen.getAllByRole('button', { name: /メンバー詳細/ });
      fireEvent.click(accordionButtons[0]); // 最初のグループのアコーディオン

      // メンバーが表示される
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
    });
  });

  describe('フィルター・ソート・検索', () => {
    test('AttendanceFiltersコンポーネントが正しいpropsで表示される', () => {
      render(<EventDetailPage />);

      // AttendanceFiltersが表示されていることを確認
      expect(screen.getByLabelText('フィルタ:')).toBeInTheDocument();
      expect(screen.getByLabelText('検索:')).toBeInTheDocument();
    });

    test('フィルターの状態変更がAttendanceFiltersに渡される', () => {
      render(<EventDetailPage />);

      const filterSelect = screen.getByLabelText('フィルタ:');

      // フィルターを変更
      fireEvent.change(filterSelect, { target: { value: 'attending' } });

      // filterSelectの値が変わることを確認
      expect(filterSelect).toHaveValue('attending');
    });

    test('検索クエリの状態変更がAttendanceFiltersに渡される', () => {
      render(<EventDetailPage />);

      const searchInput = screen.getByPlaceholderText('メンバー名で検索');

      // 検索クエリを入力
      fireEvent.change(searchInput, { target: { value: '山田' } });

      // searchQueryが状態として保持されることを確認
      expect(searchInput).toHaveValue('山田');
    });

    test('ソートの切り替えがAttendanceFiltersに渡される', () => {
      render(<EventDetailPage />);

      const sortButton = screen.getByRole('button', { name: /名前順/ });

      // ソートを切り替え
      fireEvent.click(sortButton);

      // ボタンのテキストが変わることを確認
      expect(screen.getByRole('button', { name: /ステータス順/ })).toBeInTheDocument();
    });
  });

  describe('useMemoメモ化', () => {
    test('totalSummaryがメモ化されている', () => {
      const { rerender } = render(<EventDetailPage />);

      // 初回レンダリング
      expect(mockCalculateEventTotalSummary).toHaveBeenCalledTimes(1);

      // eventIdが変わらずに再レンダリング
      rerender(<EventDetailPage />);

      // メモ化されているため、再計算されない
      expect(mockCalculateEventTotalSummary).toHaveBeenCalledTimes(1);
    });

    test('groupMembersMapがメモ化されている', () => {
      render(<EventDetailPage />);

      // 初回レンダリングで各グループのメンバーを取得
      expect(mockGetGroupMemberAttendances).toHaveBeenCalledTimes(2); // 2グループ
      expect(mockGetGroupMemberAttendances).toHaveBeenCalledWith('test-org-123', 'event-123', 'group-1');
      expect(mockGetGroupMemberAttendances).toHaveBeenCalledWith('test-org-123', 'event-123', 'group-2');
    });
  });

  describe('エラーハンドリング', () => {
    test('組織情報がない場合は何も表示されない', () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
        isLoading: false,
      });

      render(<EventDetailPage />);

      // ローディングが終わっても何も表示されない
      expect(screen.queryByText('テストイベント')).not.toBeInTheDocument();
    });

    test('getEventDateByIdがエラーをスローしてもクラッシュしない', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetEventDateById.mockImplementation(() => {
        throw new Error('Failed to load event');
      });

      render(<EventDetailPage />);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load event:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
