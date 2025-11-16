/**
 * Supabase Storage Layer Tests
 * TDD Approach: Red-Green-Refactor
 *
 * このテストファイルは、各機能ごとにベイビーステップで実装します。
 */

import type { Organization, EventDate, Group, Member, Attendance } from '@/types';
import { loadOrganizations, saveOrganizations, loadEventDates, saveEventDates, loadGroups, saveGroups } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase/client';

// Supabaseクライアントをモック
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// テストのdescribe構造のみ作成（各サイクルでテストを追加）
describe('Supabase Storage Layer', () => {
  describe('Organizations', () => {
    // Cycle 1: loadOrganizations
    describe('loadOrganizations', () => {
      it('指定されたorganizationIdの組織を取得できる', async () => {
        // モックデータ
        const mockOrganization: Organization = {
          id: 'testorg001',
          name: 'Test Organization',
          description: 'Test Description',
        };

        // Supabaseのモックレスポンスを設定
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: mockOrganization,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        });

        // テスト実行
        const result = await loadOrganizations('testorg001');

        // 検証
        expect(result).toBeDefined();
        expect(result).toHaveProperty('id', 'testorg001');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('description');
        expect(supabase.from).toHaveBeenCalledWith('organizations');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('id', 'testorg001');
        expect(mockSingle).toHaveBeenCalled();
      });
    });

    // Cycle 2: saveOrganizations
    describe('saveOrganizations', () => {
      it('組織データを保存できる（upsert）', async () => {
        // モックデータ
        const organization: Organization = {
          id: 'testorg002',
          name: 'New Organization',
          description: 'New Description',
        };

        // Supabaseのモックレスポンスを設定
        const mockUpsert = jest.fn().mockResolvedValue({
          data: organization,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          upsert: mockUpsert,
        });

        // テスト実行
        const result = await saveOrganizations(organization);

        // 検証
        expect(result).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('organizations');
        expect(mockUpsert).toHaveBeenCalledWith(organization);
      });
    });
  });

  describe('EventDates', () => {
    // Cycle 3: loadEventDates
    describe('loadEventDates', () => {
      it('指定されたorganizationIdのイベント日付を全て取得できる', async () => {
        // モックデータ
        const mockEventDates: EventDate[] = [
          {
            id: 'event001',
            organizationId: 'testorg001',
            date: '2025-11-20',
            title: 'Test Event 1',
            location: 'Location 1',
          },
          {
            id: 'event002',
            organizationId: 'testorg001',
            date: '2025-11-21',
            title: 'Test Event 2',
            location: 'Location 2',
          },
        ];

        // Supabaseのモックレスポンスを設定
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({
          data: mockEventDates,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          select: mockSelect,
          eq: mockEq,
        });

        // テスト実行
        const result = await loadEventDates('testorg001');

        // 検証
        expect(result).toEqual(mockEventDates);
        expect(supabase.from).toHaveBeenCalledWith('event_dates');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('organization_id', 'testorg001');
      });
    });

    // Cycle 4: saveEventDates
    describe('saveEventDates', () => {
      it('イベント日付データを保存できる（upsert）', async () => {
        // モックデータ
        const eventDate: EventDate = {
          id: 'event003',
          organizationId: 'testorg001',
          date: '2025-11-22',
          title: 'New Event',
          location: 'New Location',
        };

        // Supabaseのモックレスポンスを設定
        const mockUpsert = jest.fn().mockResolvedValue({
          data: eventDate,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          upsert: mockUpsert,
        });

        // テスト実行
        const result = await saveEventDates(eventDate);

        // 検証
        expect(result).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('event_dates');
        expect(mockUpsert).toHaveBeenCalledWith(eventDate);
      });
    });
  });

  describe('Groups', () => {
    // Cycle 5: loadGroups
    describe('loadGroups', () => {
      it('指定されたorganizationIdのグループを全て取得できる', async () => {
        // モックデータ
        const mockGroups: Group[] = [
          {
            id: 'group001',
            organizationId: 'testorg001',
            name: 'Group A',
            order: 1,
            color: '#FF0000',
          },
          {
            id: 'group002',
            organizationId: 'testorg001',
            name: 'Group B',
            order: 2,
            color: '#00FF00',
          },
        ];

        // Supabaseのモックレスポンスを設定
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({
          data: mockGroups,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          select: mockSelect,
          eq: mockEq,
        });

        // テスト実行
        const result = await loadGroups('testorg001');

        // 検証
        expect(result).toEqual(mockGroups);
        expect(supabase.from).toHaveBeenCalledWith('groups');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('organization_id', 'testorg001');
      });
    });

    // Cycle 6: saveGroups
    describe('saveGroups', () => {
      it('グループデータを保存できる（upsert）', async () => {
        // モックデータ
        const group: Group = {
          id: 'group003',
          organizationId: 'testorg001',
          name: 'New Group',
          order: 3,
          color: '#0000FF',
        };

        // Supabaseのモックレスポンスを設定
        const mockUpsert = jest.fn().mockResolvedValue({
          data: group,
          error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
          upsert: mockUpsert,
        });

        // テスト実行
        const result = await saveGroups(group);

        // 検証
        expect(result).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('groups');
        expect(mockUpsert).toHaveBeenCalledWith(group);
      });
    });
  });

  describe('Members', () => {
    // Cycle 7-8: loadMembers, saveMembers
  });

  describe('Attendances', () => {
    // Cycle 9-10: loadAttendances, saveAttendances
  });

  describe('Utilities', () => {
    // Cycle 11: clearOrganizationData
    // Cycle 12: エラーハンドリング
  });

  describe('Database Constraints', () => {
    // Cycle 13: カスケード削除
    // Cycle 14: 一意制約
  });

  describe('Performance', () => {
    // Cycle 15: パフォーマンステスト
  });
});
