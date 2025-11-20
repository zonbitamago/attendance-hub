'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createOrganization } from '@/lib/organization-service';
import { migrateToMultiTenant } from '@/lib/migration';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Message } from '@/components/ui/message';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [error, setError] = useState('');
  const [createdOrganizationId, setCreatedOrganizationId] = useState<string | null>(null);
  const [migrationError, setMigrationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // マイグレーション実行（マウント時に1回だけ）
  useEffect(() => {
    const result = migrateToMultiTenant();

    if (result.migrated && result.defaultOrgId) {
      // マイグレーション成功 → デフォルト団体にリダイレクト
      router.push(`/${result.defaultOrgId}`);
    } else if (result.error) {
      // マイグレーション失敗 → エラー表示
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMigrationError(result.error);
    }
    // migrated: false の場合は何もしない（新規ユーザー）
  }, [router]);

  const handleCreateOrganization = async () => {
    setError('');

    try {
      // 団体を作成
      const newOrganization = await createOrganization({
        name: organizationName,
        description: organizationDescription,
      });

      // 作成成功 - URL表示
      setCreatedOrganizationId(newOrganization.id);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('団体の作成に失敗しました');
      }
    }
  };

  // URLをクリップボードにコピー
  const handleCopyUrl = async () => {
    const organizationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdOrganizationId}`;

    try {
      await navigator.clipboard.writeText(organizationUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // 作成成功後のURL表示
  if (createdOrganizationId) {
    const organizationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdOrganizationId}`;

    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            {/* 成功アイコンとメッセージ */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Heading level={2} className="mb-2">
                団体が作成されました！
              </Heading>
            </div>

            {/* 重要な通知 */}
            <Message type="warning" className="mb-6">
              <div>
                <p className="text-sm font-medium mb-1">
                  このURLを保存してください
                </p>
                <p className="text-xs opacity-90">
                  このURLをブックマークまたはメモしておくことで、いつでも団体の出欠管理にアクセスできます。URLを忘れると団体にアクセスできなくなります。
                </p>
              </div>
            </Message>

            {/* URL表示とコピーボタン */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                団体URL
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-sky-50 border border-sky-100 rounded-md p-3">
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {organizationUrl}
                  </p>
                </div>
                <Button
                  onClick={handleCopyUrl}
                  variant="secondary"
                  title="URLをコピー"
                >
                  {copySuccess ? (
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </Button>
              </div>
              {copySuccess && (
                <p className="text-xs text-green-600 mt-2">
                  URLをクリップボードにコピーしました
                </p>
              )}
            </div>

            {/* アクセスボタン */}
            <Link
              href={`/${createdOrganizationId}`}
              className="block w-full px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-md font-medium hover:from-sky-600 hover:to-sky-700 transition shadow-md text-center"
            >
              団体にアクセスする
            </Link>

            {/* 使い方ガイドリンク */}
            <Link
              href={`/${createdOrganizationId}/guide`}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-3 bg-white border border-sky-200 text-gray-700 rounded-md font-medium hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              使い方ガイドを見る
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Heading level={1} className="mb-3">
            Attendance Hub
          </Heading>
          <p className="text-base sm:text-lg text-gray-600">
            イベントの出欠管理をシンプルに
          </p>
        </div>

        {/* 説明カード */}
        <Card className="mb-6">
          <Heading level={2} className="mb-3">
            新しい団体を作成して始めましょう
          </Heading>
          <p className="text-sm text-gray-600 mb-4">
            団体を作成すると、専用のURLが発行されます。そのURLをブックマークすることで、いつでも団体の出欠管理にアクセスできます。
            団体ページには使い方ガイドも用意されています。
          </p>

          {/* マイグレーションエラーメッセージ */}
          {migrationError && (
            <Message type="warning" className="mb-4">
              <p className="text-sm">
                <strong>マイグレーション警告: </strong>
                {migrationError}
              </p>
              <p className="text-xs mt-1 opacity-90">
                引き続き新規団体を作成できます。
              </p>
            </Message>
          )}

          {/* エラーメッセージ */}
          {error && (
            <Message type="error" className="mb-4">{error}</Message>
          )}

          {/* 作成フォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                団体名
              </label>
              <input
                id="org-name"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="例: 音楽サークル"
                className="w-full px-3 py-2 border border-sky-100 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="org-desc" className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <textarea
                id="org-desc"
                value={organizationDescription}
                onChange={(e) => setOrganizationDescription(e.target.value)}
                placeholder="例: 毎週日曜日に活動している音楽サークルです"
                rows={3}
                className="w-full px-3 py-2 border border-sky-100 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={handleCreateOrganization}
              variant="primary"
              className="w-full"
            >
              団体を作成
            </Button>
          </div>
        </Card>

        {/* 使い方ガイドリンク */}
        <div className="mb-4">
          <Link
            href="/guide"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            使い方ガイドを見る
          </Link>
        </div>

        {/* フッター */}
        <p className="text-xs text-center text-gray-500">
          作成後、専用URLをブックマークしてご利用ください
        </p>
      </div>
    </main>
  );
}
