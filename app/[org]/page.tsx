'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAllEventDates } from '@/lib/event-service';
import { calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Message } from '@/components/ui/message';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="イベント一覧を読み込み中..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Message type="error">エラーが発生しました: {error.message}</Message>
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
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">{organization.name}</Heading>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {organization.description || 'イベントの出欠確認を簡単に管理'}
          </p>
        </div>

        {/* ナビゲーションリンク */}
        <div className="mb-6 sm:mb-8 space-y-2">
          <Link
            href={`/${org}/my-register`}
            className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            → 一括出欠登録
          </Link>
          <Link
            href={`/${org}/admin`}
            className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            → 管理画面（グループ・イベント日付の管理）
          </Link>
          <Link
            href={`/${org}/guide`}
            className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            → 使い方ガイド
          </Link>
        </div>

        {/* イベント一覧 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Heading level={2}>イベント一覧</Heading>
            {events.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{events.length} 件</span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">イベント日付が登録されていません</p>
              <Link
                href={`/${org}/admin/events`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
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
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Heading level={3} className="mb-1">{event.title}</Heading>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatLongDate(event.date)}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">場所: {event.location}</p>
                        )}
                        {/* 出欠人数表示 */}
                        <div
                          className="flex flex-wrap gap-2 mt-2 text-xs"
                          role="status"
                          aria-label={`出欠状況: 参加 ${summary.totalAttending}人、未定 ${summary.totalMaybe}人、欠席 ${summary.totalNotAttending}人、合計 ${summary.totalResponded}人`}
                        >
                          <span className="text-green-600 dark:text-green-400 font-medium" aria-label="参加">
                            ◯ {summary.totalAttending}人
                          </span>
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium" aria-label="未定">
                            △ {summary.totalMaybe}人
                          </span>
                          <span className="text-red-600 dark:text-red-400 font-medium" aria-label="欠席">
                            ✗ {summary.totalNotAttending}人
                          </span>
                          <span className="text-gray-500 dark:text-gray-400" aria-label="合計">
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
        </Card>
      </div>
    </main>
  );
}
