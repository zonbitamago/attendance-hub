import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { getAllEventDates } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';

// Mockモジュール
jest.mock('@/lib/event-service');
jest.mock('@/lib/attendance-service');

const mockGetAllEventDates = getAllEventDates as jest.MockedFunction<typeof getAllEventDates>;
const mockCalculateEventTotalSummary = calculateEventTotalSummary as jest.MockedFunction<
  typeof calculateEventTotalSummary
>;

describe('Home（イベント一覧ページ）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('イベント一覧の出欠人数表示', () => {
    it('一覧で各イベントの出欠人数を表示できる', async () => {
      // Arrange: モックデータの準備
      const mockEvents = [
        {
          id: 'event1',
          date: '2025-01-15',
          title: '練習',
          location: '音楽室',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'event2',
          date: '2025-01-20',
          title: '本番',
          location: 'ホール',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockReturnValue(mockEvents);

      // event1の出欠集計: ◯ 5人 △ 3人 ✗ 2人（計10人）
      mockCalculateEventTotalSummary.mockImplementation((eventDateId: string) => {
        if (eventDateId === 'event1') {
          return {
            totalAttending: 5,
            totalMaybe: 3,
            totalNotAttending: 2,
            totalResponded: 10,
          };
        }
        // event2の出欠集計: ◯ 8人 △ 1人 ✗ 1人（計10人）
        if (eventDateId === 'event2') {
          return {
            totalAttending: 8,
            totalMaybe: 1,
            totalNotAttending: 1,
            totalResponded: 10,
          };
        }
        return {
          totalAttending: 0,
          totalMaybe: 0,
          totalNotAttending: 0,
          totalResponded: 0,
        };
      });

      // Act: コンポーネントをレンダリング
      render(<Home />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント一覧を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: event1の出欠人数が表示されている
      expect(screen.getByText(/◯ 5人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 3人/)).toBeInTheDocument();
      expect(screen.getAllByText(/✗ 2人/)[0]).toBeInTheDocument();

      // Assert: event2の出欠人数が表示されている
      expect(screen.getByText(/◯ 8人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 1人/)).toBeInTheDocument();
      expect(screen.getAllByText(/✗ 1人/)[0]).toBeInTheDocument();

      // Assert: 両方のイベントで合計10人が表示されている
      const totalElements = screen.getAllByText(/（計10人）/);
      expect(totalElements).toHaveLength(2);
    });

    it('出欠登録がない場合は0人を表示する', async () => {
      // Arrange: モックデータの準備（出欠登録なし）
      const mockEvents = [
        {
          id: 'event1',
          date: '2025-01-15',
          title: '練習',
          location: '音楽室',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockReturnValue(mockEvents);

      // 出欠登録なし: すべて0人
      mockCalculateEventTotalSummary.mockReturnValue({
        totalAttending: 0,
        totalMaybe: 0,
        totalNotAttending: 0,
        totalResponded: 0,
      });

      // Act: コンポーネントをレンダリング
      render(<Home />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント一覧を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: 出欠登録なしの場合「◯ 0人 △ 0人 ✗ 0人（計0人）」が表示されている
      expect(screen.getByText(/◯ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/✗ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/（計0人）/)).toBeInTheDocument();
    });

    it('複数のイベントで正しい人数を表示できる', async () => {
      // Arrange: 複数のイベントをモック
      const mockEvents = [
        {
          id: 'event1',
          date: '2025-01-15',
          title: '練習1',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'event2',
          date: '2025-01-20',
          title: '本番',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'event3',
          date: '2025-01-25',
          title: '練習2',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockReturnValue(mockEvents);

      // 各イベントで異なる出欠集計
      mockCalculateEventTotalSummary.mockImplementation((eventDateId: string) => {
        if (eventDateId === 'event1') {
          return {
            totalAttending: 10,
            totalMaybe: 2,
            totalNotAttending: 3,
            totalResponded: 15,
          };
        }
        if (eventDateId === 'event2') {
          return {
            totalAttending: 12,
            totalMaybe: 1,
            totalNotAttending: 2,
            totalResponded: 15,
          };
        }
        if (eventDateId === 'event3') {
          return {
            totalAttending: 8,
            totalMaybe: 4,
            totalNotAttending: 3,
            totalResponded: 15,
          };
        }
        return {
          totalAttending: 0,
          totalMaybe: 0,
          totalNotAttending: 0,
          totalResponded: 0,
        };
      });

      // Act: コンポーネントをレンダリング
      render(<Home />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント一覧を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: 各イベントが正しい出欠人数を表示している
      expect(screen.getByText(/◯ 10人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 2人/)).toBeInTheDocument();
      expect(screen.getAllByText(/✗ 3人/)[0]).toBeInTheDocument();

      expect(screen.getByText(/◯ 12人/)).toBeInTheDocument();
      expect(screen.getAllByText(/△ 1人/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/✗ 2人/)[0]).toBeInTheDocument();

      expect(screen.getByText(/◯ 8人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 4人/)).toBeInTheDocument();
      expect(screen.getAllByText(/✗ 3人/)[1]).toBeInTheDocument();

      // すべてのイベントの合計が表示されている
      const totalElements = screen.getAllByText(/（計15人）/);
      expect(totalElements).toHaveLength(3);
    });
  });
});
