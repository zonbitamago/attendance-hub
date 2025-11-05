import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * ISO 8601形式の日時文字列を日本語形式にフォーマット
 * 例: "2025-11-05T10:30:00.000Z" → "2025年11月5日 10:30"
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return format(date, 'yyyy年M月d日 HH:mm', { locale: ja })
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error)
    return isoString
  }
}

/**
 * ISO 8601形式の日時文字列を日本語の日付のみにフォーマット
 * 例: "2025-11-05T10:30:00.000Z" → "2025年11月5日"
 */
export function formatDate(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return format(date, 'yyyy年M月d日', { locale: ja })
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error)
    return isoString
  }
}

/**
 * ISO 8601形式の日時文字列を時刻のみにフォーマット
 * 例: "2025-11-05T10:30:00.000Z" → "10:30"
 */
export function formatTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return format(date, 'HH:mm', { locale: ja })
  } catch (error) {
    console.error('時刻のフォーマットに失敗しました:', error)
    return isoString
  }
}

/**
 * ISO 8601形式の日時文字列から現在までの相対時間を日本語で取得
 * 例: "2025-11-05T10:30:00.000Z" → "3時間前"
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return formatDistanceToNow(date, { addSuffix: true, locale: ja })
  } catch (error) {
    console.error('相対時間のフォーマットに失敗しました:', error)
    return isoString
  }
}

/**
 * ISO 8601形式の日時文字列を短い形式にフォーマット
 * 今日の日付なら時刻のみ、それ以外は日付と時刻
 * 例: 今日 → "10:30"、昨日以前 → "11/5 10:30"
 */
export function formatSmartDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return format(date, 'HH:mm', { locale: ja })
    } else {
      return format(date, 'M/d HH:mm', { locale: ja })
    }
  } catch (error) {
    console.error('日時のフォーマットに失敗しました:', error)
    return isoString
  }
}

/**
 * 現在の日時をISO 8601形式で取得
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString()
}

/**
 * UUID v4を生成（ブラウザのcrypto APIを使用）
 */
export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  // フォールバック: 簡易的なUUID生成（本番環境では使用しない）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
