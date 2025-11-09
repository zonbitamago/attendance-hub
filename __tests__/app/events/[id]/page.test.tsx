import { render, screen, waitFor } from '@testing-library/react';
import EventDetailPage from '@/app/events/[id]/page';
import { getEventDateById } from '@/lib/event-service';
import { calculateEventSummary, calculateEventTotalSummary } from '@/lib/attendance-service';

// Mockモジュール
jest.mock('@/lib/event-service');
jest.mock('@/lib/attendance-service');
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'event1' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockGetEventDateById = getEventDateById as jest.MockedFunction<typeof getEventDateById>;
const mockCalculateEventSummary = calculateEventSummary as jest.MockedFunction<
  typeof calculateEventSummary
>;
const mockCalculateEventTotalSummary = calculateEventTotalSummary as jest.MockedFunction<
  typeof calculateEventTotalSummary
>;

describe('EventDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('イベント全体集計の表示', () => {
    it('グループ別集計の上にイベント全体集計を表示できる', async () => {
      // Arrange: モックデータの準備
      const mockEvent = {
        id: 'event1',
        organizationId: 'test-org-id',
        date: '2025-01-15',
        title: '練習',
        location: '音楽室',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const mockGroupSummaries = [
        {
          groupId: 'group1',
          groupName: '打楽器',
          attending: 5,
          maybe: 2,
          notAttending: 1,
          total: 8,
        },
        {
          groupId: 'group2',
          groupName: '管楽器',
          attending: 7,
          maybe: 1,
          notAttending: 2,
          total: 10,
        },
      ];

      const mockTotalSummary = {
        totalAttending: 12,
        totalMaybe: 3,
        totalNotAttending: 3,
        totalResponded: 18,
      };

      mockGetEventDateById.mockReturnValue(mockEvent);
      mockCalculateEventSummary.mockReturnValue(mockGroupSummaries);
      mockCalculateEventTotalSummary.mockReturnValue(mockTotalSummary);

      // Act: コンポーネントをレンダリング
      render(<EventDetailPage />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: イベント全体集計が表示されている
      expect(screen.getByText('全体出欠状況')).toBeInTheDocument();
      expect(screen.getByText(/参加:/)).toBeInTheDocument();
      expect(screen.getByText(/12人/)).toBeInTheDocument();
      expect(screen.getByText(/未定:/)).toBeInTheDocument();
      const threePersonElements = screen.getAllByText(/3人/);
      expect(threePersonElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/欠席:/)).toBeInTheDocument();
      expect(screen.getByText(/計18人/)).toBeInTheDocument();

      // Assert: グループ別集計も表示されている
      expect(screen.getByText('打楽器')).toBeInTheDocument();
      expect(screen.getByText('管楽器')).toBeInTheDocument();
    });

    it('出欠登録がない場合は0人を表示する', async () => {
      // Arrange: モックデータの準備（出欠登録なし）
      const mockEvent = {
        id: 'event1',
        organizationId: 'test-org-id',
        date: '2025-01-15',
        title: '練習',
        location: '音楽室',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockGetEventDateById.mockReturnValue(mockEvent);
      mockCalculateEventSummary.mockReturnValue([]); // グループ集計なし
      mockCalculateEventTotalSummary.mockReturnValue({
        totalAttending: 0,
        totalMaybe: 0,
        totalNotAttending: 0,
        totalResponded: 0,
      });

      // Act: コンポーネントをレンダリング
      render(<EventDetailPage />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: イベント全体集計が0人で表示されている
      expect(screen.getByText('全体出欠状況')).toBeInTheDocument();
      expect(screen.getByText(/参加:/)).toBeInTheDocument();
      const zeroPersonElements = screen.getAllByText(/0人/);
      expect(zeroPersonElements.length).toBeGreaterThanOrEqual(3); // 参加、未定、欠席
      expect(screen.getByText(/未定:/)).toBeInTheDocument();
      expect(screen.getByText(/欠席:/)).toBeInTheDocument();
      expect(screen.getByText(/計0人/)).toBeInTheDocument();
    });

    it('全体集計がグループ別集計の合計と一致することを確認できる', async () => {
      // Arrange: モックデータの準備
      const mockEvent = {
        id: 'event1',
        organizationId: 'test-org-id',
        date: '2025-01-15',
        title: '練習',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const mockGroupSummaries = [
        {
          groupId: 'group1',
          groupName: '打楽器',
          attending: 5,
          maybe: 2,
          notAttending: 1,
          total: 8,
        },
        {
          groupId: 'group2',
          groupName: '管楽器',
          attending: 7,
          maybe: 1,
          notAttending: 2,
          total: 10,
        },
      ];

      // 全体集計はグループ集計の合計と一致する
      const mockTotalSummary = {
        totalAttending: 12, // 5 + 7
        totalMaybe: 3, // 2 + 1
        totalNotAttending: 3, // 1 + 2
        totalResponded: 18, // 8 + 10
      };

      mockGetEventDateById.mockReturnValue(mockEvent);
      mockCalculateEventSummary.mockReturnValue(mockGroupSummaries);
      mockCalculateEventTotalSummary.mockReturnValue(mockTotalSummary);

      // Act: コンポーネントをレンダリング
      render(<EventDetailPage />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: 全体集計が表示されている
      expect(screen.getByText(/12人/)).toBeInTheDocument();
      expect(screen.getByText(/計18人/)).toBeInTheDocument();

      // Assert: グループ別集計も表示されている
      expect(screen.getByText('打楽器')).toBeInTheDocument();
      expect(screen.getByText('管楽器')).toBeInTheDocument();
    });
  });
});
