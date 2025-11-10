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
});
