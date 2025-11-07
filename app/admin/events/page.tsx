'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllEventDates, createEventDate, updateEventDate, deleteEventDate } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import LoadingSpinner from '@/components/loading-spinner';
import type { EventDate } from '@/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDate | null>(null);
  const [formData, setFormData] = useState({ date: '', title: '', location: '' });
  const [error, setError] = useState('');

  const loadData = () => {
    try {
      const allEvents = getAllEventDates();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // メモ化: すべてのイベントの出欠集計を計算
  const eventSummaries = useMemo(() => {
    const summaries = new Map();
    events.forEach((event) => {
      summaries.set(event.id, calculateEventTotalSummary(event.id));
    });
    return summaries;
  }, [events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEvent) {
        // 更新
        updateEventDate(editingEvent.id, {
          date: formData.date,
          title: formData.title,
          location: formData.location || undefined,
        });
      } else {
        // 新規作成
        createEventDate({
          date: formData.date,
          title: formData.title,
          location: formData.location || undefined,
        });
      }
      setFormData({ date: '', title: '', location: '' });
      setEditingEvent(null);
      setIsEditing(false);
      loadData();
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

  const handleDelete = (id: string) => {
    if (!confirm('このイベント日付を削除しますか?\n\n※ この日付に関連する出欠登録も削除されます。')) {
      return;
    }

    try {
      deleteEventDate(id);
      loadData();
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
        <LoadingSpinner message="イベント情報を読み込み中..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            ← 管理画面に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">イベント日付管理</h1>
          <p className="text-sm sm:text-base text-gray-600">
            イベント日付の作成・編集・削除を行います
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingEvent ? 'イベント日付を編集' : '新しいイベント日付を作成'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="例: 定期演奏会, 練習"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                場所（任意）
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="例: 音楽ホール"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                {editingEvent ? '更新' : '作成'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* イベント一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">登録済みイベント日付</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">イベント日付が登録されていません</p>
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
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">{formatLongDate(event.date)}</div>
                      {event.location && (
                        <div className="text-xs text-gray-500 mt-1">場所: {event.location}</div>
                      )}
                      {/* 出欠人数表示 */}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="text-green-600 font-medium">
                          ◯ {summary.totalAttending}人
                        </span>
                        <span className="text-yellow-600 font-medium">
                          △ {summary.totalMaybe}人
                        </span>
                        <span className="text-red-600 font-medium">
                          ✗ {summary.totalNotAttending}人
                        </span>
                        <span className="text-gray-500">
                          （計{summary.totalResponded}人）
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
