'use client'

import type { Summary } from '@/types'
import { AttendanceStatusLabel } from '@/types'

interface SummaryCardProps {
  summary: Summary
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        出欠集計
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 出席 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">◯</span>
            <span className="text-xs text-gray-500 font-medium">出席</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {summary.attendingCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">人</p>
        </div>

        {/* 未定 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">△</span>
            <span className="text-xs text-gray-500 font-medium">未定</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {summary.tentativeCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">人</p>
        </div>

        {/* 欠席 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✗</span>
            <span className="text-xs text-gray-500 font-medium">欠席</span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {summary.absentCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">人</p>
        </div>

        {/* 合計 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">👥</span>
            <span className="text-xs text-gray-500 font-medium">合計</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {summary.totalCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">人</p>
        </div>
      </div>

      {/* パーセンテージ表示（オプション） */}
      {summary.totalCount > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">
                出席率: {Math.round((summary.attendingCount / summary.totalCount) * 100)}%
              </span>
            </div>
            {summary.tentativeCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 font-semibold">
                  未定: {Math.round((summary.tentativeCount / summary.totalCount) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
