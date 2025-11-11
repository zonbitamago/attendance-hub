/**
 * date-utils.ts のテスト
 *
 * テスト対象:
 * - formatDate: カスタムフォーマット文字列で日付をフォーマット
 * - formatShortDate: yyyy/MM/dd形式でフォーマット
 * - formatLongDate: yyyy年MM月dd日(E) HH:mm形式でフォーマット
 * - formatTime: HH:mm形式でフォーマット
 * - getCurrentTimestamp: 現在時刻をISO 8601形式で取得
 * - formatRelativeTime: 相対時刻を日本語で表示
 */

import {
  formatDate,
  formatShortDate,
  formatLongDate,
  formatTime,
  getCurrentTimestamp,
  formatRelativeTime,
} from '@/lib/date-utils';

describe('date-utils', () => {
  describe('formatDate', () => {
    test('文字列の日付を指定フォーマットで変換できる', () => {
      const result = formatDate('2025-11-15T14:30:00Z', 'yyyy/MM/dd HH:mm');
      expect(result).toMatch(/2025\/11\/15/); // タイムゾーンに依存しないパターンマッチ
    });

    test('Dateオブジェクトを指定フォーマットで変換できる', () => {
      const date = new Date('2025-11-15T14:30:00Z');
      const result = formatDate(date, 'yyyy/MM/dd');
      expect(result).toMatch(/2025\/11\/15/);
    });

    test('カスタムフォーマット文字列が正しく適用される', () => {
      const result = formatDate('2025-11-15T14:30:00Z', 'yyyy年MM月dd日');
      expect(result).toMatch(/2025年11月15日/);
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('日付不明');
    });

    test('undefined の場合は「日付不明」を返す', () => {
      const result = formatDate(undefined as any);
      expect(result).toBe('日付不明');
    });
  });

  describe('formatShortDate', () => {
    test('文字列の日付をyyyy/MM/dd形式に変換できる', () => {
      const result = formatShortDate('2025-11-15T14:30:00Z');
      expect(result).toMatch(/2025\/11\/15/);
    });

    test('"2025-11-15"が「2025/11/15」になる', () => {
      const result = formatShortDate('2025-11-15');
      expect(result).toMatch(/2025\/11\/15/);
    });

    test('"2025-01-01"が「2025/01/01」になる（ゼロパディング確認）', () => {
      const result = formatShortDate('2025-01-01');
      expect(result).toMatch(/2025\/01\/01/);
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      const result = formatShortDate('invalid-date');
      expect(result).toBe('日付不明');
    });
  });

  describe('formatLongDate', () => {
    test('文字列の日付をyyyy年MM月dd日(E) HH:mm形式に変換できる', () => {
      const result = formatLongDate('2025-11-15T14:30:00Z');
      expect(result).toMatch(/2025年11月15日\(.+\)/); // 曜日を含む
    });

    test('曜日が日本語で表示される', () => {
      // 2025-11-15は土曜日
      const result = formatLongDate('2025-11-15T14:30:00Z');
      expect(result).toContain('土'); // 曜日が日本語
    });

    test('"2025-11-15T14:30:00Z"が正しい日本語形式になる', () => {
      const result = formatLongDate('2025-11-15T14:30:00Z');
      expect(result).toMatch(/2025年11月15日\(.+\) \d{2}:\d{2}/);
    });

    test('時刻が24時間形式で表示される', () => {
      const result = formatLongDate('2025-11-15T14:30:00Z');
      expect(result).toMatch(/\d{2}:\d{2}$/); // HH:mm 形式
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      const result = formatLongDate('invalid-date');
      expect(result).toBe('日付不明');
    });
  });

  describe('formatTime', () => {
    test('文字列の日付からHH:mm形式の時刻を抽出できる', () => {
      const result = formatTime('2025-11-15T14:30:00Z');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    test('"2025-11-15T14:30:00Z"が時刻のみ表示される', () => {
      const result = formatTime('2025-11-15T14:30:00Z');
      expect(result).toMatch(/^\d{2}:\d{2}$/); // HH:mm形式のみ
    });

    test('ゼロパディングが正しく適用される', () => {
      const result = formatTime('2025-11-15T09:05:00Z');
      // HH:mm形式で2桁ずつゼロパディングされていることを確認
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      expect(result.split(':')[0]).toHaveLength(2); // 時は2桁
      expect(result.split(':')[1]).toHaveLength(2); // 分は2桁
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      const result = formatTime('invalid-date');
      expect(result).toBe('日付不明');
    });
  });

  describe('getCurrentTimestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('ISO 8601形式の文字列を返す', () => {
      const result = getCurrentTimestamp();
      expect(result).toBe('2025-11-15T12:00:00.000Z');
    });

    test('返り値がnew Date()でパース可能', () => {
      const result = getCurrentTimestamp();
      const date = new Date(result);
      expect(date.toISOString()).toBe('2025-11-15T12:00:00.000Z');
    });

    test('タイムゾーン情報（Z）が含まれる', () => {
      const result = getCurrentTimestamp();
      expect(result).toContain('Z');
    });

    test('呼び出すたびに異なるタイムスタンプが返る（時刻の進行）', () => {
      const timestamp1 = getCurrentTimestamp();

      // 時刻を1秒進める
      jest.advanceTimersByTime(1000);

      const timestamp2 = getCurrentTimestamp();
      expect(timestamp1).not.toBe(timestamp2);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('30秒前は「たった今」と表示される', () => {
      const date = new Date('2025-11-15T11:59:30Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('たった今');
    });

    test('45分前は「45分前」と表示される', () => {
      const date = new Date('2025-11-15T11:15:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('45分前');
    });

    test('5時間前は「5時間前」と表示される', () => {
      const date = new Date('2025-11-15T07:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('5時間前');
    });

    test('3日前は「3日前」と表示される', () => {
      const date = new Date('2025-11-12T12:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('3日前');
    });

    test('8日前は短い日付形式（yyyy/MM/dd）で表示される', () => {
      const date = new Date('2025-11-07T12:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toMatch(/2025\/11\/07/);
    });

    test('無効な日付の場合は「日付不明」を返す', () => {
      const result = formatRelativeTime('invalid-date');
      expect(result).toBe('日付不明');
    });

    test('未来の日付（負の差分）でもエラーにならない', () => {
      const date = new Date('2025-11-16T12:00:00Z'); // 1日後
      const result = formatRelativeTime(date);
      // 負の差分は diffSec < 60 として扱われ、「たった今」になる
      expect(result).toBe('たった今');
    });
  });
});
