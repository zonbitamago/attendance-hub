'use client';

import { MemberAttendanceList } from './member-attendance-list';
import type { MemberAttendanceDetail, AttendanceFilterStatus, AttendanceSortBy } from '@/types';

interface GroupAttendanceAccordionProps {
  /** グループID */
  groupId: string;
  /** グループ名（表示用） */
  groupName: string;
  /** グループに属するメンバーの出欠詳細リスト */
  members: MemberAttendanceDetail[];
  /** アコーディオンが展開されているかどうか */
  isExpanded: boolean;
  /** アコーディオンのトグル時に呼ばれるコールバック */
  onToggle: (groupId: string) => void;
  /** フィルタステータス（デフォルト: 'all'） */
  filterStatus?: AttendanceFilterStatus;
  /** ソート種類（デフォルト: 'name'） */
  sortBy?: AttendanceSortBy;
  /** 検索クエリ（デフォルト: ''） */
  searchQuery?: string;
}

/**
 * グループ出欠アコーディオンコンポーネント
 *
 * グループ名をクリックすると展開/折りたたみが切り替わり、
 * 展開時にそのグループのメンバー出欠リストを表示します。
 *
 * 状態管理は親コンポーネントで行う制御コンポーネントパターンを採用。
 *
 * @param props - コンポーネントのプロパティ
 * @returns アコーディオンUI
 */
export function GroupAttendanceAccordion({
  groupId,
  groupName,
  members,
  isExpanded,
  onToggle,
  filterStatus = 'all',
  sortBy = 'name',
  searchQuery = '',
}: GroupAttendanceAccordionProps) {
  const contentId = `accordion-content-${groupId}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(groupId);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
      <button
        type="button"
        onClick={() => onToggle(groupId)}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>{groupName}</span>
        <span className="text-gray-500 dark:text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div id={contentId} className="p-4">
          <MemberAttendanceList
            members={members}
            filterStatus={filterStatus}
            sortBy={sortBy}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
}
