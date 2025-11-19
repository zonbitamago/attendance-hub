'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAllEventDates, createEventDate, updateEventDate, deleteEventDate } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Message } from '@/components/ui/message';
import { Heading } from '@/components/ui/heading';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { EventDate, EventTotalSummary } from '@/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();
  const [events, setEvents] = useState<EventDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDate | null>(null);
  const [formData, setFormData] = useState({ date: '', title: '', location: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!organization) return;

      try {
        setIsLoading(true);
        setLoadError(null);
        const allEvents = await getAllEventDates(organization.id);

        if (isMounted) {
          setEvents(allEvents);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [organization, reloadKey]);

  // すべてのイベントの出欠集計を非同期で計算
  const [eventSummaries, setEventSummaries] = useState<Map<string, EventTotalSummary>>(new Map());

  useEffect(() => {
    let isMounted = true;

    const loadSummaries = async () => {
      if (!organization || events.length === 0) {
        setEventSummaries(new Map());
        return;
      }

      const summaries = new Map<string, EventTotalSummary>();
      for (const event of events) {
        const summary = await calculateEventTotalSummary(organization.id, event.id);
        summaries.set(event.id, summary);
      }

      if (isMounted) {
        setEventSummaries(summaries);
      }
    };

    loadSummaries();

    return () => {
      isMounted = false;
    };
  }, [events, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!organization) {
      setError('団体情報が見つかりません');
      return;
    }

    try {
      if (editingEvent) {
        // 更新
        await updateEventDate(organization.id, editingEvent.id, {
          date: formData.date,
          title: formData.title,
          location: formData.location || undefined,
        });
      } else {
        // 新規作成
        await createEventDate(organization.id, {
          date: formData.date,
          title: formData.title,
          location: formData.location || undefined,
        });
      }
      setFormData({ date: '', title: '', location: '' });
      setEditingEvent(null);
      setIsEditing(false);
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const handleEdit = (event: EventDate) => {
    setEditingEvent(event);
    setFormData({
      date: event.date,
      title: event.title,
      location: event.location || '',
    });
    setIsEditing(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このイベント日付を削除しますか?\n\n※ この日付に関連する出欠登録も削除されます。')) {
      return;
    }

    if (!organization) {
      setError('団体情報が見つかりません');
      return;
    }

    try {
      await deleteEventDate(organization.id, id);
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleCancel = () => {
    setFormData({ date: '', title: '', location: '' });
    setEditingEvent(null);
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="イベント日付を読み込み中..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Message type="error">エラーが発生しました: {loadError.message}</Message>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* テーマ切替 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${org}/admin`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            ← 管理画面に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">イベント日付管理</Heading>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            イベント日付の作成・編集・削除を行います
          </p>
        </div>

        {/* フォーム */}
        <Card className="mb-6 sm:mb-8">
          <Heading level={2} className="mb-4">
            {editingEvent ? 'イベント日付を編集' : '新しいイベント日付を作成'}
          </Heading>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日付 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                ariaLabel="イベント日付"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例: 定期演奏会, 練習"
                required
                ariaLabel="イベントタイトル"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                場所（任意）
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例: 音楽ホール"
                ariaLabel="イベント場所"
              />
            </div>

            {error && (
              <Message type="error">{error}</Message>
            )}

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingEvent ? '更新' : '作成'}
              </Button>
              {isEditing && (
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  キャンセル
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* イベント一覧 */}
        <Card>
          <Heading level={2} className="mb-4">登録済みイベント日付</Heading>
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">イベント日付が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                let summary = eventSummaries.get(event.id);
                if (!summary) {
                  summary = {
                    totalAttending: 0,
                    totalMaybe: 0,
                    totalNotAttending: 0,
                    totalResponded: 0,
                  };
                }

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{event.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatLongDate(event.date)}</div>
                      {event.location && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">場所: {event.location}</div>
                      )}
                      {/* 出欠人数表示 */}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ◯ {summary.totalAttending}人
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                          △ {summary.totalMaybe}人
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ✗ {summary.totalNotAttending}人
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          （計{summary.totalResponded}人）
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                        編集
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(event.id)}>
                        削除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
