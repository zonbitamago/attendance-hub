import type { Group } from '@/types';
import { loadGroups, saveGroups } from './storage';
import { CreateGroupInputSchema, type GroupInput } from './validation';
import { getCurrentTimestamp } from './date-utils';
import { ErrorMessages } from './error-utils';

// グループを作成
export function createGroup(input: GroupInput): Group {
  const validated = CreateGroupInputSchema.parse(input);

  const newGroup: Group = {
    id: crypto.randomUUID(),
    name: validated.name,
    order: validated.order,
    color: validated.color,
    createdAt: getCurrentTimestamp(),
  };

  const groups = loadGroups();
  groups.push(newGroup);

  const success = saveGroups(groups);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return newGroup;
}

// すべてのグループを取得（order昇順）
export function getAllGroups(): Group[] {
  const groups = loadGroups();
  return groups.sort((a, b) => a.order - b.order);
}

// IDでグループを取得
export function getGroupById(id: string): Group | null {
  const groups = loadGroups();
  return groups.find((group) => group.id === id) || null;
}

// グループを更新
export function updateGroup(id: string, input: Partial<GroupInput>): Group {
  const groups = loadGroups();
  const index = groups.findIndex((group) => group.id === id);

  if (index === -1) {
    throw new Error(ErrorMessages.NOT_FOUND('グループ'));
  }

  const updateData: GroupInput = {
    name: input.name ?? groups[index].name,
    order: input.order ?? groups[index].order,
    color: input.color !== undefined ? input.color : groups[index].color,
  };
  const validated = CreateGroupInputSchema.parse(updateData);

  const updatedGroup: Group = {
    ...groups[index],
    name: validated.name,
    order: validated.order,
    color: validated.color,
  };

  groups[index] = updatedGroup;

  const success = saveGroups(groups);
  if (!success) {
    throw new Error(ErrorMessages.STORAGE_FULL);
  }

  return updatedGroup;
}

// グループを削除
export function deleteGroup(id: string): boolean {
  const groups = loadGroups();
  const filteredGroups = groups.filter((group) => group.id !== id);

  if (groups.length === filteredGroups.length) {
    return false;
  }

  return saveGroups(filteredGroups);
}
