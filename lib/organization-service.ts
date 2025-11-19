import { nanoid } from 'nanoid';
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '@/types';
import { CreateOrganizationInputSchema, UpdateOrganizationInputSchema } from '@/lib/validation';
import { loadAllOrganizations, saveOrganization, clearOrganizationData, deleteOrganization as deleteOrganizationFromStorage } from '@/lib/unified-storage';

// 団体IDを生成（nanoid, 10文字）
export function generateOrganizationId(): string {
  return nanoid(10);
}

// 新しい団体を作成
export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
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

  // 保存
  await saveOrganization(newOrganization);

  return newOrganization;
}

// すべての団体を取得（createdAt降順でソート）
export async function getAllOrganizations(): Promise<Organization[]> {
  const organizations = await loadAllOrganizations();

  // createdAt降順でソート（新しい順）
  return organizations.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// IDで団体を取得
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const organizations = await loadAllOrganizations();
  return organizations.find((org) => org.id === id) || null;
}

// 団体を更新
export async function updateOrganization(id: string, input: UpdateOrganizationInput): Promise<Organization> {
  // 入力検証
  const validatedInput = UpdateOrganizationInputSchema.parse(input);

  // すべての団体を読み込み
  const organizations = await loadAllOrganizations();

  // IDで団体を検索
  const organization = organizations.find((org) => org.id === id);
  if (!organization) {
    throw new Error('Organization not found');
  }

  // 更新されたフィールドをマージ（idとcreatedAtは保持）
  const updatedOrganization: Organization = {
    ...organization,
    name: validatedInput.name ?? organization.name,
    description: validatedInput.description ?? organization.description,
  };

  // 保存
  await saveOrganization(updatedOrganization);

  return updatedOrganization;
}

// 団体を削除（カスケード削除）
export async function deleteOrganization(id: string): Promise<void> {
  // すべての団体を読み込み
  const organizations = await loadAllOrganizations();

  // IDで団体を検索
  const organization = organizations.find((org) => org.id === id);
  if (!organization) {
    throw new Error('Organization not found');
  }

  // 団体を削除
  await deleteOrganizationFromStorage(id);

  // カスケード削除: すべての関連データを削除
  await clearOrganizationData(id);
}
