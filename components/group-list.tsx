'use client'

import Link from 'next/link'
import type { Group } from '@/types'
import { formatDateTime } from '@/lib/date-utils'

interface GroupListProps {
  groups: Group[]
}

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-4">まだグループがありません</p>
          <Link
            href="/groups/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新しいグループを作成
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">全 {groups.length} グループ</p>
        <Link
          href="/groups/new"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + 新しいグループ
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {group.description}
              </p>
            )}
            <p className="text-gray-400 text-xs">
              作成日: {formatDateTime(group.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
