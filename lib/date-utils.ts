import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日本語ロケールで日付をフォーマット
export function formatDate(date: string | Date, formatStr: string = 'yyyy/MM/dd HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: ja });
  } catch (error) {
    console.error('Failed to format date:', error);
    return '日付不明';
  }
}

// 短い日付フォーマット（年月日のみ）
export function formatShortDate(date: string | Date): string {
  return formatDate(date, 'yyyy/MM/dd');
}

// 詳細な日付フォーマット（曜日含む）
export function formatLongDate(date: string | Date): string {
  return formatDate(date, 'yyyy年MM月dd日(E) HH:mm');
}

// 時刻のみ
export function formatTime(date: string | Date): string {
  return formatDate(date, 'HH:mm');
}

// 現在の日時をISO 8601形式で取得
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// 相対時刻表示（例：「2時間前」）
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'たった今';
    } else if (diffMin < 60) {
      return `${diffMin}分前`;
    } else if (diffHour < 24) {
      return `${diffHour}時間前`;
    } else if (diffDay < 7) {
      return `${diffDay}日前`;
    } else {
      return formatShortDate(dateObj);
    }
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return '日付不明';
  }
}
