'use client';

import { useState, useEffect } from 'react';
import { loadGroups, loadMembers } from '@/lib/storage';
import type { Group, Member } from '@/types';

export interface MemberSelection {
  groupId: string;
  memberId: string | null;
  memberName: string;
}

interface MemberSelectorProps {
  onSelect: (selection: MemberSelection) => void;
}

export function MemberSelector({ onSelect }: MemberSelectorProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isNewMember, setIsNewMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // グループとメンバーを読み込み
  useEffect(() => {
    setGroups(loadGroups());
    setMembers(loadMembers());
  }, []);

  // グループが選択された時の処理
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSelectedMemberId('');
    setIsNewMember(false);
    setNewMemberName('');
  };

  // メンバーが選択された時の処理
  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    setSelectedMemberId(memberId);

    if (memberId === '__new__') {
      setIsNewMember(true);
      setNewMemberName('');
      // 次のレンダリングで入力フィールドにフォーカスするため、少し遅延
      setTimeout(() => {
        document.getElementById('new-member-name')?.focus();
      }, 0);
    } else {
      setIsNewMember(false);
      const member = members.find((m) => m.id === memberId);
      if (member) {
        onSelect({
          groupId: selectedGroupId,
          memberId: member.id,
          memberName: member.name,
        });
      }
    }
  };

  // 新規メンバー名が入力された時の処理
  const handleNewMemberNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewMemberName(name);

    if (name.trim()) {
      onSelect({
        groupId: selectedGroupId,
        memberId: null,
        memberName: name,
      });
    }
  };

  // 選択されたグループのメンバーのみフィルタ
  const filteredMembers = selectedGroupId
    ? members.filter((m) => m.groupId === selectedGroupId)
    : [];

  return (
    <div className="space-y-4">
      {/* グループ選択 */}
      <div>
        <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 mb-1">
          グループを選択
        </label>
        <select
          id="group-select"
          aria-label="グループ"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
        >
          <option value="">グループを選んでください</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* メンバー選択（グループが選択された後に表示） */}
      {selectedGroupId && (
        <div>
          <label htmlFor="member-select" className="block text-sm font-medium text-gray-700 mb-1">
            メンバーを選択
          </label>
          <select
            id="member-select"
            aria-label="メンバー"
            value={selectedMemberId}
            onChange={handleMemberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
          >
            <option value="">メンバーを選んでください</option>
            {filteredMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
            <option value="__new__">+ 新しいメンバーを追加</option>
          </select>
        </div>
      )}

      {/* 新規メンバー名入力（「新しいメンバーを追加」が選択された後に表示） */}
      {isNewMember && (
        <div>
          <label htmlFor="new-member-name" className="block text-sm font-medium text-gray-700 mb-1">
            名前を入力
          </label>
          <input
            type="text"
            id="new-member-name"
            aria-label="名前"
            value={newMemberName}
            onChange={handleNewMemberNameChange}
            placeholder="例: 山田太郎"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      )}
    </div>
  );
}
