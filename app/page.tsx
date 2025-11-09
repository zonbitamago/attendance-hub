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

  // マイグレーション実行（マウント時に1回だけ）
  useEffect(() => {
    const result = migrateToMultiTenant();

    if (result.migrated && result.defaultOrgId) {
      // マイグレーション成功 → デフォルト団体にリダイレクト
      router.push(`/${result.defaultOrgId}`);
    } else if (result.error) {
      // マイグレーション失敗 → エラー表示
      setMigrationError(result.error);
    }
    // migrated: false の場合は何もしない（新規ユーザー）
  }, [router]);

  const handleCreateOrganization = () => {
    setError('');

    try {
      // 団体を作成
      const newOrganization = createOrganization({
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

  // 作成成功後のURL表示
  if (createdOrganizationId) {
    const organizationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdOrganizationId}`;

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                団体が作成されました！
              </h2>
              <p className="text-sm text-gray-600">
                以下のURLをブックマークしてご利用ください
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">団体URL</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {organizationUrl}
              </p>
            </div>

            <Link
              href={`/${createdOrganizationId}`}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
            >
              アクセスする
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
