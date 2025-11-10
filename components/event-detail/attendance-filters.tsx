import type { AttendanceFilterStatus, AttendanceSortBy } from '@/types';

interface AttendanceFiltersProps {
  /** 現在のフィルタステータス */
  filterStatus: AttendanceFilterStatus;
  /** フィルタ変更時のコールバック */
  onFilterChange: (status: AttendanceFilterStatus) => void;
  /** ソート種類（デフォルト: 'name'） */
  sortBy?: AttendanceSortBy;
  /** ソート変更時のコールバック */
  onSortChange?: (sortBy: AttendanceSortBy) => void;
}

/**
 * 出欠フィルタ・ソートコンポーネント
 *
 * ユーザーが特定の出欠ステータスでメンバーをフィルタリングし、
 * 名前順またはステータス順で並び替えできるUIを提供します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns フィルタ・ソートUI
 */
export function AttendanceFilters({
  filterStatus,
  onFilterChange,
  sortBy = 'name',
  onSortChange,
}: AttendanceFiltersProps) {
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(event.target.value as AttendanceFilterStatus);
  };

  const handleSortToggle = () => {
    if (onSortChange) {
      const newSortBy: AttendanceSortBy = sortBy === 'name' ? 'status' : 'name';
      onSortChange(newSortBy);
    }
  };

  const sortLabel = sortBy === 'name' ? '名前順' : 'ステータス順';

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* フィルタドロップダウン */}
      <div className="flex items-center gap-2">
        <label htmlFor="filter-status" className="text-sm font-medium text-gray-700">
          フィルタ:
        </label>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
        >
          <option value="all">すべて</option>
          <option value="attending">参加のみ</option>
          <option value="maybe">未定のみ</option>
          <option value="notAttending">欠席のみ</option>
          <option value="unregistered">未登録のみ</option>
        </select>
      </div>

      {/* ソート切り替えボタン */}
      {onSortChange && (
        <button
          type="button"
          onClick={handleSortToggle}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
          aria-label={`ソート: 現在は${sortLabel}`}
        >
          ソート: {sortLabel}
        </button>
      )}
    </div>
  );
}
