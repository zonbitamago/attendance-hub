'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventDateById } from '@/lib/event-service';
import { getAllGroups } from '@/lib/group-service';
import { getMembersByGroupId, createMember } from '@/lib/member-service';
import { createAttendance } from '@/lib/attendance-service';
import { formatLongDate } from '@/lib/date-utils';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Message } from '@/components/ui/message';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { EventDate, Group, Member, AttendanceStatus } from '@/types';

export default function RegisterAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { organization } = useOrganization();

  const [event, setEvent] = useState<EventDate | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('◯');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        const allGroups = await getAllGroups(organization.id);

        if (isMounted) {
          setEvent(foundEvent);
          setGroups(allGroups);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
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

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!selectedGroupId || !organization) {
        setMembers([]);
        return;
      }

      const groupMembers = await getMembersByGroupId(organization.id, selectedGroupId);

      if (isMounted) {
        setMembers(groupMembers);
        setSelectedMemberId('');
        setNewMemberName('');
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [selectedGroupId, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!organization) {
      setError('団体情報が見つかりません');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!selectedGroupId) {
        throw new Error('グループを選択してください');
      }

      let memberId = selectedMemberId;

      // 新しいメンバー名が入力されている場合は作成
      if (newMemberName.trim()) {
        const newMember = await createMember(organization.id, {
          groupId: selectedGroupId,
          name: newMemberName.trim(),
        });
        memberId = newMember.id;
      }

      if (!memberId) {
        throw new Error('メンバーを選択するか、新しい名前を入力してください');
      }

      // 出欠登録を作成
      await createAttendance(organization.id, {
        eventDateId: eventId,
        memberId,
        status,
      });

      // 成功したらイベント詳細ページに戻る
      router.push(`/${params.org as string}/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message="読み込み中..." />
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

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* テーマ切替 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${params.org as string}/events/${eventId}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            ← イベント詳細に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">出欠を登録</Heading>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium">{event.title}</p>
            <p>{formatLongDate(event.date)}</p>
            {event.location && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">場所: {event.location}</p>}
          </div>
        </div>

        {/* フォーム */}
        <Card>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">グループが登録されていません</p>
              <Link
                href={`/${params.org as string}/admin/groups`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
              >
                グループを登録する
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* グループ選択 */}
              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1. グループを選択 <span className="text-red-500">*</span>
                </label>
                <select
                  id="group"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder:text-gray-400"
                  required
                >
                  <option value="">-- 選択してください --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* メンバー選択または新規作成 */}
              {selectedGroupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    2. メンバーを選択または新規登録 <span className="text-red-500">*</span>
                  </label>

                  {members.length > 0 && (
                    <div className="mb-3">
                      <label htmlFor="member" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        既存のメンバーから選択
                      </label>
                      <select
                        id="member"
                        value={selectedMemberId}
                        onChange={(e) => {
                          setSelectedMemberId(e.target.value);
                          if (e.target.value) setNewMemberName('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder:text-gray-400"
                        disabled={!!newMemberName}
                      >
                        <option value="">-- 選択してください --</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="newMember" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      または新しい名前を入力
                    </label>
                    <input
                      type="text"
                      id="newMember"
                      value={newMemberName}
                      onChange={(e) => {
                        setNewMemberName(e.target.value);
                        if (e.target.value) setSelectedMemberId('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder:text-gray-400"
                      placeholder="名前を入力"
                      disabled={!!selectedMemberId}
                    />
                  </div>
                </div>
              )}

              {/* 出欠ステータス選択 */}
              {selectedGroupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3. 出欠状況を選択 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('◯')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        status === '◯'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">◯</div>
                      <div className="text-xs">参加</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('△')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        status === '△'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-500 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">△</div>
                      <div className="text-xs">未定</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('✗')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        status === '✗'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">✗</div>
                      <div className="text-xs">欠席</div>
                    </button>
                  </div>
                </div>
              )}

              {/* エラーメッセージ */}
              {error && (
                <Message type="error">{error}</Message>
              )}

              {/* 送信ボタン */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !selectedGroupId}
                  className="w-full"
                >
                  {isSubmitting ? '登録中...' : '登録する'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
