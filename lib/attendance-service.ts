import type {
  Attendance,
  CreateAttendanceInput,
  UpdateAttendanceInput,
  Summary,
} from '@/types'
import { loadAttendances, saveAttendances } from './storage'
import { CreateAttendanceInputSchema, UpdateAttendanceInputSchema } from './validation'
import { generateId, getCurrentDateTime } from './date-utils'
import { NotFoundError, ValidationError } from './error-utils'

/**
 * 出欠登録を新規作成する
 * @throws {ValidationError} バリデーションエラー
 */
export function createAttendance(input: CreateAttendanceInput): Attendance {
  // バリデーション
  const result = CreateAttendanceInputSchema.safeParse(input)
  if (!result.success) {
    const errors: Record<string, string[]> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(issue.message)
    })
    throw new ValidationError(errors)
  }

  const validatedInput = result.data

  // 新しい出欠登録を作成
  const newAttendance: Attendance = {
    id: generateId(),
    groupId: validatedInput.groupId,
    userName: validatedInput.userName.trim(),
    status: validatedInput.status,
    createdAt: getCurrentDateTime(),
  }

  // 既存の出欠登録を読み込み
  const attendances = loadAttendances()

  // 新しい出欠登録を追加
  attendances.push(newAttendance)

  // 保存
  saveAttendances(attendances)

  return newAttendance
}

/**
 * 指定されたグループの出欠登録を取得する（登録日時の降順）
 */
export function getAttendancesByGroupId(groupId: string): Attendance[] {
  const attendances = loadAttendances()

  // 指定されたグループの出欠登録のみフィルタ
  const groupAttendances = attendances.filter((a) => a.groupId === groupId)

  // 登録日時の降順でソート（新しいものが上）
  return groupAttendances.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * グループの出欠状況を集計する（User Story 2）
 */
export function calculateSummary(groupId: string): Summary {
  const attendances = getAttendancesByGroupId(groupId)

  const summary: Summary = {
    groupId,
    attendingCount: 0,
    tentativeCount: 0,
    absentCount: 0,
    totalCount: attendances.length,
  }

  attendances.forEach((attendance) => {
    switch (attendance.status) {
      case 'attending':
        summary.attendingCount++
        break
      case 'tentative':
        summary.tentativeCount++
        break
      case 'absent':
        summary.absentCount++
        break
    }
  })

  return summary
}

/**
 * 出欠登録を更新する（User Story 3）
 * @throws {ValidationError} バリデーションエラー
 * @throws {NotFoundError} 出欠登録が見つからない場合
 */
export function updateAttendance(input: UpdateAttendanceInput): Attendance {
  // バリデーション
  const result = UpdateAttendanceInputSchema.safeParse(input)
  if (!result.success) {
    const errors: Record<string, string[]> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(issue.message)
    })
    throw new ValidationError(errors)
  }

  const validatedInput = result.data

  // 既存の出欠登録を読み込み
  const attendances = loadAttendances()

  // 更新対象を検索
  const index = attendances.findIndex((a) => a.id === validatedInput.id)
  if (index === -1) {
    throw new NotFoundError('出欠登録', validatedInput.id)
  }

  // 出欠状況を更新（他のフィールドは変更しない）
  attendances[index] = {
    ...attendances[index],
    status: validatedInput.status,
  }

  // 保存
  saveAttendances(attendances)

  return attendances[index]
}

/**
 * 出欠登録を削除する（User Story 3）
 * @throws {NotFoundError} 出欠登録が見つからない場合
 */
export function deleteAttendance(id: string): void {
  const attendances = loadAttendances()

  const index = attendances.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new NotFoundError('出欠登録', id)
  }

  attendances.splice(index, 1)
  saveAttendances(attendances)
}

/**
 * グループの出欠履歴を時系列で取得する（User Story 4）
 * 登録日時の昇順（古いものから新しいものへ）
 */
export function getAttendanceHistoryByGroupId(groupId: string): Attendance[] {
  const attendances = loadAttendances()

  // 指定されたグループの出欠登録のみフィルタ
  const groupAttendances = attendances.filter((a) => a.groupId === groupId)

  // 登録日時の昇順でソート（古いものから新しいものへ）
  return groupAttendances.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

/**
 * IDで出欠登録を取得する
 * @throws {NotFoundError} 出欠登録が見つからない場合
 */
export function getAttendanceById(id: string): Attendance {
  const attendances = loadAttendances()
  const attendance = attendances.find((a) => a.id === id)

  if (!attendance) {
    throw new NotFoundError('出欠登録', id)
  }

  return attendance
}
