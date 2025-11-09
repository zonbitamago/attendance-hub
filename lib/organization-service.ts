import { nanoid } from 'nanoid';
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '@/types';
import { CreateOrganizationInputSchema, UpdateOrganizationInputSchema } from '@/lib/validation';
import { loadOrganizations, saveOrganizations, clearOrganizationData } from '@/lib/storage';

// 団体IDを生成（nanoid, 10文字）
export function generateOrganizationId(): string {
  return nanoid(10);
}

// 新しい団体を作成
export function createOrganization(input: CreateOrganizationInput): Organization {
  // 入力検証
  const validatedInput = CreateOrganizationInputSchema.parse(input);

  // 一意なIDを生成
  const id = generateOrganizationId();

  // 新しい団体オブジェクトを作成
  const newOrganization: Organization = {
    id,
    name: validatedInput.name,
    description: validatedInput.description,
    createdAt: new Date().toISOString(),
  };

  // 既存の団体を読み込み
  const organizations = loadOrganizations();

  // リストに追加
  organizations.push(newOrganization);

  // 保存
  saveOrganizations(organizations);

  return newOrganization;
}

// すべての団体を取得（createdAt降順でソート）
export function getAllOrganizations(): Organization[] {
  const organizations = loadOrganizations();

  // createdAt降順でソート（新しい順）
  return organizations.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// IDで団体を取得
export function getOrganizationById(id: string): Organization | null {
  const organizations = loadOrganizations();
  return organizations.find((org) => org.id === id) || null;
}

// 団体を更新
export function updateOrganization(id: string, input: UpdateOrganizationInput): Organization {
  // 入力検証
  const validatedInput = UpdateOrganizationInputSchema.parse(input);

  // すべての団体を読み込み
  const organizations = loadOrganizations();

  // IDで団体を検索
  const index = organizations.findIndex((org) => org.id === id);
  if (index === -1) {
    throw new Error('Organization not found');
  }

  // 更新されたフィールドをマージ（idとcreatedAtは保持）
  const updatedOrganization: Organization = {
    ...organizations[index],
    name: validatedInput.name ?? organizations[index].name,
    description: validatedInput.description ?? organizations[index].description,
  };

  // リストを更新
  organizations[index] = updatedOrganization;

  // 保存
  saveOrganizations(organizations);

  return updatedOrganization;
}

// 団体を削除（カスケード削除）
export function deleteOrganization(id: string): void {
  // すべての団体を読み込み
  const organizations = loadOrganizations();

  // IDで団体を検索
  const index = organizations.findIndex((org) => org.id === id);
  if (index === -1) {
    throw new Error('Organization not found');
  }

  // リストから削除
  organizations.splice(index, 1);

  // 保存
  saveOrganizations(organizations);

  // カスケード削除: すべての関連データを削除
  clearOrganizationData(id);
}
