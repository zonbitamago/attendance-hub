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

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('◯');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    if (!organization) return;
    try {
      const foundEvent = getEventDateById(organization.id, eventId);
      if (!foundEvent) {
        router.push(`/${params.org as string}`);
        return;
      }

      const allGroups = getAllGroups(organization.id);
      setEvent(foundEvent);
      setGroups(allGroups);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId, router]);

  useEffect(() => {
    // グループが選択されたらそのグループのメンバーを読み込む
    if (selectedGroupId && organization) {
      const groupMembers = getMembersByGroupId(organization.id, selectedGroupId);
      setMembers(groupMembers);
      setSelectedMemberId('');
      setNewMemberName('');
    } else {
      setMembers([]);
    }
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
        const newMember = createMember(organization.id, {
          groupId: selectedGroupId,
          name: newMemberName.trim(),
        });
        memberId = newMember.id;
      }

      if (!memberId) {
        throw new Error('メンバーを選択するか、新しい名前を入力してください');
      }

      // 出欠登録を作成
      createAttendance(organization.id, {
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="読み込み中..." />
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link
            href={`/${params.org as string}/events/${eventId}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            ← イベント詳細に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">出欠を登録</h1>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{event.title}</p>
            <p>{formatLongDate(event.date)}</p>
            {event.location && <p className="text-xs text-gray-500 mt-1">場所: {event.location}</p>}
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">グループが登録されていません</p>
              <Link
                href={`/${params.org as string}/admin/groups`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                グループを登録する
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* グループ選択 */}
              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                  1. グループを選択 <span className="text-red-500">*</span>
                </label>
                <select
                  id="group"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. メンバーを選択または新規登録 <span className="text-red-500">*</span>
                  </label>

                  {members.length > 0 && (
                    <div className="mb-3">
                      <label htmlFor="member" className="block text-xs text-gray-600 mb-1">
                        既存のメンバーから選択
                      </label>
                      <select
                        id="member"
                        value={selectedMemberId}
                        onChange={(e) => {
                          setSelectedMemberId(e.target.value);
                          if (e.target.value) setNewMemberName('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
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
                    <label htmlFor="newMember" className="block text-xs text-gray-600 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="名前を入力"
                      disabled={!!selectedMemberId}
                    />
                  </div>
                </div>
              )}

              {/* 出欠ステータス選択 */}
              {selectedGroupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. 出欠状況を選択 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('◯')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        status === '◯'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
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
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 hover:border-yellow-300'
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
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 送信ボタン */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedGroupId}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '登録中...' : '登録する'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
