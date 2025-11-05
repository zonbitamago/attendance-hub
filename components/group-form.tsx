'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateGroupInput } from '@/types'
import { createGroup } from '@/lib/group-service'
import { ValidationError } from '@/lib/error-utils'

export function GroupForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<CreateGroupInput>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')

    startTransition(() => {
      try {
        const newGroup = createGroup(formData)
        // グループ詳細ページにリダイレクト
        router.push(`/groups/${newGroup.id}`)
      } catch (error) {
        if (error instanceof ValidationError) {
          setErrors(error.fields)
        } else if (error instanceof Error) {
          setSubmitError(error.message)
        } else {
          setSubmitError('グループの作成に失敗しました')
        }
      }
    })
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          グループ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例: 12月の忘年会"
          disabled={isPending}
          autoFocus
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          説明（任意）
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例: 12月20日 18:00〜 新宿の居酒屋で開催"
          disabled={isPending}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isPending}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={isPending}
        >
          {isPending ? '作成中...' : 'グループを作成'}
        </button>
      </div>
    </form>
  )
}
