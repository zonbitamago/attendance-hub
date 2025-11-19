/**
 * 統合ストレージ層のインターフェース定義
 *
 * このファイルは実装のコントラクト（契約）を定義します。
 * 実際の実装は lib/unified-storage.ts に行います。
 */

import type { Organization, Group, Member, EventDate, Attendance } from '@/types';

// ストレージモード
export type StorageMode = 'localStorage' | 'supabase';

// ストレージ設定
export interface StorageConfig {
  useSupabase: boolean;
  isProduction: boolean;
}

// ストレージモード判定関数
export declare function getStorageMode(): StorageMode;

// Organization操作
export declare function loadOrganization(organizationId: string): Promise<Organization | null>;
export declare function saveOrganization(organization: Organization): Promise<boolean>;
export declare function loadAllOrganizations(): Promise<Organization[]>;
export declare function deleteOrganization(organizationId: string): Promise<boolean>;

// Group操作
export declare function loadGroups(organizationId: string): Promise<Group[]>;
export declare function saveGroups(organizationId: string, groups: Group[]): Promise<boolean>;

// Member操作
export declare function loadMembers(organizationId: string): Promise<Member[]>;
export declare function saveMembers(organizationId: string, members: Member[]): Promise<boolean>;

// EventDate操作
export declare function loadEventDates(organizationId: string): Promise<EventDate[]>;
export declare function saveEventDates(organizationId: string, eventDates: EventDate[]): Promise<boolean>;

// Attendance操作
export declare function loadAttendances(organizationId: string): Promise<Attendance[]>;
export declare function saveAttendances(organizationId: string, attendances: Attendance[]): Promise<boolean>;

// ユーティリティ
export declare function clearOrganizationData(organizationId: string): Promise<boolean>;
