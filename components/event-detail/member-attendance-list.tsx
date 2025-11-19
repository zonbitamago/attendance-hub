import type { MemberAttendanceDetail, AttendanceFilterStatus, AttendanceSortBy } from '@/types';

interface MemberAttendanceListProps {
  /** メンバーの出欠詳細リスト */
  members: MemberAttendanceDetail[];
  /** フィルタステータス（デフォルト: 'all'） */
  filterStatus?: AttendanceFilterStatus;
  /** ソート種類（デフォルト: 'name'） */
  sortBy?: AttendanceSortBy;
  /** 検索クエリ（デフォルト: ''） */
  searchQuery?: string;
}

/**
 * メンバー出欠リストコンポーネント
 *
 * グループに所属するメンバーの名前と出欠ステータスをリスト表示します。
 * - 登録済み: ◯/△/✗ のいずれかのステータスアイコン
 * - 未登録: - （ハイフン）
 *
 * @param props.members - 表示するメンバーの出欠詳細配列
 * @param props.filterStatus - フィルタステータス（'all', 'attending', 'maybe', 'notAttending', 'unregistered'）
 * @param props.sortBy - ソート種類（'name', 'status'）
 * @param props.searchQuery - 検索クエリ（部分一致、大文字小文字区別なし）
 * @returns メンバーリストまたは空の状態メッセージ
 */
export function MemberAttendanceList({
  members,
  filterStatus = 'all',
  sortBy = 'name',
  searchQuery = ''
}: MemberAttendanceListProps) {
  // 元のメンバーリストが空の場合は早期リターン
  if (members.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        メンバーがいません
      </div>
    );
  }

  // 検索フィルタリング処理
  const searchedMembers = members.filter((member) => {
    if (!searchQuery) return true;
    return member.memberName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ステータスフィルタリング処理
  const filteredMembers = searchedMembers.filter((member) => {
    switch (filterStatus) {
      case 'all':
        return true;
      case 'attending':
        return member.status === '◯';
      case 'maybe':
        return member.status === '△';
      case 'notAttending':
        return member.status === '✗';
      case 'unregistered':
        return member.status === null;
      default:
        return true;
    }
  });

  // ソート処理
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'name') {
      // 名前順（五十音順/アルファベット順）
      return a.memberName.localeCompare(b.memberName, 'ja');
    } else {
      // ステータス順（◯→△→✗→-）
      const statusOrder: { [key: string]: number } = {
        '◯': 0,
        '△': 1,
        '✗': 2,
        '-': 3,
      };
      const aOrder = statusOrder[a.status ?? '-'] ?? 999;
      const bOrder = statusOrder[b.status ?? '-'] ?? 999;
      return aOrder - bOrder;
    }
  });

  // フィルタリング後に0件になった場合
  if (sortedMembers.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        条件に該当するメンバーがいません
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {sortedMembers.map((member) => {
        // ステータスに応じた色を設定
        const statusColor = member.status === '◯'
          ? 'text-green-600'
          : member.status === '△'
          ? 'text-yellow-600'
          : member.status === '✗'
          ? 'text-red-600'
          : 'text-gray-400';

        return (
          <li
            key={member.memberId}
            className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">{member.memberName}</span>
            <span className={`font-bold text-xl ${statusColor}`}>
              {member.status ?? '-'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
