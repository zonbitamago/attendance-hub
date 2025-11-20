'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganization } from '@/contexts/organization-context';
import { Heading } from '@/components/ui/heading';

export default function AdminPage() {
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-3">
          <Link
            href={`/${org}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            トップページに戻る
          </Link>
          <Link
            href={`/${org}/my-register`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            一括出欠登録
          </Link>
          <Link
            href={`/${org}/guide`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            使い方ガイド
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Heading level={1} className="mb-2">管理画面</Heading>
          <p className="text-sm sm:text-base text-gray-600">
            グループとイベント日付を管理できます
          </p>
        </div>

        {/* メニューカード */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* グループ管理 */}
          <Link
            href={`/${org}/admin/groups`}
            className="block bg-white border border-sky-100 rounded-xl shadow-lg p-6 hover:bg-sky-50 hover:border-sky-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <Heading level={2} className="mb-1">グループ管理</Heading>
                <p className="text-sm text-gray-600">
                  グループの作成・編集・削除・並び替えを行います
                </p>
              </div>
            </div>
          </Link>

          {/* イベント日付管理 */}
          <Link
            href={`/${org}/admin/events`}
            className="block bg-white border border-sky-100 rounded-xl shadow-lg p-6 hover:bg-sky-50 hover:border-sky-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <Heading level={2} className="mb-1">イベント日付管理</Heading>
                <p className="text-sm text-gray-600">
                  イベント日付の作成・編集・削除を行います
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
