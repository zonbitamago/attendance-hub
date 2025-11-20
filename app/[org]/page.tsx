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
      <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center">
        <LoadingSpinner message="イベント一覧を読み込み中..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Message type="error">エラーが発生しました: {error.message}</Message>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">{organization.name}</Heading>
          <p className="text-sm sm:text-base text-gray-600">
            {organization.description || 'イベントの出欠確認を簡単に管理'}
          </p>
        </div>

        {/* ナビゲーションリンク */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-3">
          <Link
            href={`/${org}/my-register`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            一括出欠登録
          </Link>
          <Link
            href={`/${org}/admin`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            管理画面
          </Link>
          <Link
            href={`/${org}/guide`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            使い方ガイド
          </Link>
        </div>

        {/* イベント一覧 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Heading level={2}>イベント一覧</Heading>
            {events.length > 0 && (
              <span className="text-sm text-gray-500">{events.length} 件</span>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">イベント日付が登録されていません</p>
              <Link
                href={`/${org}/admin/events`}
                className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-md font-medium hover:from-sky-600 hover:to-sky-700 transition shadow-md text-sm"
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
                    className="block p-4 border border-sky-200 rounded-lg hover:bg-sky-50 hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Heading level={3} className="mb-1">{event.title}</Heading>
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
                          className="w-5 h-5 text-sky-600"
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
