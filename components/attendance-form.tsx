'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateAttendanceInput, AttendanceStatus } from '@/types'
import { AttendanceStatusLabel } from '@/types'
import { createAttendance } from '@/lib/attendance-service'
import { ValidationError } from '@/lib/error-utils'

interface AttendanceFormProps {
  groupId: string
}

export function AttendanceForm({ groupId }: AttendanceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<CreateAttendanceInput>({
    groupId,
    userName: '',
    status: 'attending',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')
    setSuccessMessage('')

    startTransition(() => {
      try {
        createAttendance(formData)
        setSuccessMessage('出欠を登録しました！')
        // フォームをリセット
        setFormData({
          groupId,
          userName: '',
          status: 'attending',
        })
        // グループ詳細ページにリダイレクト
        setTimeout(() => {
          router.push(`/groups/${groupId}`)
        }, 1000)
      } catch (error) {
        if (error instanceof ValidationError) {
          setErrors(error.fields)
        } else if (error instanceof Error) {
          setSubmitError(error.message)
        } else {
          setSubmitError('出欠登録に失敗しました')
        }
      }
    })
  }

  const handleCancel = () => {
    router.push(`/groups/${groupId}`)
  }

  const statusOptions: AttendanceStatus[] = ['attending', 'tentative', 'absent']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-2">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="userName"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.userName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例: 田中太郎"
          disabled={isPending}
          autoFocus
        />
        {errors.userName && (
          <p className="mt-1 text-sm text-red-600">{errors.userName[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          出欠状況 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFormData({ ...formData, status })}
              className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                formData.status === status
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
              disabled={isPending}
            >
              {AttendanceStatusLabel[status]}
            </button>
          ))}
        </div>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status[0]}</p>
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
          {isPending ? '登録中...' : '出欠を登録'}
        </button>
      </div>
    </form>
  )
}
