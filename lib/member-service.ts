import type { Member } from '@/types';
import { loadMembers, saveMembers } from './storage';
import { CreateMemberInputSchema, type MemberInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// メンバーを作成
export async function createMember(organizationId: string, input: MemberInput): Promise<Member> {
  const validated = CreateMemberInputSchema.parse(input);

  const newMember: Member = {
    id: crypto.randomUUID(),
    organizationId,
    groupId: validated.groupId,
    name: validated.name,
    createdAt: getCurrentTimestamp(),
  };

  const members = loadMembers(organizationId);
  members.push(newMember);

  const success = saveMembers(organizationId, members);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newMember;
}

// メンバーを保存（新規作成のエイリアス）
// 一括登録機能で使用
export async function saveMember(organizationId: string, input: MemberInput): Promise<Member> {
  return await createMember(organizationId, input);
}

// すべてのメンバーを取得
export async function getAllMembers(organizationId: string): Promise<Member[]> {
  return loadMembers(organizationId);
}

// グループIDでメンバーを取得
export async function getMembersByGroupId(organizationId: string, groupId: string): Promise<Member[]> {
  const members = loadMembers(organizationId);
  return members.filter((member) => member.groupId === groupId);
}

// IDでメンバーを取得
export async function getMemberById(organizationId: string, id: string): Promise<Member | null> {
  const members = loadMembers(organizationId);
  return members.find((member) => member.id === id) || null;
}

// メンバーを更新
export async function updateMember(organizationId: string, id: string, input: Partial<Omit<MemberInput, 'groupId'>>): Promise<Member> {
  const members = loadMembers(organizationId);
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

  const success = saveMembers(organizationId, members);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedMember;
}

// メンバーを削除
export async function deleteMember(organizationId: string, id: string): Promise<boolean> {
  const members = loadMembers(organizationId);
  const filteredMembers = members.filter((member) => member.id !== id);

  if (members.length === filteredMembers.length) {
    return false;
  }

  return saveMembers(organizationId, filteredMembers);
}
