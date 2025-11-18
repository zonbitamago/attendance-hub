'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAllEventDates } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import type { EventDate, EventTotalSummary } from '@/types';

export default function Home() {
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();
  const [events, setEvents] = useState<EventDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      if (!organization) return;

      try {
        setIsLoading(true);
        setError(null);
        const allEvents = await getAllEventDates(organization.id);

        if (isMounted) {
          setEvents(allEvents);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [organization]);

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="イベント一覧を読み込み中..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">エラーが発生しました: {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {organization.description || 'イベントの出欠確認を簡単に管理'}
          </p>
        </div>

        {/* ナビゲーションリンク */}
        <div className="mb-6 space-y-2">
          <Link
            href={`/${org}/my-register`}
            className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            → 一括出欠登録
          </Link>
          <Link
            href={`/${org}/admin`}
            className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            → 管理画面（グループ・イベント日付の管理）
          </Link>
          <Link
            href={`/${org}/guide`}
            className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            → 使い方ガイド
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
                href={`/${org}/admin/events`}
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
                    href={`/${org}/events/${event.id}`}
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
