'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventDateById } from '@/lib/event-service';
import { calculateEventSummary, calculateEventTotalSummary } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import LoadingSpinner from '@/components/loading-spinner';
import type { EventDate, GroupSummary } from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDate | null>(null);
  const [summaries, setSummaries] = useState<GroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    try {
      const foundEvent = getEventDateById(eventId);
      if (!foundEvent) {
        router.push('/');
        return;
      }

      const eventSummaries = calculateEventSummary(eventId);
      setEvent(foundEvent);
      setSummaries(eventSummaries);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, router]);

  // メモ化: イベント全体の出欠集計を計算
  // NOTE: eventIdだけでなくeventも依存配列に含める必要がある
  // eventが読み込まれるまでcalculateEventTotalSummaryを実行すべきでないため
  const totalSummary = useMemo(() => {
    if (!event) return null;
    return calculateEventTotalSummary(eventId);
  }, [event, eventId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="イベント情報を読み込み中..." />
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            ← トップページに戻る
          </Link>
        </div>

        {/* イベント情報 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-1">{formatLongDate(event.date)}</p>
          {event.location && (
            <p className="text-sm text-gray-500">場所: {event.location}</p>
          )}
        </div>

        {/* 出欠登録ボタン */}
        <div className="mb-6">
          <Link
            href={`/events/${eventId}/register`}
            className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-center"
          >
            + 出欠を登録する
          </Link>
        </div>

        {/* イベント全体集計 */}
        {totalSummary && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">全体出欠状況</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">参加: </span>
                <span className="font-semibold text-green-600">{totalSummary.totalAttending}人</span>
              </div>
              <div>
                <span className="text-gray-600">未定: </span>
                <span className="font-semibold text-yellow-600">{totalSummary.totalMaybe}人</span>
              </div>
              <div>
                <span className="text-gray-600">欠席: </span>
                <span className="font-semibold text-red-600">{totalSummary.totalNotAttending}人</span>
              </div>
              <div>
                <span className="text-gray-600">（</span>
                <span className="font-semibold text-gray-900">計{totalSummary.totalResponded}人</span>
                <span className="text-gray-600">）</span>
              </div>
            </div>
          </div>
        )}

        {/* グループ別集計 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">グループ別出欠状況</h2>

          {summaries.length === 0 ? (
            <p className="text-gray-500 text-sm">まだ出欠登録がありません</p>
          ) : (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div key={summary.groupId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{summary.groupName}</h3>
                    <span className="text-sm text-gray-500">計 {summary.total} 人</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {summary.attending}
                      </div>
                      <div className="text-xs text-gray-600">参加 ◯</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {summary.maybe}
                      </div>
                      <div className="text-xs text-gray-600">未定 △</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {summary.notAttending}
                      </div>
                      <div className="text-xs text-gray-600">欠席 ✗</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
