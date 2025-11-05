import { z } from 'zod'
import type {
  AttendanceStatus,
  Group,
  Attendance,
  CreateGroupInput,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from '@/types'

/**
 * 出欠状況のZodスキーマ
 */
export const AttendanceStatusSchema = z.enum(['attending', 'tentative', 'absent'], {
  errorMap: () => ({ message: '出欠状況を選択してください' }),
})

/**
 * グループエンティティのZodスキーマ
 */
export const GroupSchema = z.object({
  id: z.string().uuid('IDの形式が正しくありません'),
  name: z.string().min(1, 'グループ名を入力してください').max(100, 'グループ名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  createdAt: z.string().datetime('日時の形式が正しくありません'),
}) satisfies z.ZodType<Group>

/**
 * 出欠登録エンティティのZodスキーマ
 */
export const AttendanceSchema = z.object({
  id: z.string().uuid('IDの形式が正しくありません'),
  groupId: z.string().uuid('グループIDの形式が正しくありません'),
  userName: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  status: AttendanceStatusSchema,
  createdAt: z.string().datetime('日時の形式が正しくありません'),
}) satisfies z.ZodType<Attendance>

/**
 * グループ作成時の入力データのZodスキーマ
 */
export const CreateGroupInputSchema = z.object({
  name: z
    .string()
    .min(1, 'グループ名を入力してください')
    .max(100, 'グループ名は100文字以内で入力してください')
    .trim(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .trim()
    .optional()
    .or(z.literal('')),
}) satisfies z.ZodType<CreateGroupInput>

/**
 * 出欠登録作成時の入力データのZodスキーマ
 */
export const CreateAttendanceInputSchema = z.object({
  groupId: z.string().uuid('グループIDの形式が正しくありません'),
  userName: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください')
    .trim(),
  status: AttendanceStatusSchema,
}) satisfies z.ZodType<CreateAttendanceInput>

/**
 * 出欠登録更新時の入力データのZodスキーマ
 */
export const UpdateAttendanceInputSchema = z.object({
  id: z.string().uuid('IDの形式が正しくありません'),
  status: AttendanceStatusSchema,
}) satisfies z.ZodType<UpdateAttendanceInput>

/**
 * バリデーション結果の型
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> }

/**
 * Zodバリデーションを実行し、エラーをフィールドごとに整理する
 */
export function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Zodのエラーをフィールドごとに整理
  const errors: Record<string, string[]> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  })

  return { success: false, errors }
}

/**
 * バリデーションエラーメッセージを取得するヘルパー
 */
export function getErrorMessage(
  errors: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  return errors?.[field]?.[0]
}
