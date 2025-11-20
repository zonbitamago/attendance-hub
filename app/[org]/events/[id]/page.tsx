'use client';

import { useEffect, useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Message } from '@/components/ui/message';
import { Button } from '@/components/ui/button';
import type {
  EventDate,
  GroupSummary,
  AttendanceFilterStatus,
  AttendanceSortBy,
  EventTotalSummary,
  MemberAttendanceDetail,
} from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { organization } = useOrganization();

  const [event, setEvent] = useState<EventDate | null>(null);
  const [summaries, setSummaries] = useState<GroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<AttendanceFilterStatus>('all');
  const [sortBy, setSortBy] = useState<AttendanceSortBy>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!organization) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const foundEvent = await getEventDateById(organization.id, eventId);
        if (!foundEvent) {
          router.push(`/${params.org as string}`);
          return;
        }

        const eventSummaries = await calculateEventSummary(organization.id, eventId);

        if (isMounted) {
          setEvent(foundEvent);
          setSummaries(eventSummaries);
        }
      } catch (error) {
        console.error('Failed to load event:', error);
        if (isMounted) {
          setLoadError(error instanceof Error ? error : new Error('Unknown error'));
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
  }, [organization, eventId, params.org, router]);

  // イベント全体の出欠集計を非同期で計算
  const [totalSummary, setTotalSummary] = useState<EventTotalSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTotalSummary = async () => {
      if (!event || !organization) {
        setTotalSummary(null);
        return;
      }

      const summary = await calculateEventTotalSummary(organization.id, eventId);

      if (isMounted) {
        setTotalSummary(summary);
      }
    };

    loadTotalSummary();

    return () => {
      isMounted = false;
    };
  }, [event, eventId, organization]);

  // グループごとのメンバー出欠データを非同期で計算
  const [groupMembersMap, setGroupMembersMap] = useState<Map<string, MemberAttendanceDetail[]>>(
    new Map()
  );

  useEffect(() => {
    let isMounted = true;

    const loadGroupMembers = async () => {
      if (!organization || summaries.length === 0) {
        setGroupMembersMap(new Map());
        return;
      }

      const membersMap = new Map<string, MemberAttendanceDetail[]>();
      for (const summary of summaries) {
        const members = await getGroupMemberAttendances(organization.id, eventId, summary.groupId);
        membersMap.set(summary.groupId, members);
      }

      if (isMounted) {
        setGroupMembersMap(membersMap);
      }
    };

    loadGroupMembers();

    return () => {
      isMounted = false;
    };
  }, [organization, eventId, summaries]);

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
      <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center">
        <LoadingSpinner message="イベント情報を読み込み中..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Message type="error">エラーが発生しました: {loadError.message}</Message>
        </div>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${params.org as string}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            トップページに戻る
          </Link>
        </div>

        {/* イベント情報 */}
        <Card className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">{event.title}</Heading>
          <p className="text-sm sm:text-base text-gray-600 mb-1">{formatLongDate(event.date)}</p>
          {event.location && (
            <p className="text-sm text-gray-600">場所: {event.location}</p>
          )}
        </Card>

        {/* 出欠登録ボタン */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${params.org as string}/events/${eventId}/register`}
            className="inline-block w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-sky-700 transition shadow-md text-center"
          >
            + 出欠を登録する
          </Link>
        </div>

        {/* イベント全体集計 */}
        {totalSummary && (
          <Card className="mb-6 sm:mb-8">
            <Heading level={2} className="mb-4">全体出欠状況</Heading>
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
          </Card>
        )}

        {/* グループ別出欠状況 */}
        <Card>
          <Heading level={2} className="mb-4">グループ別出欠状況</Heading>

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
                const members = groupMembersMap.get(summary.groupId) ?? [];

                return (
                  <div key={summary.groupId}>
                    {/* グループ集計ヘッダー */}
                    <div className="bg-sky-50 px-4 py-3 rounded-t-lg border border-sky-200 flex items-center justify-between">
                      <Heading level={3}>{summary.groupName}</Heading>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-semibold">◯ {summary.attending}</span>
                        <span className="text-yellow-600 font-semibold">△ {summary.maybe}</span>
                        <span className="text-red-600 font-semibold">✗ {summary.notAttending}</span>
                        <span className="text-gray-600">計 {summary.total}人</span>
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
        </Card>
      </div>
    </main>
  );
}
