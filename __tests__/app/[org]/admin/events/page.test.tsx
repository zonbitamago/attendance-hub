import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminEventsPage from '@/app/[org]/admin/events/page';
import * as eventService from '@/lib/event-service';
import * as attendanceService from '@/lib/attendance-service';
import * as organizationContext from '@/contexts/organization-context';
import type { EventDate, Organization } from '@/types';

// モック
jest.mock('@/lib/event-service');
jest.mock('@/lib/attendance-service');
jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  useParams: jest.fn(),
}));
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

describe('Admin Events Page', () => {
  const mockGetAllEventDates = eventService.getAllEventDates as jest.MockedFunction<
    typeof eventService.getAllEventDates
  >;
  const mockCreateEventDate = eventService.createEventDate as jest.MockedFunction<
    typeof eventService.createEventDate
  >;
  const mockUpdateEventDate = eventService.updateEventDate as jest.MockedFunction<
    typeof eventService.updateEventDate
  >;
  const mockDeleteEventDate = eventService.deleteEventDate as jest.MockedFunction<
    typeof eventService.deleteEventDate
  >;
  const mockCalculateEventTotalSummary = attendanceService.calculateEventTotalSummary as jest.MockedFunction<
    typeof attendanceService.calculateEventTotalSummary
  >;
  const mockUseOrganization = organizationContext.useOrganization as jest.MockedFunction<
    typeof organizationContext.useOrganization
  >;
  const { useParams } = require('next/navigation');
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

  const testOrg: Organization = {
    id: 'test-org-1',
    name: 'テスト団体',
    description: 'テスト用の団体',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const testEvents: EventDate[] = [
    {
      id: 'event-1',
      organizationId: 'test-org-1',
      date: '2025-12-01',
      title: 'テストイベント1',
      location: '会場A',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'event-2',
      organizationId: 'test-org-1',
      date: '2025-12-15',
      title: 'テストイベント2',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ org: 'test-org' });
    mockUseOrganization.mockReturnValue({
      organization: testOrg,
      isLoading: false,
      error: null,
    });
    mockGetAllEventDates.mockResolvedValue(testEvents);
    mockCalculateEventTotalSummary.mockResolvedValue({
      totalAttending: 5,
      totalMaybe: 2,
      totalNotAttending: 1,
      totalResponded: 8,
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching events', () => {
      mockGetAllEventDates.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      render(<AdminEventsPage />);
      expect(screen.getByText(/イベント日付を読み込み中/)).toBeInTheDocument();
    });

    it('should hide loading spinner after events are fetched', async () => {
      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/イベント日付を読み込み中/)).not.toBeInTheDocument();
        expect(screen.getByText('イベント日付管理')).toBeInTheDocument();
      });
    });
  });

  describe('Event List Display', () => {
    it('should display event list when events exist', async () => {
      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('テストイベント1')).toBeInTheDocument();
        expect(screen.getByText('テストイベント2')).toBeInTheDocument();
      });
    });

    it('should display empty state when no events exist', async () => {
      mockGetAllEventDates.mockResolvedValue([]);

      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('イベント日付が登録されていません')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching events fails', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAllEventDates.mockRejectedValue(new Error('Network error'));

      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/イベント日付を読み込み中/)).not.toBeInTheDocument();
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should handle error when creating event fails', async () => {
      mockCreateEventDate.mockRejectedValue(new Error('作成に失敗しました'));

      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいイベント日付を作成')).toBeInTheDocument();
      });

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
      fireEvent.change(titleInput, { target: { value: 'クリスマス' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new event', async () => {
      const newEvent: EventDate = {
        id: 'event-3',
        organizationId: 'test-org-1',
        date: '2025-12-25',
        title: 'クリスマス',
        location: '会場B',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      mockCreateEventDate.mockResolvedValue(newEvent);

      render(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('新しいイベント日付を作成')).toBeInTheDocument();
      });

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const locationInput = screen.getByLabelText(/場所/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-25' } });
      fireEvent.change(titleInput, { target: { value: 'クリスマス' } });
      fireEvent.change(locationInput, { target: { value: '会場B' } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateEventDate).toHaveBeenCalledWith('test-org-1', {
          date: '2025-12-25',
          title: 'クリスマス',
          location: '会場B',
        });
      });
    });

    it('should delete an event', async () => {
      mockDeleteEventDate.mockResolvedValue(undefined);
      global.confirm = jest.fn(() => true);

      render(<AdminEventsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(mockDeleteEventDate).toHaveBeenCalledWith('test-org-1', 'event-1');
      });
    });
  });
});
