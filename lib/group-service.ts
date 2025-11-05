import type { Group, CreateGroupInput } from '@/types'
import { loadGroups, saveGroups } from './storage'
import { CreateGroupInputSchema } from './validation'
import { generateId, getCurrentDateTime } from './date-utils'
import { NotFoundError, ValidationError } from './error-utils'

/**
 * グループを新規作成する
 * @throws {ValidationError} バリデーションエラー
 */
export function createGroup(input: CreateGroupInput): Group {
  // バリデーション
  const result = CreateGroupInputSchema.safeParse(input)
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

  // 新しいグループを作成
  const newGroup: Group = {
    id: generateId(),
    name: validatedInput.name.trim(),
    description: validatedInput.description?.trim() || undefined,
    createdAt: getCurrentDateTime(),
  }

  // 既存のグループを読み込み
  const groups = loadGroups()

  // 新しいグループを追加
  groups.push(newGroup)

  // 保存
  saveGroups(groups)

  return newGroup
}

/**
 * すべてのグループを取得する（作成日時の降順）
 */
export function getAllGroups(): Group[] {
  const groups = loadGroups()

  // 作成日時の降順でソート（新しいものが上）
  return groups.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * IDでグループを取得する
 * @throws {NotFoundError} グループが見つからない場合
 */
export function getGroupById(id: string): Group {
  const groups = loadGroups()
  const group = groups.find((g) => g.id === id)

  if (!group) {
    throw new NotFoundError('グループ', id)
  }

  return group
}

/**
 * グループを削除する（将来的な拡張用）
 * @throws {NotFoundError} グループが見つからない場合
 */
export function deleteGroup(id: string): void {
  const groups = loadGroups()
  const index = groups.findIndex((g) => g.id === id)

  if (index === -1) {
    throw new NotFoundError('グループ', id)
  }

  groups.splice(index, 1)
  saveGroups(groups)
}

/**
 * グループ数を取得する
 */
export function getGroupCount(): number {
  const groups = loadGroups()
  return groups.length
}
