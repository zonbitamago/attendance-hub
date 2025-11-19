import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Home from '@/app/[org]/page';
import * as eventService from '@/lib/event-service';
import * as attendanceService from '@/lib/attendance-service';
import * as organizationContext from '@/contexts/organization-context';
import type { EventDate, Organization } from '@/types';
import { renderWithTheme, setupMatchMediaMock, clearDocumentClasses } from '../../utils/test-utils';

// モック
jest.mock('@/lib/event-service');
jest.mock('@/lib/attendance-service');
jest.mock('@/contexts/organization-context', () => ({
  useOrganization: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));
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

describe('Home Page (Event List)', () => {
  const mockGetAllEventDates = eventService.getAllEventDates as jest.MockedFunction<
    typeof eventService.getAllEventDates
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ org: 'test-org' });
    mockUseOrganization.mockReturnValue({
      organization: testOrg,
      isLoading: false,
      error: null,
    });
    setupMatchMediaMock();
    clearDocumentClasses();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching events', () => {
      // データ取得に時間がかかる状態をシミュレート
      mockGetAllEventDates.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      renderWithTheme(<Home />);

      // ローディング中は「イベント一覧を読み込み中...」が表示される
      expect(screen.getByText(/イベント一覧を読み込み中/)).toBeInTheDocument();
    });

    it('should hide loading spinner after events are fetched', async () => {
      const testEvents: EventDate[] = [
        {
          id: 'event-1',
          organizationId: 'test-org-1',
          date: '2025-12-01',
          title: 'テストイベント',
          location: 'テスト会場',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockResolvedValue(testEvents);
      mockCalculateEventTotalSummary.mockResolvedValue({
        totalAttending: 5,
        totalMaybe: 2,
        totalNotAttending: 1,
        totalResponded: 8,
      });

      renderWithTheme(<Home />);

      // データ取得後はローディングメッセージが消える
      await waitFor(() => {
        expect(screen.queryByText(/イベント一覧を読み込み中/)).not.toBeInTheDocument();
        expect(screen.getByText('テストイベント')).toBeInTheDocument();
      });
    });
  });

  describe('Event List Display', () => {
    it('should display event list when events exist', async () => {
      const testEvents: EventDate[] = [
        {
          id: 'event-1',
          organizationId: 'test-org-1',
          date: '2025-12-01',
          title: 'イベント1',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'event-2',
          organizationId: 'test-org-1',
          date: '2025-12-15',
          title: 'イベント2',
          location: '会場A',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockResolvedValue(testEvents);
      mockCalculateEventTotalSummary.mockResolvedValue({
        totalAttending: 3,
        totalMaybe: 1,
        totalNotAttending: 0,
        totalResponded: 4,
      });

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.getByText('イベント1')).toBeInTheDocument();
        expect(screen.getByText('イベント2')).toBeInTheDocument();
        expect(screen.getByText('2 件')).toBeInTheDocument();
      });
    });

    it('should display empty state when no events exist', async () => {
      mockGetAllEventDates.mockResolvedValue([]);

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.getByText('イベント日付が登録されていません')).toBeInTheDocument();
        expect(screen.getByText('イベント日付を登録する')).toBeInTheDocument();
      });
    });

    it('should display attendance summary for each event', async () => {
      const testEvents: EventDate[] = [
        {
          id: 'event-1',
          organizationId: 'test-org-1',
          date: '2025-12-01',
          title: 'テストイベント',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockGetAllEventDates.mockResolvedValue(testEvents);
      mockCalculateEventTotalSummary.mockResolvedValue({
        totalAttending: 10,
        totalMaybe: 3,
        totalNotAttending: 2,
        totalResponded: 15,
      });

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.getByText('◯ 10人')).toBeInTheDocument();
        expect(screen.getByText('△ 3人')).toBeInTheDocument();
        expect(screen.getByText('✗ 2人')).toBeInTheDocument();
        expect(screen.getByText('（計15人）')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching events fails', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockGetAllEventDates.mockRejectedValue(new Error('Network error'));

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.queryByText(/イベント一覧を読み込み中/)).not.toBeInTheDocument();
        // エラー時はエラーメッセージが表示される
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Organization Info', () => {
    it('should display organization name and description', async () => {
      mockGetAllEventDates.mockResolvedValue([]);

      renderWithTheme(<Home />);

      await waitFor(() => {
        expect(screen.getByText('テスト団体')).toBeInTheDocument();
        expect(screen.getByText('テスト用の団体')).toBeInTheDocument();
      });
    });
  });
});
