'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '@/lib/group-service';
import { useOrganization } from '@/contexts/organization-context';
import LoadingSpinner from '@/components/loading-spinner';
import type { Group } from '@/types';

export default function AdminGroupsPage() {
  const router = useRouter();
  const params = useParams();
  const org = params.org as string;
  const { organization } = useOrganization();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ name: '', order: 0, color: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!organization) return;

      try {
        setIsLoading(true);
        setLoadError(null);
        const allGroups = await getAllGroups(organization.id);

        if (isMounted) {
          setGroups(allGroups);
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err : new Error('Unknown error'));
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
  }, [organization, reloadKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!organization) {
      setError('団体情報が見つかりません');
      return;
    }

    try {
      if (editingGroup) {
        // 更新
        await updateGroup(organization.id, editingGroup.id, {
          name: formData.name,
          order: formData.order,
          color: formData.color || undefined,
        });
      } else {
        // 新規作成
        await createGroup(organization.id, {
          name: formData.name,
          order: formData.order,
          color: formData.color || undefined,
        });
      }
      setFormData({ name: '', order: 0, color: '' });
      setEditingGroup(null);
      setIsEditing(false);
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      order: group.order,
      color: group.color || '',
    });
    setIsEditing(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このグループを削除しますか?\n\n※ このグループに所属するメンバーと出欠登録も削除されます。')) {
      return;
    }

    if (!organization) {
      setError('団体情報が見つかりません');
      return;
    }

    try {
      await deleteGroup(organization.id, id);
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', order: 0, color: '' });
    setEditingGroup(null);
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="グループ情報を読み込み中..." />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">エラーが発生しました: {loadError.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link
            href={`/${org}/admin`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            ← 管理画面に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">グループ管理</h1>
          <p className="text-sm sm:text-base text-gray-600">
            グループの作成・編集・削除を行います
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingGroup ? 'グループを編集' : '新しいグループを作成'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                グループ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="例: 打, Cla, Sax"
                required
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                表示順序 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">小さい数字ほど上に表示されます</p>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                カラーコード（任意）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="例: #3B82F6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                {formData.color && (
                  <div
                    className="w-10 h-10 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">#RRGGBB形式で入力してください</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                {editingGroup ? '更新' : '作成'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* グループ一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">登録済みグループ</h2>
          {groups.length === 0 ? (
            <p className="text-gray-500 text-sm">グループが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  {group.color && (
                    <div
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-xs text-gray-500">表示順序: {group.order}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(group)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
