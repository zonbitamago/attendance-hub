import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminEventsPage from '@/app/admin/events/page';
import { getAllEventDates, deleteEventDate } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';

// Mockモジュール
jest.mock('@/lib/event-service');
jest.mock('@/lib/attendance-service');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockGetAllEventDates = getAllEventDates as jest.MockedFunction<typeof getAllEventDates>;
const mockDeleteEventDate = deleteEventDate as jest.MockedFunction<typeof deleteEventDate>;
const mockCalculateEventTotalSummary = calculateEventTotalSummary as jest.MockedFunction<
  typeof calculateEventTotalSummary
>;

describe('AdminEventsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトでconfirmをモック（削除テスト用）
    global.confirm = jest.fn(() => true);
  });

  describe('イベント一覧の出欠人数表示', () => {
    it('should render attendance counts for each event in the admin page', async () => {
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
      render(<AdminEventsPage />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
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

    it('should display zero counts when no attendances are registered', async () => {
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
      render(<AdminEventsPage />);

      // Assert: ローディングが終わるのを待つ
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
      });

      // Assert: 出欠登録なしの場合「◯ 0人 △ 0人 ✗ 0人（計0人）」が表示されている
      expect(screen.getByText(/◯ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/△ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/✗ 0人/)).toBeInTheDocument();
      expect(screen.getByText(/（計0人）/)).toBeInTheDocument();
    });

    it('should update attendance counts when an event is deleted', async () => {
      // Arrange: 初期状態で2つのイベントがある
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

      // 最初のレンダリング時は2つのイベント
      let eventsList = [...mockEvents];
      mockGetAllEventDates.mockImplementation(() => eventsList);

      mockCalculateEventTotalSummary.mockImplementation((eventDateId: string) => {
        if (eventDateId === 'event1') {
          return {
            totalAttending: 5,
            totalMaybe: 3,
            totalNotAttending: 2,
            totalResponded: 10,
          };
        }
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

      // 削除処理のモック: event1を削除したら、eventsListを更新
      mockDeleteEventDate.mockImplementation((id: string) => {
        eventsList = eventsList.filter((e) => e.id !== id);
        return true;
      });

      const user = userEvent.setup();

      // Act: コンポーネントをレンダリング
      render(<AdminEventsPage />);

      // Assert: 初期状態で2つのイベントが表示されている
      await waitFor(() => {
        expect(screen.queryByText('イベント情報を読み込み中...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('練習')).toBeInTheDocument();
      expect(screen.getByText('本番')).toBeInTheDocument();
      expect(screen.getByText(/◯ 5人/)).toBeInTheDocument();
      expect(screen.getByText(/◯ 8人/)).toBeInTheDocument();

      // Act: event1を削除
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]); // 最初の削除ボタン（event1）

      // Assert: event1が削除され、event2だけが表示されている
      await waitFor(() => {
        expect(screen.queryByText('練習')).not.toBeInTheDocument();
      });

      expect(screen.getByText('本番')).toBeInTheDocument();
      expect(screen.queryByText(/◯ 5人/)).not.toBeInTheDocument();
      expect(screen.getByText(/◯ 8人/)).toBeInTheDocument();
    });
  });
});
