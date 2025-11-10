import type { AttendanceFilterStatus } from '@/types';

interface AttendanceFiltersProps {
  /** 現在のフィルタステータス */
  filterStatus: AttendanceFilterStatus;
  /** フィルタ変更時のコールバック */
  onFilterChange: (status: AttendanceFilterStatus) => void;
}

/**
 * 出欠フィルタコンポーネント
 *
 * ユーザーが特定の出欠ステータスでメンバーをフィルタリングできるドロップダウンを提供します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns フィルタUI
 */
export function AttendanceFilters({
  filterStatus,
  onFilterChange,
}: AttendanceFiltersProps) {
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(event.target.value as AttendanceFilterStatus);
  };

  return (
    <div className="flex items-center gap-4">
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
  );
}
