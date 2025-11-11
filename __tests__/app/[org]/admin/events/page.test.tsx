/**
 * イベント管理ページのテスト
 *
 * テスト対象: app/[org]/admin/events/page.tsx
 * 機能:
 * - イベント一覧表示（タイトル、日付、場所、出欠人数）
 * - イベント作成（日付、タイトル、場所）
 * - イベント編集
 * - イベント削除
 * - useMemoによる出欠集計のメモ化
 * - エラーハンドリング
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import AdminEventsPage from '@/app/[org]/admin/events/page';
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

describe('イベント管理ページ', () => {
  // モック関数の型定義
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
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
  const mockCalculateEventTotalSummary =
    attendanceService.calculateEventTotalSummary as jest.MockedFunction<
      typeof attendanceService.calculateEventTotalSummary
    >;

  // モックデータ
  const mockOrganization = {
    id: 'test-org-123',
    name: 'テスト団体',
    description: 'テスト用の団体',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockEvents = [
    {
      id: 'event-1',
      organizationId: 'test-org-123',
      title: '定期演奏会',
      date: '2025-11-20T10:00:00.000Z',
      location: '音楽ホール',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'event-2',
      organizationId: 'test-org-123',
      title: '練習',
      date: '2025-11-22T18:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const mockSummary1 = {
    totalAttending: 10,
    totalMaybe: 2,
    totalNotAttending: 1,
    totalResponded: 13,
  };

  const mockSummary2 = {
    totalAttending: 5,
    totalMaybe: 0,
    totalNotAttending: 2,
    totalResponded: 7,
  };

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
    });

    mockGetAllEventDates.mockReturnValue(mockEvents);
    mockCalculateEventTotalSummary
      .mockReturnValueOnce(mockSummary1)
      .mockReturnValueOnce(mockSummary2);
  });

  describe('基本表示', () => {
    test('ローディング中はLoadingSpinnerが表示される', () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
        isLoading: true,
      });

      render(<AdminEventsPage />);
      expect(screen.getByText('イベント情報を読み込み中...')).toBeInTheDocument();
    });

    test('ページタイトルと説明が表示される', () => {
      render(<AdminEventsPage />);

      expect(screen.getByText('イベント日付管理')).toBeInTheDocument();
      expect(screen.getByText('イベント日付の作成・編集・削除を行います')).toBeInTheDocument();
    });

    test('管理画面に戻るリンクが表示される', () => {
      render(<AdminEventsPage />);

      const backLink = screen.getByRole('link', { name: /管理画面に戻る/ });
      expect(backLink).toHaveAttribute('href', '/test-org-123/admin');
    });

    test('イベントが0件の場合はメッセージが表示される', () => {
      mockGetAllEventDates.mockReturnValue([]);

      render(<AdminEventsPage />);

      expect(screen.getByText('イベント日付が登録されていません')).toBeInTheDocument();
    });
  });

  describe('イベント一覧表示', () => {
    test('イベント一覧が表示される', () => {
      render(<AdminEventsPage />);

      expect(screen.getByText('登録済みイベント日付')).toBeInTheDocument();
      expect(screen.getByText('定期演奏会')).toBeInTheDocument();
      expect(screen.getByText('練習')).toBeInTheDocument();
    });

    test('各イベントに編集・削除ボタンが表示される', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      const deleteButtons = screen.getAllByRole('button', { name: '削除' });

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    test('イベントの日付と場所が表示される', () => {
      render(<AdminEventsPage />);

      expect(screen.getByText(/2025年11月20日/)).toBeInTheDocument();
      expect(screen.getByText(/場所: 音楽ホール/)).toBeInTheDocument();
    });

    test('出欠人数が表示される', () => {
      render(<AdminEventsPage />);

      // 定期演奏会の出欠人数
      expect(screen.getByText('◯ 10人')).toBeInTheDocument();
      expect(screen.getByText('△ 2人')).toBeInTheDocument();
      expect(screen.getByText('✗ 1人')).toBeInTheDocument();
      expect(screen.getByText('（計13人）')).toBeInTheDocument();

      // 練習の出欠人数
      expect(screen.getByText('◯ 5人')).toBeInTheDocument();
      expect(screen.getByText('✗ 2人')).toBeInTheDocument();
      expect(screen.getByText('（計7人）')).toBeInTheDocument();
    });
  });

  describe('イベント作成', () => {
    test('新規作成フォームが表示される', () => {
      render(<AdminEventsPage />);

      expect(screen.getByText('新しいイベント日付を作成')).toBeInTheDocument();
      expect(screen.getByLabelText(/日付/)).toBeInTheDocument();
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
      expect(screen.getByLabelText(/場所/)).toBeInTheDocument();
    });

    test('有効な入力で作成ボタンをクリックするとcreateEventDateが呼ばれる', () => {
      const newEvent = {
        id: 'event-3',
        organizationId: 'test-org-123',
        title: '新年会',
        date: '2025-12-31T18:00:00.000Z',
        location: 'レストラン',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateEventDate.mockReturnValue(newEvent);

      render(<AdminEventsPage />);

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const locationInput = screen.getByLabelText(/場所/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
      fireEvent.change(titleInput, { target: { value: '新年会' } });
      fireEvent.change(locationInput, { target: { value: 'レストラン' } });
      fireEvent.click(createButton);

      expect(mockCreateEventDate).toHaveBeenCalledWith('test-org-123', {
        date: '2025-12-31',
        title: '新年会',
        location: 'レストラン',
      });
    });

    test('場所が空の場合はundefinedで作成される', () => {
      const newEvent = {
        id: 'event-3',
        organizationId: 'test-org-123',
        title: '新年会',
        date: '2025-12-31T18:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateEventDate.mockReturnValue(newEvent);

      render(<AdminEventsPage />);

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
      fireEvent.change(titleInput, { target: { value: '新年会' } });
      fireEvent.click(createButton);

      expect(mockCreateEventDate).toHaveBeenCalledWith('test-org-123', {
        date: '2025-12-31',
        title: '新年会',
        location: undefined,
      });
    });

    test('作成成功後はフォームがクリアされる', () => {
      const newEvent = {
        id: 'event-3',
        organizationId: 'test-org-123',
        title: '新年会',
        date: '2025-12-31T18:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
      };
      mockCreateEventDate.mockReturnValue(newEvent);

      render(<AdminEventsPage />);

      const dateInput = screen.getByLabelText(/日付/) as HTMLInputElement;
      const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
      const locationInput = screen.getByLabelText(/場所/) as HTMLInputElement;
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
      fireEvent.change(titleInput, { target: { value: '新年会' } });
      fireEvent.change(locationInput, { target: { value: 'レストラン' } });
      fireEvent.click(createButton);

      expect(dateInput.value).toBe('');
      expect(titleInput.value).toBe('');
      expect(locationInput.value).toBe('');
    });
  });

  describe('イベント編集', () => {
    test('編集ボタンをクリックするとフォームに既存データが入力される', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
      const locationInput = screen.getByLabelText(/場所/) as HTMLInputElement;

      // formDataにデータが設定されていることを確認
      expect(titleInput.value).toBe('定期演奏会');
      expect(locationInput.value).toBe('音楽ホール');
    });

    test('編集中はフォームタイトルが「イベント日付を編集」になる', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('イベント日付を編集')).toBeInTheDocument();
    });

    test('編集中は更新ボタンとキャンセルボタンが表示される', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    test('タイトルを変更して更新ボタンをクリックするとupdateEventDateが呼ばれる', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const updateButton = screen.getByRole('button', { name: '更新' });

      // 日付を有効な形式で設定
      fireEvent.change(dateInput, { target: { value: '2025-11-20' } });
      fireEvent.change(titleInput, { target: { value: '定期演奏会（変更）' } });
      fireEvent.click(updateButton);

      expect(mockUpdateEventDate).toHaveBeenCalledWith('test-org-123', 'event-1', {
        date: '2025-11-20',
        title: '定期演奏会（変更）',
        location: '音楽ホール',
      });
    });

    test('キャンセルボタンをクリックするとフォームがクリアされる', () => {
      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      fireEvent.click(cancelButton);

      const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
      expect(titleInput.value).toBe('');
      expect(screen.getByText('新しいイベント日付を作成')).toBeInTheDocument();
    });
  });

  describe('イベント削除', () => {
    test('削除ボタンをクリックすると確認ダイアログが表示される', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<AdminEventsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('このイベント日付を削除しますか?')
      );

      confirmSpy.mockRestore();
    });

    test('確認ダイアログでOKを選択するとdeleteEventDateが呼ばれる', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<AdminEventsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteEventDate).toHaveBeenCalledWith('test-org-123', 'event-1');

      confirmSpy.mockRestore();
    });

    test('確認ダイアログでキャンセルを選択するとdeleteEventDateが呼ばれない', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<AdminEventsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteEventDate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('useMemoメモ化', () => {
    test('eventSummariesがメモ化されている', () => {
      const { rerender } = render(<AdminEventsPage />);

      // 初回レンダリング
      expect(mockCalculateEventTotalSummary).toHaveBeenCalledTimes(2); // 2イベント

      // 再レンダリング（eventsが変わらない）
      rerender(<AdminEventsPage />);

      // メモ化されているため、再計算されない
      expect(mockCalculateEventTotalSummary).toHaveBeenCalledTimes(2);
    });
  });

  describe('エラーハンドリング', () => {
    test('createEventDate失敗時はエラーメッセージが表示される', () => {
      mockCreateEventDate.mockImplementation(() => {
        throw new Error('作成に失敗しました');
      });

      render(<AdminEventsPage />);

      const dateInput = screen.getByLabelText(/日付/);
      const titleInput = screen.getByLabelText(/タイトル/);
      const createButton = screen.getByRole('button', { name: '作成' });

      fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
      fireEvent.change(titleInput, { target: { value: '新年会' } });
      fireEvent.click(createButton);

      expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
    });

    test('updateEventDate失敗時はエラーメッセージが表示される', () => {
      mockUpdateEventDate.mockImplementation(() => {
        throw new Error('更新に失敗しました');
      });

      render(<AdminEventsPage />);

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      fireEvent.click(editButtons[0]);

      const dateInput = screen.getByLabelText(/日付/);
      const updateButton = screen.getByRole('button', { name: '更新' });

      // 日付を有効な形式で設定
      fireEvent.change(dateInput, { target: { value: '2025-11-20' } });
      fireEvent.click(updateButton);

      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
    });

    test('deleteEventDate失敗時はエラーメッセージが表示される', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockDeleteEventDate.mockImplementation(() => {
        throw new Error('削除に失敗しました');
      });

      render(<AdminEventsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();

      confirmSpy.mockRestore();
    });

    test('組織情報がない場合はローディング状態が表示される', () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
        isLoading: false,
      });

      render(<AdminEventsPage />);

      expect(screen.getByText('イベント情報を読み込み中...')).toBeInTheDocument();
    });

    test('getAllEventDatesがエラーをスローしてもクラッシュしない', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetAllEventDates.mockImplementation(() => {
        throw new Error('Failed to load events');
      });

      render(<AdminEventsPage />);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load events:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
