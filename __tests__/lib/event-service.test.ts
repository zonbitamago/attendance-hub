import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createEventDate,
  getAllEventDates,
  getEventDateById,
  updateEventDate,
  deleteEventDate,
} from '@/lib/event-service';
import { loadEventDates, clearAllData } from '@/lib/storage';
import type { EventDateInput } from '@/types';

describe('Event Service', () => {
  const TEST_ORG_ID = 'test_org_1';

  beforeEach(() => {
    clearAllData();
  });

  describe('createEventDate', () => {
    it('有効な入力で新しいイベントを作成できる', async () => {
      const input: EventDateInput = {
        date: '2025-12-01',
        title: 'テストイベント',
        location: 'テスト会場',
      };

      const event = await createEventDate(TEST_ORG_ID, input);

      expect(event.id).toBeDefined();
      expect(event.organizationId).toBe(TEST_ORG_ID);
      expect(event.date).toBe('2025-12-01');
      expect(event.title).toBe('テストイベント');
      expect(event.location).toBe('テスト会場');
      expect(event.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('locationが省略可能', async () => {
      const input: EventDateInput = {
        date: '2025-12-15',
        title: 'シンプルイベント',
      };

      const event = await createEventDate(TEST_ORG_ID, input);

      expect(event.title).toBe('シンプルイベント');
      expect(event.location).toBeUndefined();
    });

    it('localStorageに保存される', async () => {
      const input: EventDateInput = {
        date: '2025-12-20',
        title: 'ストレージテストイベント',
      };

      const event = await createEventDate(TEST_ORG_ID, input);

      const events = loadEventDates(TEST_ORG_ID);
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(event.id);
      expect(events[0].title).toBe('ストレージテストイベント');
    });

    it('複数のイベントを作成できる', async () => {
      const input1: EventDateInput = {
        date: '2025-12-01',
        title: 'イベント1',
      };
      const input2: EventDateInput = {
        date: '2025-12-15',
        title: 'イベント2',
      };

      await createEventDate(TEST_ORG_ID, input1);
      await createEventDate(TEST_ORG_ID, input2);

      const events = loadEventDates(TEST_ORG_ID);
      expect(events).toHaveLength(2);
    });

    it('無効な日付形式でエラー', async () => {
      const input = {
        date: 'invalid-date',
        title: 'テストイベント',
      };

      await expect(createEventDate(TEST_ORG_ID, input as EventDateInput)).rejects.toThrow();
    });

    it('空のタイトルでエラー', async () => {
      const input = {
        date: '2025-12-01',
        title: '',
      };

      await expect(createEventDate(TEST_ORG_ID, input as EventDateInput)).rejects.toThrow();
    });
  });

  describe('getAllEventDates', () => {
    it('すべてのイベントを日付昇順で取得できる', async () => {
      await createEventDate(TEST_ORG_ID, { date: '2025-12-15', title: 'イベント2' });
      await createEventDate(TEST_ORG_ID, { date: '2025-12-01', title: 'イベント1' });
      await createEventDate(TEST_ORG_ID, { date: '2025-12-31', title: 'イベント3' });

      const events = await getAllEventDates(TEST_ORG_ID);

      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-12-01');
      expect(events[1].date).toBe('2025-12-15');
      expect(events[2].date).toBe('2025-12-31');
    });

    it('イベントがない場合は空配列を返す', async () => {
      const events = await getAllEventDates(TEST_ORG_ID);
      expect(events).toEqual([]);
    });

    it('異なる団体のイベントは取得しない', async () => {
      await createEventDate(TEST_ORG_ID, { date: '2025-12-01', title: 'イベントA' });
      await createEventDate('other_org', { date: '2025-12-15', title: 'イベントB' });

      const events = await getAllEventDates(TEST_ORG_ID);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('イベントA');
    });
  });

  describe('getEventDateById', () => {
    it('IDでイベントを取得できる', async () => {
      const created = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: 'テストイベント',
      });

      const event = await getEventDateById(TEST_ORG_ID, created.id);

      expect(event).not.toBeNull();
      expect(event?.id).toBe(created.id);
      expect(event?.title).toBe('テストイベント');
    });

    it('存在しないIDの場合nullを返す', async () => {
      const event = await getEventDateById(TEST_ORG_ID, 'nonexistent');
      expect(event).toBeNull();
    });

    it('異なる団体のイベントは取得できない', async () => {
      const created = await createEventDate('other_org', {
        date: '2025-12-01',
        title: '他団体イベント',
      });

      const event = await getEventDateById(TEST_ORG_ID, created.id);
      expect(event).toBeNull();
    });
  });

  describe('updateEventDate', () => {
    it('イベントを更新できる', async () => {
      const created = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: '元のタイトル',
        location: '元の場所',
      });

      const updated = await updateEventDate(TEST_ORG_ID, created.id, {
        title: '更新されたタイトル',
        location: '更新された場所',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe('更新されたタイトル');
      expect(updated.location).toBe('更新された場所');
      expect(updated.date).toBe('2025-12-01'); // 変更していない
    });

    it('部分的な更新ができる（タイトルのみ）', async () => {
      const created = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: '元のタイトル',
        location: '元の場所',
      });

      const updated = await updateEventDate(TEST_ORG_ID, created.id, {
        title: '新しいタイトル',
      });

      expect(updated.title).toBe('新しいタイトル');
      expect(updated.location).toBe('元の場所'); // 変更していない
    });

    it('存在しないイベントの更新でエラー', async () => {
      await expect(
        updateEventDate(TEST_ORG_ID, 'nonexistent', { title: 'テスト' })
      ).rejects.toThrow('イベント日付');
    });

    it('localStorageに反映される', async () => {
      const created = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: '元のタイトル',
      });

      await updateEventDate(TEST_ORG_ID, created.id, {
        title: '更新されたタイトル',
      });

      const events = loadEventDates(TEST_ORG_ID);
      expect(events[0].title).toBe('更新されたタイトル');
    });
  });

  describe('deleteEventDate', () => {
    it('イベントを削除できる', async () => {
      const created = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: 'テストイベント',
      });

      const result = await deleteEventDate(TEST_ORG_ID, created.id);

      expect(result).toBe(true);

      const events = loadEventDates(TEST_ORG_ID);
      expect(events).toHaveLength(0);
    });

    it('存在しないイベントの削除でfalseを返す', async () => {
      const result = await deleteEventDate(TEST_ORG_ID, 'nonexistent');
      expect(result).toBe(false);
    });

    it('複数のイベントから特定のイベントのみ削除', async () => {
      const event1 = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-01',
        title: 'イベント1',
      });
      const event2 = await createEventDate(TEST_ORG_ID, {
        date: '2025-12-15',
        title: 'イベント2',
      });

      await deleteEventDate(TEST_ORG_ID, event1.id);

      const events = loadEventDates(TEST_ORG_ID);
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(event2.id);
    });
  });
});
