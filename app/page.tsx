'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllEventDates } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import LoadingSpinner from '@/components/loading-spinner';
import type { EventDate } from '@/types';

export default function Home() {
  const [events, setEvents] = useState<EventDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = () => {
      try {
        const allEvents = getAllEventDates();
        setEvents(allEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // メモ化: すべてのイベントの出欠集計を計算
  const eventSummaries = useMemo(() => {
    const summaries = new Map();
    events.forEach((event) => {
      summaries.set(event.id, calculateEventTotalSummary(event.id));
    });
    return summaries;
  }, [events]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="イベント一覧を読み込み中..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Attendance Hub</h1>
          <p className="text-sm sm:text-base text-gray-600">イベントの出欠確認を簡単に管理</p>
        </div>

        {/* 管理画面リンク */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            → 管理画面（グループ・イベント日付の管理）
          </Link>
        </div>

        {/* イベント一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">イベント一覧</h2>
            {events.length > 0 && (
              <span className="text-sm text-gray-500">{events.length} 件</span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">イベント日付が登録されていません</p>
              <Link
                href="/admin/events"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                イベント日付を登録する
              </Link>
            </div>
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
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600">{formatLongDate(event.date)}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">場所: {event.location}</p>
                        )}
                        {/* 出欠人数表示 */}
                        <div
                          className="flex flex-wrap gap-2 mt-2 text-xs"
                          role="status"
                          aria-label={`出欠状況: 参加 ${summary.totalAttending}人、未定 ${summary.totalMaybe}人、欠席 ${summary.totalNotAttending}人、合計 ${summary.totalResponded}人`}
                        >
                          <span className="text-green-600 font-medium" aria-label="参加">
                            ◯ {summary.totalAttending}人
                          </span>
                          <span className="text-yellow-600 font-medium" aria-label="未定">
                            △ {summary.totalMaybe}人
                          </span>
                          <span className="text-red-600 font-medium" aria-label="欠席">
                            ✗ {summary.totalNotAttending}人
                          </span>
                          <span className="text-gray-500" aria-label="合計">
                            （計{summary.totalResponded}人）
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
