'use client';

import { useState } from 'react';
import { MemberSelector, type MemberSelection } from '@/components/bulk-register/member-selector';
import { EventList } from '@/components/bulk-register/event-list';
import { upsertBulkAttendances } from '@/lib/attendance-service';
import { saveMember } from '@/lib/member-service';
import type { AttendanceStatus } from '@/types';

export default function MyRegisterPage() {
  const [memberSelection, setMemberSelection] = useState<MemberSelection | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [eventStatuses, setEventStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // メンバー選択時の処理
  const handleMemberSelect = (selection: MemberSelection) => {
    setMemberSelection(selection);
    setMessage('');
  };

  // イベント選択変更時の処理
  const handleEventSelectionChange = (eventIds: string[]) => {
    setSelectedEvents(eventIds);
    setMessage('');

    // 新しく選択されたイベントにデフォルトステータスを設定
    const newStatuses = { ...eventStatuses };
    eventIds.forEach((eventId) => {
      if (!newStatuses[eventId]) {
        newStatuses[eventId] = '◯'; // デフォルトは出席
      }
    });
    setEventStatuses(newStatuses);
  };

  // 個別イベントのステータス変更時の処理
  const handleEventStatusChange = (eventId: string, status: AttendanceStatus) => {
    setEventStatuses((prev) => ({
      ...prev,
      [eventId]: status,
    }));
  };

  // 一括登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // バリデーション
    if (!memberSelection) {
      setMessage('メンバーを選択してください');
      return;
    }

    if (selectedEvents.length === 0) {
      setMessage('登録するイベントを選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 新規メンバーの場合は先に作成
      let memberId = memberSelection.memberId;
      if (!memberId) {
        const newMember = saveMember({
          groupId: memberSelection.groupId,
          name: memberSelection.memberName,
        });
        memberId = newMember.id;
      }

      // 一括登録用の入力データを作成（各イベントの個別ステータスを使用）
      const inputs = selectedEvents.map((eventDateId) => ({
        eventDateId,
        memberId,
        status: eventStatuses[eventDateId] || '◯',
      }));

      // 一括登録を実行
      const result = upsertBulkAttendances(inputs);

      const totalCount = result.success.length + result.updated.length;
      const updatedCount = result.updated.length;

      if (result.failed.length > 0) {
        setMessage(
          `${totalCount}件登録しました（うち${updatedCount}件更新）。${result.failed.length}件失敗しました。`
        );
      } else {
        setMessage(
          updatedCount > 0
            ? `${totalCount}件登録しました（うち${updatedCount}件更新）`
            : `${totalCount}件登録しました`
        );
      }

      // 成功後、選択をクリア
      setSelectedEvents([]);
    } catch (error) {
      setMessage(
        error instanceof Error ? `エラー: ${error.message}` : 'エラーが発生しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">一括出欠登録</h1>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* メンバー選択 */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <MemberSelector onSelect={handleMemberSelect} />
          </div>

          {/* イベント選択（メンバーが選択された後に表示） */}
          {memberSelection && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <EventList
                memberId={memberSelection.memberId}
                selectedEvents={selectedEvents}
                onSelectionChange={handleEventSelectionChange}
                eventStatuses={eventStatuses}
                onStatusChange={handleEventStatusChange}
              />
            </div>
          )}

          {/* 登録ボタン */}
          {memberSelection && selectedEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '登録中...' : `${selectedEvents.length}件のイベントに登録`}
              </button>
            </div>
          )}

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes('エラー') || message.includes('失敗')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
