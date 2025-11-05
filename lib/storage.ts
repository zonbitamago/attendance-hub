import type { Group, Attendance } from '@/types'
import { GroupSchema, AttendanceSchema } from './validation'

/**
 * localStorageのキー
 */
const STORAGE_KEYS = {
  GROUPS: 'attendance-hub:groups',
  ATTENDANCES: 'attendance-hub:attendances',
} as const

/**
 * localStorageからデータを安全に読み込む
 * データが破損している場合は空配列を返す
 */
function safeLoadData<T>(key: string, schema: any): T[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem(key)
    if (!data) {
      return []
    }

    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) {
      console.warn(`データの形式が不正です: ${key}`)
      return []
    }

    // 各アイテムをバリデーション
    const validated = parsed.filter((item) => {
      const result = schema.safeParse(item)
      if (!result.success) {
        console.warn(`無効なデータをスキップしました: ${key}`, result.error)
        return false
      }
      return true
    })

    return validated
  } catch (error) {
    console.error(`データの読み込みに失敗しました: ${key}`, error)
    return []
  }
}

/**
 * localStorageにデータを安全に保存する
 */
function safeSaveData<T>(key: string, data: T[]): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorageの容量制限を超えました')
      throw new Error('データの保存に失敗しました。ストレージの容量が不足しています。')
    }
    console.error(`データの保存に失敗しました: ${key}`, error)
    throw new Error('データの保存に失敗しました')
  }
}

/**
 * グループをlocalStorageから読み込む
 */
export function loadGroups(): Group[] {
  return safeLoadData<Group>(STORAGE_KEYS.GROUPS, GroupSchema)
}

/**
 * グループをlocalStorageに保存する
 */
export function saveGroups(groups: Group[]): void {
  safeSaveData(STORAGE_KEYS.GROUPS, groups)
}

/**
 * 出欠登録をlocalStorageから読み込む
 */
export function loadAttendances(): Attendance[] {
  return safeLoadData<Attendance>(STORAGE_KEYS.ATTENDANCES, AttendanceSchema)
}

/**
 * 出欠登録をlocalStorageに保存する
 */
export function saveAttendances(attendances: Attendance[]): void {
  safeSaveData(STORAGE_KEYS.ATTENDANCES, attendances)
}

/**
 * すべてのデータをクリアする（テスト用）
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.GROUPS)
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCES)
  } catch (error) {
    console.error('データのクリアに失敗しました', error)
  }
}

/**
 * データが破損しているかチェックし、破損している場合は初期化する
 */
export function validateAndRepairStorage(): {
  isValid: boolean
  repairedGroups: boolean
  repairedAttendances: boolean
} {
  let repairedGroups = false
  let repairedAttendances = false

  // グループデータのチェック
  try {
    loadGroups()
    // 読み込めたら問題なし
  } catch (error) {
    console.warn('グループデータが破損しています。初期化します。')
    localStorage.removeItem(STORAGE_KEYS.GROUPS)
    repairedGroups = true
  }

  // 出欠登録データのチェック
  try {
    loadAttendances()
    // 読み込めたら問題なし
  } catch (error) {
    console.warn('出欠登録データが破損しています。初期化します。')
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCES)
    repairedAttendances = true
  }

  return {
    isValid: !repairedGroups && !repairedAttendances,
    repairedGroups,
    repairedAttendances,
  }
}
