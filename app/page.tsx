'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createOrganization } from '@/lib/organization-service';
import { migrateToMultiTenant } from '@/lib/migration';

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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* 成功アイコンとメッセージ */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                団体が作成されました！
              </h2>
            </div>

            {/* 重要な通知 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    このURLを保存してください
                  </p>
                  <p className="text-xs text-yellow-700">
                    このURLをブックマークまたはメモしておくことで、いつでも団体の出欠管理にアクセスできます。URLを忘れると団体にアクセスできなくなります。
                  </p>
                </div>
              </div>
            </div>

            {/* URL表示とコピーボタン */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                団体URL
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {organizationUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                  title="URLをコピー"
                >
                  {copySuccess ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
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
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
            >
              団体にアクセスする
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Attendance Hub
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            イベントの出欠管理をシンプルに
          </p>
        </div>

        {/* 説明カード */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            新しい団体を作成して始めましょう
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            団体を作成すると、専用のURLが発行されます。そのURLをブックマークすることで、いつでも団体の出欠管理にアクセスできます。
          </p>

          {/* マイグレーションエラーメッセージ */}
          {migrationError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                <strong>マイグレーション警告: </strong>
                {migrationError}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                引き続き新規団体を作成できます。
              </p>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleCreateOrganization}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              団体を作成
            </button>
          </div>
        </div>

        {/* フッター */}
        <p className="text-xs text-center text-gray-500">
          作成後、専用URLをブックマークしてご利用ください
        </p>
      </div>
    </main>
  );
}
