'use client';

import Link from 'next/link';

/**
 * 組織ルートのエラーバウンダリ
 *
 * React 19のuse()フックでparamsのPromiseが拒否された場合や、
 * OrganizationProviderで組織が見つからない場合のエラーをキャッチする。
 */
export default function OrganizationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            エラーが発生しました
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error.message || '団体の読み込み中に問題が発生しました'}
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
            <Link
              href="/"
              className="block w-full px-6 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
