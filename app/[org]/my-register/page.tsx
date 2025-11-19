'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganization } from '@/contexts/organization-context';
import { MemberSelector, type MemberSelection } from '@/components/bulk-register/member-selector';
import { EventList } from '@/components/bulk-register/event-list';
import { upsertBulkAttendances } from '@/lib/attendance-service';
import { saveMember } from '@/lib/member-service';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Message } from '@/components/ui/message';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { AttendanceStatus } from '@/types';

export default function MyRegisterPage() {
  const router = useRouter();
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();
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

    if (!organization) {
      setMessage('団体情報が見つかりません');
      return;
    }

    setIsSubmitting(true);

    try {
      // 新規メンバーの場合は先に作成
      let memberId = memberSelection.memberId;
      if (!memberId) {
        const newMember = await saveMember(organization.id, {
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
      const result = await upsertBulkAttendances(organization.id, inputs);

      const totalCount = result.success.length + result.updated.length;
      const updatedCount = result.updated.length;

      if (result.failed.length > 0) {
        setMessage(
          `${totalCount}件登録しました（うち${updatedCount}件更新）。${result.failed.length}件失敗しました。`
        );
      } else {
        const successMessage = updatedCount > 0
          ? `${totalCount}件登録しました（うち${updatedCount}件更新）`
          : `${totalCount}件登録しました`;
        setMessage(successMessage);

        // 成功時は1秒後にトップページへリダイレクト
        setTimeout(() => {
          router.push(`/${org}`);
        }, 1000);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 relative">
      {/* テーマ切替 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${org}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            ← トップページへ戻る
          </Link>
        </div>

        <Heading level={1} className="mb-6 sm:mb-8">一括出欠登録</Heading>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* メンバー選択 */}
          <Card>
            <MemberSelector onSelect={handleMemberSelect} organizationId={organization.id} />
          </Card>

          {/* イベント選択（メンバーが選択された後に表示） */}
          {memberSelection && (
            <Card>
              <EventList
                memberId={memberSelection.memberId}
                selectedEvents={selectedEvents}
                onSelectionChange={handleEventSelectionChange}
                eventStatuses={eventStatuses}
                onStatusChange={handleEventStatusChange}
                organizationId={organization.id}
              />
            </Card>
          )}

          {/* 登録ボタン */}
          {memberSelection && selectedEvents.length > 0 && (
            <Card>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '登録中...' : `${selectedEvents.length}件のイベントに登録`}
              </Button>
            </Card>
          )}

          {/* メッセージ表示 */}
          {message && (
            <Message
              type={message.includes('エラー') || message.includes('失敗') ? 'error' : 'success'}
            >
              {message}
            </Message>
          )}
        </form>
      </div>
    </div>
  );
}
