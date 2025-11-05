import type { Member } from '@/types';
import { loadMembers, saveMembers } from './storage';
import { CreateMemberInputSchema, type MemberInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// メンバーを作成
export function createMember(input: MemberInput): Member {
  const validated = CreateMemberInputSchema.parse(input);

  const newMember: Member = {
    id: crypto.randomUUID(),
    groupId: validated.groupId,
    name: validated.name,
    createdAt: getCurrentTimestamp(),
  };

  const members = loadMembers();
  members.push(newMember);

  const success = saveMembers(members);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newMember;
}

// すべてのメンバーを取得
export function getAllMembers(): Member[] {
  return loadMembers();
}

// グループIDでメンバーを取得
export function getMembersByGroupId(groupId: string): Member[] {
  const members = loadMembers();
  return members.filter((member) => member.groupId === groupId);
}

// IDでメンバーを取得
export function getMemberById(id: string): Member | null {
  const members = loadMembers();
  return members.find((member) => member.id === id) || null;
}

// メンバーを更新
export function updateMember(id: string, input: Partial<Omit<MemberInput, 'groupId'>>): Member {
  const members = loadMembers();
  const index = members.findIndex((member) => member.id === id);

  if (index === -1) {
    throw new Error(ErrorMessages.NOT_FOUND('メンバー'));
  }

  const updateData: MemberInput = {
    groupId: members[index].groupId,
    name: input.name ?? members[index].name,
  };
  const validated = CreateMemberInputSchema.parse(updateData);

  const updatedMember: Member = {
    ...members[index],
    name: validated.name,
  };

  members[index] = updatedMember;

  const success = saveMembers(members);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedMember;
}

// メンバーを削除
export function deleteMember(id: string): boolean {
  const members = loadMembers();
  const filteredMembers = members.filter((member) => member.id !== id);

  if (members.length === filteredMembers.length) {
    return false;
  }

  return saveMembers(filteredMembers);
}
