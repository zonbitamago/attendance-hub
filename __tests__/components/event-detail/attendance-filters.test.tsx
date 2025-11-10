import { render, screen, fireEvent } from '@testing-library/react';
import { AttendanceFilters } from '@/components/event-detail/attendance-filters';
import type { AttendanceFilterStatus } from '@/types';

describe('AttendanceFilters', () => {
  describe('Test Case 1: フィルタドロップダウンの表示', () => {
    it('フィルタドロップダウンが表示され、選択肢が正しい', () => {
      const mockOnFilterChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
        />
      );

      // フィルタドロップダウンが表示されること
      const filterSelect = screen.getByRole('combobox', { name: /フィルタ/i });
      expect(filterSelect).toBeInTheDocument();

      // すべての選択肢が存在すること
      expect(screen.getByRole('option', { name: 'すべて' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '参加のみ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '未定のみ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '欠席のみ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '未登録のみ' })).toBeInTheDocument();
    });

    it('初期値が正しく選択されている', () => {
      const mockOnFilterChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="attending"
          onFilterChange={mockOnFilterChange}
        />
      );

      const filterSelect = screen.getByRole('combobox', { name: /フィルタ/i }) as HTMLSelectElement;
      expect(filterSelect.value).toBe('attending');
    });
  });

  describe('Test Case 2: フィルタ選択時のコールバック', () => {
    it('フィルタを選択するとonFilterChange()が呼ばれる', () => {
      const mockOnFilterChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
        />
      );

      const filterSelect = screen.getByRole('combobox', { name: /フィルタ/i });

      // 「参加のみ」を選択
      fireEvent.change(filterSelect, { target: { value: 'attending' } });
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFilterChange).toHaveBeenCalledWith('attending');

      // 「未登録のみ」を選択
      fireEvent.change(filterSelect, { target: { value: 'unregistered' } });
      expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
      expect(mockOnFilterChange).toHaveBeenCalledWith('unregistered');
    });
  });

  describe('Test Case 3: ソート切り替えボタンの表示', () => {
    it('ソート切り替えボタンが表示され、現在のソート種類が表示される', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSortChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          sortBy="name"
          onSortChange={mockOnSortChange}
        />
      );

      // ソート切り替えボタンが表示されること
      const sortButton = screen.getByRole('button', { name: /ソート/i });
      expect(sortButton).toBeInTheDocument();

      // 現在のソート種類が表示されること（name = 名前順）
      expect(sortButton).toHaveTextContent('名前順');
    });

    it('sortBy="status"の場合、「ステータス順」と表示される', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSortChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          sortBy="status"
          onSortChange={mockOnSortChange}
        />
      );

      const sortButton = screen.getByRole('button', { name: /ソート/i });
      expect(sortButton).toHaveTextContent('ステータス順');
    });
  });

  describe('Test Case 4: ソート切り替え時のコールバック', () => {
    it('名前順の状態でボタンをクリックするとステータス順に切り替わる', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSortChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          sortBy="name"
          onSortChange={mockOnSortChange}
        />
      );

      const sortButton = screen.getByRole('button', { name: /ソート/i });

      // ボタンをクリック
      fireEvent.click(sortButton);

      // onSortChangeが'status'で呼ばれること
      expect(mockOnSortChange).toHaveBeenCalledTimes(1);
      expect(mockOnSortChange).toHaveBeenCalledWith('status');
    });

    it('ステータス順の状態でボタンをクリックすると名前順に切り替わる', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSortChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          sortBy="status"
          onSortChange={mockOnSortChange}
        />
      );

      const sortButton = screen.getByRole('button', { name: /ソート/i });

      // ボタンをクリック
      fireEvent.click(sortButton);

      // onSortChangeが'name'で呼ばれること
      expect(mockOnSortChange).toHaveBeenCalledTimes(1);
      expect(mockOnSortChange).toHaveBeenCalledWith('name');
    });
  });

  describe('Test Case 5: 検索ボックスの表示', () => {
    it('検索ボックスが表示され、プレースホルダーテキストが正しい', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSearchChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      );

      // 検索ボックスが表示されること
      const searchInput = screen.getByRole('textbox', { name: /検索/i });
      expect(searchInput).toBeInTheDocument();

      // プレースホルダーテキストが正しいこと
      expect(searchInput).toHaveAttribute('placeholder', 'メンバー名で検索');
    });

    it('初期値が正しく設定されている', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSearchChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          searchQuery="太郎"
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByRole('textbox', { name: /検索/i }) as HTMLInputElement;
      expect(searchInput.value).toBe('太郎');
    });
  });

  describe('Test Case 6: 検索入力時のコールバック', () => {
    it('検索ボックスに入力するとonSearchChange()が呼ばれる', () => {
      const mockOnFilterChange = jest.fn();
      const mockOnSearchChange = jest.fn();

      render(
        <AttendanceFilters
          filterStatus="all"
          onFilterChange={mockOnFilterChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
        />
      );

      const searchInput = screen.getByRole('textbox', { name: /検索/i });

      // 「太郎」と入力
      fireEvent.change(searchInput, { target: { value: '太郎' } });
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
      expect(mockOnSearchChange).toHaveBeenCalledWith('太郎');

      // 「山田」と入力
      fireEvent.change(searchInput, { target: { value: '山田' } });
      expect(mockOnSearchChange).toHaveBeenCalledTimes(2);
      expect(mockOnSearchChange).toHaveBeenCalledWith('山田');
    });
  });
});
