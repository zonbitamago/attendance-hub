'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventDateById } from '@/lib/event-service';
import {
  calculateEventSummary,
  calculateEventTotalSummary,
  getGroupMemberAttendances,
} from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import { GroupAttendanceAccordion } from '@/components/event-detail/group-attendance-accordion';
import { AttendanceFilters } from '@/components/event-detail/attendance-filters';
import type { EventDate, GroupSummary, AttendanceFilterStatus, AttendanceSortBy } from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { organization } = useOrganization();

  const [event, setEvent] = useState<EventDate | null>(null);
  const [summaries, setSummaries] = useState<GroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<AttendanceFilterStatus>('all');
  const [sortBy, setSortBy] = useState<AttendanceSortBy>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = () => {
    if (!organization) return;
    try {
      const foundEvent = getEventDateById(organization.id, eventId);
      if (!foundEvent) {
        router.push(`/${params.org as string}`);
        return;
      }

      const eventSummaries = calculateEventSummary(organization.id, eventId);
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
    if (!event || !organization) return null;
    return calculateEventTotalSummary(organization.id, eventId);
  }, [event, eventId, organization]);

  // アコーディオンのトグルハンドラ
  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

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
            href={`/${params.org as string}`}
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
            href={`/${params.org as string}/events/${eventId}/register`}
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

        {/* グループ別出欠状況 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">グループ別出欠状況</h2>

          {/* フィルタ・ソート・検索 */}
          <div className="mb-4">
            <AttendanceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {summaries.length === 0 ? (
            <p className="text-gray-500 text-sm">まだ出欠登録がありません</p>
          ) : (
            <div className="space-y-2">
              {summaries.map((summary) => {
                const members = organization
                  ? getGroupMemberAttendances(organization.id, eventId, summary.groupId)
                  : [];

                return (
                  <div key={summary.groupId}>
                    {/* グループ集計ヘッダー */}
                    <div className="bg-gray-50 px-4 py-3 rounded-t-lg border border-gray-200 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{summary.groupName}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-semibold">◯ {summary.attending}</span>
                        <span className="text-yellow-600 font-semibold">△ {summary.maybe}</span>
                        <span className="text-red-600 font-semibold">✗ {summary.notAttending}</span>
                        <span className="text-gray-500">計 {summary.total}人</span>
                      </div>
                    </div>

                    {/* アコーディオン */}
                    <GroupAttendanceAccordion
                      groupId={summary.groupId}
                      groupName="メンバー詳細"
                      members={members}
                      isExpanded={expandedGroups.has(summary.groupId)}
                      onToggle={handleToggleGroup}
                      searchQuery={searchQuery}
                      filterStatus={filterStatus}
                      sortBy={sortBy}
                    />
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
