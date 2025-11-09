'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganization } from '@/contexts/organization-context';
import { updateOrganization, deleteOrganization } from '@/lib/organization-service';

export default function OrganizationsPage() {
  const router = useRouter();
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();

  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = () => {
    setError('');
    setSuccess('');

    try {
      updateOrganization(organization.id, {
        name,
        description: description || undefined,
      });
      setSuccess('団体情報を更新しました');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('更新に失敗しました');
      }
    }
  };

  const handleDelete = () => {
    try {
      deleteOrganization(organization.id);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('削除に失敗しました');
      }
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href={`/${org}/admin`} className="text-blue-600 hover:text-blue-700 text-sm">
            ← 管理トップに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">団体設定</h1>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* メッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* フォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                団体名
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="org-description" className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <textarea
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>

        {/* 危険な操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-red-200">
          <h2 className="text-lg font-bold text-red-600 mb-2">危険な操作</h2>
          <p className="text-sm text-gray-600 mb-4">
            団体を削除すると、すべてのグループ、メンバー、イベント、出欠記録が完全に削除されます。この操作は取り消せません。
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            団体を削除
          </button>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">本当に削除しますか？</h3>
            <p className="text-sm text-gray-600 mb-6">
              この操作は取り消せません。団体「{organization.name}」とすべての関連データが完全に削除されます。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
