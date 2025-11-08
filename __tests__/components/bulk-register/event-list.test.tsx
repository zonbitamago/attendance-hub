import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventList } from '@/components/bulk-register/event-list';
import { loadEventDates, loadAttendances } from '@/lib/storage';
import type { EventDate, Attendance, AttendanceStatus } from '@/types';

// storage モジュールをモック
jest.mock('@/lib/storage');

describe('EventList', () => {
  const mockLoadEventDates = loadEventDates as jest.MockedFunction<typeof loadEventDates>;
  const mockLoadAttendances = loadAttendances as jest.MockedFunction<typeof loadAttendances>;

  const mockEventDates: EventDate[] = [
    {
      id: 'event-1',
      date: '2025-01-15',
      title: '定期演奏会',
      location: '市民ホール',
    },
    {
      id: 'event-2',
      date: '2025-01-22',
      title: '通常練習',
      location: '練習場A',
    },
    {
      id: 'event-3',
      date: '2025-01-29',
      title: 'アンサンブル練習',
      location: '練習場B',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadEventDates.mockReturnValue(mockEventDates);
    mockLoadAttendances.mockReturnValue([]);
  });

  describe('Test Case 1: イベント一覧表示', () => {
    it('イベントカードのリストを表示する', () => {
      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId={null}
          selectedEvents={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      // 各イベントが表示される
      expect(screen.getByText('定期演奏会')).toBeInTheDocument();
      expect(screen.getByText('通常練習')).toBeInTheDocument();
      expect(screen.getByText('アンサンブル練習')).toBeInTheDocument();

      // 日付と場所も表示される
      expect(screen.getByText('2025-01-15')).toBeInTheDocument();
      expect(screen.getByText('市民ホール')).toBeInTheDocument();
    });

    it('各イベントにチェックボックスが表示される', () => {
      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId={null}
          selectedEvents={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      // 各イベントのチェックボックスが表示される
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });
  });

  describe('Test Case 2: イベント選択（チェックボックス）', () => {
    it('チェックボックスをクリックして選択/解除できる', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId={null}
          selectedEvents={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      // 最初のイベントを選択
      await user.click(checkboxes[0]);

      expect(onSelectionChange).toHaveBeenNthCalledWith(1, ['event-1']);

      // 2つ目のイベントも選択（selectedEventsは親で管理されるので、ここでは['event-2']のみが渡される）
      await user.click(checkboxes[1]);

      expect(onSelectionChange).toHaveBeenNthCalledWith(2, ['event-2']);
    });

    it('選択済みイベントはチェック状態になる', () => {
      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId={null}
          selectedEvents={['event-1', 'event-3']}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      // event-1とevent-3がチェック状態
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });
  });

  describe('Test Case 3: 既存ステータス表示', () => {
    it('既存登録があるイベントに現在のステータスを表示する', () => {
      const mockAttendances: Attendance[] = [
        {
          id: 'att-1',
          eventDateId: 'event-1',
          memberId: 'member-1',
          status: '◯',
          createdAt: '2025-01-10T10:00:00Z',
        },
        {
          id: 'att-2',
          eventDateId: 'event-3',
          memberId: 'member-1',
          status: '✗',
          createdAt: '2025-01-10T11:00:00Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId="member-1"
          selectedEvents={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      // event-1の現在のステータスが表示される
      expect(screen.getByText(/現在: ◯/)).toBeInTheDocument();

      // event-3の現在のステータスが表示される
      expect(screen.getByText(/現在: ✗/)).toBeInTheDocument();
    });

    it('memberIdがnullの場合、既存ステータスは表示されない', () => {
      const mockAttendances: Attendance[] = [
        {
          id: 'att-1',
          eventDateId: 'event-1',
          memberId: 'member-1',
          status: '◯',
          createdAt: '2025-01-10T10:00:00Z',
        },
      ];

      mockLoadAttendances.mockReturnValue(mockAttendances);

      const onSelectionChange = jest.fn();

      render(
        <EventList
          memberId={null}
          selectedEvents={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      // 既存ステータスは表示されない
      expect(screen.queryByText(/現在:/)).not.toBeInTheDocument();
    });
  });
});
