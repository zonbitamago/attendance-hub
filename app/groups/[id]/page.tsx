'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Group, Attendance, Summary } from '@/types'
import { AttendanceStatusSymbol } from '@/types'
import { getGroupById } from '@/lib/group-service'
import { getAttendancesByGroupId, calculateSummary } from '@/lib/attendance-service'
import { formatDateTime } from '@/lib/date-utils'
import { NotFoundError } from '@/lib/error-utils'
import { SummaryCard } from '@/components/summary-card'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    try {
      const loadedGroup = getGroupById(groupId)
      const loadedAttendances = getAttendancesByGroupId(groupId)
      const calculatedSummary = calculateSummary(groupId)
      setGroup(loadedGroup)
      setAttendances(loadedAttendances)
      setSummary(calculatedSummary)
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
      <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← グループ一覧に戻る
        </Link>
      </div>

      {/* グループ情報 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {group.name}
        </h2>
        {group.description && (
          <p className="text-gray-600 mb-4">{group.description}</p>
        )}
        <p className="text-gray-400 text-sm">
          作成日: {formatDateTime(group.createdAt)}
        </p>
      </div>

      {/* 出欠登録ボタン */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              出欠を登録する
            </h3>
            <p className="text-gray-600 text-sm">
              あなたの出欠状況を登録してください
            </p>
          </div>
          <Link
            href={`/groups/${groupId}/register`}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            出欠を登録
          </Link>
        </div>
      </div>

      {/* 集計結果 */}
      {summary && summary.totalCount > 0 && (
        <SummaryCard summary={summary} />
      )}

      {/* 出欠一覧 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          出欠一覧 ({attendances.length}人)
        </h3>

        {attendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだ出欠登録がありません
          </div>
        ) : (
          <div className="space-y-3">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {AttendanceStatusSymbol[attendance.status]}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {attendance.userName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(attendance.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
