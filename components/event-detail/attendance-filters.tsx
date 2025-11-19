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
  /** 検索クエリ */
  searchQuery?: string;
  /** 検索クエリ変更時のコールバック */
  onSearchChange?: (query: string) => void;
}

/**
 * 出欠フィルタ・ソート・検索コンポーネント
 *
 * ユーザーが特定の出欠ステータスでメンバーをフィルタリングし、
 * 名前順またはステータス順で並び替え、
 * メンバー名で検索できるUIを提供します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns フィルタ・ソート・検索UI
 */
export function AttendanceFilters({
  filterStatus,
  onFilterChange,
  sortBy = 'name',
  onSortChange,
  searchQuery = '',
  onSearchChange,
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(event.target.value);
    }
  };

  const sortLabel = sortBy === 'name' ? '名前順' : 'ステータス順';

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 検索ボックス */}
      {onSearchChange && (
        <div className="flex items-center gap-2">
          <label htmlFor="search-member" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            検索:
          </label>
          <input
            type="text"
            id="search-member"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="メンバー名で検索"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* フィルタドロップダウン */}
      <div className="flex items-center gap-2">
        <label htmlFor="filter-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          フィルタ:
        </label>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
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
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700 dark:text-gray-300"
          aria-label={`ソート: 現在は${sortLabel}`}
        >
          ソート: {sortLabel}
        </button>
      )}
    </div>
  );
}
