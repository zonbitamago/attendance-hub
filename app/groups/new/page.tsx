'use client'

import Link from 'next/link'
import { GroupForm } from '@/components/group-form'

export default function NewGroupPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← グループ一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          新しいグループを作成
        </h2>
        <p className="text-gray-600 mb-6">
          イベントやミーティングのグループを作成して、出欠確認を始めましょう。
        </p>

        <GroupForm />
      </div>
    </div>
  )
}
