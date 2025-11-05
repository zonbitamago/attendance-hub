'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Group } from '@/types'
import { getGroupById } from '@/lib/group-service'
import { AttendanceForm } from '@/components/attendance-form'
import { NotFoundError } from '@/lib/error-utils'

export default function RegisterAttendancePage() {
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    try {
      const loadedGroup = getGroupById(groupId)
      setGroup(loadedGroup)
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError('グループが見つかりませんでした')
      } else {
        setError('グループの読み込みに失敗しました')
      }
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← グループ一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/groups/${groupId}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← グループ詳細に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          出欠を登録
        </h2>
        <p className="text-gray-600 mb-1 font-semibold">
          グループ: {group.name}
        </p>
        {group.description && (
          <p className="text-gray-500 text-sm mb-6">{group.description}</p>
        )}

        <AttendanceForm groupId={groupId} />
      </div>
    </div>
  )
}
