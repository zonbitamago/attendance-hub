'use client'

import { useEffect, useState } from 'react'
import type { Group } from '@/types'
import { getAllGroups } from '@/lib/group-service'
import { GroupList } from '@/components/group-list'

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorageからグループを読み込む
    try {
      const loadedGroups = getAllGroups()
      setGroups(loadedGroups)
    } catch (error) {
      console.error('グループの読み込みに失敗しました', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          グループ一覧
        </h2>
        <p className="text-gray-600 mb-6">
          グループを作成して、出欠確認を始めましょう。
        </p>

        <GroupList groups={groups} />
      </div>
    </div>
  )
}
