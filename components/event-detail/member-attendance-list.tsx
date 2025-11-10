import type { MemberAttendanceDetail } from '@/types';

interface MemberAttendanceListProps {
  /** メンバーの出欠詳細リスト */
  members: MemberAttendanceDetail[];
}

/**
 * メンバー出欠リストコンポーネント
 *
 * グループに所属するメンバーの名前と出欠ステータスをリスト表示します。
 * - 登録済み: ◯/△/✗ のいずれかのステータスアイコン
 * - 未登録: - （ハイフン）
 *
 * @param props.members - 表示するメンバーの出欠詳細配列
 * @returns メンバーリストまたは空の状態メッセージ
 */
export function MemberAttendanceList({ members }: MemberAttendanceListProps) {
  if (members.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        メンバーがいません
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => {
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
            className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 rounded"
          >
            <span className="font-medium text-gray-900">{member.memberName}</span>
            <span className={`font-bold text-xl ${statusColor}`}>
              {member.status ?? '-'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
